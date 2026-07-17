"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AuditForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/public/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, business, message }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Submission failed");
        return;
      }

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
          Thanks! We&apos;ll reach out within 1 business day to schedule your audit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
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
        <Label htmlFor="audit-email">Email</Label>
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
      <div className="space-y-1.5">
        <Label htmlFor="audit-business">Business name</Label>
        <Input
          id="audit-business"
          required
          autoComplete="organization"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          placeholder="Smile Dental Care"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="audit-message">What&apos;s your biggest challenge?</Label>
        <Textarea
          id="audit-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Missed calls after hours, slow lead follow-up…"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting…" : "Request Free Audit"}
      </Button>
    </form>
  );
}
