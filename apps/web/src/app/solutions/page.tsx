import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SOLUTIONS, VERTICALS } from "@ai-voice-leads/shared";

export default function SolutionsPage() {
  return (
    <MarketingLayout>
      <section className="section hero">
        <div className="container">
          <p className="eyebrow">SOLUTIONS</p>
          <h1 className="hero-title">Pre-built systems for every business</h1>
          <p className="hero-sub muted">
            Start with one solution or deploy a full revenue system. Each includes AI voice,
            TCPA-compliant SMS follow-up, and lead capture.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>By industry</h2>
          <div className="vertical-scroll" style={{ marginBottom: 40 }}>
            {VERTICALS.map((v) => (
              <Link key={v.slug} href={`/solutions/${v.slug}`} className="vertical-chip">
                <span>{v.icon}</span> {v.name}
              </Link>
            ))}
          </div>

          <h2>By solution</h2>
          <div className="grid-2">
            {SOLUTIONS.map((sol) => (
              <div key={sol.slug} className="card solution-card">
                <span className="solution-category">{sol.category}</span>
                <h3>{sol.name}</h3>
                <p className="muted">{sol.description}</p>
                <Link href={`/solutions/${sol.slug}`} className="link-arrow">
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
