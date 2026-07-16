"use client";

import Link from "next/link";
import { PRICING_PLANS } from "@ai-voice-leads/shared";

export function BillingPanel({ currentPlan }: { currentPlan: string }) {
  async function upgrade(planId: string) {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "Billing not configured. Set STRIPE_SECRET_KEY.");
    }
  }

  return (
    <div className="grid-3" style={{ marginTop: 16 }}>
      {PRICING_PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`card ${currentPlan.toLowerCase() === plan.id ? "system-highlight" : ""}`}
        >
          <h3>{plan.name}</h3>
          <p className="stat-value" style={{ fontSize: "1.8rem" }}>
            ${plan.priceUsd}
            <span className="muted" style={{ fontSize: 14 }}>
              /mo
            </span>
          </p>
          <ul className="feature-list">
            {plan.features.slice(0, 4).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {currentPlan.toLowerCase() === plan.id ? (
            <span className="badge" style={{ marginTop: 12 }}>
              Current plan
            </span>
          ) : (
            <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => upgrade(plan.id)}>
              Upgrade
            </button>
          )}
        </div>
      ))}
      <p className="muted" style={{ gridColumn: "1 / -1", fontSize: 14 }}>
        Managed setup from $600 — <Link href="/audit">book a free audit</Link>
      </p>
    </div>
  );
}
