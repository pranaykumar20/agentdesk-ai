# Testing

## Stack

| Layer | Tool | Status |
|-------|------|--------|
| Unit / route | Vitest (`apps/web`) | Active |
| E2E journeys | Playwright | Planned |
| RLS policies | SQL / Supabase | Planned |

## Vitest (current)

Run: `npm test -w @ai-voice-leads/web`

Covered areas include:

- `can()` RBAC matrix (roles + appointments/knowledge)
- Retell HMAC webhook verification
- Retell webhook route (401 / duplicate / enqueue)
- Webhook idempotency (memory fallback)
- Local jobs microtask enqueue
- Org cookie membership pick (`pickActiveOrgId`)
- Retell call org resolution (`resolveOrganizationId`)
- Internal API auth helper
- Role-filtered dashboard nav
- Demo data helpers (calls, billing, analytics, routing)

## Planned E2E journeys (Playwright)

1. Sign up + create organization
2. Complete onboarding
3. Open dashboard
4. Create AI agent
5. Add phone number (mock)
6. Create routing rule
7. Mock inbound call creates record
8. Open call details
9. Create appointment
10. Upload knowledge document
11. Invite team member
12. Unauthorized tenant access rejected
13. Stripe webhook updates subscription
14. Retell webhook updates call status

## Planned RLS checks

Cross-tenant `SELECT`/`UPDATE` denied for membership-scoped tables (see `docs/database.md` helpers).
