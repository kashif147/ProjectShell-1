# INMO DEV smoke-test gate

`inmo-dev-smoke.sh` is a fast, **non-destructive** liveness + security-regression
check for the ProjectShell **DEV** environment. Run it before and after every
migration/change as a go/no-go gate.

## 1. Purpose
Confirm the DEV stack is up and that the Phase 0B security fixes still hold —
without mutating any business data, sending email/push, taking payments, or
approving applications.

## 2. DEV target
- Gateway: `https://projectshell-vm.northeurope.cloudapp.azure.com:8443`
- CRM: `project-shell-crm-dev` · Portal: `project-shell-portal-dev`
- Tenant scope for tenant-scoped probes: INMO DEV `Tenant._id` `68cbf7806080b4621d469d34`
  (override with `--tenant-id`).

Override the gateway with `--base https://…:8443`.

## 3. Dependencies
`bash` and `curl`. `jq` is **not** required (assertions are on HTTP status).

## 4. Local usage
```bash
# unauthenticated tier only (no token)
scripts/smoke/inmo-dev-smoke.sh

# full gate with a low-privilege DEV JWT
scripts/smoke/inmo-dev-smoke.sh --token-file /path/to/dev.jwt
SMOKE_JWT_FILE=/path/to/dev.jwt scripts/smoke/inmo-dev-smoke.sh
```

## 5. VM usage
```bash
# pipe the script to the VM (token file already on the VM)
ssh deploy@<vm> 'SMOKE_JWT_FILE=/path/to/dev.jwt bash -s' < scripts/smoke/inmo-dev-smoke.sh
# or copy it over and run it there
```
There is **no implicit token path** — you must pass the token explicitly. (The
`/home/deploy-dev/pstest.jwt` used during Phase 0B was deleted after 0B-7; mint a
fresh low-privilege DEV token for the authenticated tier.)

## 6. `--require-auth`
By default the authenticated checks **SKIP** when no token is supplied and the run
can still exit 0 on the unauthenticated tier. With `--require-auth`, a usable JWT is
mandatory; if none is available the gate exits **2** without running.

## 7. Token handling
- Sources, in order: `--token-file`, `$SMOKE_JWT_FILE`, `$SMOKE_JWT`.
- The token is read once, an optional `Bearer ` prefix and CR/LF are stripped, and it
  is validated to *look* like a JWT (three base64url segments) **without decoding or
  printing it**.
- The token is sent only via the `Authorization` header; it is never echoed, never a
  positional CLI argument, and never logged. No token is stored in this repo.

## 8. Exit codes
- `0` — all eligible **required** checks passed.
- `1` — one or more required checks failed.
- `2` — `--require-auth` was set but no usable JWT was available.

Optional/WARN checks never change the exit code.

## 9. Automated checks
Unauthenticated (always run, **required**):
| ID | Check | Expected |
|----|-------|----------|
| U1 | `GET /health` | 200 |
| U2 | `GET /user-service/pkce/generate` | 200 |
| U3 | `GET /audit-service/health` | 200 |
| S12 | `POST /user-service/auth/general-crm/register` (empty body) | **404** (blocked at gateway, 0B-6) |
| S13 | `POST /user-service/auth/general-crm/login` (empty body) | **404** (0B-6) |

Authenticated reads (run only with a token; **required-when-token**; `2xx`=PASS,
`400`=WARN "missing param", `403`=WARN "low-priv role may lack permission", else FAIL):
| ID | Service | Endpoint |
|----|---------|----------|
| A3 | user-service | `GET /user-service/api/roles` |
| A4 | profile-service | `GET /profile-service/api/profile` |
| A5 | subscription-service | `GET /subscription-service/api/v1/subscriptions` |
| A6 | events-service | `GET /events-service/api/events` |
| A7 | issue-service | `GET /issue-service/api/issues` |
| A8 | reporting-service | `GET /reporting-service/api/dashboard/overview` |
| A9 | audit-service | `GET /audit-service/api/audit-logs` (tenant from gateway-injected `x-tenant-id`) |

Security regression (require a token to reach the backend; **required**, exact status):
| ID | Check | Expected |
|----|-------|----------|
| S14 | internal by-email + external `x-internal-request: true` | **403** (0B-7 — header stripped at gateway) |
| S15 | internal by-email + spoofed `x-jwt-verified: true` | **403** (spoofed header creates no trust) |

S14/S15 use `email=nonexistent@example.invalid` and never a real member email.

Optional / informational (never FAIL the gate):
| ID | Check | Note |
|----|-------|------|
| A10 | `GET /notification-service/api/notifications` | optional read; WARN if not 2xx |
| A11 | `POST /user-service/auth/refresh` (empty body) | reachability only (expect 400); **not** a health signal |

## 10. Manual checks (not automated)
Run these by hand; do **not** automate real credentials, payments, email, or push:
- **CRM Entra login** — interactive.
- **Portal B2C login** — interactive.
- **Mobile login** — **currently known BROKEN / incompatible** (client does not send the
  server-issued `state` the hardened `/auth/azure-portal` now requires). Do not report as working.
- **Application approval / workflow** — manual (no destructive automation).
- **Stripe test payment** — manual, test mode only.
- **Email receipt (SES)** — manual inbox check.
- **FCM push notification** — manual device check.
- **Letter / PDF generation** — **currently known BROKEN** (LibreOffice is not installed in
  the communication-service image). Do not report as working.

## 11. Known limitations
- Smoke coverage only: liveness + security regression, not full functional testing.
- Per-service reads assert HTTP status, not populated data; an empty result (`data:null`) is a PASS.
- A `400`/`403` on an authenticated read is a WARN, not a failure, because a low-privilege
  role may lack a permission or a route may want a query param. Investigate WARNs; don't
  broaden permissions to force a PASS.
- Exact read paths (A4, A8) were chosen from current `develop` routes; if a service route
  changes, update the corresponding check here.
- DEV JWTs are short-lived (~24h): supply a fresh low-privilege token each run.

## 12. Future CI use
Add a GitHub Actions workflow in this repo (a separate change; not included here):
- On every PR: run the **unauthenticated tier** (no secret) as a required check.
- Pre-deploy / scheduled: run the **full gate** with `--require-auth`, reading a
  low-privilege DEV token from an encrypted Actions secret (`SMOKE_JWT`) that CI mints or
  rotates — never a hardcoded token. Exit codes drive pass/fail (exit 2 = token missing).
