import type { Organization } from "@/types/database";
import type { NotificationPreferences, OrganizationGeneralSettings } from "./types";

const notificationsStore = new Map<string, NotificationPreferences>();

export function getGeneralSettings(organization: Organization): OrganizationGeneralSettings {
  return {
    businessName: organization.name,
    businessEmail: "hello@smiledentalcare.example",
    businessPhone: "+1 (513) 555-0100",
    website: "https://www.smiledentalcare.example",
    industry: organization.industry ?? "healthcare_dental",
    timezone: organization.timezone,
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    language: "en-US",
  };
}

export function getNotificationPreferences(organizationId: string): NotificationPreferences {
  return (
    notificationsStore.get(organizationId) ?? {
      missedCall: true,
      newLead: true,
      appointmentBooked: true,
      escalation: true,
      integrationFailure: true,
      usageLimit: true,
      email: true,
      sms: false,
      inApp: true,
    }
  );
}

export function setNotificationPreferences(
  organizationId: string,
  prefs: NotificationPreferences,
): NotificationPreferences {
  notificationsStore.set(organizationId, prefs);
  return prefs;
}

const generalStore = new Map<string, OrganizationGeneralSettings>();

export function saveGeneralSettings(
  organizationId: string,
  settings: OrganizationGeneralSettings,
): OrganizationGeneralSettings {
  generalStore.set(organizationId, settings);
  return settings;
}

export function getSavedGeneralSettings(
  organizationId: string,
  fallback: Organization,
): OrganizationGeneralSettings {
  return generalStore.get(organizationId) ?? getGeneralSettings(fallback);
}
