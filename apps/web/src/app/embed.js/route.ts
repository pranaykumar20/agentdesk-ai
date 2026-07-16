import { NextResponse } from "next/server";
import { TCPA_CONSENT_TEXT } from "@ai-voice-leads/shared";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const script = `
(function() {
  var script = document.currentScript;
  var orgSlug = script.getAttribute('data-org');
  if (!orgSlug) return;

  var container = document.createElement('div');
  container.id = 'voicelead-embed-' + orgSlug;
  container.style.cssText = 'font-family:system-ui,sans-serif;max-width:420px;padding:16px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;color:#0f172a;';

  container.innerHTML = '<h3 style="margin:0 0 12px;font-size:18px;">Request a callback</h3>' +
    '<form id="vl-form" style="display:grid;gap:10px;">' +
    '<input name="name" placeholder="Your name" required style="padding:10px;border:1px solid #cbd5e1;border-radius:8px;" />' +
    '<input name="phone" placeholder="Phone number" required type="tel" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px;" />' +
    '<textarea name="message" placeholder="How can we help?" rows="3" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px;"></textarea>' +
    '<label style="font-size:12px;color:#64748b;display:flex;gap:8px;align-items:flex-start;">' +
    '<input type="checkbox" name="consent" required style="margin-top:3px;" />' +
    '<span>${TCPA_CONSENT_TEXT.replace(/'/g, "\\'")}</span></label>' +
    '<button type="submit" style="padding:10px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Get a call back</button>' +
    '<p id="vl-status" style="margin:0;font-size:13px;"></p></form>';

  script.parentNode.insertBefore(container, script.nextSibling);

  document.getElementById('vl-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = e.target;
    var status = document.getElementById('vl-status');
    status.textContent = 'Submitting…';
    status.style.color = '#64748b';

    fetch('${appUrl}/api/public/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgSlug: orgSlug,
        name: form.name.value,
        phone: form.phone.value,
        message: form.message.value,
        consent: form.consent.checked,
        consentText: '${TCPA_CONSENT_TEXT.replace(/'/g, "\\'")}'
      })
    }).then(function(res) { return res.json().then(function(data) { return { ok: res.ok, data: data }; }); })
      .then(function(result) {
        if (result.ok) {
          status.textContent = 'Thanks! Our AI assistant is calling you now.';
          status.style.color = '#16a34a';
          form.reset();
        } else {
          status.textContent = result.data.error || 'Submission failed';
          status.style.color = '#dc2626';
        }
      })
      .catch(function() {
        status.textContent = 'Network error. Please try again.';
        status.style.color = '#dc2626';
      });
  });
})();
`.trim();

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300",
    },
  });
}
