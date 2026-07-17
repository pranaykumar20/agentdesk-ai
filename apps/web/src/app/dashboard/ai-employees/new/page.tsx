import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateEmployeeForm } from "@/components/ai-employees/CreateEmployeeForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New AI Employee" };

export default async function NewAiEmployeePage() {
  await requireOrg();

  return (
    <div>
      <PageHeader
        title="AI Employee Builder"
        description="Create unlimited AI employees — receptionists, sales reps, support agents, and more."
      />
      <CreateEmployeeForm />
    </div>
  );
}
