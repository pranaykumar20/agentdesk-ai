# Testing

## Stack (Phase H)

- Vitest — unit + data-access
- Playwright — E2E journeys
- SQL / Supabase — RLS policy tests

## Minimum E2E journeys

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

Phase A: foundation modules should include unit tests for `can()` permissions at minimum.
