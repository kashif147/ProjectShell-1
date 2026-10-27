# DEV gateway configuration (tracked source)

This directory is the **tracked source for the DEV `:8443` gateway** (`dev-nginx-gateway`), whose
files are bind-mounted from the DEV VM:

| File here | On the DEV VM |
|---|---|
| `nginx.conf` | `/home/deploy-dev/gateway/nginx.conf` |
| `sites-enabled/default.conf` | `/home/deploy-dev/gateway/sites-enabled/default.conf` |
| `lua/verify_jwt.lua` | `/home/deploy-dev/gateway/lua/verify_jwt.lua` |
| `lua/trusted_headers.lua` | `/home/deploy-dev/gateway/lua/trusted_headers.lua` |

Changes are deployed to DEV by copying these files and reloading the gateway (`openresty -t`, then
`openresty -s reload`; never recreate it). Adding or editing them here deploys nothing by itself.

## Authentication and the tenant boundary

- **User authentication is the ProjectShell HS256 JWT.** Users sign in with Microsoft / Azure B2C
  through `/user-service/auth/azure-*`, which issues the ProjectShell JWT; every later request uses it.
- **Microsoft / Azure AD RS256 tokens are rejected (401) on `:8443`** - delegated-user and app-only
  alike, before any verification call. A Microsoft directory id (`tid`) is not a ProjectShell tenant,
  and Entra app roles are not ProjectShell roles.
- **`x-tenant-id` comes only from the verified ProjectShell JWT's `tenantId`**, which must be exactly
  24 lowercase hexadecimal characters (otherwise 401; never normalised, never taken from `tid`, a
  header, the body or the query).
- **Client-supplied trusted headers are stripped on every location** (`lua/trusted_headers.lua`:
  `x-jwt-verified`, `x-auth-source`, `x-user-*`, `x-tenant-id`, `x-internal-request`, ...): by the
  server-level block in `default.conf` for public locations, and by `verify_jwt.lua` (which then sets
  the verified values) for JWT-protected ones. `Authorization`, `x-correlation-id` and the
  gateway-set `X-Real-IP` are not stripped.
- **Every client-supplied `x-platform-*` header is stripped** (Phase B Z1; same `clear()`, by prefix,
  case-insensitive, over all request headers). Platform authority comes only from the `plat` claim inside
  a ProjectShell JWT signed by user-service, never from a header, body or query value.
- `/user-service/auth/` and `/user-service/pkce/` stay public (sign-in callbacks, refresh, login
  start), except **`/user-service/auth/logout`, which requires a verified ProjectShell JWT** (exact
  location).

## Tests

```bash
node --test gateway/tests/default-conf.test.js gateway/tests/trusted-headers.test.js  # source checks, no deps
GATEWAY_IT=1 node --test gateway/tests/gateway.integration.test.js                     # real OpenResty (Docker)
```

The integration suite runs these exact files in a test-only OpenResty image with the DEV gateway's
versions (`tests/integration/Dockerfile`) against an echo upstream; all secrets are random per run.

## Scope

- **UAT / Gateway path `:443` (`nginx-gateway`) is NOT covered by this directory or these changes.**
- `frontend/ProjectShell-1/default.conf` is a separate, UAT/prod-flavoured file and is not this config.
- The root `config/verify_jwt.lua` and `config/gateway/` copies are stale and not the DEV source.
