import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoutingRulesBoard } from "@/components/routing/RoutingRulesBoard";
import { listRoutingRules } from "@/modules/routing/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Routing Rules" };

export default async function RoutingRulesPage() {
  const { organization } = await requireOrg();
  const rules = await listRoutingRules(organization.id);

  return (
    <div>
      <PageHeader
        title="Routing Rules"
        description="Structured WHEN/THEN rules with priority ordering. Not freeform prompts only."
      />
      <RoutingRulesBoard initialRules={rules} />
    </div>
  );
}
