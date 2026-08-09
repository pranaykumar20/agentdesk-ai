import { Suspense } from "react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateEmployeeWizard } from "@/components/ai-employees/CreateEmployeeWizard";
import { listAiEmployees } from "@/modules/agents/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "New AI Employee" };

export default async function NewAiEmployeePage() {
  const { organization } = await requireOrg();
  const existingEmployees = await listAiEmployees(organization.id);

  return (
    <div>
      <PageHeader
        title="AI Employee Builder"
        description="6-step wizard: template → basics → prompt → knowledge → phone → test → publish."
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading builder…</p>}>
        <CreateEmployeeWizard
          businessName={organization.name}
          existingEmployees={existingEmployees}
        />
      </Suspense>
    </div>
  );
}
