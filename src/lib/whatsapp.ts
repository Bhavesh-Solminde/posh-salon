// India-only salon: bare 10-digit customer numbers need the 91 country code
// before wa.me will accept them. Numbers already carrying a country code
// (12+ digits) pass through untouched.
export function toWhatsappPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export function buildWhatsappHref(phone: string, message: string): string {
  return `https://wa.me/${toWhatsappPhone(phone)}?text=${encodeURIComponent(message)}`;
}
