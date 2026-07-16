# Webhooks

## Routes

| Path | Provider | Notes |
|------|----------|--------|
| `/api/webhooks/retell` | Retell AI | HMAC `x-retell-signature`; enqueues call sync jobs |
| `/api/webhooks/twilio/voice` | Twilio | Signature via auth token; returns TwiML |
| `/api/webhooks/twilio/status` | Twilio | Call status callback; idempotent |
| `/api/webhooks/twilio/outbound` | Twilio | Outbound TwiML callback |
| `/api/webhooks/stripe` | Stripe | Signature + subscription sync |

## Processing pipeline

1. Verify signature (`VoiceProvider` / `TelephonyProvider` / `BillingProvider`)
2. Claim `webhook_events` row with unique `(provider, idempotency_key)` — memory fallback without service role
3. Reject duplicates (`{ duplicate: true }`)
4. Enqueue heavy work via `JOBS_PROVIDER` (default `local` microtask)
5. Mark event `processed` or `error`
6. Never trust unverified payloads

## Env

| Variable | Purpose |
|----------|---------|
| `RETELL_API_KEY` / `RETELL_WEBHOOK_SECRET` | Retell API + webhook HMAC |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Twilio API + signature validation |
| `TWILIO_WEBHOOK_BASE_URL` | Public URL Twilio used when signing |
| `STRIPE_WEBHOOK_SECRET` | Stripe signature |
| `SUPABASE_SERVICE_ROLE_KEY` | Persist `webhook_events` / call writes |
| `DEFAULT_WEBHOOK_ORG_ID` | Fallback org when Retell metadata omits `organization_id` |
| `JOBS_PROVIDER` | `local` (default) |

Stripe subscription state is updated only from verified webhooks, not checkout success redirects alone.

Call conversation sync is **Retell-primary**. Twilio voice webhooks acknowledge PSTN; AI media streams via `apps/voice-worker` are deprecated.
