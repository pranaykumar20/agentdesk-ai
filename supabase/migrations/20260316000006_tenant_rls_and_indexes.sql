-- Apply standard tenant RLS + org_id indexes to all organization-scoped tables
do $$
declare
  tbl text;
  tables text[] := array[
    'departments', 'team_members', 'team_member_schedules', 'team_member_skills',
    'ai_agents', 'ai_agent_versions', 'ai_agent_capabilities', 'ai_agent_prompts', 'ai_agent_test_runs',
    'phone_numbers', 'phone_number_assignments',
    'routing_rules', 'routing_rule_conditions', 'routing_rule_actions',
    'routing_groups', 'routing_group_members',
    'contacts', 'leads', 'lead_activities', 'callback_requests',
    'calls', 'call_participants', 'call_events', 'call_transcripts', 'call_recordings',
    'call_summaries', 'call_tags', 'call_notes', 'call_actions', 'call_transfers',
    'services', 'appointment_types', 'appointments', 'appointment_events', 'availability_rules',
    'knowledge_sources', 'knowledge_documents', 'knowledge_chunks', 'faq_items', 'business_policies',
    'integration_connections', 'integration_events',
    'subscriptions', 'usage_records', 'daily_analytics', 'billing_events', 'audit_logs'
  ];
begin
  foreach tbl in array tables loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_org_member(organization_id))',
      tbl || '_select_member', tbl
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_org_member(organization_id))',
      tbl || '_insert_member', tbl
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id))',
      tbl || '_update_member', tbl
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.has_org_role(organization_id, array[''OWNER'', ''ADMIN'', ''MANAGER'']::public.user_role[]))',
      tbl || '_delete_manager', tbl
    );
    execute format('create index if not exists %I on public.%I (organization_id)', tbl || '_org_id_idx', tbl);
  end loop;
end $$;

-- Hot-path indexes
create index if not exists calls_org_started_at_idx on public.calls (organization_id, started_at desc);
create index if not exists calls_org_status_idx on public.calls (organization_id, status);
create index if not exists appointments_org_starts_at_idx on public.appointments (organization_id, starts_at);
create index if not exists contacts_org_phone_idx on public.contacts (organization_id, phone);
create index if not exists webhook_events_provider_key_idx on public.webhook_events (provider, idempotency_key);

-- Integrations catalog is global read
alter table public.integrations enable row level security;
create policy integrations_select_authenticated
  on public.integrations for select
  to authenticated
  using (true);

-- Webhook events: service role only (no authenticated policies)
alter table public.webhook_events enable row level security;
