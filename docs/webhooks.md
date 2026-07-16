# Webhooks

## Routes

| Path | Provider |
|------|----------|
| `/api/webhooks/retell` | Retell AI |
| `/api/webhooks/twilio` | Twilio (voice/SMS status) |
| `/api/webhooks/stripe` | Stripe billing |

## Requirements

1. Verify signature before processing
2. Persist event metadata in `webhook_events` with idempotency key
3. Reject duplicates
4. Return quickly; enqueue heavy work
5. Log result / failure reason
6. Never trust unverified payloads

Stripe subscription state is updated only from verified webhooks, not checkout success redirects alone.
