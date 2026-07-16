"use client";

import { useState } from "react";
import { US_TIMEZONES } from "@ai-voice-leads/shared";

type Playbook = {
  id: string;
  type: string;
  name: string;
  isActive: boolean;
  systemPrompt?: string;
};

type Profile = {
  industry: string;
  greeting: string;
  timezone: string;
  hours?: unknown;
  notifyEmail: string | null;
  notifyPhone: string | null;
  menuOrServices: unknown;
} | null;

type PhoneNumber = {
  id: string;
  e164: string;
  isPrimary: boolean;
};

type Props = {
  org: {
    id: string;
    name: string;
    slug: string;
    apiKey: string;
    profile: Profile;
    playbooks: Playbook[];
    phoneNumbers: PhoneNumber[];
  };
  appUrl: string;
};

export function SettingsForm({ org, appUrl }: Props) {
  const [name, setName] = useState(org.name);
  const [greeting, setGreeting] = useState(
    org.profile?.greeting ?? "Hello, thank you for calling.",
  );
  const [industry, setIndustry] = useState(org.profile?.industry ?? "GENERAL");
  const [notifyEmail, setNotifyEmail] = useState(org.profile?.notifyEmail ?? "");
  const [notifyPhone, setNotifyPhone] = useState(org.profile?.notifyPhone ?? "");
  const [phoneE164, setPhoneE164] = useState(org.phoneNumbers[0]?.e164 ?? "");
  const [timezone, setTimezone] = useState(org.profile?.timezone ?? "America/New_York");
  const [hoursJson, setHoursJson] = useState(
    JSON.stringify(org.profile?.hours ?? {
      mon: { open: "09:00", close: "17:00" },
      tue: { open: "09:00", close: "17:00" },
      wed: { open: "09:00", close: "17:00" },
      thu: { open: "09:00", close: "17:00" },
      fri: { open: "09:00", close: "17:00" },
      sat: null,
      sun: null,
    }, null, 2),
  );
  const [playbookPrompt, setPlaybookPrompt] = useState(
    org.playbooks.find((p) => p.isActive)?.type ?? "RESTAURANT",
  );
  const activePb = org.playbooks.find((p) => p.isActive);
  const [systemPrompt, setSystemPrompt] = useState(
    (activePb as { systemPrompt?: string })?.systemPrompt ?? "",
  );
  const [menuJson, setMenuJson] = useState(
    JSON.stringify(org.profile?.menuOrServices ?? [], null, 2),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");

    let menuOrServices = [];
    let hours = {};
    try {
      menuOrServices = JSON.parse(menuJson);
      hours = JSON.parse(hoursJson);
    } catch {
      setMessage("Menu/Services and Hours must be valid JSON");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/org/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        greeting,
        industry,
        timezone,
        hours,
        notifyEmail,
        notifyPhone,
        phoneE164,
        activePlaybook: playbookPrompt,
        systemPrompt,
        menuOrServices,
      }),
    });

    const data = await res.json();
    setSaving(false);
    setMessage(res.ok ? "Settings saved." : data.error ?? "Save failed.");
  }

  const embedCode = `<script src="${appUrl}/embed.js" data-org="${org.slug}"></script>`;

  return (
    <div style={{ marginTop: 24, display: "grid", gap: 24 }}>
      <div className="card">
        <h3>Business profile</h3>
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <label>
            <span className="label">Business name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            <span className="label">Industry</span>
            <select
              className="select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="RESTAURANT">Restaurant</option>
              <option value="CLINIC">Clinic & Healthcare</option>
              <option value="REAL_ESTATE">Real Estate</option>
              <option value="COACH">Coach / Consultant</option>
              <option value="LEGAL">Legal</option>
              <option value="ECOMMERCE">E-commerce</option>
              <option value="SERVICE">Service business</option>
              <option value="GENERAL">General enquiry</option>
            </select>
          </label>
          <label>
            <span className="label">Timezone</span>
            <select className="select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {US_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Greeting</span>
            <textarea
              className="textarea"
              rows={3}
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
            />
          </label>
          <label>
            <span className="label">Notification email</span>
            <input
              className="input"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
            />
          </label>
          <label>
            <span className="label">Notification SMS number</span>
            <input
              className="input"
              value={notifyPhone}
              onChange={(e) => setNotifyPhone(e.target.value)}
            />
          </label>
          <label>
            <span className="label">Twilio phone number (E.164)</span>
            <input
              className="input"
              placeholder="+15551234567"
              value={phoneE164}
              onChange={(e) => setPhoneE164(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="card">
        <h3>Business hours (JSON)</h3>
        <textarea
          className="textarea"
          rows={6}
          value={hoursJson}
          onChange={(e) => setHoursJson(e.target.value)}
        />
      </div>

      <div className="card">
        <h3>Playbook template</h3>
        <p className="muted">Choose and edit what your AI agent collects on calls.</p>
        <select
          className="select"
          style={{ marginTop: 12 }}
          value={playbookPrompt}
          onChange={(e) => {
            const pb = org.playbooks.find((p) => p.type === e.target.value);
            setPlaybookPrompt(e.target.value);
            if (pb?.systemPrompt) setSystemPrompt(pb.systemPrompt);
          }}
        >
          {org.playbooks.map((p) => (
            <option key={p.id} value={p.type}>
              {p.name}
            </option>
          ))}
        </select>
        <label style={{ display: "block", marginTop: 12 }}>
          <span className="label">System prompt (editable)</span>
          <textarea
            className="textarea"
            rows={8}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </label>
      </div>

      <div className="card">
        <h3>Menu / Services (JSON)</h3>
        <textarea
          className="textarea"
          rows={8}
          value={menuJson}
          onChange={(e) => setMenuJson(e.target.value)}
        />
      </div>

      <div className="card">
        <h3>Embeddable form</h3>
        <p className="muted">Add this to your website to trigger instant AI callbacks.</p>
        <pre
          style={{
            background: "var(--surface-2)",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
            fontSize: 13,
          }}
        >
          {embedCode}
        </pre>
        <p className="muted" style={{ marginTop: 12 }}>
          Branded site: <a href={`${appUrl}/sites/${org.slug}`}>{appUrl}/sites/{org.slug}</a>
        </p>
        <p className="muted">
          Hosted form: <a href={`${appUrl}/enquire/${org.slug}`}>{appUrl}/enquire/{org.slug}</a>
        </p>
        <p className="muted">API key: {org.apiKey}</p>
      </div>

      <div>
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </button>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </div>
    </div>
  );
}
