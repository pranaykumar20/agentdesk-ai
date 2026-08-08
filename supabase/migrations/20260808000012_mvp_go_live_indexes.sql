-- Thin MVP go-live: uniqueness helpers for Retell agent/call sync

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
