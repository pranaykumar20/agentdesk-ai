-- Enable Phase 2 module flags as their UIs ship.
update public.feature_flags
set default_enabled = true
where key in (
  'contact_center',
  'call_queues',
  'live_monitor',
  'workflows',
  'voice_flows',
  'sms_campaigns',
  'whatsapp',
  'training',
  'roi',
  'marketplace'
);
