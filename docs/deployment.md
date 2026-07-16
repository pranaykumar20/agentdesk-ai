# Deployment

## Prerequisites

- Supabase project
- Vercel (or equivalent) for `apps/web`
- Retell / Twilio / Stripe accounts when leaving mock mode

## Steps

1. Copy `.env.example` → `.env.local` and fill Supabase keys
2. `npx supabase db push` (or link + migrate)
3. `npm run db:seed` (optional demo data)
4. `npm run build -w @ai-voice-leads/web`
5. Deploy web app; set production env vars
6. Point Retell/Twilio/Stripe webhooks at `/api/webhooks/*`
7. Confirm mock providers are disabled in production when using real keys

## Production security checklist

- Set `VOICE_PROVIDER=retell`, `TELEPHONY_PROVIDER=twilio`, `BILLING_PROVIDER=stripe` (mock webhook verify rejects in production)
- Set a strong `INTERNAL_API_SECRET` (placeholder/`change-me-in-production` is rejected in production)
- Set `SUPABASE_SERVICE_ROLE_KEY` for webhook idempotency + call sync
- Prefer Retell call `metadata.organization_id`; use `DEFAULT_WEBHOOK_ORG_ID` only for single-tenant staging
- Keep `LOCAL_DEMO_MODE=false`

## Legacy

Do not deploy `apps/voice-worker` for AgentDesk Phase 1.
