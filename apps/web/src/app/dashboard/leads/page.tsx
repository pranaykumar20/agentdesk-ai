import { ComingSoonPage } from "@/components/layout/ComingSoonPage";

export const metadata = { title: "Leads" };

export default function LeadsPage() {
  return (
    <ComingSoonPage
      title="Leads"
      description="Lead capture folds into calls and contacts in later phases."
      phaseHint="Phase D expands contacts/leads alongside the calls workspace."
    />
  );
}
