# AgentDesk AI — Architecture

## Overview

AgentDesk AI is a modular monolith (Phase 1) on Next.js App Router with Supabase (Auth, Postgres, RLS, Storage). Voice AI is Retell; telephony/SMS is Twilio via provider adapters. Billing is Stripe. Email is Resend.

## Services

| Service | Location | Responsibility |
|---------|----------|----------------|
| Web app | `apps/web` | Marketing, auth, dashboard, API routes, webhooks |
| Supabase | hosted / local | Auth, Postgres + RLS, Storage |
| Voice (Retell) | external | AI phone conversations |
| Telephony (Twilio) | external | Numbers, SMS, optional PSTN |
| Legacy voice-worker | `apps/voice-worker` | **Deprecated** — Twilio Media Streams + Deepgram (not used in Phase 1) |

## Multi-tenancy

- Every business is an `organizations` row
- Users belong via `organization_members` with roles: OWNER, ADMIN, MANAGER, AGENT, VIEWER
- Tenant tables include `organization_id`
- Isolation: Supabase RLS + server-side `requireOrg` / `can()`
- Active organization is resolved from session membership — never trust client-supplied org IDs without validation

## Call flow (Phase 1 target)

```
PSTN → Twilio (optional) / Retell phone
    → Retell AI agent
    → POST /api/webhooks/retell (verified)
    → calls + transcripts + summaries (org-scoped)
    → background jobs for heavy processing
```

## Auth flow

```
Browser → Supabase Auth (cookie session via @supabase/ssr)
       → middleware refreshes session
       → server components / route handlers use createServerClient
       → profiles synced from auth.users
```

## Provider abstraction

Interfaces in `apps/web/src/lib/providers/`:

- `VoiceProvider` — Retell or mock
- `TelephonyProvider` — Twilio or mock
- `BillingProvider` — Stripe or mock
- `CalendarProvider` — Google or mock

Selection via env (`VOICE_PROVIDER`, etc.). Default local development uses mocks.

## Security

- RLS on all tenant tables
- Webhook signature verification (Retell, Twilio, Stripe)
- Service role key only on server (webhooks/admin jobs)
- Integration secrets stored server-side (encrypt-at-rest planned; not yet implemented)
- No secrets in client bundles or logs

## Deployment

1. Provision Supabase project; run migrations; seed if needed
2. Deploy `apps/web` to Vercel
3. Configure webhook URLs and secrets
4. Set provider env vars (or leave mock mode)
