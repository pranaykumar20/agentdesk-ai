import { FileText } from "lucide-react";
import { requireOrg } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { KnowledgeStatusBadge } from "@/components/dashboard/StatusBadge";
import { UploadDocumentForm } from "@/components/knowledge/UploadDocumentForm";
import {
  getKnowledgeMetrics,
  listFaqs,
  listKnowledgeDocuments,
} from "@/modules/knowledge/data";
import { formatDate } from "@/lib/formatting/datetime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Knowledge Base" };

export default async function KnowledgeBasePage() {
  const { organization } = await requireOrg();
  const [docs, faqs, metrics] = await Promise.all([
    listKnowledgeDocuments(organization.id),
    listFaqs(organization.id),
    getKnowledgeMetrics(organization.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Documents and FAQs that power your AI receptionist."
        actions={<UploadDocumentForm />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Articles" value={metrics.totalArticles} />
        <MetricCard label="Published" value={metrics.published} />
        <MetricCard label="Drafts" value={metrics.drafts} />
        <MetricCard label="Processing" value={metrics.processing} />
        <MetricCard label="Failed" value={metrics.failed} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm xl:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Documents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Article</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Updated</th>
                  <th className="px-3 py-3 font-medium">Views</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id} className="border-b border-border/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" aria-hidden />
                        <span className="font-medium text-foreground">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{doc.category ?? "—"}</td>
                    <td className="px-3 py-3">
                      <KnowledgeStatusBadge status={doc.status} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatDate(doc.updatedAt, organization.timezone)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{doc.viewCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">FAQs</h2>
          <ul className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <li key={faq.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground">{faq.question}</p>
                <p className="mt-1 text-xs text-muted-foreground">{faq.answer}</p>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-primary">{faq.category}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
