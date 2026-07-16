-- Smile Dental Care demo seed (fictional data).
-- Requires a demo auth user. Create via Supabase Auth or set DEMO_USER_ID below after signup.
-- This seed is idempotent for the fixed organization id.

create extension if not exists pgcrypto;

-- Fixed IDs for demo reproducibility
-- Demo user must exist in auth.users. For local: create user demo@smiledentalcare.com then update this UUID.
-- Placeholder: skip profile/member inserts if demo user missing.

do $$
declare
  demo_user_id uuid;
  org_id uuid := '11111111-1111-1111-1111-111111111111';
  location_id uuid := '22222222-2222-2222-2222-222222222222';
  agent_id uuid := '33333333-3333-3333-3333-333333333333';
  dept_reception uuid := '44444444-4444-4444-4444-444444444401';
  dept_billing uuid := '44444444-4444-4444-4444-444444444402';
  dept_clinical uuid := '44444444-4444-4444-4444-444444444403';
  dept_mgmt uuid := '44444444-4444-4444-4444-444444444404';
  phone_primary uuid := '55555555-5555-5555-5555-555555555501';
  i int;
begin
  select id into demo_user_id from auth.users where email = 'demo@smiledentalcare.com' limit 1;

  if demo_user_id is null then
    raise notice 'Seed skipped memberships: create auth user demo@smiledentalcare.com first';
  end if;

  insert into public.organizations (id, name, slug, industry, timezone, onboarding_step, onboarding_completed_at, created_by)
  values (
    org_id,
    'Smile Dental Care',
    'smile-dental-care',
    'healthcare_dental',
    'America/New_York',
    10,
    timezone('utc', now()),
    demo_user_id
  )
  on conflict (id) do update set name = excluded.name;

  insert into public.organization_settings (organization_id, business_email, business_phone, website, currency, language)
  values (org_id, 'hello@smiledentalcare.com', '+15135550100', 'https://www.smiledentalcare.example', 'USD', 'en-US')
  on conflict (organization_id) do nothing;

  if demo_user_id is not null then
    insert into public.organization_members (organization_id, user_id, role, status, invited_email, joined_at)
    values (org_id, demo_user_id, 'OWNER', 'active', 'demo@smiledentalcare.com', timezone('utc', now()))
    on conflict (organization_id, user_id) do nothing;
  end if;

  insert into public.locations (id, organization_id, name, city, region, country, timezone, is_primary)
  values (location_id, org_id, 'Cincinnati Office', 'Cincinnati', 'OH', 'US', 'America/New_York', true)
  on conflict (id) do nothing;

  insert into public.departments (id, organization_id, name) values
    (dept_reception, org_id, 'Reception'),
    (dept_billing, org_id, 'Billing'),
    (dept_clinical, org_id, 'Clinical'),
    (dept_mgmt, org_id, 'Management')
  on conflict do nothing;

  insert into public.ai_agents (id, organization_id, name, role_title, description, primary_language, voice, timezone, status)
  values (
    agent_id,
    org_id,
    'Ava',
    'Dental Receptionist',
    'AI assistant for Smile Dental Care. Handles calls, books appointments, answers FAQs, and routes to the right team.',
    'en-US',
    'Ava Natural',
    'America/New_York',
    'active'
  )
  on conflict (id) do nothing;

  insert into public.ai_agent_versions (organization_id, agent_id, version_number, status, greeting, system_prompt, published_at)
  values (
    org_id,
    agent_id,
    1,
    'published',
    'Hi! Thanks for calling Smile Dental Care. How can I help you today?',
    'You are Ava, a friendly dental receptionist for Smile Dental Care in Cincinnati.',
    timezone('utc', now())
  )
  on conflict do nothing;

  insert into public.phone_numbers (id, organization_id, e164, friendly_name, number_type, provider, status, location_id)
  values
    (phone_primary, org_id, '+15135550100', 'Primary', 'local', 'mock', 'active', location_id),
    ('55555555-5555-5555-5555-555555555502', org_id, '+15135550101', 'Appointments Line', 'local', 'mock', 'active', location_id),
    ('55555555-5555-5555-5555-555555555503', org_id, '+18005550199', 'Toll Free', 'toll_free', 'mock', 'forwarding', location_id)
  on conflict do nothing;

  insert into public.phone_number_assignments (organization_id, phone_number_id, agent_id, assignment_type)
  values (org_id, phone_primary, agent_id, 'ai_agent')
  on conflict do nothing;

  insert into public.subscriptions (organization_id, plan_key, status, minutes_included, minutes_used)
  values (org_id, 'professional', 'active', 5000, 2500)
  on conflict (organization_id) do nothing;

  insert into public.faq_items (organization_id, question, answer, category, status) values
    (org_id, 'What are your office hours?', 'We are open Monday–Friday 8am–5pm and Saturday 9am–1pm.', 'Hours', 'published'),
    (org_id, 'Do you accept insurance?', 'Yes, we accept most major dental insurance plans. Our billing team can verify coverage.', 'Insurance', 'published'),
    (org_id, 'How do I book an appointment?', 'You can book by phone with our AI receptionist or request a time and we will confirm.', 'Appointments', 'published');

  insert into public.business_policies (organization_id, title, body, status) values
    (org_id, 'Cancellation policy', 'Please cancel or reschedule at least 24 hours in advance to avoid a fee.', 'published'),
    (org_id, 'New patient intake', 'New patients should arrive 15 minutes early to complete paperwork.', 'published');

  insert into public.services (organization_id, name, description, duration_minutes) values
    (org_id, 'Teeth Cleaning', 'Routine dental cleaning', 30),
    (org_id, 'Dental Checkup', 'Comprehensive exam', 45),
    (org_id, 'Tooth Extraction Consultation', 'Consultation for extraction', 30);

  insert into public.routing_rules (organization_id, name, description, priority, status) values
    (org_id, 'Appointment booking', 'Route appointment intents to booking flow', 10, 'active'),
    (org_id, 'Billing', 'Route billing questions to Billing department', 20, 'active'),
    (org_id, 'Insurance', 'Route insurance questions to Billing', 30, 'active'),
    (org_id, 'After hours', 'After-hours voicemail and callback', 90, 'active'),
    (org_id, 'Escalation', 'Escalate complex cases to Management', 100, 'active');

  -- 30 sample calls
  for i in 1..30 loop
    insert into public.calls (
      organization_id, phone_number_id, agent_id, direction, status, disposition,
      from_number, to_number, started_at, ended_at, duration_seconds, external_provider, sentiment
    ) values (
      org_id,
      phone_primary,
      agent_id,
      'inbound',
      case when i % 10 = 0 then 'missed'::public.call_status
           when i % 7 = 0 then 'voicemail'::public.call_status
           else 'completed'::public.call_status end,
      case when i % 5 = 0 then 'Insurance Inquiry'
           when i % 3 = 0 then 'Office Hours'
           else 'Book Appointment' end,
      '+1513555' || lpad((100 + i)::text, 4, '0'),
      '+15135550100',
      timezone('utc', now()) - (i || ' hours')::interval,
      timezone('utc', now()) - (i || ' hours')::interval + ((120 + i) || ' seconds')::interval,
      120 + i,
      'mock',
      case when i % 4 = 0 then 'neutral' else 'positive' end
    );
  end loop;

  -- 20 sample appointments
  for i in 1..20 loop
    insert into public.appointments (
      organization_id, status, starts_at, ends_at, source, created_by_ai, notes
    ) values (
      org_id,
      case when i % 5 = 0 then 'pending'::public.appointment_status
           when i % 8 = 0 then 'cancelled'::public.appointment_status
           else 'confirmed'::public.appointment_status end,
      timezone('utc', now()) + ((i || ' days')::interval) + interval '10 hours',
      timezone('utc', now()) + ((i || ' days')::interval) + interval '10 hours 30 minutes',
      'ai_agent',
      true,
      'Seed appointment #' || i
    );
  end loop;

  insert into public.daily_analytics (organization_id, day, metrics)
  values (
    org_id,
    (timezone('utc', now()))::date,
    jsonb_build_object(
      'total_calls', 30,
      'answered_calls', 25,
      'appointments_booked', 20,
      'new_leads', 12
    )
  )
  on conflict (organization_id, day) do nothing;
end $$;
