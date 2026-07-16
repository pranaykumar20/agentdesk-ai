import { mockBillingProvider } from "./mock/billing";
import { mockCalendarProvider } from "./mock/calendar";
import { mockTelephonyProvider } from "./mock/telephony";
import { mockVoiceProvider } from "./mock/voice";
import { retellVoiceProvider } from "./retell/voice";
import { stripeBillingProvider } from "./stripe/billing";
import type { BillingProvider, CalendarProvider, TelephonyProvider, VoiceProvider } from "./types";

export type * from "./types";

export function getVoiceProvider(): VoiceProvider {
  const mode = process.env.VOICE_PROVIDER?.trim() || "mock";
  if (mode === "retell") return retellVoiceProvider;
  return mockVoiceProvider;
}

export function getTelephonyProvider(): TelephonyProvider {
  const mode = process.env.TELEPHONY_PROVIDER?.trim() || "mock";
  if (mode === "twilio") {
    // Twilio adapter in Phase G — fall back to mock with warning via name
    return mockTelephonyProvider;
  }
  return mockTelephonyProvider;
}

export function getBillingProvider(): BillingProvider {
  const mode = process.env.BILLING_PROVIDER?.trim() || "mock";
  if (mode === "stripe") return stripeBillingProvider;
  return mockBillingProvider;
}

export function getCalendarProvider(): CalendarProvider {
  const mode = process.env.CALENDAR_PROVIDER?.trim() || "mock";
  if (mode === "google") {
    return mockCalendarProvider;
  }
  return mockCalendarProvider;
}
