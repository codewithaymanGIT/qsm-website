export function whatsappMessage(subject?: string): string {
  const what = subject ? `${subject} Steel` : "steel";
  return `Hello, I would like a quotation for ${what}.\nDimensions:\nQuantity:\nPlease contact me.`;
}

/** wa.me link with a pre-filled message. An unset number opens a contact picker. */
export function buildWhatsAppUrl(number: string, subject?: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage(subject))}`;
}
