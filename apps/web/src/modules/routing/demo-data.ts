import type { RoutingRule } from "./types";

const store = new Map<string, RoutingRule[]>();

export function buildDemoRules(organizationId: string): RoutingRule[] {
  return [
    {
      id: "rr-001",
      organizationId,
      name: "Appointment booking",
      description: "Route appointment intents to booking flow",
      priority: 10,
      status: "active",
      conditions: [{ field: "intent", operator: "equals", value: "book_appointment" }],
      actions: [{ actionType: "book_appointment", config: {} }],
      fallback: "ai_message",
    },
    {
      id: "rr-002",
      organizationId,
      name: "Billing",
      description: "Route billing questions to Billing department",
      priority: 20,
      status: "active",
      conditions: [{ field: "intent", operator: "equals", value: "billing" }],
      actions: [{ actionType: "route_department", config: { department: "Billing" } }],
      fallback: "voicemail",
    },
    {
      id: "rr-003",
      organizationId,
      name: "Insurance",
      description: "Route insurance questions to Billing",
      priority: 30,
      status: "active",
      conditions: [{ field: "intent", operator: "equals", value: "insurance" }],
      actions: [{ actionType: "route_department", config: { department: "Billing" } }],
      fallback: "callback",
    },
    {
      id: "rr-004",
      organizationId,
      name: "After hours",
      description: "After-hours voicemail and callback",
      priority: 90,
      status: "active",
      conditions: [{ field: "business_hours", operator: "equals", value: "closed" }],
      actions: [
        { actionType: "take_voicemail", config: {} },
        { actionType: "create_callback", config: {} },
      ],
      fallback: "ai_message",
    },
    {
      id: "rr-005",
      organizationId,
      name: "Escalation",
      description: "Escalate complex cases to Management",
      priority: 100,
      status: "paused",
      conditions: [{ field: "sentiment", operator: "equals", value: "negative" }],
      actions: [{ actionType: "route_department", config: { department: "Management" } }],
      fallback: "emergency_escalation",
    },
  ];
}

export function getDemoRules(organizationId: string): RoutingRule[] {
  const custom = store.get(organizationId);
  const rules = custom ?? buildDemoRules(organizationId);
  return [...rules].sort((a, b) => a.priority - b.priority);
}

export function setDemoRules(organizationId: string, rules: RoutingRule[]): void {
  store.set(organizationId, rules);
}

export function addDemoRule(rule: RoutingRule): void {
  const rules = getDemoRules(rule.organizationId);
  setDemoRules(rule.organizationId, [rule, ...rules]);
}
