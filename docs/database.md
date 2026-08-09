# AgentDesk AI — Database

Source of truth: `supabase/migrations/`.

## Conventions

- UUID primary keys (`gen_random_uuid()`)
- UTC timestamps (`timestamptz`)
- `organization_id` on all tenant-owned tables
- `created_at` / `updated_at` with trigger
- Indexes on `organization_id` and common filters
- Soft delete only where product requires it

## Core groups

1. **Tenancy** — profiles, organizations, organization_members, organization_settings, locations
2. **Team** — departments, team_members, schedules, skills
3. **Agents** — ai_agents, versions, capabilities, prompts, test_runs
4. **Phone / routing** — phone_numbers, routing_rules (+ conditions/actions), routing_groups
5. **CRM** — contacts, leads, lead_activities, callback_requests
6. **Calls** — calls, participants, events, transcripts, recordings, summaries, tags, notes
7. **Appointments** — services, appointment_types, appointments, availability_rules
8. **Knowledge** — sources, documents, chunks, faq_items, business_policies. Documents and FAQs may set nullable `agent_id` (specific AI employee) or leave it null (shared with all agents). On FAQ/document save, AgentDesk rewrites affected agents’ draft system prompts (knowledge appendix) and pushes them to Vapi automatically (`syncKnowledgeToAgents` / `POST /api/knowledge/sync`). The appendix includes FAQ Q/A plus up to a few `knowledge_chunks` excerpts per document (article summaries are stored as chunks on create). Dashboard **Generate with AI** (`POST /api/knowledge/generate`) drafts FAQs/article summaries from a business brief (optional `language`, including `te-IN`); users review before save.
9. **Integrations** — integrations, connections, events, webhook_events
10. **Billing / analytics** — subscriptions, usage_records, daily_analytics, billing_events, audit_logs

## RLS

Helper functions (security definer):

- `is_org_member(org_id)`
- `has_org_role(org_id, roles[])`

Policies: members can SELECT/INSERT/UPDATE per role matrix; destructive actions limited to OWNER/ADMIN.

Service role bypasses RLS for verified webhooks and admin jobs only.

## Seed

`supabase/seed.sql` — Smile Dental Care demo organization (fictional data).
