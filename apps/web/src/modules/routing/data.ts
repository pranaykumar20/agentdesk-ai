import { addDemoRule, getDemoRules, setDemoRules } from "./demo-data";
import type { RoutingRule, RoutingRuleStatus } from "./types";

export async function listRoutingRules(organizationId: string): Promise<RoutingRule[]> {
  return getDemoRules(organizationId);
}

export async function createRoutingRule(input: {
  organizationId: string;
  name: string;
  description: string;
}): Promise<RoutingRule> {
  const existing = await listRoutingRules(input.organizationId);
  const rule: RoutingRule = {
    id: `rr-${crypto.randomUUID().slice(0, 8)}`,
    organizationId: input.organizationId,
    name: input.name,
    description: input.description,
    priority: (existing[0]?.priority ?? 10) - 1,
    status: "active",
    conditions: [{ field: "intent", operator: "equals", value: "general" }],
    actions: [{ actionType: "answer_with_ai", config: {} }],
    fallback: "voicemail",
  };
  addDemoRule(rule);
  return rule;
}

export async function reorderRoutingRules(
  organizationId: string,
  orderedIds: string[],
): Promise<RoutingRule[]> {
  const current = await listRoutingRules(organizationId);
  const byId = new Map(current.map((r) => [r.id, r]));
  const reordered = orderedIds
    .map((id, index) => {
      const rule = byId.get(id);
      if (!rule) return null;
      return { ...rule, priority: (index + 1) * 10 };
    })
    .filter((r): r is RoutingRule => Boolean(r));

  // append any missing
  for (const rule of current) {
    if (!orderedIds.includes(rule.id)) reordered.push(rule);
  }

  setDemoRules(organizationId, reordered);
  return getDemoRules(organizationId);
}

export async function updateRoutingRuleStatus(
  organizationId: string,
  id: string,
  status: RoutingRuleStatus,
): Promise<RoutingRule | null> {
  const rules = await listRoutingRules(organizationId);
  const next = rules.map((r) => (r.id === id ? { ...r, status } : r));
  setDemoRules(organizationId, next);
  return next.find((r) => r.id === id) ?? null;
}

export async function duplicateRoutingRule(
  organizationId: string,
  id: string,
): Promise<RoutingRule | null> {
  const rules = await listRoutingRules(organizationId);
  const source = rules.find((r) => r.id === id);
  if (!source) return null;
  const copy: RoutingRule = {
    ...source,
    id: `rr-${crypto.randomUUID().slice(0, 8)}`,
    name: `${source.name} (copy)`,
    priority: source.priority + 1,
    status: "paused",
  };
  addDemoRule(copy);
  return copy;
}
