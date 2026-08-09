export const AGENT_ROLES = [
  "Receptionist",
  "Sales Rep",
  "SDR",
  "Customer Support",
  "Appointment Setter",
  "Billing Agent",
  "Collections Agent",
  "Insurance Agent",
] as const;

export const AGENT_TONES = [
  "Friendly professional",
  "Warm and conversational",
  "Concise and efficient",
  "Calm and reassuring",
  "Formal and polished",
  "Upbeat and energetic",
] as const;

export const AGENT_INDUSTRIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "dental", label: "Dental" },
  { value: "clinic", label: "Clinic / healthcare" },
  { value: "general", label: "General business" },
] as const;

export const AGENT_LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "te-IN", label: "Telugu" },
] as const;

export const VOICES_BY_LANGUAGE: Record<string, Array<{ value: string; label: string }>> = {
  "en-US": [
    { value: "Elliot", label: "Elliot (Vapi)" },
    { value: "Hana", label: "Hana (Vapi)" },
    { value: "Savannah", label: "Savannah (Vapi)" },
  ],
  "te-IN": [
    { value: "te-IN-ShrutiNeural", label: "Shruti — Female (Azure Telugu)" },
    { value: "te-IN-MohanNeural", label: "Mohan — Male (Azure Telugu)" },
  ],
};

export function voicesForLanguage(language: string) {
  return VOICES_BY_LANGUAGE[language] ?? VOICES_BY_LANGUAGE["en-US"]!;
}
