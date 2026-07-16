export type OrganizationGeneralSettings = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  website: string;
  industry: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  language: string;
};

export type NotificationPreferences = {
  missedCall: boolean;
  newLead: boolean;
  appointmentBooked: boolean;
  escalation: boolean;
  integrationFailure: boolean;
  usageLimit: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
};
