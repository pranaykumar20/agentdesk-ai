"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrganizationGeneralSettings } from "@/modules/settings/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TABS = [
  "General",
  "AI Agent",
  "Phone & Calls",
  "Notifications",
  "Security",
  "Billing",
  "Team",
  "Advanced",
] as const;

export function SettingsPanel({
  initial,
  planName,
  minutesUsed,
  minutesIncluded,
}: {
  initial: OrganizationGeneralSettings;
  planName: string;
  minutesUsed: number;
  minutesIncluded: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState("");

  function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await fetch("/api/settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Save failed");
        return;
      }
      setMessage("General settings saved.");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              tab === t ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" ? (
        <form onSubmit={saveGeneral} className="grid max-w-3xl gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-2">
          {(
            [
              ["businessName", "Business name"],
              ["businessEmail", "Business email"],
              ["businessPhone", "Business phone"],
              ["website", "Website"],
              ["industry", "Industry"],
              ["timezone", "Timezone"],
              ["currency", "Currency"],
              ["dateFormat", "Date format"],
              ["language", "Language"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <Button type="submit" disabled={pending}>
              Save Changes
            </Button>
            {message ? <p className="mt-2 text-sm text-muted-foreground">{message}</p> : null}
          </div>
        </form>
      ) : null}

      {tab === "Billing" ? (
        <div className="max-w-xl rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{planName}</h3>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {minutesUsed.toLocaleString()} / {minutesIncluded.toLocaleString()} mins used
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, (minutesUsed / Math.max(minutesIncluded, 1)) * 100)}%` }}
            />
          </div>
          <div className="mt-4">
            <a href="/dashboard/billing" className="text-sm font-medium text-primary hover:underline">
              Open Billing →
            </a>
          </div>
        </div>
      ) : null}

      {tab === "Security" ? (
        <div className="max-w-xl space-y-3 rounded-xl border border-border bg-card p-5 text-sm">
          <p className="font-semibold text-foreground">Security</p>
          <p className="text-muted-foreground">Password changes use Supabase Auth. MFA placeholder for a later phase.</p>
          <p className="text-muted-foreground">Session management and API keys placeholders are documented for Phase G/H.</p>
          <p className="text-muted-foreground">Audit logs are stored in `audit_logs` (schema ready).</p>
        </div>
      ) : null}

      {tab === "Notifications" ? (
        <div className="max-w-xl space-y-2 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Notification preferences UI hooks into `modules/settings` store. Defaults: missed call, new lead, appointment booked, escalation, integration failure, and usage limit alerts via email + in-app.
        </div>
      ) : null}

      {tab === "AI Agent" || tab === "Phone & Calls" || tab === "Team" ? (
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Configure this area from the dedicated{" "}
          <a className="text-primary hover:underline" href={tab === "AI Agent" ? "/dashboard/ai-agent" : tab === "Team" ? "/dashboard/team" : "/dashboard/phone-numbers"}>
            {tab}
          </a>{" "}
          page.
        </div>
      ) : null}

      {tab === "Advanced" ? (
        <div className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Export / import and developer webhooks land in later phases. Deleting an organization requires confirmation.
          </p>
          <div className="space-y-1">
            <Label htmlFor="confirmDelete">Type DELETE to confirm organization deletion</Label>
            <Input id="confirmDelete" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} />
          </div>
          <Button type="button" variant="destructive" disabled={confirmDelete !== "DELETE"}>
            Delete organization
          </Button>
        </div>
      ) : null}
    </div>
  );
}
