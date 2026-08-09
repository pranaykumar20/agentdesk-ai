# AgentDesk AI — Architecture

## Overview

AgentDesk AI is a modular monolith (Phase 1) on Next.js App Router with Supabase (Auth, Postgres, RLS, Storage). Voice AI + inbound numbers are Vapi (Retell remains an env fallback); optional SMS/bridge via Twilio. Billing is Stripe. Email is Resend.

## Services

| Service | Location | Responsibility |
|---------|----------|----------------|
| Web app | `apps/web` | Marketing, auth, dashboard, API routes, webhooks |
| Supabase | hosted / local | Auth, Postgres + RLS, Storage |
| Voice (Vapi) | external | AI phone conversations (Telugu + English) |
| Telephony (Vapi) | external | Native inbound numbers bound to assistants |
| Telephony (Twilio) | external | Optional SMS / later bridge |
| Legacy voice-worker | `apps/voice-worker` | **Deprecated** — Twilio Media Streams + Deepgram (not used in Phase 1) |

## Multi-tenancy

- Every business is an `organizations` row
- Users belong via `organization_members` with roles: OWNER, ADMIN, MANAGER, AGENT, VIEWER
- Tenant tables include `organization_id`
- Isolation: Supabase RLS + server-side `requireOrg` / `can()`
- Active organization is resolved from session membership — never trust client-supplied org IDs without validation

## Call flow (Thin MVP)

```
PSTN → Vapi-native phone number (bound to assistantId)
    → Vapi assistant (STT → LLM → TTS)
    → POST /api/webhooks/vapi (verified)
    → calls + transcripts + summaries (org-scoped)
    → contacts / leads / appointments from end-of-call-report
    → background jobs for heavy processing
```

Twilio voice webhooks remain for optional forwarding/SMS later; they are **not** the MVP inbound AI bridge.
Set `VOICE_PROVIDER=vapi` and `TELEPHONY_PROVIDER=vapi` for production go-live.
Rollback: `VOICE_PROVIDER=retell` and `TELEPHONY_PROVIDER=retell`.

## Auth flow

```
Browser → Supabase Auth (cookie session via @supabase/ssr)
       → middleware refreshes session
       → server components / route handlers use createServerClient
       → profiles synced from auth.users
```

## Provider abstraction

Interfaces in `apps/web/src/lib/providers/`:

- `VoiceProvider` — Vapi (default), Retell, or mock
- `TelephonyProvider` — Twilio or mock
- `BillingProvider` — Stripe or mock
- `CalendarProvider` — Google or mock

Selection via env (`VOICE_PROVIDER`, etc.). Default local development uses mocks.

AI employees are seeded with role training prompts (identity, conversation flow, guardrails, empty `## Knowledge Base` section) from `modules/agents/role-templates.ts`. Industry packs (restaurant / dental / clinic / general) and capability toggles customize those templates. Knowledge Base documents/FAQs are org-scoped with optional `agent_id` (null = all agents). Saving knowledge (or agent create/save/publish) replaces the `## Knowledge Base` section with shared + agent-assigned FAQs/document titles and syncs the prompt to Vapi automatically.

### AI Employee Create Wizard

`/dashboard/ai-employees/new` runs `CreateEmployeeWizard`: template gallery/clone, then six steps — Basics → Prompt → Seed KB → Phone → Test call → Review & publish.

- **Gallery / clone** — role×industry presets (`modules/agents/gallery.ts`) or `POST /api/ai-employees/clone`
- **Basics** — name, role, industry, tone, language, voice, capabilities → `POST /api/ai-employees` creates a draft with Vapi `externalAgentId`
- **Prompt** — edit greeting/system prompt; reload role template or `POST /api/ai-employees/generate-prompt`; Telugu (`te-IN`) guidance; save via `PATCH /api/ai-agent` `save_draft`
- **Seed KB** — hours/FAQs + optional AI generate; `POST /api/knowledge/sync` (skip if empty)
- **Phone** — optional `POST /api/phone-numbers` (needs `externalAgentId`; publish not required)
- **Test call** — optional `POST /api/ai-employees/test-call`
- **Review** — **Publish & finish** or **Save draft & exit**

List page **New** opens the gallery; each row has **Clone**. Agent editor capabilities are editable and merge into the prompt on save.

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
