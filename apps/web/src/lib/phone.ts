/** US/NANP area code: 3 digits, first digit 2–9. */
export function isValidAreaCode(value: string): boolean {
  return /^[2-9]\d{2}$/.test(value.trim());
}

/** E.164: + then country code and subscriber number (8–15 digits total after +). */
export function isValidE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value.trim());
}

export function normalizeToE164Hint(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return trimmed.startsWith("+") ? trimmed : `+${digits}`;
}
