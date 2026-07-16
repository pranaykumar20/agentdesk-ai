"use client";

import { useState } from "react";
import { TCPA_CONSENT_TEXT } from "@ai-voice-leads/shared";

type Props = {
  orgSlug: string;
  orgName: string;
};

export function EnquiryForm({ orgSlug, orgName }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgSlug,
        name,
        phone,
        email,
        message,
        consent,
        consentText: TCPA_CONSENT_TEXT,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Submission failed");
      return;
    }

    setResult(
      `Thanks! ${orgName}'s AI assistant is calling you now. Please keep your phone nearby.`,
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <label>
        <span className="label">Name</span>
        <input
          className="input"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        <span className="label">Phone</span>
        <input
          className="input"
          required
          type="tel"
          placeholder="+1 555 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <label>
        <span className="label">Email (optional)</span>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        <span className="label">Message</span>
        <textarea
          className="textarea"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14 }}>
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ marginTop: 4 }}
        />
        <span className="muted">{TCPA_CONSENT_TEXT}</span>
      </label>
      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Get a call back"}
      </button>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {result && <p style={{ color: "var(--accent-2)" }}>{result}</p>}
    </form>
  );
}
