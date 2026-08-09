# Provider adapters

## Interfaces

Located in `apps/web/src/lib/providers/`.

### VoiceProvider

Vapi (primary), Retell (fallback), or mock. Methods: create/update/publish agent, initiate test call, get call, transfer, verify webhook.

### TelephonyProvider

`mock`, `vapi` (MVP inbound), `retell` (fallback), or `twilio`. Methods: list/provision/connect numbers, configure forwarding, send SMS, verify webhook.

- **Vapi** (`TELEPHONY_PROVIDER=vapi`): buys/binds numbers via Vapi Phone Number API (`assistantId` on provision). Primary thin MVP inbound path; supports Telugu (`te-IN`) via Deepgram STT + Azure TTS.
- **Retell** (`TELEPHONY_PROVIDER=retell`): buys/binds numbers via Retell Phone Number API (`inbound_agents` / `outbound_agents` weighted lists). Kept as env rollback.
- **Twilio**: account numbers + SMS; voice webhook is not the AI bridge for MVP.

### BillingProvider

Stripe (`lib/providers/stripe/billing.ts`) or mock. Methods: checkout session, customer portal, get subscription, verify webhook.

- App subscription/usage UI reads `modules/billing` (Supabase when configured, else demo store).
- Checkout/portal: `POST /api/billing/checkout`, `POST /api/billing/portal` (requires `manage` on `billing`).
- Price IDs from `STRIPE_PRICE_*` env vars; mock uses `price_mock_{plan}_{interval}`.
- Webhooks: `POST /api/webhooks/stripe` verifies signature when `STRIPE_WEBHOOK_SECRET` is set and syncs plan/status.

### CalendarProvider

Google or mock. Methods: availability, create/reschedule/cancel appointment.

## Selection

```bash
VOICE_PROVIDER=mock|vapi|retell
TELEPHONY_PROVIDER=mock|vapi|retell|twilio
BILLING_PROVIDER=mock|stripe
CALENDAR_PROVIDER=mock|google
JOBS_PROVIDER=local
```

Default for local development: all `mock` (jobs default `local`).
Production MVP: `VOICE_PROVIDER=vapi`, `TELEPHONY_PROVIDER=vapi`, `BILLING_PROVIDER=stripe`.

## Implementations (Thin MVP)

| Provider | File | Real mode behavior |
|----------|------|--------------------|
| Vapi voice | `lib/providers/vapi/voice.ts` | Create/update assistants, analysis plan, test call, webhook secret verify |
| Vapi telephony | `lib/providers/vapi/telephony.ts` | Create/list/update phone numbers bound to assistants |
| Retell voice | `lib/providers/retell/voice.ts` | Create LLM+agent, post-call analysis fields, test call, HMAC webhook verify |
| Retell telephony | `lib/providers/retell/telephony.ts` | Create/list/update phone numbers bound to agents |
| Twilio | `lib/providers/twilio/telephony.ts` | Numbers, forwarding, SMS, request signature verify |
| Stripe | `lib/providers/stripe/billing.ts` | Checkout, portal, webhook sync → Supabase `subscriptions` |
| Jobs | `lib/jobs/` | Local microtask queue; handlers upsert calls + outcomes from Vapi/Retell |

Webhook routes under `app/api/webhooks/*` use adapters + `lib/webhooks/idempotency.ts`.

## Legacy

`apps/voice-worker` (Deepgram + Twilio Media Streams) is deprecated and not selected by these env vars.
