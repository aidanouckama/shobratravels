import { Resend } from "resend";
import { readFileSync } from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Shobra Travel Agency <notifications@shobratravelagency.com>";
const ADMIN_EMAIL = process.env.NOTIFICATION_EMAIL || "shobratravels@gmail.com";
const REPLY_TO = "shobratravels@gmail.com";

const BRAND = {
  green900: "#1a3a2a",
  green800: "#234d38",
  green700: "#2d6145",
  green600: "#3a7d5a",
  green500: "#4a9e72",
  green400: "#5fbf8a",
  green100: "#dcf3e5",
  green50: "#f0faf4",
  ink: "#1a3a2a",
  body: "#404040",
  muted: "#737373",
  divider: "#e5e5e5",
  bg: "#f5f7f6",
};

const LOGO_CID = "shobra-logo";

const LOGO_BUFFER: Buffer = (() => {
  try {
    return readFileSync(path.resolve(process.cwd(), "public/logo.png"));
  } catch {
    return Buffer.alloc(0);
  }
})();

const LOGO_ATTACHMENT = {
  filename: "logo.png",
  content: LOGO_BUFFER,
  contentType: "image/png",
  contentId: LOGO_CID,
};

function brandedEmail(opts: {
  preheader: string;
  accentLabel?: string;
  heading: string;
  intro?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaHref?: string;
  footerNote?: string;
}) {
  const preheader = opts.preheader.replace(/</g, "&lt;");

  const accentBar = opts.accentLabel
    ? `
    <tr>
      <td style="padding:20px 40px 0;">
        <div style="display:inline-block;padding:6px 14px;background:${BRAND.green100};color:${BRAND.green800};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;border-radius:2px;">${opts.accentLabel}</div>
      </td>
    </tr>`
    : "";

  const intro = opts.intro
    ? `<tr><td style="padding:0 40px 4px;color:${BRAND.body};font-size:15px;line-height:1.6;">${opts.intro}</td></tr>`
    : "";

  const cta =
    opts.ctaText && opts.ctaHref
      ? `
      <tr>
        <td style="padding:12px 40px 32px;">
          <a href="${opts.ctaHref}" style="display:inline-block;background:${BRAND.green700};color:#ffffff;text-decoration:none;padding:14px 28px;font-size:14px;letter-spacing:1px;text-transform:uppercase;font-weight:700;border-radius:2px;">${opts.ctaText}</a>
        </td>
      </tr>`
      : "";

  const footerNote = opts.footerNote
    ? `<p style="margin:0 0 12px;color:${BRAND.muted};font-size:13px;line-height:1.6;">${opts.footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Shobra Travel Agency</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${BRAND.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${BRAND.divider};border-radius:4px;overflow:hidden;">

          <tr>
            <td style="background:${BRAND.green800};padding:32px 40px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="vertical-align:middle;padding-right:14px;">
                    <img src="cid:${LOGO_CID}" alt="Shobra Travel" width="56" height="56" style="display:block;width:56px;height:56px;background:#ffffff;border-radius:50%;padding:4px;">
                  </td>
                  <td style="vertical-align:middle;">
                    <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:2px;text-transform:uppercase;line-height:1;">Shobra Travel</div>
                    <div style="color:${BRAND.green400};font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-top:6px;">Agency · Short Hills, NJ</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="height:4px;background:linear-gradient(90deg, ${BRAND.green400} 0%, ${BRAND.green700} 100%);line-height:4px;font-size:0;">&nbsp;</td>
          </tr>

          ${accentBar}

          <tr>
            <td style="padding:28px 40px 12px;">
              <h1 style="margin:0;color:${BRAND.ink};font-size:24px;font-weight:700;letter-spacing:-0.2px;line-height:1.25;">${opts.heading}</h1>
            </td>
          </tr>

          ${intro}

          <tr>
            <td style="padding:16px 40px 8px;">${opts.bodyHtml}</td>
          </tr>

          ${cta}

          <tr>
            <td style="height:1px;background:${BRAND.divider};line-height:1px;font-size:0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding:24px 40px 28px;">
              ${footerNote}
              <p style="margin:0;color:${BRAND.muted};font-size:12px;line-height:1.6;">
                Shobra Travel Agency &middot; Short Hills, NJ<br>
                <a href="mailto:${REPLY_TO}" style="color:${BRAND.green700};text-decoration:none;">${REPLY_TO}</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.shobratravelagency.com" style="color:${BRAND.green700};text-decoration:none;">shobratravelagency.com</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="height:6px;background:${BRAND.green800};line-height:6px;font-size:0;">&nbsp;</td>
          </tr>

        </table>
        <div style="color:${BRAND.muted};font-size:11px;margin-top:16px;">
          &copy; ${new Date().getFullYear()} Shobra Travel Agency. All rights reserved.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const fmtMoney = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function kvTable(rows: Array<[string, string]>) {
  const trs = rows
    .map(
      ([k, v], i) => `
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1px;${i < rows.length - 1 ? `border-bottom:1px solid ${BRAND.divider};` : ""}width:40%;">${k}</td>
          <td style="padding:12px 16px;font-size:15px;color:${BRAND.ink};${i < rows.length - 1 ? `border-bottom:1px solid ${BRAND.divider};` : ""}text-align:right;font-weight:500;">${v}</td>
        </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${BRAND.green50};border:1px solid ${BRAND.green100};border-radius:3px;">${trs}</table>`;
}

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

  const bodyHtml = kvTable([
    ["Client", data.clientName],
    ["Email", `<a href="mailto:${data.clientEmail}" style="color:${BRAND.green700};text-decoration:none;">${data.clientEmail}</a>`],
    ["Phone", `<a href="tel:${data.clientPhone}" style="color:${BRAND.green700};text-decoration:none;">${data.clientPhone}</a>`],
    ["Trip", data.tripTitle],
    ["Departure", fmtDate(data.departureDate)],
    ["Payment method", methodLabel],
  ]);

  const html = brandedEmail({
    preheader: `New registration from ${data.clientName} for ${data.tripTitle}`,
    accentLabel: "Admin · New Registration",
    heading: "New trip registration",
    intro: `<strong>${data.clientName}</strong> just registered for <strong>${data.tripTitle}</strong> and paid their deposit.`,
    bodyHtml,
    ctaText: "Open admin dashboard",
    ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
  });

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: REPLY_TO,
    subject: `New Registration: ${data.clientName} — ${data.tripTitle}`,
    html,
    attachments: [LOGO_ATTACHMENT],
  });
}

export async function sendClientConfirmation(data: {
  clientName: string;
  clientEmail: string;
  tripTitle: string;
  departureDate: Date;
  returnDate: Date;
  base: number;
  fee: number;
  total: number;
  paymentMethod: string;
  squarePaymentId: string | null;
  paidAt: Date;
}) {
  const methodLabel =
    data.paymentMethod === "credit_card"
      ? "Credit Card"
      : data.paymentMethod === "ach"
      ? "Bank Transfer (ACH)"
      : "Check";

  const confirmationId = data.squarePaymentId
    ? data.squarePaymentId.slice(0, 12).toUpperCase()
    : "—";

  const feeRow =
    data.fee > 0 && data.paymentMethod === "credit_card"
      ? `
        <tr>
          <td style="padding:10px 16px;font-size:14px;color:${BRAND.body};border-bottom:1px solid ${BRAND.divider};">Credit card fee (3.9%)</td>
          <td style="padding:10px 16px;font-size:14px;color:${BRAND.body};border-bottom:1px solid ${BRAND.divider};text-align:right;">${fmtMoney(data.fee)}</td>
        </tr>`
      : "";

  const receipt = `
    <div style="background:#ffffff;border:1px solid ${BRAND.divider};border-top:4px solid ${BRAND.green600};border-radius:3px;margin:8px 0 16px;">
      <div style="padding:18px 20px 8px;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">Receipt</div>
        <div style="font-size:20px;font-weight:700;color:${BRAND.ink};margin-top:4px;">${data.tripTitle}</div>
        <div style="font-size:13px;color:${BRAND.muted};margin-top:4px;">Departs ${fmtDate(data.departureDate)} &middot; Returns ${fmtDate(data.returnDate)}</div>
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;">
        <tr>
          <td style="padding:10px 16px;font-size:14px;color:${BRAND.body};border-bottom:1px solid ${BRAND.divider};">Deposit</td>
          <td style="padding:10px 16px;font-size:14px;color:${BRAND.body};border-bottom:1px solid ${BRAND.divider};text-align:right;">${fmtMoney(data.base)}</td>
        </tr>
        ${feeRow}
        <tr>
          <td style="padding:14px 16px;font-size:15px;color:${BRAND.ink};font-weight:700;background:${BRAND.green50};">Total charged</td>
          <td style="padding:14px 16px;font-size:17px;color:${BRAND.green800};font-weight:700;background:${BRAND.green50};text-align:right;">${fmtMoney(data.total)}</td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:10px 16px;font-size:12px;color:${BRAND.muted};">Paid with</td>
          <td style="padding:10px 16px;font-size:12px;color:${BRAND.muted};text-align:right;">${methodLabel}</td>
        </tr>
        <tr>
          <td style="padding:0 16px 10px;font-size:12px;color:${BRAND.muted};">Date</td>
          <td style="padding:0 16px 10px;font-size:12px;color:${BRAND.muted};text-align:right;">${fmtDate(data.paidAt)}</td>
        </tr>
        <tr>
          <td style="padding:0 16px 16px;font-size:12px;color:${BRAND.muted};">Confirmation #</td>
          <td style="padding:0 16px 16px;font-size:12px;color:${BRAND.muted};text-align:right;font-family:'Courier New',monospace;letter-spacing:1px;">${confirmationId}</td>
        </tr>
      </table>
    </div>
  `;

  const nextSteps = `
    <div style="background:${BRAND.green50};border-left:3px solid ${BRAND.green600};padding:16px 20px;margin:16px 0 8px;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.green800};font-weight:700;margin-bottom:8px;">What happens next</div>
      <ol style="margin:0;padding-left:18px;color:${BRAND.body};font-size:14px;line-height:1.7;">
        <li>Your spot on this trip is officially reserved.</li>
        <li>We'll send a balance-due reminder as departure approaches.</li>
        <li>Pre-trip updates, documents, and itinerary details will arrive by email.</li>
      </ol>
    </div>
  `;

  const html = brandedEmail({
    preheader: `Thank you for booking ${data.tripTitle}. Your deposit of ${fmtMoney(data.total)} is confirmed.`,
    accentLabel: "Booking confirmed · Receipt",
    heading: `Thank you, ${data.clientName}!`,
    intro: `We've received your registration and deposit for <strong>${data.tripTitle}</strong>. This email is both your receipt and your booking confirmation — we're thrilled to have you with us.`,
    bodyHtml: receipt + nextSteps,
    footerNote: `Have a question about your booking? Just reply to this email — it goes straight to us.`,
  });

  await resend.emails.send({
    from: FROM,
    to: data.clientEmail,
    replyTo: REPLY_TO,
    subject: `Thank You — Deposit Received for ${data.tripTitle}`,
    html,
    attachments: [LOGO_ATTACHMENT],
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

  const bodyHtml = kvTable([
    ["Client", data.clientName],
    ["Trip", data.tripTitle],
    ["Amount", fmtMoney(data.amount)],
    ["Type", data.type],
    ["Method", methodLabel],
  ]);

  const html = brandedEmail({
    preheader: `Payment of ${fmtMoney(data.amount)} received from ${data.clientName}`,
    accentLabel: "Admin · Payment Received",
    heading: `${fmtMoney(data.amount)} received`,
    intro: `A <strong>${data.type.toLowerCase()}</strong> payment from <strong>${data.clientName}</strong> for <strong>${data.tripTitle}</strong> just landed.`,
    bodyHtml,
    ctaText: "View in admin dashboard",
    ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/payments`,
  });

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: REPLY_TO,
    subject: `Payment Received: ${fmtMoney(data.amount)} from ${data.clientName}`,
    html,
    attachments: [LOGO_ATTACHMENT],
  });
}

export async function notifyNewContactMessage(data: {
  name: string;
  email: string;
  message: string;
}) {
  const safeMessage = data.message.replace(/</g, "&lt;").replace(/\n/g, "<br>");

  const bodyHtml = `
    ${kvTable([
      ["From", data.name],
      ["Email", `<a href="mailto:${data.email}" style="color:${BRAND.green700};text-decoration:none;">${data.email}</a>`],
    ])}
    <div style="margin-top:16px;background:#ffffff;border:1px solid ${BRAND.divider};border-left:4px solid ${BRAND.green600};padding:16px 20px;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.muted};font-weight:700;margin-bottom:8px;">Message</div>
      <div style="font-size:15px;color:${BRAND.ink};line-height:1.6;">${safeMessage}</div>
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `New Contact Message from ${data.name}`,
    html: brandedEmail({
      preheader: `${data.name} sent a message through the website.`,
      accentLabel: "Admin · New Message",
      heading: `New message from ${data.name}`,
      intro: `Reply to this email to respond to them directly.`,
      bodyHtml,
      ctaText: "Open admin inbox",
      ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/messages`,
    }),
    attachments: [LOGO_ATTACHMENT],
  });
}

export async function sendContactReceived(data: {
  name: string;
  email: string;
  message: string;
}) {
  const safeMessage = data.message.replace(/</g, "&lt;").replace(/\n/g, "<br>");

  const bodyHtml = `
    <div style="background:${BRAND.green50};border-left:3px solid ${BRAND.green600};padding:14px 18px;margin:0 0 16px;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.green800};font-weight:700;margin-bottom:6px;">Your message</div>
      <div style="font-size:14px;color:${BRAND.body};line-height:1.6;font-style:italic;">${safeMessage}</div>
    </div>
    <p style="margin:0;color:${BRAND.body};font-size:15px;line-height:1.6;">
      We typically respond within one business day. In the meantime, feel free to browse our upcoming trips.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: data.email,
    replyTo: REPLY_TO,
    subject: "We received your message — Shobra Travel Agency",
    html: brandedEmail({
      preheader: "Thanks for reaching out — we'll get back to you shortly.",
      accentLabel: "Message received",
      heading: `Thanks, ${data.name}!`,
      intro: `We've received your message and someone from our team will be in touch soon.`,
      bodyHtml,
      ctaText: "Explore upcoming trips",
      ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL}/trips`,
      footerNote: `Need to add something? Just reply to this email.`,
    }),
    attachments: [LOGO_ATTACHMENT],
  });
}

export async function sendReviewReceived(data: {
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  content: string;
}) {
  const fullStars = "★".repeat(data.rating);
  const emptyStars = "☆".repeat(5 - data.rating);
  const safeContent = data.content.replace(/</g, "&lt;");

  const bodyHtml = `
    <div style="font-size:22px;letter-spacing:4px;margin:0 0 14px;">
      <span style="color:${BRAND.green600};">${fullStars}</span><span style="color:${BRAND.divider};">${emptyStars}</span>
    </div>
    <blockquote style="margin:0;padding:18px 22px;background:${BRAND.green50};border-left:4px solid ${BRAND.green600};font-size:15px;line-height:1.6;color:${BRAND.ink};font-style:italic;">
      &ldquo;${safeContent}&rdquo;
    </blockquote>
    <p style="margin:18px 0 0;color:${BRAND.body};font-size:15px;line-height:1.6;">
      Our team briefly reviews each submission before posting. Once it's live on our site, we'll let you know.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: data.reviewerEmail,
    replyTo: REPLY_TO,
    subject: "Thanks for your review — Shobra Travel Agency",
    html: brandedEmail({
      preheader: "We received your review and will post it shortly.",
      accentLabel: "Review received",
      heading: `Thank you, ${data.reviewerName}!`,
      intro: `We really appreciate you taking the time to share your experience.`,
      bodyHtml,
    }),
    attachments: [LOGO_ATTACHMENT],
  });
}

export async function sendReviewApproved(data: {
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
}) {
  const fullStars = "★".repeat(data.rating);
  const emptyStars = "☆".repeat(5 - data.rating);

  const bodyHtml = `
    <div style="font-size:22px;letter-spacing:4px;margin:0 0 14px;">
      <span style="color:${BRAND.green600};">${fullStars}</span><span style="color:${BRAND.divider};">${emptyStars}</span>
    </div>
    <p style="margin:0;color:${BRAND.body};font-size:15px;line-height:1.6;">
      Your kind words mean the world to us — and to future travelers who are deciding where to go next.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: data.reviewerEmail,
    replyTo: REPLY_TO,
    subject: "Your review is now live — Shobra Travel Agency",
    html: brandedEmail({
      preheader: "Your review has been published on our website.",
      accentLabel: "Review published",
      heading: `${data.reviewerName}, your review is live!`,
      intro: `Thanks again for sharing your experience with Shobra Travel Agency.`,
      bodyHtml,
      ctaText: "See it on our site",
      ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL}/reviews`,
    }),
    attachments: [LOGO_ATTACHMENT],
  });
}

export async function sendBalanceDueReminder(data: {
  clientName: string;
  clientEmail: string;
  tripTitle: string;
  departureDate: Date;
  returnDate: Date;
  balanceDue: number;
  paymentDueDate: Date;
  daysUntilDue: number;
}) {
  const daysLabel =
    data.daysUntilDue === 1 ? "1 day" : `${data.daysUntilDue} days`;

  const bodyHtml = `
    <div style="background:#ffffff;border:1px solid ${BRAND.divider};border-top:4px solid ${BRAND.green600};padding:20px 22px;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">Balance due</div>
      <div style="font-size:28px;font-weight:700;color:${BRAND.green800};margin-top:4px;">${fmtMoney(data.balanceDue)}</div>
      <div style="font-size:14px;color:${BRAND.body};margin-top:10px;">
        ${data.tripTitle}<br>
        <span style="color:${BRAND.muted};">Departs ${fmtDate(data.departureDate)} &middot; Returns ${fmtDate(data.returnDate)}</span>
      </div>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid ${BRAND.divider};">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">Payment due by</div>
        <div style="font-size:18px;font-weight:700;color:${BRAND.ink};margin-top:4px;">${fmtDate(data.paymentDueDate)}</div>
        <div style="font-size:13px;color:${BRAND.muted};margin-top:2px;">That's ${daysLabel} from today.</div>
      </div>
    </div>
    <p style="margin:18px 0 0;color:${BRAND.body};font-size:15px;line-height:1.6;">
      We close out bookings three months before departure, so the final payment needs to land by <strong>${fmtDate(data.paymentDueDate)}</strong> to keep your spot on this trip.
    </p>
    <p style="margin:12px 0 0;color:${BRAND.body};font-size:15px;line-height:1.6;">
      Simply reply to this email and we'll send you a secure payment link (or provide ACH / check instructions, whichever works best for you).
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: data.clientEmail,
    replyTo: REPLY_TO,
    subject: `Balance due ${fmtDate(data.paymentDueDate)} — ${data.tripTitle}`,
    html: brandedEmail({
      preheader: `Final payment of ${fmtMoney(data.balanceDue)} due ${fmtDate(data.paymentDueDate)}.`,
      accentLabel: "Balance due reminder",
      heading: `${data.clientName}, your balance is due in ${daysLabel}`,
      intro: `A friendly reminder that the final payment for your trip is due one week from today.`,
      bodyHtml,
      footerNote: `Questions about your balance or payment options? Reply to this email and we'll sort it out.`,
    }),
    attachments: [LOGO_ATTACHMENT],
  });
}

export async function sendFinalPaymentReceipt(data: {
  clientName: string;
  clientEmail: string;
  tripTitle: string;
  departureDate: Date;
  returnDate: Date;
  amount: number;
  paymentMethod: string;
  squarePaymentId: string | null;
  paidAt: Date;
}) {
  const methodLabel =
    data.paymentMethod === "credit_card"
      ? "Credit Card"
      : data.paymentMethod === "ach"
      ? "Bank Transfer (ACH)"
      : "Check";
  const confirmationId = data.squarePaymentId
    ? data.squarePaymentId.slice(0, 12).toUpperCase()
    : "—";

  const bodyHtml = `
    <div style="background:#ffffff;border:1px solid ${BRAND.divider};border-top:4px solid ${BRAND.green600};padding:20px 22px;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">Paid in full</div>
      <div style="font-size:20px;font-weight:700;color:${BRAND.ink};margin-top:4px;">${data.tripTitle}</div>
      <div style="font-size:13px;color:${BRAND.muted};margin-top:4px;">Departs ${fmtDate(data.departureDate)} &middot; Returns ${fmtDate(data.returnDate)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:14px;">
        <tr>
          <td style="padding:12px 0;font-size:15px;color:${BRAND.ink};font-weight:700;background:${BRAND.green50};padding-left:14px;">Balance paid</td>
          <td style="padding:12px 14px;font-size:17px;color:${BRAND.green800};font-weight:700;background:${BRAND.green50};text-align:right;">${fmtMoney(data.amount)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:12px;color:${BRAND.muted};">Paid with</td>
          <td style="padding:8px 0;font-size:12px;color:${BRAND.muted};text-align:right;">${methodLabel}</td>
        </tr>
        <tr>
          <td style="padding:0;font-size:12px;color:${BRAND.muted};">Date</td>
          <td style="padding:0;font-size:12px;color:${BRAND.muted};text-align:right;">${fmtDate(data.paidAt)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0 0;font-size:12px;color:${BRAND.muted};">Confirmation #</td>
          <td style="padding:4px 0 0;font-size:12px;color:${BRAND.muted};text-align:right;font-family:'Courier New',monospace;letter-spacing:1px;">${confirmationId}</td>
        </tr>
      </table>
    </div>
    <p style="margin:18px 0 0;color:${BRAND.body};font-size:15px;line-height:1.6;">
      You're all set — your trip is paid in full. Keep an eye on your inbox for pre-trip details and packing tips in the coming weeks.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to: data.clientEmail,
    replyTo: REPLY_TO,
    subject: `Paid in full — ${data.tripTitle}`,
    html: brandedEmail({
      preheader: `Final payment of ${fmtMoney(data.amount)} received. Your trip is paid in full.`,
      accentLabel: "Paid in full · Receipt",
      heading: `Thank you, ${data.clientName}!`,
      intro: `We've received your final payment. You're officially good to go for <strong>${data.tripTitle}</strong>.`,
      bodyHtml,
      footerNote: `Questions before you travel? Just reply to this email.`,
    }),
    attachments: [LOGO_ATTACHMENT],
  });
}

export async function notifyNewReview(data: {
  reviewerName: string;
  rating: number;
  content: string;
}) {
  const fullStars = "★".repeat(data.rating);
  const emptyStars = "☆".repeat(5 - data.rating);

  const quote = `
    <blockquote style="margin:0;padding:20px 24px;background:${BRAND.green50};border-left:4px solid ${BRAND.green600};font-size:16px;line-height:1.6;color:${BRAND.ink};font-style:italic;border-radius:2px;">
      &ldquo;${data.content.replace(/</g, "&lt;")}&rdquo;
    </blockquote>
  `;

  const stars = `
    <div style="font-size:24px;letter-spacing:4px;margin:4px 0 16px;">
      <span style="color:${BRAND.green600};">${fullStars}</span><span style="color:${BRAND.divider};">${emptyStars}</span>
      <span style="font-size:14px;color:${BRAND.muted};letter-spacing:0;margin-left:10px;vertical-align:2px;">${data.rating} / 5 from ${data.reviewerName}</span>
    </div>
  `;

  const html = brandedEmail({
    preheader: `${data.rating}/5 review from ${data.reviewerName}`,
    accentLabel: "Admin · New Review",
    heading: "A new review needs your approval",
    bodyHtml: stars + quote,
    ctaText: "Review & approve",
    ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reviews`,
    footerNote: `This review is pending approval — it won't show on the site until you approve it.`,
  });

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: REPLY_TO,
    subject: `New Review: ${data.rating}/5 from ${data.reviewerName}`,
    html,
    attachments: [LOGO_ATTACHMENT],
  });
}
