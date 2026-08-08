-- MVP go-live schema patch for remote Supabase
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT / DROP POLICY IF EXISTS)

-- Org creator can SELECT the org they just created
drop policy if exists "organizations_select_member" on public.organizations;
drop policy if exists "organizations_select_member_or_creator" on public.organizations;

create policy "organizations_select_member_or_creator"
  on public.organizations for select
  to authenticated
  using (
    public.is_org_member(id)
    or created_by = auth.uid()
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- AI employee lifecycle
do $$ begin
  create type public.employee_lifecycle_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

alter table public.ai_agents
  add column if not exists department text,
  add column if not exists avatar_url text,
  add column if not exists personality text,
  add column if not exists goals jsonb not null default '[]'::jsonb,
  add column if not exists kpis jsonb not null default '{}'::jsonb,
  add column if not exists working_hours jsonb not null default '{}'::jsonb,
  add column if not exists escalation_rules jsonb not null default '{}'::jsonb,
  add column if not exists lifecycle_status public.employee_lifecycle_status not null default 'draft',
  add column if not exists performance_score numeric(5,2),
  add column if not exists tags text[] not null default '{}';

update public.ai_agents
set lifecycle_status = case
  when status = 'inactive' then 'archived'::public.employee_lifecycle_status
  when status = 'active' then 'published'::public.employee_lifecycle_status
  else 'draft'::public.employee_lifecycle_status
end
where lifecycle_status = 'draft' and status in ('active', 'inactive');

-- Feature flags + onboarding progress
create table if not exists public.feature_flags (
  key text primary key,
  description text,
  default_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feature_flag_overrides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  flag_key text not null references public.feature_flags (key) on delete cascade,
  enabled boolean not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, flag_key)
);

create table if not exists public.org_onboarding_progress (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  current_step integer not null default 1,
  completed_steps integer[] not null default '{}',
  data jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Starter-safe defaults (Phase 2 shells off)
insert into public.feature_flags (key, description, default_enabled) values
  ('ai_employees', 'AI Employee Builder', true),
  ('crm', 'CRM & Lead Pipeline', false),
  ('locations', 'Multi-location management', false),
  ('onboarding_wizard', 'Business onboarding wizard', true),
  ('workflows', 'Workflow Builder', false),
  ('voice_flows', 'AI Voice Flow Designer', false),
  ('marketplace', 'Agent Marketplace', false),
  ('contact_center', 'Customer Contact Center', false),
  ('call_queues', 'Call Queue Management', false),
  ('live_monitor', 'Live Call Monitor', false),
  ('sms_campaigns', 'SMS Campaigns', false),
  ('whatsapp', 'WhatsApp Automation', false),
  ('training', 'AI Training Center', false),
  ('website_importer', 'Website Knowledge Importer', false),
  ('roi', 'Revenue & ROI Dashboard', false)
on conflict (key) do nothing;

-- RLS
alter table public.feature_flags enable row level security;
drop policy if exists feature_flags_select_authenticated on public.feature_flags;
create policy feature_flags_select_authenticated
  on public.feature_flags for select
  to authenticated
  using (true);

alter table public.feature_flag_overrides enable row level security;
drop policy if exists feature_flag_overrides_select_member on public.feature_flag_overrides;
create policy feature_flag_overrides_select_member
  on public.feature_flag_overrides for select
  to authenticated
  using (public.is_org_member(organization_id));

alter table public.org_onboarding_progress enable row level security;
drop policy if exists org_onboarding_progress_select_member on public.org_onboarding_progress;
create policy org_onboarding_progress_select_member
  on public.org_onboarding_progress for select
  to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists org_onboarding_progress_insert_member on public.org_onboarding_progress;
create policy org_onboarding_progress_insert_member
  on public.org_onboarding_progress for insert
  to authenticated
  with check (public.is_org_member(organization_id));

drop policy if exists org_onboarding_progress_update_member on public.org_onboarding_progress;
create policy org_onboarding_progress_update_member
  on public.org_onboarding_progress for update
  to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Retell sync indexes
create unique index if not exists ai_agents_org_external_agent_id_uidx
  on public.ai_agents (organization_id, external_agent_id)
  where external_agent_id is not null;

create unique index if not exists calls_org_external_call_id_uidx
  on public.calls (organization_id, external_call_id)
  where external_call_id is not null;

create index if not exists phone_numbers_e164_idx
  on public.phone_numbers (e164);

create index if not exists ai_agents_external_agent_id_idx
  on public.ai_agents (external_agent_id)
  where external_agent_id is not null;
