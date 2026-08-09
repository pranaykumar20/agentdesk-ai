import type { AgentCapability } from "@/modules/agents/types";

export const WIZARD_STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Prompt" },
  { id: 3, label: "Knowledge" },
  { id: 4, label: "Phone" },
  { id: 5, label: "Test call" },
  { id: 6, label: "Publish" },
] as const;

export type WizardState = {
  step: number;
  agentId: string | null;
  name: string;
  roleTitle: string;
  department: string;
  description: string;
  tone: string;
  industry: string;
  language: string;
  voice: string;
  greeting: string;
  systemPrompt: string;
  capabilities: AgentCapability[];
  hours: string;
  faqs: Array<{ question: string; answer: string }>;
  areaCode: string;
  phoneE164: string | null;
  testPhone: string;
  brief: string;
};

export function initialWizardState(partial?: Partial<WizardState>): WizardState {
  return {
    step: 0, // 0 = gallery
    agentId: null,
    name: "Ava",
    roleTitle: "Receptionist",
    department: "Front Office",
    description: "",
    tone: "Friendly professional",
    industry: "restaurant",
    language: "en-US",
    voice: "Elliot",
    greeting: "",
    systemPrompt: "",
    capabilities: [],
    hours: "Mon–Fri 9am–9pm\nSat 10am–8pm\nSun closed",
    faqs: [{ question: "What are your hours?", answer: "" }],
    areaCode: "513",
    phoneE164: null,
    testPhone: "",
    brief: "",
    ...partial,
  };
}
