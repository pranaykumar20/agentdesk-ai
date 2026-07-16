import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const setupError =
    params.error === "supabase_not_configured"
      ? "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      : null;

  return (
    <AuthCard title="Welcome back" description="Sign in to your AgentDesk AI account.">
      {setupError ? <p className="mb-4 text-sm text-destructive">{setupError}</p> : null}
      <LoginForm nextPath={params.next} />
    </AuthCard>
  );
}
