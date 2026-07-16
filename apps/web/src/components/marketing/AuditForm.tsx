"use client";

import { useState } from "react";

export function AuditForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/public/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, business, message }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Submission failed");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <p style={{ color: "var(--accent-2)" }}>
        Thanks! We&apos;ll reach out within 1 business day to schedule your audit.
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <label>
        <span className="label">Your name</span>
        <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        <span className="label">Email</span>
        <input
          className="input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        <span className="label">Business name</span>
        <input
          className="input"
          required
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
        />
      </label>
      <label>
        <span className="label">What&apos;s your biggest challenge?</span>
        <textarea
          className="textarea"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <button type="submit" className="btn">
        Request Free Audit
      </button>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
    </form>
  );
}
