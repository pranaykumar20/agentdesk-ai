import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Set new password" };

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Choose a new password" description="Enter a strong password for your account.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
