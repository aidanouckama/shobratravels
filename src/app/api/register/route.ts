import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processPayment, calculateDeposit } from "@/lib/square";
import { notifyNewRegistration, notifyPaymentReceived } from "@/lib/email";
import { checkLimit, getClientIp, limiters } from "@/lib/ratelimit";
import { registerSchema, formatZodError } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const limit = await checkLimit(limiters.register, `register:${getClientIp(req)}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const {
      fullName,
      email,
      cellPhone,
      homePhone,
      address,
      tripId,
      tripDateId,
      passportNumber,
      passportCountry,
      passportIssued,
      passportExpiry,
      passportIssuedBy,
      passportImage,
      paymentMethod,
      sourceId,
    } = parsed.data;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { dates: { where: { id: tripDateId } } },
    });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const tripDate = trip.dates[0];
    if (!tripDate) {
      return NextResponse.json({ error: "Trip date not found" }, { status: 404 });
    }

    const phone = cellPhone + (homePhone ? ` / ${homePhone}` : "");
    const client = await prisma.client.upsert({
      where: { email },
      update: { fullName, phone, address },
      create: { fullName, email, phone, address },
    });

    const existing = await prisma.registration.findUnique({
      where: { clientId_tripDateId: { clientId: client.id, tripDateId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this trip date." },
        { status: 409 }
      );
    }

    if (trip.groupSizeMax) {
      const booked = await prisma.registration.count({
        where: { tripDateId, status: { not: "CANCELLED" } },
      });
      if (booked >= trip.groupSizeMax) {
        return NextResponse.json(
          { error: "This trip date is full. Please choose another date." },
          { status: 409 },
        );
      }
    }

    // Process deposit payment FIRST — if this fails, no registration is created
    const { base, fee, total } = calculateDeposit(paymentMethod);
    const amountCents = Math.round(total * 100);
    const squarePayment = await processPayment(sourceId, amountCents, email, trip.title);

    // Payment succeeded — now create registration + payment record
    const registration = await prisma.registration.create({
      data: {
        clientId: client.id,
        tripId,
        tripDateId,
        passportNumber,
        passportCountry,
        passportIssued: new Date(passportIssued),
        passportExpiry: new Date(passportExpiry),
        passportIssuedBy,
        passportImage: passportImage || null,
        paymentMethod,
        status: "DEPOSIT_PAID",
      },
    });

    await prisma.payment.create({
      data: {
        clientId: client.id,
        registrationId: registration.id,
        amount: base,
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
      departureDate: tripDate.departureDate,
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
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const detail = error instanceof Error ? error.message : "";
    const isPaymentError = detail.includes("BAD_REQUEST") || detail.includes("INVALID_REQUEST");
    return NextResponse.json(
      {
        error: isPaymentError
          ? "Payment could not be processed. Please check your payment details and try again."
          : "Registration failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
