"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { assertSupabaseConfigured } from "./env";

export function createClient() {
  const { url, anonKey } = assertSupabaseConfigured();
  return createBrowserClient<Database>(url, anonKey);
}
