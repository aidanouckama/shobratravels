import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processPayment, calculateTotal } from "@/lib/square";
import { notifyNewRegistration, notifyPaymentReceived } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      cellPhone,
      homePhone,
      address,
      tripId,
      passportNumber,
      passportCountry,
      passportIssued,
      passportExpiry,
      passportIssuedBy,
      paymentMethod,
      sourceId,
    } = body;

    if (!fullName || !email || !cellPhone || !address || !tripId || !passportNumber) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    if (!sourceId) {
      return NextResponse.json(
        { error: "Payment information is required" },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const phone = cellPhone + (homePhone ? ` / ${homePhone}` : "");
    const client = await prisma.client.upsert({
      where: { email },
      update: { fullName, phone, address },
      create: { fullName, email, phone, address },
    });

    const existing = await prisma.registration.findUnique({
      where: { clientId_tripId: { clientId: client.id, tripId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this trip." },
        { status: 409 }
      );
    }

    // Process payment FIRST — if this fails, no registration is created
    const { deposit, fee, total } = calculateTotal(paymentMethod);
    const squarePayment = await processPayment(sourceId, paymentMethod, email);

    // Payment succeeded — now create registration + payment record
    const registration = await prisma.registration.create({
      data: {
        clientId: client.id,
        tripId,
        passportNumber,
        passportCountry,
        passportIssued: new Date(passportIssued),
        passportExpiry: new Date(passportExpiry),
        passportIssuedBy,
        paymentMethod,
        status: "DEPOSIT_PAID",
      },
    });

    await prisma.payment.create({
      data: {
        clientId: client.id,
        registrationId: registration.id,
        amount: deposit,
        processingFee: fee,
        type: "DEPOSIT",
        status: "COMPLETED",
        method: paymentMethod,
        squarePaymentId: squarePayment?.id || null,
      },
    });

    notifyNewRegistration({
      clientName: fullName,
      clientEmail: email,
      clientPhone: cellPhone,
      tripTitle: trip.title,
      departureDate: trip.departureDate,
      paymentMethod,
    }).catch(console.error);

    notifyPaymentReceived({
      clientName: fullName,
      tripTitle: trip.title,
      amount: total,
      method: paymentMethod,
      type: "DEPOSIT",
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Payment failed. Please try again." },
      { status: 500 }
    );
  }
}
