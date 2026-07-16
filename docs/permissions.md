# AgentDesk AI — Permissions

## Roles

| Role | Summary |
|------|---------|
| OWNER | Full access, billing, delete org, manage owners |
| ADMIN | Manage resources, team, agents, routing, integrations; no org delete |
| MANAGER | Calls, appointments, routing, knowledge, analytics; limited team |
| AGENT | Assigned calls/appointments, notes, callbacks |
| VIEWER | Read-only dashboard, calls, appointments, analytics |

## API

Centralized authorization in `apps/web/src/lib/permissions/`:

```ts
can(role, action, resource) // boolean
assertCan(role, action, resource) // throws
```

Do not scatter role string comparisons in UI components. Pass capability flags or check on the server.

## Resources / actions (Phase 1)

Resources: `organization`, `billing`, `members`, `agents`, `phone_numbers`, `routing`, `calls`, `appointments`, `knowledge`, `integrations`, `analytics`, `settings`.

Actions: `read`, `create`, `update`, `delete`, `manage`, `invite`, `publish`.
