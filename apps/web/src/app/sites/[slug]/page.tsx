import { notFound } from "next/navigation";
import { prisma } from "@ai-voice-leads/db";
import { VERTICAL_DETAILS, type VerticalSlug } from "@ai-voice-leads/shared";
import { EnquiryForm } from "@/components/EnquiryForm";

export const dynamic = "force-dynamic";

export default async function SitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug },
    include: { profile: true, landingPages: true },
  });

  if (!org) notFound();

  const industry = org.profile?.industry?.toLowerCase().replace("_", "-") ?? "general";
  const vertical =
    VERTICAL_DETAILS[industry as VerticalSlug] ?? VERTICAL_DETAILS.restaurant;

  const hero = (org.landingPages[0]?.heroJson as { tagline?: string }) ?? {};

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div className="container" style={{ display: "flex", justifyContent: "space-between" }}>
          <strong style={{ fontSize: "1.2rem" }}>{org.name}</strong>
          <span className="muted" style={{ fontSize: 13 }}>
            Powered by VoiceLead
          </span>
        </div>
      </header>

      <section className="container" style={{ paddingTop: 64, paddingBottom: 32, maxWidth: 800 }}>
        <p className="eyebrow">{vertical.name}</p>
        <h1 style={{ fontSize: "2.4rem", lineHeight: 1.15, margin: "8px 0 16px" }}>
          {hero.tagline ?? vertical.headline}
        </h1>
        <p className="muted" style={{ fontSize: 18, marginBottom: 32 }}>
          {org.profile?.greeting ?? vertical.description}
        </p>

        <div className="grid-2" style={{ marginBottom: 40 }}>
          {vertical.features.map((f) => (
            <div key={f} className="card" style={{ padding: 14 }}>
              <span style={{ fontSize: 14 }}>✓ {f}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ maxWidth: 480, paddingBottom: 64 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Get in touch</h2>
          <p className="muted" style={{ marginBottom: 16 }}>
            Submit your details — we&apos;ll text you instantly and call within seconds.
          </p>
          <EnquiryForm orgSlug={org.slug} orgName={org.name} />
        </div>
      </section>
    </main>
  );
}
