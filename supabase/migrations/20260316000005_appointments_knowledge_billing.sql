-- Appointments
create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.appointment_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  service_id uuid references public.services (id) on delete set null,
  color text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  provider_member_id uuid references public.team_members (id) on delete set null,
  location_id uuid references public.locations (id) on delete set null,
  status public.appointment_status not null default 'pending',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  source text,
  external_calendar_id text,
  created_by_ai boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.appointment_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  team_member_id uuid references public.team_members (id) on delete cascade,
  location_id uuid references public.locations (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Knowledge
create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  source_type text not null,
  name text not null,
  status public.knowledge_status not null default 'draft',
  config jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  source_id uuid references public.knowledge_sources (id) on delete set null,
  title text not null,
  status public.knowledge_status not null default 'draft',
  storage_path text,
  mime_type text,
  byte_size bigint,
  category text,
  view_count integer not null default 0,
  helpful_rate numeric(5,2),
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_id uuid not null references public.knowledge_documents (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  question text not null,
  answer text not null,
  category text,
  status public.knowledge_status not null default 'published',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.business_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  body text not null,
  status public.knowledge_status not null default 'published',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Integrations
create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  category text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  integration_id uuid not null references public.integrations (id) on delete cascade,
  status public.integration_status not null default 'disconnected',
  connected_at timestamptz,
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  secrets_encrypted text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, integration_id)
);

create table public.integration_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  connection_id uuid references public.integration_connections (id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  idempotency_key text not null,
  event_type text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received',
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (provider, idempotency_key)
);

-- Billing + analytics
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  plan_key text not null default 'starter',
  status public.subscription_status not null default 'trialing',
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  minutes_included integer not null default 500,
  minutes_used integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.usage_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  metric text not null,
  quantity numeric not null,
  recorded_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb
);

create table public.daily_analytics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  day date not null,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, day)
);

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Catalog integrations seed rows
insert into public.integrations (key, name, category, description) values
  ('google_calendar', 'Google Calendar', 'Scheduling', 'Sync appointments and availability'),
  ('twilio', 'Twilio', 'Communication', 'Phone numbers and SMS'),
  ('retell', 'Retell AI', 'Communication', 'AI voice agents'),
  ('hubspot', 'HubSpot', 'CRM', 'CRM sync'),
  ('salesforce', 'Salesforce', 'CRM', 'CRM sync (placeholder)'),
  ('slack', 'Slack', 'Communication', 'Team notifications'),
  ('stripe', 'Stripe', 'Payments', 'Billing and payments'),
  ('mailchimp', 'Mailchimp', 'Marketing', 'Email marketing (placeholder)'),
  ('quickbooks', 'QuickBooks Online', 'Accounting', 'Accounting (placeholder)'),
  ('zapier', 'Zapier', 'Automation', 'Webhook automation (placeholder)');
