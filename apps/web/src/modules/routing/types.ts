export type RoutingRuleStatus = "active" | "paused" | "disabled";

export type RoutingCondition = {
  field: string;
  operator: string;
  value: string;
};

export type RoutingAction = {
  actionType: string;
  config: Record<string, string>;
};

export type RoutingRule = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  priority: number;
  status: RoutingRuleStatus;
  conditions: RoutingCondition[];
  actions: RoutingAction[];
  fallback: string;
};
