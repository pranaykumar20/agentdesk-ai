import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy route — AI Agent Settings is now AI Employees (Phase 2B). */
export default function AiAgentRedirectPage() {
  redirect("/dashboard/ai-employees");
}
