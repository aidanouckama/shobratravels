import "dotenv/config";
import {
  sendClientConfirmation,
  notifyNewRegistration,
  notifyPaymentReceived,
  notifyNewReview,
  notifyNewContactMessage,
  sendContactReceived,
  sendReviewReceived,
  sendReviewApproved,
  sendBalanceDueReminder,
  sendFinalPaymentReceipt,
} from "../src/lib/email";

const TEST_TO = "shobratravels@gmail.com";

async function main() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not set — check .env");
  }
  if (process.env.NOTIFICATION_EMAIL && process.env.NOTIFICATION_EMAIL !== TEST_TO) {
    console.warn(
      `Warning: NOTIFICATION_EMAIL is ${process.env.NOTIFICATION_EMAIL}; admin emails will go there, not ${TEST_TO}.`,
    );
  }

  const departure = new Date("2026-10-12");
  const returnDate = new Date("2026-10-22");

  console.log("1/10 sendClientConfirmation (deposit receipt)...");
  await sendClientConfirmation({
    clientName: "Amira Shobra",
    clientEmail: TEST_TO,
    tripTitle: "Egypt & The Nile — Oct 2026",
    departureDate: departure,
    returnDate,
    base: 1200,
    fee: 46.8,
    total: 1246.8,
    paymentMethod: "credit_card",
    squarePaymentId: "TEST_PAYMENT_ABC123XYZ",
    paidAt: new Date(),
  });

  console.log("2/10 notifyNewRegistration (admin)...");
  await notifyNewRegistration({
    clientName: "Amira Shobra",
    clientEmail: "amira.test@example.com",
    clientPhone: "(973) 555-0123",
    tripTitle: "Egypt & The Nile — Oct 2026",
    departureDate: departure,
    paymentMethod: "credit_card",
  });

  console.log("3/10 notifyPaymentReceived (admin)...");
  await notifyPaymentReceived({
    clientName: "Amira Shobra",
    tripTitle: "Egypt & The Nile — Oct 2026",
    amount: 1246.8,
    method: "credit_card",
    type: "DEPOSIT",
  });

  console.log("4/10 notifyNewReview (admin)...");
  await notifyNewReview({
    reviewerName: "Sarah K.",
    rating: 5,
    content:
      "Our Egypt trip with Shobra was unforgettable — every detail was perfect, from the Nile cruise to the private guide at the pyramids. We'll book our next trip with them for sure.",
  });

  console.log("5/10 notifyNewContactMessage (admin)...");
  await notifyNewContactMessage({
    name: "David Rossi",
    email: "david.test@example.com",
    message:
      "Hi — I'm interested in the Egypt trip next October but want to know if you have room for a family of four.\n\nAlso, do you offer the single-supplement option?",
  });

  console.log("6/10 sendContactReceived (client)...");
  await sendContactReceived({
    name: "David Rossi",
    email: TEST_TO,
    message:
      "Hi — I'm interested in the Egypt trip next October but want to know if you have room for a family of four.\n\nAlso, do you offer the single-supplement option?",
  });

  console.log("7/10 sendReviewReceived (client)...");
  await sendReviewReceived({
    reviewerName: "Sarah K.",
    reviewerEmail: TEST_TO,
    rating: 5,
    content:
      "Our Egypt trip with Shobra was unforgettable — every detail was perfect. Highly recommend.",
  });

  console.log("8/10 sendReviewApproved (client)...");
  await sendReviewApproved({
    reviewerName: "Sarah K.",
    reviewerEmail: TEST_TO,
    rating: 5,
  });

  console.log("9/10 sendBalanceDueReminder (client)...");
  const paymentDueDate = new Date(departure);
  paymentDueDate.setMonth(paymentDueDate.getMonth() - 3);
  await sendBalanceDueReminder({
    clientName: "Amira Shobra",
    clientEmail: TEST_TO,
    tripTitle: "Egypt & The Nile — Oct 2026",
    departureDate: departure,
    returnDate,
    balanceDue: 4800,
    paymentDueDate,
    daysUntilDue: 7,
  });

  console.log("10/10 sendFinalPaymentReceipt (client)...");
  await sendFinalPaymentReceipt({
    clientName: "Amira Shobra",
    clientEmail: TEST_TO,
    tripTitle: "Egypt & The Nile — Oct 2026",
    departureDate: departure,
    returnDate,
    amount: 4800,
    paymentMethod: "ach",
    squarePaymentId: "TEST_FINAL_XYZ789ABC",
    paidAt: new Date(),
  });

  console.log(`\nAll 10 test emails sent to ${TEST_TO}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
