export type ProviderMode = "mock" | "retell" | "twilio" | "stripe" | "google" | "local";

export interface VoiceAgentInput {
  organizationId: string;
  name: string;
  greeting?: string;
  systemPrompt?: string;
  voice?: string;
  language?: string;
}

export type VoiceAgentCreateResult = {
  externalAgentId: string;
  /** Retell LLM id used for prompt/greeting/analysis updates */
  externalLlmId?: string;
};

export interface VoiceProvider {
  readonly name: string;
  createAgent(input: VoiceAgentInput): Promise<VoiceAgentCreateResult>;
  updateAgent(
    externalAgentId: string,
    input: Partial<VoiceAgentInput> & { externalLlmId?: string },
  ): Promise<void>;
  publishAgent(externalAgentId: string): Promise<void>;
  initiateTestCall(input: {
    externalAgentId: string;
    toNumber: string;
    fromNumber?: string;
  }): Promise<{ externalCallId: string }>;
  getCall(externalCallId: string): Promise<{ status: string; raw: unknown }>;
  transferCall(externalCallId: string, target: string): Promise<void>;
  verifyWebhook(headers: Headers, rawBody: string): Promise<boolean>;
}

export interface TelephonyProvider {
  readonly name: string;
  listNumbers(organizationId: string): Promise<Array<{ e164: string; friendlyName?: string }>>;
  provisionNumber(input: {
    organizationId: string;
    areaCode?: string;
    /** Retell agent id to bind for inbound (required when provider is retell) */
    inboundAgentId?: string;
  }): Promise<{ e164: string; providerSid: string }>;
  connectNumber(input: {
    organizationId: string;
    e164: string;
    inboundAgentId?: string;
  }): Promise<{ providerSid: string }>;
  configureForwarding(input: {
    e164: string;
    forwardTo: string;
  }): Promise<void>;
  sendSms(input: { to: string; body: string; from?: string }): Promise<{ sid: string }>;
  verifyWebhook(headers: Headers, rawBody: string): Promise<boolean>;
}

export interface BillingProvider {
  readonly name: string;
  createCheckoutSession(input: {
    organizationId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
  }): Promise<{ url: string }>;
  createCustomerPortalSession(input: {
    customerId: string;
    returnUrl: string;
  }): Promise<{ url: string }>;
  getSubscription(organizationId: string): Promise<{
    status: string;
    planKey: string;
  } | null>;
  verifyWebhook(headers: Headers, rawBody: string): Promise<boolean>;
}

export interface CalendarProvider {
  readonly name: string;
  getAvailability(input: {
    organizationId: string;
    from: string;
    to: string;
  }): Promise<Array<{ start: string; end: string }>>;
  createAppointment(input: {
    organizationId: string;
    title: string;
    start: string;
    end: string;
    attendeeEmail?: string;
  }): Promise<{ externalId: string }>;
  rescheduleAppointment(input: {
    externalId: string;
    start: string;
    end: string;
  }): Promise<void>;
  cancelAppointment(externalId: string): Promise<void>;
}
