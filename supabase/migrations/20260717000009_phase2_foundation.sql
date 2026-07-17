-- Phase 2A foundation: AI Employees columns, CRM, workflows, contact center, flags, etc.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.employee_lifecycle_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.workflow_run_status as enum ('pending', 'running', 'succeeded', 'failed', 'simulated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.crm_deal_stage as enum ('new_lead', 'contacted', 'qualified', 'proposal', 'won', 'lost');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.conversation_channel as enum ('phone', 'sms', 'whatsapp', 'email', 'web_chat', 'social');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.conversation_status as enum ('open', 'pending', 'in_progress', 'on_hold', 'resolved', 'closed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.campaign_status as enum ('draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.training_job_status as enum ('queued', 'running', 'completed', 'failed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.import_job_status as enum ('queued', 'running', 'completed', 'failed', 'cancelled');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Evolve ai_agents → AI Employees (product rename; table name kept)
-- ---------------------------------------------------------------------------
alter table public.ai_agents
  add column if not exists department text,
  add column if not exists avatar_url text,
  add column if not exists personality text,
  add column if not exists goals jsonb not null default '[]'::jsonb,
  add column if not exists kpis jsonb not null default '{}'::jsonb,
  add column if not exists working_hours jsonb not null default '{}'::jsonb,
  add column if not exists escalation_rules jsonb not null default '{}'::jsonb,
  add column if not exists location_id uuid references public.locations (id) on delete set null,
  add column if not exists lifecycle_status public.employee_lifecycle_status not null default 'draft',
  add column if not exists performance_score numeric(5,2),
  add column if not exists tags text[] not null default '{}';

-- Align legacy status text with lifecycle when possible
update public.ai_agents
set lifecycle_status = case
  when status = 'inactive' then 'archived'::public.employee_lifecycle_status
  when status = 'active' then 'published'::public.employee_lifecycle_status
  else 'draft'::public.employee_lifecycle_status
end
where lifecycle_status = 'draft' and status in ('active', 'inactive');

alter table public.locations
  add column if not exists phone text,
  add column if not exists status text not null default 'active',
  add column if not exists settings jsonb not null default '{}'::jsonb,
  add column if not exists manager_member_id uuid references public.organization_members (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Feature flags + platform admins
-- ---------------------------------------------------------------------------
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

create table if not exists public.platform_admins (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.org_onboarding_progress (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  current_step integer not null default 1,
  completed_steps integer[] not null default '{}',
  data jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.feature_flags (key, description, default_enabled) values
  ('ai_employees', 'AI Employee Builder', true),
  ('crm', 'CRM & Lead Pipeline', true),
  ('locations', 'Multi-location management', true),
  ('onboarding_wizard', 'Business onboarding wizard', true),
  ('workflows', 'Workflow Builder', true),
  ('voice_flows', 'AI Voice Flow Designer', true),
  ('marketplace', 'Agent Marketplace', true),
  ('contact_center', 'Customer Contact Center', true),
  ('call_queues', 'Call Queue Management', true),
  ('live_monitor', 'Live Call Monitor', true),
  ('sms_campaigns', 'SMS Campaigns', true),
  ('whatsapp', 'WhatsApp Automation', true),
  ('training', 'AI Training Center', true),
  ('website_importer', 'Website Knowledge Importer', false),
  ('roi', 'Revenue & ROI Dashboard', true)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Workflows
-- ---------------------------------------------------------------------------
create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft',
  graph jsonb not null default '{"nodes":[],"edges":[]}'::jsonb,
  published_version integer,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workflow_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  version_number integer not null,
  graph jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (workflow_id, version_number)
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  status public.workflow_run_status not null default 'pending',
  trigger_type text,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workflow_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  run_id uuid not null references public.workflow_runs (id) on delete cascade,
  level text not null default 'info',
  message text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Voice flows
-- ---------------------------------------------------------------------------
create table if not exists public.voice_flows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid references public.ai_agents (id) on delete set null,
  name text not null,
  status text not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.voice_nodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  flow_id uuid not null references public.voice_flows (id) on delete cascade,
  node_key text not null,
  node_type text not null,
  label text,
  config jsonb not null default '{}'::jsonb,
  position jsonb not null default '{"x":0,"y":0}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (flow_id, node_key)
);

create table if not exists public.voice_edges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  flow_id uuid not null references public.voice_flows (id) on delete cascade,
  source_node_key text not null,
  target_node_key text not null,
  label text,
  condition jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Marketplace
-- ---------------------------------------------------------------------------
create table if not exists public.marketplace_agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category text,
  industry text,
  rating numeric(3,2) not null default 0,
  installs integer not null default 0,
  price_cents integer not null default 0,
  template jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  marketplace_agent_id uuid not null references public.marketplace_agents (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketplace_installs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  marketplace_agent_id uuid not null references public.marketplace_agents (id) on delete cascade,
  agent_id uuid references public.ai_agents (id) on delete set null,
  installed_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, marketplace_agent_id)
);

-- ---------------------------------------------------------------------------
-- CRM
-- ---------------------------------------------------------------------------
create table if not exists public.crm_companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  website text,
  industry text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  company_id uuid references public.crm_companies (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  source text,
  owner_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  company_id uuid references public.crm_companies (id) on delete set null,
  title text not null,
  stage public.crm_deal_stage not null default 'new_lead',
  value_cents integer not null default 0,
  currency text not null default 'USD',
  source text,
  owner_user_id uuid references public.profiles (id) on delete set null,
  expected_close_at date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  deal_id uuid references public.crm_deals (id) on delete cascade,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  title text not null,
  due_at timestamptz,
  status text not null default 'open',
  assignee_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  deal_id uuid references public.crm_deals (id) on delete set null,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  activity_type text not null,
  summary text not null,
  meta jsonb not null default '{}'::jsonb,
  actor_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Contact center + queues
-- ---------------------------------------------------------------------------
create table if not exists public.contact_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  channel public.conversation_channel not null,
  status public.conversation_status not null default 'open',
  subject text,
  contact_name text,
  contact_phone text,
  contact_email text,
  queue_name text,
  assignee_user_id uuid references public.profiles (id) on delete set null,
  sla_due_at timestamptz,
  last_message_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  conversation_id uuid not null references public.contact_conversations (id) on delete cascade,
  direction text not null default 'inbound',
  body text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.call_queues (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  queue_type text not null default 'support',
  status text not null default 'active',
  strategy text not null default 'round_robin',
  color text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table if not exists public.call_queue_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  queue_id uuid not null references public.call_queues (id) on delete cascade,
  team_member_id uuid not null references public.team_members (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (queue_id, team_member_id)
);

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------
create table if not exists public.sms_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  campaign_type text not null default 'broadcast',
  status public.campaign_status not null default 'draft',
  template_body text,
  audience_count integer not null default 0,
  sent_count integer not null default 0,
  delivered_count integer not null default 0,
  response_count integer not null default 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sms_campaign_sends (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  campaign_id uuid not null references public.sms_campaigns (id) on delete cascade,
  phone text not null,
  status text not null default 'pending',
  provider_sid text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.whatsapp_workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  workflow_id uuid references public.whatsapp_workflows (id) on delete set null,
  phone text not null,
  direction text not null default 'outbound',
  body text not null,
  status text not null default 'sent',
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Training + website import + ROI
-- ---------------------------------------------------------------------------
create table if not exists public.training_datasets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  source_type text not null default 'knowledge_base',
  item_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.training_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid references public.ai_agents (id) on delete set null,
  dataset_id uuid references public.training_datasets (id) on delete set null,
  name text not null,
  status public.training_job_status not null default 'queued',
  accuracy numeric(5,2),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.training_evaluations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  job_id uuid references public.training_jobs (id) on delete cascade,
  name text not null,
  passed boolean not null default false,
  score numeric(5,2),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.website_import_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  url text not null,
  status public.import_job_status not null default 'queued',
  pages_crawled integer not null default 0,
  pages_total integer not null default 0,
  progress_pct integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.website_import_pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  job_id uuid not null references public.website_import_jobs (id) on delete cascade,
  page_url text not null,
  title text,
  content_excerpt text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roi_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  metric_date date not null,
  revenue_cents integer not null default 0,
  ai_attributed_revenue_cents integer not null default 0,
  cost_cents integer not null default 0,
  appointments_booked integer not null default 0,
  calls_handled integer not null default 0,
  leads_created integer not null default 0,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, metric_date)
);

-- ---------------------------------------------------------------------------
-- RLS for new org-scoped tables
-- ---------------------------------------------------------------------------
do $$
declare
  tbl text;
  tables text[] := array[
    'feature_flag_overrides',
    'org_onboarding_progress',
    'workflows', 'workflow_versions', 'workflow_runs', 'workflow_logs',
    'voice_flows', 'voice_nodes', 'voice_edges',
    'marketplace_reviews', 'marketplace_installs',
    'crm_companies', 'crm_contacts', 'crm_deals', 'crm_tasks', 'crm_activities',
    'contact_conversations', 'contact_messages',
    'call_queues', 'call_queue_members',
    'sms_campaigns', 'sms_campaign_sends',
    'whatsapp_workflows', 'whatsapp_messages',
    'training_datasets', 'training_jobs', 'training_evaluations',
    'website_import_jobs', 'website_import_pages',
    'roi_metrics'
  ];
begin
  foreach tbl in array tables loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format(
      'drop policy if exists %I on public.%I',
      tbl || '_select_member', tbl
    );
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_org_member(organization_id))',
      tbl || '_select_member', tbl
    );
    execute format(
      'drop policy if exists %I on public.%I',
      tbl || '_insert_member', tbl
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_org_member(organization_id))',
      tbl || '_insert_member', tbl
    );
    execute format(
      'drop policy if exists %I on public.%I',
      tbl || '_update_member', tbl
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id))',
      tbl || '_update_member', tbl
    );
    execute format(
      'drop policy if exists %I on public.%I',
      tbl || '_delete_manager', tbl
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.has_org_role(organization_id, array[''OWNER'', ''ADMIN'', ''MANAGER'']::public.user_role[]))',
      tbl || '_delete_manager', tbl
    );
    execute format('create index if not exists %I on public.%I (organization_id)', tbl || '_org_id_idx', tbl);
  end loop;
end $$;

-- Global catalog tables
alter table public.feature_flags enable row level security;
drop policy if exists feature_flags_select_authenticated on public.feature_flags;
create policy feature_flags_select_authenticated
  on public.feature_flags for select
  to authenticated
  using (true);

alter table public.marketplace_agents enable row level security;
drop policy if exists marketplace_agents_select_authenticated on public.marketplace_agents;
create policy marketplace_agents_select_authenticated
  on public.marketplace_agents for select
  to authenticated
  using (published = true);

alter table public.platform_admins enable row level security;
drop policy if exists platform_admins_select_self on public.platform_admins;
create policy platform_admins_select_self
  on public.platform_admins for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins a where a.user_id = auth.uid()
  );
$$;

grant execute on function public.is_platform_admin() to authenticated, service_role;
