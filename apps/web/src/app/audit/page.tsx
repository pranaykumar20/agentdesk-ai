import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { AuditForm } from "@/components/marketing/AuditForm";

const CAL_EMBED_URL = process.env.NEXT_PUBLIC_CAL_EMBED_URL?.trim();

export default function AuditPage() {
  return (
    <MarketingLayout>
      <section className="section hero">
        <div className="container">
          <p className="eyebrow">FREE REVENUE AUDIT</p>
          <h1 className="hero-title">Find where your business is leaking revenue</h1>
          <p className="hero-sub muted">
            30-minute strategy call. We map your lead flow, identify gaps, and show you exactly
            what to automate — no obligation.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid-2">
          <div className="card">
            <h3>What we cover</h3>
            <ul className="feature-list">
              <li>Where leads are going cold</li>
              <li>Manual tasks eating your team&apos;s time</li>
              <li>Website conversion gaps</li>
              <li>Recommended voice + SMS + CRM setup</li>
              <li>Fixed scope and price if you proceed</li>
            </ul>
            <p className="muted" style={{ fontSize: 14, marginTop: 16 }}>
              Prefer self-serve?{" "}
              <Link href="/sign-up">Start your free trial</Link> and go live in under an hour.
            </p>
          </div>

          <div className="card">
            <h3>Book your audit</h3>
            {CAL_EMBED_URL ? (
              <iframe
                src={CAL_EMBED_URL}
                style={{ width: "100%", height: 480, border: "none", borderRadius: 8 }}
                title="Book audit"
              />
            ) : (
              <AuditForm />
            )}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
