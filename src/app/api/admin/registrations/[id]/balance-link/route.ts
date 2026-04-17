import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createBalancePaymentLink } from "@/lib/square";

type Context = { params: Promise<{ id: string }> };

// Returns the balance payment link for a registration, generating one if
// none exists yet. Idempotent — calling repeatedly returns the same link.
export async function POST(_req: NextRequest, context: Context) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const reg = await prisma.registration.findUnique({
    where: { id },
    include: {
      client: true,
      trip: true,
      payments: { where: { status: "COMPLETED" } },
    },
  });
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (reg.balancePaymentLinkUrl) {
    return NextResponse.json({ url: reg.balancePaymentLinkUrl });
  }

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

  const link = await createBalancePaymentLink({
    registrationId: reg.id,
    clientName: reg.client.fullName,
    clientEmail: reg.client.email,
    tripTitle: reg.trip.title,
    balanceAmount: balanceDue,
  });
  if (!link) {
    return NextResponse.json(
      { error: "Square did not return a payment link." },
      { status: 502 },
    );
  }

  await prisma.registration.update({
    where: { id },
    data: {
      balancePaymentLinkUrl: link.url,
      balancePaymentLinkId: link.id,
      balancePaymentOrderId: link.orderId,
    },
  });

  return NextResponse.json({ url: link.url });
}
