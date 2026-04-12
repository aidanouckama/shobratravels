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
const DEPOSIT_AMOUNT = 1200; // $1,200
const CC_FEE_RATE = 0.039; // 3.9%
const ACH_FEE_RATE = 0.01; // 1%

export function calculateTotal(method: string) {
  if (method === "credit_card") {
    const fee = Math.round(DEPOSIT_AMOUNT * CC_FEE_RATE * 100) / 100;
    return { deposit: DEPOSIT_AMOUNT, fee, total: DEPOSIT_AMOUNT + fee };
  }
  if (method === "ach") {
    const fee = Math.round(DEPOSIT_AMOUNT * ACH_FEE_RATE * 100) / 100;
    return { deposit: DEPOSIT_AMOUNT, fee, total: DEPOSIT_AMOUNT + fee };
  }
  return { deposit: DEPOSIT_AMOUNT, fee: 0, total: DEPOSIT_AMOUNT };
}

export async function processPayment(
  sourceId: string,
  method: string,
  buyerEmail: string
) {
  const { total } = calculateTotal(method);
  // Square expects amount in cents
  const amountCents = BigInt(Math.round(total * 100));

  console.log("Processing payment:", {
    method,
    amountCents: amountCents.toString(),
    sourceIdPrefix: sourceId.substring(0, 20) + "...",
    locationId: LOCATION_ID,
    environment: process.env.SQUARE_ENVIRONMENT,
  });

  const response = await client.payments.create({
    sourceId,
    idempotencyKey: crypto.randomUUID(),
    amountMoney: {
      amount: amountCents,
      currency: "USD",
    },
    locationId: LOCATION_ID,
    buyerEmailAddress: buyerEmail,
    note: `Shobra Travel Agency — Trip Deposit ($${DEPOSIT_AMOUNT})`,
  });

  return response.payment;
}
