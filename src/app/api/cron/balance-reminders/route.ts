import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendBalanceDueReminder } from "@/lib/email";

// Shobra closes purchases 3 months before departure — that's the final
// payment deadline. Fire a reminder 1 week before the deadline.
const PAYMENT_DUE_MONTHS_BEFORE_DEPARTURE = 3;
const REMINDER_DAYS_BEFORE_DUE = 7;
// ±1 day window around the target, in case a cron run is skipped.
const WINDOW_TOLERANCE_DAYS = 1;

export const dynamic = "force-dynamic";

function addMonths(date: Date, months: number): Date {
  const out = new Date(date);
  out.setMonth(out.getMonth() + months);
  return out;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function computePaymentDueDate(departureDate: Date): Date {
  return addMonths(departureDate, -PAYMENT_DUE_MONTHS_BEFORE_DEPARTURE);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Target: today should equal (departure − 3 months − 7 days).
  // Equivalently: departure ∈ [today + 3mo + 6d, today + 3mo + 8d].
  const targetDeparture = addDays(
    addMonths(now, PAYMENT_DUE_MONTHS_BEFORE_DEPARTURE),
    REMINDER_DAYS_BEFORE_DUE,
  );
  const windowStart = addDays(targetDeparture, -WINDOW_TOLERANCE_DAYS);
  const windowEnd = addDays(targetDeparture, WINDOW_TOLERANCE_DAYS);

  const registrations = await prisma.registration.findMany({
    where: {
      status: "DEPOSIT_PAID",
      balanceReminderSentAt: null,
      tripDate: {
        departureDate: { gte: windowStart, lte: windowEnd },
      },
    },
    include: {
      client: true,
      trip: true,
      tripDate: true,
      payments: { where: { status: "COMPLETED" } },
    },
  });

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const reg of registrations) {
    try {
      const paid = reg.payments
        .filter((p) => p.type !== "REFUND")
        .reduce((sum, p) => sum + p.amount, 0);
      const refunded = reg.payments
        .filter((p) => p.type === "REFUND")
        .reduce((sum, p) => sum + p.amount, 0);
      const balanceDue = Math.max(0, reg.trip.pricePerPerson - (paid - refunded));
      if (balanceDue <= 0) {
        await prisma.registration.update({
          where: { id: reg.id },
          data: { balanceReminderSentAt: now },
        });
        results.push({ id: reg.id, ok: true });
        continue;
      }

      const paymentDueDate = computePaymentDueDate(reg.tripDate.departureDate);
      const daysUntilDue = Math.round(
        (paymentDueDate.getTime() - now.getTime()) / 86_400_000,
      );

      await sendBalanceDueReminder({
        clientName: reg.client.fullName,
        clientEmail: reg.client.email,
        tripTitle: reg.trip.title,
        departureDate: reg.tripDate.departureDate,
        returnDate: reg.tripDate.returnDate,
        balanceDue,
        paymentDueDate,
        daysUntilDue,
      });

      await prisma.registration.update({
        where: { id: reg.id },
        data: { balanceReminderSentAt: now },
      });

      results.push({ id: reg.id, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error(`balance reminder failed for ${reg.id}:`, err);
      results.push({ id: reg.id, ok: false, error: msg });
    }
  }

  return NextResponse.json({
    processed: registrations.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
