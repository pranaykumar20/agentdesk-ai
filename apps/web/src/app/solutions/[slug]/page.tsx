import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import {
  SOLUTIONS,
  VERTICAL_DETAILS,
  type VerticalSlug,
} from "@ai-voice-leads/shared";

type Props = { params: Promise<{ slug: string }> };

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;

  const vertical = VERTICAL_DETAILS[slug as VerticalSlug];
  const solution = SOLUTIONS.find((s) => s.slug === slug);

  if (!vertical && !solution) notFound();

  if (vertical) {
    return (
      <MarketingLayout>
        <section className="section hero">
          <div className="container">
            <p className="eyebrow">{vertical.name.toUpperCase()}</p>
            <h1 className="hero-title">{vertical.headline}</h1>
            <p className="hero-sub muted">{vertical.description}</p>
            <div className="hero-cta">
              <Link href="/audit" className="btn">
                Book Free Audit
              </Link>
              <Link href="/sign-up" className="btn btn-secondary">
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container grid-2">
            <div className="card">
              <h3>Inbound</h3>
              <p className="muted">{vertical.inboundUseCase}</p>
            </div>
            <div className="card">
              <h3>Outbound</h3>
              <p className="muted">{vertical.outboundUseCase}</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Channels</h2>
            <div className="vertical-scroll">
              {vertical.channels.map((c) => (
                <span key={c} className="vertical-chip">
                  {c}
                </span>
              ))}
            </div>
            <h2 style={{ marginTop: 32 }}>Features</h2>
            <ul className="feature-list">
              {vertical.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link href="/enquire/demo-restaurant" className="btn btn-secondary" style={{ marginTop: 24 }}>
              Try demo form
            </Link>
          </div>
        </section>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <section className="section hero">
        <div className="container">
          <p className="eyebrow">{solution!.category.toUpperCase()}</p>
          <h1 className="hero-title">{solution!.name}</h1>
          <p className="hero-sub muted">{solution!.description}</p>
          {solution!.priceUsd === 0 ? (
            <Link href="/audit" className="btn">
              Book Free Audit
            </Link>
          ) : (
            <div className="hero-cta">
              <Link href="/pricing" className="btn">
                View Pricing
              </Link>
              <Link href="/sign-up" className="btn btn-secondary">
                Start Free Trial
              </Link>
            </div>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
