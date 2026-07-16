# Provider adapters

## Interfaces

Located in `apps/web/src/lib/providers/`.

### VoiceProvider

Retell (primary) or mock. Methods: create/update/publish agent, initiate test call, get call, transfer, verify webhook.

### TelephonyProvider

Twilio or mock. Methods: list/provision/connect numbers, configure forwarding, send SMS, verify webhook.

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
VOICE_PROVIDER=mock|retell
TELEPHONY_PROVIDER=mock|twilio
BILLING_PROVIDER=mock|stripe
CALENDAR_PROVIDER=mock|google
JOBS_PROVIDER=local
```

Default for local development: all `mock` (jobs default `local`).

## Implementations (Phase G)

| Provider | File | Real mode behavior |
|----------|------|--------------------|
| Retell | `lib/providers/retell/voice.ts` | Create LLM+agent, test call, HMAC webhook verify |
| Twilio | `lib/providers/twilio/telephony.ts` | Numbers, forwarding, SMS, request signature verify |
| Stripe | `lib/providers/stripe/billing.ts` | Checkout, portal, webhook sync |
| Jobs | `lib/jobs/` | Local microtask queue; handlers upsert calls from Retell |

Webhook routes under `app/api/webhooks/*` use adapters + `lib/webhooks/idempotency.ts`.

## Legacy

`apps/voice-worker` (Deepgram + Twilio Media Streams) is deprecated and not selected by these env vars.
