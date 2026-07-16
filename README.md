# AgentDesk AI

Multi-tenant AI receptionist platform for service businesses. Configure an AI phone agent, connect numbers, manage knowledge, route calls, book appointments, capture leads, and view analytics.

> Formerly VoiceLead. Phase 1 rebuild uses Supabase Auth + RLS and Retell AI (with mock providers for local development).

## Monorepo

```
apps/web           Next.js App Router (marketing + dashboard + APIs)
apps/voice-worker  DEPRECATED — legacy Deepgram worker (not used in Phase 1)
packages/          Legacy shared packages (being replaced by apps/web modules)
supabase/          SQL migrations, seed, config
docs/              Architecture and implementation docs
```

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (or local Supabase CLI)

## Setup

```bash
# Quick local demo (no Supabase): copy env and enable demo mode
cp .env.example apps/web/.env.local
# Ensure LOCAL_DEMO_MODE=true and NEXT_PUBLIC_LOCAL_DEMO_MODE=true

npm install
npm run dev -w @ai-voice-leads/web
```

Open [http://localhost:3000](http://localhost:3000) — marketing works immediately; with demo mode, `/dashboard` loads Smile Dental Care sample data as Owner.

For real Auth + Postgres: set Supabase keys in `apps/web/.env.local`, set demo mode to `false`, then `npx supabase db push` and seed.

## Mock mode

Leave provider env vars as `mock` (defaults in `.env.example`). The app runs without Retell, Twilio, or Stripe accounts. Switch to `retell` / `twilio` / `stripe` when keys are available.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev -w @ai-voice-leads/web` | Dev server |
| `npm run build -w @ai-voice-leads/web` | Production build |
| `npm run lint -w @ai-voice-leads/web` | Lint |
| `npm run typecheck -w @ai-voice-leads/web` | TypeScript check |
| `npm run db:seed` | Seed Smile Dental Care demo data |
| `npm test -w @ai-voice-leads/web` | Unit tests |

## Documentation

- [Implementation plan](docs/implementation-plan.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/database.md)
- [Permissions](docs/permissions.md)
- [Providers](docs/provider-adapters.md)
- [Webhooks](docs/webhooks.md)
- [Testing](docs/testing.md)
- [Routing engine](docs/routing-engine.md)
- [Compliance](docs/COMPLIANCE.md)
- [Deployment](docs/deployment.md)

## Phase status

**Phases A–H** complete for Phase 1 scope. Playwright E2E and SQL RLS suites are documented follow-ups in [Testing](docs/testing.md).
