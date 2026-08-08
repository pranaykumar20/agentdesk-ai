import { planHasFeature } from "./feature-access";
import type { PlanKey } from "./types";

export function maxAiEmployees(planKey: PlanKey): number {
  return planHasFeature(planKey, "ai_employees_multi") ? 10 : 1;
}

export function maxPhoneNumbers(planKey: PlanKey): number {
  if (planKey === "business") return 20;
  if (planKey === "professional") return 5;
  return 1;
}

export function assertCanCreateAiEmployee(planKey: PlanKey, currentCount: number): void {
  const max = maxAiEmployees(planKey);
  if (currentCount >= max) {
    throw new Error(
      `Plan limit reached: ${planKey} allows ${max} AI employee${max === 1 ? "" : "s"}. Upgrade to add more.`,
    );
  }
}

export function assertCanProvisionPhoneNumber(planKey: PlanKey, currentCount: number): void {
  const max = maxPhoneNumbers(planKey);
  if (currentCount >= max) {
    throw new Error(
      `Plan limit reached: ${planKey} allows ${max} phone number${max === 1 ? "" : "s"}. Upgrade to add more.`,
    );
  }
}
