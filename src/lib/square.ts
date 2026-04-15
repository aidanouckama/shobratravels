import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

const LOCATION_ID = process.env.SQUARE_LOCATION_ID!;
const DEPOSIT_AMOUNT = 1; // TEMP: $1 for prod testing (restore to 1200 after)
const CC_FEE_RATE = 0.039; // 3.9% — passed to customer
const ACH_FEE_RATE = 0.01; // 1% — absorbed by business

export function calculateDeposit(method: string) {
  if (method === "credit_card") {
    const fee = Math.round(DEPOSIT_AMOUNT * CC_FEE_RATE * 100) / 100;
    return { base: DEPOSIT_AMOUNT, fee, total: DEPOSIT_AMOUNT + fee };
  }
  // ACH — 1% absorbed, customer pays $1,200 flat
  const fee = Math.round(DEPOSIT_AMOUNT * ACH_FEE_RATE * 100) / 100;
  return { base: DEPOSIT_AMOUNT, fee, total: DEPOSIT_AMOUNT };
}

export async function processPayment(
  sourceId: string,
  amountCents: number,
  buyerEmail: string,
  tripTitle: string
) {
  const response = await client.payments.create({
    sourceId,
    idempotencyKey: crypto.randomUUID(),
    amountMoney: {
      amount: BigInt(amountCents),
      currency: "USD",
    },
    locationId: LOCATION_ID,
    buyerEmailAddress: buyerEmail,
    note: `Shobra Travel Agency — Deposit for ${tripTitle}`,
  });

  return response.payment;
}
