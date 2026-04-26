# Environment Variables

> v1.0 (stdio + no auth) requires **no environment variables**.

## Optional

| Var | Default | Description |
|---|---|---|
| `DEBUG` | unset | Set to `vantage-agent-composer:*` to enable verbose structured logs. |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error`. |

## Phase 2 (placeholder)

- `ALLOWED_ROLES` — RBAC, deferred per spec §4.
- `VANTAGE_AGENT_COMPOSER_HTTP_PORT` — when HTTP transport is added.
