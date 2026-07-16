# Routing engine

Routing rules are structured data (not only freeform prompts).

## Shape

- **WHEN** conditions: intent, caller type, business hours, location, phone number, language, sentiment, keyword, known contact, VIP
- **THEN** actions: answer with AI, route department/member, ring group, transfer, voicemail, callback, notify, book appointment, create lead
- **Fallback** chain: next member, department, voicemail, callback, AI message, emergency

## Features (Phase 1)

Priority ordering, active/paused/disabled, reorder, duplicate, schedule / after-hours, conflict warnings (UI).

Tables: `routing_rules`, `routing_rule_conditions`, `routing_rule_actions`, `routing_groups`, `routing_group_members`.
