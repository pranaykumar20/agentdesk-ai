-- Team
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  department_id uuid references public.departments (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  role public.user_role not null default 'AGENT',
  status public.member_status not null default 'active',
  transfer_phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.team_member_schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  team_member_id uuid not null references public.team_members (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.team_member_skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  team_member_id uuid not null references public.team_members (id) on delete cascade,
  skill text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- AI agents
create table public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  role_title text,
  description text,
  status text not null default 'active',
  primary_language text not null default 'en-US',
  voice text,
  timezone text,
  published_version_id uuid,
  external_provider text,
  external_agent_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.ai_agent_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid not null references public.ai_agents (id) on delete cascade,
  version_number integer not null,
  status public.agent_version_status not null default 'draft',
  greeting text,
  system_prompt text,
  behavior jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (agent_id, version_number)
);

create table public.ai_agent_capabilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid not null references public.ai_agents (id) on delete cascade,
  capability_key text not null,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (agent_id, capability_key)
);

create table public.ai_agent_prompts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid not null references public.ai_agents (id) on delete cascade,
  version_id uuid references public.ai_agent_versions (id) on delete cascade,
  name text not null,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.ai_agent_test_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid not null references public.ai_agents (id) on delete cascade,
  version_id uuid references public.ai_agent_versions (id) on delete set null,
  channel text not null default 'chat',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Phone + routing
create table public.phone_numbers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  e164 text not null,
  friendly_name text,
  number_type text not null default 'local',
  provider text not null default 'mock',
  provider_sid text,
  status public.phone_number_status not null default 'active',
  location_id uuid references public.locations (id) on delete set null,
  recording_enabled boolean not null default true,
  voicemail_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, e164)
);

create table public.phone_number_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  phone_number_id uuid not null references public.phone_numbers (id) on delete cascade,
  agent_id uuid references public.ai_agents (id) on delete set null,
  department_id uuid references public.departments (id) on delete set null,
  team_member_id uuid references public.team_members (id) on delete set null,
  assignment_type text not null default 'ai_agent',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.routing_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  priority integer not null default 100,
  status public.routing_rule_status not null default 'active',
  schedule jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.routing_rule_conditions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  rule_id uuid not null references public.routing_rules (id) on delete cascade,
  field text not null,
  operator text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.routing_rule_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  rule_id uuid not null references public.routing_rules (id) on delete cascade,
  action_type text not null,
  config jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.routing_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  strategy text not null default 'simultaneous',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.routing_group_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  group_id uuid not null references public.routing_groups (id) on delete cascade,
  team_member_id uuid not null references public.team_members (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (group_id, team_member_id)
);

-- Contacts / leads
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  source text,
  status text not null default 'new',
  score integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  activity_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  call_id uuid,
  status text not null default 'open',
  due_at timestamptz,
  assigned_to uuid references public.team_members (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Calls
create table public.calls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  phone_number_id uuid references public.phone_numbers (id) on delete set null,
  agent_id uuid references public.ai_agents (id) on delete set null,
  direction public.call_direction not null default 'inbound',
  status public.call_status not null default 'ringing',
  disposition text,
  from_number text,
  to_number text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  external_call_id text,
  external_provider text,
  sentiment text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.call_participants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  participant_type text not null,
  display_name text,
  phone text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.call_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);

create table public.call_transcripts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  speaker text not null,
  content text not null,
  started_at_ms integer,
  ended_at_ms integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.call_recordings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  storage_path text,
  duration_seconds integer,
  consent_captured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.call_summaries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null unique references public.calls (id) on delete cascade,
  summary text,
  key_topics jsonb not null default '[]'::jsonb,
  insights jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.call_tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (call_id, tag)
);

create table public.call_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.call_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  action_type text not null,
  status text not null default 'open',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.call_transfers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  from_target text,
  to_target text,
  reason text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.callback_requests
  add constraint callback_requests_call_id_fkey
  foreign key (call_id) references public.calls (id) on delete set null;
