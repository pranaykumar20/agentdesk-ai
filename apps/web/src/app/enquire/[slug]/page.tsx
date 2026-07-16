import { notFound } from "next/navigation";
import { prisma } from "@ai-voice-leads/db";
import { EnquiryForm } from "@/components/EnquiryForm";

export const dynamic = "force-dynamic";

export default async function EnquirePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!org) notFound();

  return (
    <main className="container" style={{ maxWidth: 520, paddingTop: 48, paddingBottom: 48 }}>
      <h1>Contact {org.name}</h1>
      <p className="muted">
        Submit your details and our AI assistant will call you back within seconds.
      </p>
      <div className="card" style={{ marginTop: 24 }}>
        <EnquiryForm orgSlug={org.slug} orgName={org.name} />
      </div>
    </main>
  );
}
