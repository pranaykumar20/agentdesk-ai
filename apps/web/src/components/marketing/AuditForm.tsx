"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics/track";

const INDUSTRY_OPTIONS = [
  "Insurance",
  "Home services",
  "Dental / healthcare",
  "Auto repair",
  "Property management",
  "Legal",
  "Real estate",
  "Restaurants",
  "Multi-location",
  "Other",
];

export function AuditForm() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent") ?? "demo";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [callVolume, setCallVolume] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started && (name || email)) {
      setStarted(true);
      track("demo_form_started", { intent });
    }
  }, [name, email, started, intent]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const composedMessage = [
      message.trim(),
      "",
      `Intent: ${intent}`,
      phone.trim() ? `Phone: ${phone.trim()}` : null,
      industry ? `Industry: ${industry}` : null,
      employeeCount ? `Employees: ${employeeCount}` : null,
      callVolume ? `Monthly call volume: ${callVolume}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/public/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          business,
          message: composedMessage,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Submission failed");
        return;
      }

      track("demo_form_submitted", { intent });
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">Request received</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Thanks! We&apos;ll reach out within 1 business day to schedule your{" "}
          {intent === "sales" ? "sales conversation" : "demo"}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="audit-name">Your name</Label>
          <Input
            id="audit-name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-email">Business email</Label>
          <Input
            id="audit-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@business.com"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="audit-business">Company</Label>
          <Input
            id="audit-business"
            required
            autoComplete="organization"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Acme Services"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-phone">Phone</Label>
          <Input
            id="audit-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="audit-industry">Industry</Label>
          <select
            id="audit-industry"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
          >
            <option value="">Select…</option>
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-employees">Employee count</Label>
          <Input
            id="audit-employees"
            value={employeeCount}
            onChange={(e) => setEmployeeCount(e.target.value)}
            placeholder="1-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-calls">Monthly call volume</Label>
          <Input
            id="audit-calls"
            value={callVolume}
            onChange={(e) => setCallVolume(e.target.value)}
            placeholder="500+"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="audit-message">What should we cover?</Label>
        <Textarea
          id="audit-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Missed calls after hours, multi-location routing, CRM sync…"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading || done}>
        {loading ? "Submitting…" : intent === "sales" ? "Contact Sales" : "Book a Demo"}
      </Button>
    </form>
  );
}
