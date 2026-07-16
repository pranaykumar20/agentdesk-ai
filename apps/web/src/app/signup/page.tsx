import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Start free trial" };

export default function SignupPage() {
  return (
    <AuthCard title="Start your free trial" description="Create your AgentDesk AI account in minutes.">
      <SignupForm />
    </AuthCard>
  );
}
