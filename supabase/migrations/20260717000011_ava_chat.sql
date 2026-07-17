-- Ava in-app chat history + audit (metadata previews only; no full secret payloads)

create table if not exists public.ava_chat_messages (
  id text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ava_chat_messages_org_user_created_idx
  on public.ava_chat_messages (organization_id, user_id, created_at);

create table if not exists public.ava_chat_audit_events (
  id text primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  pathname text,
  model text not null,
  tools_used text[] not null default '{}',
  citations jsonb not null default '[]'::jsonb,
  user_message_preview text not null default '',
  assistant_reply_preview text not null default '',
  used_fallback boolean not null default false,
  guard_reasons text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists ava_chat_audit_org_created_idx
  on public.ava_chat_audit_events (organization_id, created_at desc);

alter table public.ava_chat_messages enable row level security;
alter table public.ava_chat_audit_events enable row level security;

drop policy if exists ava_chat_messages_select_own on public.ava_chat_messages;
create policy ava_chat_messages_select_own
  on public.ava_chat_messages
  for select
  using (
    user_id = auth.uid()
    and public.is_org_member(organization_id)
  );

drop policy if exists ava_chat_messages_insert_own on public.ava_chat_messages;
create policy ava_chat_messages_insert_own
  on public.ava_chat_messages
  for insert
  with check (
    user_id = auth.uid()
    and public.is_org_member(organization_id)
  );

drop policy if exists ava_chat_messages_delete_own on public.ava_chat_messages;
create policy ava_chat_messages_delete_own
  on public.ava_chat_messages
  for delete
  using (
    user_id = auth.uid()
    and public.is_org_member(organization_id)
  );

drop policy if exists ava_chat_audit_select_admins on public.ava_chat_audit_events;
create policy ava_chat_audit_select_admins
  on public.ava_chat_audit_events
  for select
  using (
    public.is_org_member(organization_id)
    and public.has_org_role(organization_id, array['OWNER', 'ADMIN']::public.user_role[])
  );

drop policy if exists ava_chat_audit_insert_own on public.ava_chat_audit_events;
create policy ava_chat_audit_insert_own
  on public.ava_chat_audit_events
  for insert
  with check (
    user_id = auth.uid()
    and public.is_org_member(organization_id)
  );
