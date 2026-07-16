import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { AUTH_ROUTES } from "./constants";
import { getLocalDemoUser, isLocalDemoMode } from "./local-demo";
import type { User } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<User | null> {
  if (!getSupabaseEnv().configured) {
    return isLocalDemoMode() ? getLocalDemoUser() : null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect(AUTH_ROUTES.login);
  }
  return user;
}

export async function getAuthUserId(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.id ?? null;
}
