import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Shobra Travel Agency <notifications@shobratravelagency.com>";
const ADMIN_EMAIL = process.env.NOTIFICATION_EMAIL || "shobratravels@gmail.com";

export async function notifyNewRegistration(data: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  tripTitle: string;
  departureDate: Date;
  paymentMethod: string;
}) {
  const methodLabel =
    data.paymentMethod === "credit_card"
      ? "Credit Card (3.9% fee)"
      : data.paymentMethod === "ach"
      ? "Bank Transfer / ACH (1% fee)"
      : "Check (no fee)";

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Registration: ${data.clientName} — ${data.tripTitle}`,
    html: `
      <h2>New Trip Registration</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:6px 12px;font-weight:bold;">Client</td><td style="padding:6px 12px;">${data.clientName}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;"><a href="mailto:${data.clientEmail}">${data.clientEmail}</a></td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;"><a href="tel:${data.clientPhone}">${data.clientPhone}</a></td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Trip</td><td style="padding:6px 12px;">${data.tripTitle}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Departure</td><td style="padding:6px 12px;">${data.departureDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Payment</td><td style="padding:6px 12px;">${methodLabel}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Deposit</td><td style="padding:6px 12px;">$1.00</td></tr>
      </table>
      <p style="margin-top:16px;color:#666;">View details in the <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">admin dashboard</a>.</p>
    `,
  });
}

export async function notifyPaymentReceived(data: {
  clientName: string;
  tripTitle: string;
  amount: number;
  method: string;
  type: string;
}) {
  const methodLabel = data.method.replace("_", " ");

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Payment Received: $${data.amount.toLocaleString()} from ${data.clientName}`,
    html: `
      <h2>Payment Received</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:6px 12px;font-weight:bold;">Client</td><td style="padding:6px 12px;">${data.clientName}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Trip</td><td style="padding:6px 12px;">${data.tripTitle}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Amount</td><td style="padding:6px 12px;">$${data.amount.toLocaleString()}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Type</td><td style="padding:6px 12px;">${data.type}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Method</td><td style="padding:6px 12px;text-transform:capitalize;">${methodLabel}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666;">View details in the <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/payments">admin dashboard</a>.</p>
    `,
  });
}

export async function notifyNewReview(data: {
  reviewerName: string;
  rating: number;
  content: string;
}) {
  const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Review: ${data.rating}/5 from ${data.reviewerName}`,
    html: `
      <h2>New Review Submitted</h2>
      <p style="font-size:20px;margin:0;">${stars}</p>
      <table style="border-collapse:collapse;font-family:sans-serif;margin-top:12px;">
        <tr><td style="padding:6px 12px;font-weight:bold;">From</td><td style="padding:6px 12px;">${data.reviewerName}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Rating</td><td style="padding:6px 12px;">${data.rating} / 5</td></tr>
      </table>
      <blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #4a9e72;color:#333;font-style:italic;">
        "${data.content}"
      </blockquote>
      <p style="color:#666;">This review is pending approval. <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/reviews">Approve or reject it</a>.</p>
    `,
  });
}
