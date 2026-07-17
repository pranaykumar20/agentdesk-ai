import { USE_CASES } from "@/content/marketing/homepage";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";

export function UseCasesSection() {
  return (
    <section id="use-cases" className="scroll-mt-24 border-b border-border py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Use cases"
          title="Sample workflows for real service businesses"
          description="These are labeled sample scenarios—not customer testimonials or verified case studies."
        />
        <ul className="mt-12 grid gap-4 lg:grid-cols-2">
          {USE_CASES.map((item) => (
            <li key={item.title} className="marketing-card rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sample use case</p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-foreground">Before</dt>
                  <dd className="text-muted-foreground">{item.before}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">AgentDesk AI workflow</dt>
                  <dd className="text-muted-foreground">{item.workflow}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Business outcome</dt>
                  <dd className="text-muted-foreground">{item.outcome}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
