"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { BillingInterval, PlanKey } from "@/modules/billing/types";

export function CheckoutButton({
  planKey,
  interval = "month",
  label,
  variant = "default",
}: {
  planKey: PlanKey;
  interval?: BillingInterval;
  label: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        variant={variant}
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await fetch("/api/billing/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planKey, interval }),
            });
            const data = (await res.json()) as { url?: string; error?: string };
            if (!res.ok || !data.url) {
              setError(data.error ?? "Checkout failed");
              return;
            }
            window.location.href = data.url;
            router.refresh();
          });
        }}
      >
        {pending ? "Starting…" : label}
      </Button>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function ManageBillingButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await fetch("/api/billing/portal", { method: "POST" });
            const data = (await res.json()) as { url?: string; error?: string };
            if (!res.ok || !data.url) {
              setError(data.error ?? "Could not open billing portal");
              return;
            }
            window.location.href = data.url;
            router.refresh();
          });
        }}
      >
        {pending ? "Opening…" : "Manage subscription"}
      </Button>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
