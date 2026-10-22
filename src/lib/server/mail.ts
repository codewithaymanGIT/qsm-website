import "server-only";
import nodemailer from "nodemailer";

export type LeadEmail = {
  reference: string;
  name: string;
  company: string | null;
  phone: string;
  email: string;
  gradeName: string | null;
  service: string | null;
  dimensions: string | null;
  quantity: string | null;
  message: string | null;
  pagePath: string | null;
  files: { originalName: string; sizeBytes: number }[];
};

function transport() {
  const url = process.env.SMTP_URL;
  if (!url) throw new Error("SMTP_URL is not set, so no email was sent.");
  // "json://" builds the message without sending it (tests and local development).
  return url === "json://" ? nodemailer.createTransport({ jsonTransport: true }) : nodemailer.createTransport(url);
}

const row = (label: string, value: string | null) => (value ? `${label}: ${value}` : null);

/** Notifies the sales team. Throws on any failure; callers record the error but keep the lead. */
export async function sendLeadNotification(lead: LeadEmail) {
  const to = process.env.LEAD_NOTIFY_TO;
  if (!to) throw new Error("LEAD_NOTIFY_TO is not set, so no email was sent.");
  const subject = `New enquiry ${lead.reference}: ${lead.gradeName ?? lead.service ?? "Steel"} from ${lead.company || lead.name}`;
  const text = [
    `Enquiry ${lead.reference}`,
    "",
    row("Name", lead.name),
    row("Company", lead.company),
    row("Phone", lead.phone),
    row("Email", lead.email),
    row("Grade", lead.gradeName),
    row("Service", lead.service),
    row("Dimensions", lead.dimensions),
    row("Quantity", lead.quantity),
    row("Message", lead.message),
    row("Sent from", lead.pagePath),
    lead.files.length ? `Files: ${lead.files.map((f) => `${f.originalName} (${Math.ceil(f.sizeBytes / 1024)} KB)`).join(", ")}` : null,
    "",
    "Files are stored securely and can be opened from the admin panel.",
  ]
    .filter((l) => l !== null)
    .join("\n");
  await transport().sendMail({
    from: process.env.MAIL_FROM ?? "Quality Steel and Metals <no-reply@localhost>",
    to,
    replyTo: `${lead.name} <${lead.email}>`,
    subject,
    text,
  });
}
