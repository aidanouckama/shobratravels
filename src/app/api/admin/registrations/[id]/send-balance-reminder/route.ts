import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendBalanceDueReminder } from "@/lib/email";
import { createBalancePaymentLink } from "@/lib/square";

type Context = { params: Promise<{ id: string }> };

const PAYMENT_DUE_MONTHS_BEFORE_DEPARTURE = 3;

function computePaymentDueDate(departureDate: Date): Date {
  const out = new Date(departureDate);
  out.setMonth(out.getMonth() - PAYMENT_DUE_MONTHS_BEFORE_DEPARTURE);
  return out;
}

export async function POST(_req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const reg = await prisma.registration.findUnique({
    where: { id },
    include: {
      client: true,
      trip: true,
      tripDate: true,
      payments: { where: { status: "COMPLETED" } },
    },
  });
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const paid = reg.payments
    .filter((p) => p.type !== "REFUND")
    .reduce((sum, p) => sum + p.amount, 0);
  const refunded = reg.payments
    .filter((p) => p.type === "REFUND")
    .reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(0, reg.trip.pricePerPerson - (paid - refunded));

  if (balanceDue <= 0) {
    return NextResponse.json(
      { error: "No outstanding balance on this registration." },
      { status: 400 },
    );
  }

  // Make sure we have a payment link to include.
  let balancePaymentLinkUrl = reg.balancePaymentLinkUrl;
  if (!balancePaymentLinkUrl) {
    const link = await createBalancePaymentLink({
      registrationId: reg.id,
      clientName: reg.client.fullName,
      clientEmail: reg.client.email,
      tripTitle: reg.trip.title,
      balanceAmount: balanceDue,
    });
    if (link) {
      balancePaymentLinkUrl = link.url;
      await prisma.registration.update({
        where: { id: reg.id },
        data: {
          balancePaymentLinkUrl: link.url,
          balancePaymentLinkId: link.id,
          balancePaymentOrderId: link.orderId,
        },
      });
    }
  }

  const paymentDueDate = computePaymentDueDate(reg.tripDate.departureDate);
  const now = new Date();
  const daysUntilDue = Math.max(
    0,
    Math.round((paymentDueDate.getTime() - now.getTime()) / 86_400_000),
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
    balancePaymentLinkUrl,
  });

  await prisma.registration.update({
    where: { id: reg.id },
    data: { balanceReminderSentAt: now },
  });

  return NextResponse.json({ ok: true, sentAt: now.toISOString() });
}
