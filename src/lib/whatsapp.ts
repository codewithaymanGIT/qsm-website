type Details = { dimensions?: string; quantity?: string };

const line = (label: string, value?: string) => (value ? `${label}: ${value}` : `${label}:`);

export function whatsappMessage(subject?: string, details: Details = {}): string {
  const what = subject ? `${subject} Steel` : "steel";
  return [
    `Hello, I would like a quotation for ${what}.`,
    line("Dimensions", details.dimensions),
    line("Quantity", details.quantity),
    "Please contact me.",
  ].join("\n");
}

/** wa.me link with a pre-filled message. An unset number opens a contact picker. */
export function buildWhatsAppUrl(number: string, subject?: string, details?: Details): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage(subject, details))}`;
}
