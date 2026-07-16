-- Extensions and shared helpers
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create type public.user_role as enum ('OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'VIEWER');
create type public.member_status as enum ('active', 'invited', 'disabled');
create type public.call_status as enum ('ringing', 'in_progress', 'completed', 'missed', 'voicemail', 'failed', 'busy', 'no_answer');
create type public.call_direction as enum ('inbound', 'outbound');
create type public.appointment_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
create type public.integration_status as enum ('connected', 'disconnected', 'needs_attention', 'expired', 'error');
create type public.agent_version_status as enum ('draft', 'published', 'archived');
create type public.routing_rule_status as enum ('active', 'paused', 'disabled');
create type public.phone_number_status as enum ('active', 'forwarding', 'unavailable', 'in_use');
create type public.knowledge_status as enum ('draft', 'processing', 'published', 'failed', 'archived');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
