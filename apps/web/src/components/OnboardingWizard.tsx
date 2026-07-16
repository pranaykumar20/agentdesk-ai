"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { US_CHANNELS, US_DEFAULT_CHANNELS, US_TIMEZONES } from "@ai-voice-leads/shared";

const STEPS = [
  { title: "Industry", desc: "What type of business are you?" },
  { title: "Channels", desc: "How should we reach your leads?" },
  { title: "Hours", desc: "When are you open?" },
  { title: "Phone", desc: "Your US business phone number" },
  { title: "Go live", desc: "Review and launch" },
];

const INDUSTRIES = [
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "SERVICE", label: "Service Business" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "CLINIC", label: "Clinic & Healthcare" },
  { value: "COACH", label: "Coach / Consultant" },
  { value: "LEGAL", label: "Legal" },
  { value: "GENERAL", label: "General" },
];

export function OnboardingWizard({ initialStep = 0 }: { initialStep?: number }) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [industry, setIndustry] = useState("RESTAURANT");
  const [channels, setChannels] = useState<string[]>([...US_DEFAULT_CHANNELS]);
  const [timezone, setTimezone] = useState("America/New_York");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleChannel(ch: string) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  async function finish() {
    setSaving(true);
    await fetch("/api/org/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: 5,
        industry,
        preferredChannels: channels,
        timezone,
        phoneE164: phone,
      }),
    });
    setSaving(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= step ? "var(--accent)" : "var(--border)",
            }}
          />
        ))}
      </div>

      <p className="eyebrow">
        Step {step + 1} of {STEPS.length}
      </p>
      <h2>{STEPS[step].title}</h2>
      <p className="muted">{STEPS[step].desc}</p>

      {step === 0 && (
        <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.value}
              type="button"
              className={`btn ${industry === ind.value ? "" : "btn-secondary"}`}
              style={{ justifyContent: "flex-start" }}
              onClick={() => setIndustry(ind.value)}
            >
              {ind.label}
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {US_CHANNELS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              className={`btn btn-sm ${channels.includes(ch.id) ? "" : "btn-secondary"}`}
              onClick={() => toggleChannel(ch.id)}
            >
              {ch.label}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <label style={{ display: "block", marginTop: 16 }}>
          <span className="label">Timezone</span>
          <select
            className="select"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {US_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {step === 3 && (
        <label style={{ display: "block", marginTop: 16 }}>
          <span className="label">Twilio phone number (E.164, US)</span>
          <input
            className="input"
            placeholder="+15551234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      )}

      {step === 4 && (
        <div style={{ marginTop: 16 }}>
          <p>
            <strong>Industry:</strong> {industry}
          </p>
          <p>
            <strong>Channels:</strong> {channels.join(", ")}
          </p>
          <p>
            <strong>Timezone:</strong> {timezone}
          </p>
          <p>
            <strong>Phone:</strong> {phone || "Not set"}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        {step > 0 && (
          <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn" onClick={() => setStep(step + 1)}>
            Continue
          </button>
        ) : (
          <button type="button" className="btn" onClick={finish} disabled={saving}>
            {saving ? "Launching…" : "Go live"}
          </button>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 13 }}>
        <Link href="/dashboard" className="muted">
          Skip for now
        </Link>
      </p>
    </div>
  );
}
