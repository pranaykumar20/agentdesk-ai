"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/marketing/pricing";
import { cn } from "@/lib/utils";

export function PricingToggle() {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      <div className="mb-10 flex items-center justify-center gap-3">
        <span className={cn("text-sm", !annual ? "font-semibold text-foreground" : "text-muted-foreground")}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          aria-label="Toggle annual billing"
          onClick={() => setAnnual((v) => !v)}
          className={cn(
            "relative h-7 w-12 rounded-full transition-colors",
            annual ? "bg-primary" : "bg-slate-300",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
              annual ? "left-5" : "left-0.5",
            )}
          />
        </button>
        <span className={cn("text-sm", annual ? "font-semibold text-foreground" : "text-muted-foreground")}>
          Annual <span className="text-primary">(save ~20%)</span>
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PRICING_PLANS.map((plan) => {
          const price = annual ? plan.annualPriceUsd : plan.monthlyPriceUsd;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border",
              )}
            >
              {plan.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">${price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan.minutesIncluded.toLocaleString()} mins · {plan.trialDays}-day trial
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={cn(
                  "mt-8 inline-flex h-11 items-center justify-center rounded-lg text-sm font-medium",
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border bg-background hover:bg-muted",
                )}
              >
                Start free trial
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
