# AgentDesk AI — Phase 2 Plan

## Status

- **Phase 2A (Foundation):** Implemented in-repo (migration, permissions, feature flags, grouped nav).
- **Phase 2B (AI Employees):** List / create / detail shipped (demo store); `/dashboard/ai-agent` redirects to `/dashboard/ai-employees`.
- **Phase 2E (CRM + Locations):** Pipeline Kanban + locations table shipped (demo data); Supabase CRM tables ready from 2A.
- **Phase 2F (Contact Center + Queues + Live Monitor):** Unified inbox, queue table, live call cards with stubbed listen/whisper/barge; flags enabled by default.
- **Phase 2C/2D (Workflow + Voice Flow):** List + three-pane canvas builders (palette | canvas | properties); demo graph data; flags enabled.
- **Phase 2G (SMS + WhatsApp):** Campaign / conversation overviews with KPIs and templates; flags enabled.
- **Phase 2H (Training Center):** Jobs table + accuracy metrics (demo); embeddings pipeline stubbed.
- **Phase 2I (Revenue & ROI):** Executive ROI dashboard with sources, agents, insights (demo aggregates).
- **Phase 2J (Super Admin + Marketplace):** `/admin` gated by `platform_admins` / `PLATFORM_ADMIN_EMAILS`; marketplace browse/install shell.

## Locked decisions

- Hybrid delivery: production for foundation + AI Employees + CRM/locations/contact center; UI/demo for visual builders until stable.
- AI Employee Builder **replaces** AI Agent Settings (same `ai_agents*` tables; product rename).
- Supabase migrations are source of truth — see `supabase/migrations/20260717000009_phase2_foundation.sql`.

## Feature flags

Defaults in `apps/web/src/lib/feature-flags.ts`. Org overrides via `feature_flag_overrides`.

Enabled by default: `ai_employees`, `crm`, `locations`, `onboarding_wizard`, `contact_center`, `call_queues`, `live_monitor`, `workflows`, `voice_flows`, `sms_campaigns`, `whatsapp`, `training`, `roi`, `marketplace`.  
Off by default: `website_importer`.

## Navigation groups

Overview · Operations · AI Workforce · Growth · Workspace · Account — see `apps/web/src/lib/navigation/dashboard.ts`.

## Platform admin

- Route: `/admin`
- Gate: `PLATFORM_ADMIN_EMAILS` allowlist, or `platform_admins` row when Supabase is configured; local demo allows all when both are unset.
