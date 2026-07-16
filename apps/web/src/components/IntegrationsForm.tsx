"use client";

import { useEffect, useState } from "react";

export function IntegrationsForm() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [hubspotToken, setHubspotToken] = useState("");
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/org/integrations")
      .then((r) => r.json())
      .then((data) => {
        for (const i of data.integrations ?? []) {
          if (i.provider === "WEBHOOK") setWebhookUrl((i.config as { url?: string })?.url ?? "");
          if (i.provider === "HUBSPOT")
            setHubspotToken("••••••••");
          if (i.provider === "GOOGLE_SHEETS")
            setSheetsUrl((i.credentials as { webhookUrl?: string })?.webhookUrl ?? "");
        }
      });
  }, []);

  async function save(provider: string, credentials: object, config: object) {
    const res = await fetch("/api/org/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, credentials, config }),
    });
    setMessage(res.ok ? "Integration saved." : "Save failed.");
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="card">
        <h3>Webhook</h3>
        <p className="muted" style={{ fontSize: 14 }}>
          Receive POST events for lead.created and call.completed
        </p>
        <input
          className="input"
          placeholder="https://your-server.com/webhook"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <button
          className="btn btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => save("WEBHOOK", {}, { url: webhookUrl })}
        >
          Save webhook
        </button>
      </div>

      <div className="card">
        <h3>HubSpot</h3>
        <input
          className="input"
          placeholder="HubSpot private app access token"
          value={hubspotToken}
          onChange={(e) => setHubspotToken(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <button
          className="btn btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => save("HUBSPOT", { accessToken: hubspotToken }, {})}
        >
          Save HubSpot
        </button>
      </div>

      <div className="card">
        <h3>Google Sheets</h3>
        <p className="muted" style={{ fontSize: 14 }}>
          Use a Google Apps Script web app URL to append rows
        </p>
        <input
          className="input"
          placeholder="https://script.google.com/macros/s/..."
          value={sheetsUrl}
          onChange={(e) => setSheetsUrl(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <button
          className="btn btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => save("GOOGLE_SHEETS", { webhookUrl: sheetsUrl }, {})}
        >
          Save Sheets
        </button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}
