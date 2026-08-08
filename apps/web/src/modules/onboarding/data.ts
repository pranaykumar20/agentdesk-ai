import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export const ONBOARDING_STEPS = [
  { id: 1, key: "organization", title: "Organization" },
  { id: 2, key: "knowledge", title: "Hours & FAQs" },
  { id: 3, key: "agent", title: "AI Employee" },
  { id: 4, key: "phone", title: "Phone Number" },
  { id: 5, key: "test", title: "Go Live" },
] as const;

export type OnboardingProgress = {
  currentStep: number;
  completedSteps: number[];
  data: Record<string, unknown>;
  completedAt: string | null;
};

export async function getOnboardingProgress(
  organizationId: string,
): Promise<OnboardingProgress> {
  if (!getSupabaseEnv().configured) {
    return { currentStep: 1, completedSteps: [1], data: {}, completedAt: null };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("org_onboarding_progress")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data) {
    return { currentStep: 1, completedSteps: [1], data: {}, completedAt: null };
  }

  return {
    currentStep: data.current_step,
    completedSteps: data.completed_steps ?? [],
    data: (data.data as Record<string, unknown>) ?? {},
    completedAt: data.completed_at,
  };
}

export async function isOnboardingComplete(organizationId: string): Promise<boolean> {
  if (!getSupabaseEnv().configured) return true;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("onboarding_completed_at")
    .eq("id", organizationId)
    .maybeSingle();
  if (org?.onboarding_completed_at) return true;

  const progress = await getOnboardingProgress(organizationId);
  return Boolean(progress.completedAt);
}

export async function saveOnboardingStep(
  organizationId: string,
  step: number,
  patch?: Record<string, unknown>,
): Promise<OnboardingProgress> {
  const current = await getOnboardingProgress(organizationId);
  const completedSteps = Array.from(new Set([...current.completedSteps, step])).sort(
    (a, b) => a - b,
  );
  const nextStep = Math.min(5, Math.max(current.currentStep, step + 1));
  const data = { ...current.data, ...(patch ?? {}) };
  const now = new Date().toISOString();

  if (!getSupabaseEnv().configured) {
    return { currentStep: nextStep, completedSteps, data, completedAt: null };
  }

  const supabase = await createClient();
  await supabase.from("org_onboarding_progress").upsert({
    organization_id: organizationId,
    current_step: nextStep,
    completed_steps: completedSteps,
    data: data as Json,
    updated_at: now,
  });

  await supabase
    .from("organizations")
    .update({ onboarding_step: nextStep, updated_at: now })
    .eq("id", organizationId);

  return { currentStep: nextStep, completedSteps, data, completedAt: null };
}

export async function completeOnboarding(organizationId: string): Promise<void> {
  const now = new Date().toISOString();
  if (!getSupabaseEnv().configured) return;

  const supabase = await createClient();
  const current = await getOnboardingProgress(organizationId);
  const completedSteps = Array.from(new Set([...current.completedSteps, 1, 2, 3, 4, 5])).sort(
    (a, b) => a - b,
  );

  await supabase.from("org_onboarding_progress").upsert({
    organization_id: organizationId,
    current_step: 5,
    completed_steps: completedSteps,
    data: current.data as Json,
    completed_at: now,
    updated_at: now,
  });

  await supabase
    .from("organizations")
    .update({
      onboarding_step: 99,
      onboarding_completed_at: now,
      updated_at: now,
    })
    .eq("id", organizationId);
}

export async function saveBusinessKnowledge(
  organizationId: string,
  input: {
    hours: string;
    faqs: Array<{ question: string; answer: string }>;
  },
): Promise<void> {
  if (!getSupabaseEnv().configured) return;
  const supabase = await createClient();

  await supabase.from("business_policies").insert({
    organization_id: organizationId,
    title: "Business hours",
    body: input.hours,
    status: "published",
  });

  for (const faq of input.faqs.filter((f) => f.question.trim() && f.answer.trim())) {
    await supabase.from("faq_items").insert({
      organization_id: organizationId,
      question: faq.question.trim(),
      answer: faq.answer.trim(),
      category: "onboarding",
      status: "published",
    });
  }
}
