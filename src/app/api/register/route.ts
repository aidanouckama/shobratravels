import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyNewRegistration } from "@/lib/email";

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
    } = body;

    if (!fullName || !email || !cellPhone || !address || !tripId || !passportNumber) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
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
      },
    });

    const depositAmount = 1200;
    let processingFee = 0;
    if (paymentMethod === "credit_card") processingFee = depositAmount * 0.039;
    if (paymentMethod === "ach") processingFee = depositAmount * 0.01;

    await prisma.payment.create({
      data: {
        clientId: client.id,
        registrationId: registration.id,
        amount: depositAmount,
        processingFee,
        type: "DEPOSIT",
        status: paymentMethod === "check" ? "PENDING" : "PENDING",
        method: paymentMethod,
      },
    });

    // TODO: Create Square payment link for credit_card/ach and email to client

    notifyNewRegistration({
      clientName: fullName,
      clientEmail: email,
      clientPhone: cellPhone,
      tripTitle: trip.title,
      departureDate: trip.departureDate,
      paymentMethod,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
