# AgentDesk AI — Implementation Plan

## Product

**AgentDesk AI** is a multi-tenant, industry-neutral AI receptionist SaaS. Businesses configure an AI phone agent, connect numbers, manage knowledge, route calls, book appointments, capture leads, and view analytics.

Demo seed data uses **Smile Dental Care** (Cincinnati). The application must not hardcode dental-only behavior.

## Stack decisions (locked)

| Concern | Choice |
|---------|--------|
| Auth + DB | Supabase Auth + Postgres + RLS |
| Voice | Retell AI (primary); Twilio telephony adapter |
| UI | Next.js 15 App Router, Tailwind, shadcn/ui, Lucide |
| Legacy | Clerk + Prisma removed from hot path; `apps/voice-worker` (Deepgram) deprecated |

## Phases

### Phase A — Foundation (complete)

- Architecture docs and env configuration
- Design tokens + Tailwind + shadcn base
- Supabase clients, migrations, RLS, seed
- Auth (signup/login/reset), org tenancy, RBAC `can()`
- Provider interfaces + mocks
- Deprecate voice-worker / Clerk / Prisma as source of truth

**Verified:** `npm run typecheck`, `npm run test`, `npm run lint` (web workspace).

### Phase B — Marketing (complete)

Landing, Features, Industries, Pricing, SEO, responsive nav/footer.

**Verified:** typecheck, lint, tests pass.

### Phase C — App shell (complete)

Sidebar, top bar, org switcher, page chrome, loading/empty/error states.

**Verified:** typecheck, lint, tests pass.

### Phase D — Core operational pages (complete)

Dashboard metrics/charts, Calls (server pagination + filters), Call Details (transcript/summary/analysis), Appointments (list/create/status), Knowledge Base (docs/FAQs + mock upload).

Demo data fallback when Supabase tables are empty. **Verified:** typecheck, lint, tests pass.

### Phase E — Configuration (complete)

Team invites/roles, Routing Rules reorder, Integrations connect/disconnect, AI Agent draft/publish, Phone Numbers (mock telephony provision), Settings tabs (general + billing usage).

Demo modules under `apps/web/src/modules/{team,routing,integrations,agents,phone-numbers,settings}`. **Verified:** typecheck, lint, tests pass.

### Phase F — Analytics and billing (complete)

Analytics page (range tabs, KPIs, intents, peak hours, CSV export), billing subscription/usage model, invoices UI, checkout + customer portal APIs, Stripe provider (SDK when keys present) + mock updates, webhook sync handler.

Modules: `modules/analytics`, `modules/billing`. **Verified:** typecheck, lint, tests pass.

### Phase G — Providers and webhooks

Retell + Twilio adapters, verified webhooks, idempotency, jobs.

### Phase H — Quality

Unit/integration/E2E tests, a11y, security review, docs sync.

## Acceptance (Phase 1)

See product brief: 16 screens, RLS isolation, roles, mock/real providers, webhook verification, typecheck/lint/tests green, docs current.

## Working rules

- Implement incrementally; verify TypeScript, lint, and tests after each major step
- Never claim complete without verification
- Prefer modules under `apps/web/src/modules/*` and provider interfaces under `lib/providers/*`
