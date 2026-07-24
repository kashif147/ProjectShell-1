# Which docs to trust

`docs/` has ~10 files; most are current and genuinely useful, with one clear exception:

- **`docs/AUTHORIZATION_GUIDE.md` is superseded by `docs/AUTHORIZATION_UPDATE_GUIDE.md`** — the
  original assumed dedicated auth API endpoints that don't exist; the update doc describes what's
  actually implemented (permissions/roles extracted from the JWT plus calls to user-service's real
  `/policy/permissions/:resource`, `/policy/check/:resource/:action`, `/policy/evaluate` endpoints —
  see `backend/user-service/CLAUDE.md` for the PDP side of this). Read the update doc, treat the
  original as historical context only.
- `docs/DYNAMIC_PERMISSIONS_GUIDE.md`, `docs/DYNAMIC_ROUTE_PERMISSIONS_GUIDE.md`,
  `docs/POLICY_CLIENT_IMPLEMENTATION.md` — all current, cover incremental extensions to the same
  authorization system (dynamic UI permission checks, dynamic per-route permission fetch, a
  standalone policy-client SDK wrapper). **The corresponding demo pages
  (`src/pages/AuthorizationExample.js`, `DynamicPermissionsExample.js`,
  `DynamicRoutePermissionsExample.js`, `PolicyClientExample.js`) are not mounted anywhere in
  `src/Entry.js`'s routing** — they're reference implementations for the pattern, not live pages.
  Don't treat their presence as evidence a route exists.
- `docs/DATA_REFRESH_PATTERN.md` — current, real convention: after any insert/update/delete, dispatch
  the slice's `reset*()` action before refetching, because Redux Toolkit's typical "don't refetch if
  we already have data" condition checks otherwise block picking up the mutation.
- `docs/API_PAGINATION_GUIDE.md` — current, documents the `ApiPagination` component's page-size
  tiering (behavior changes at 1k/10k/50k record thresholds).
- `docs/MEMBERSHIP_REPORT_STANDARD.md` — the report-page convention (columns/filters/export/print/row
  chrome) referenced from `backend/reporting-service`'s own docs — read this before building or
  modifying any report page; the `add-report` skill also encodes this pattern.
- `docs/SOCKET_IO_FRONTEND.md` / `docs/SOCKET_IO_GATEWAY_FIX.md` — client side of
  `backend/notification-service`'s Socket.IO layer (see that service's `docs/SOCKET_IO.md` and
  CLAUDE.md for the server side) plus a documented nginx WebSocket-proxy gotcha.
- `GATEWAY_ENV_CONFIG.md` (repo root) — the authoritative list of `REACT_APP_*` env vars, one per
  backend service, all pointing through the gateway (`.../<service-name>/api`). Cross-reference
  `src/config/serviceUrls.js`, which is the code that actually reads them (with legacy fallback names
  for a couple of services, e.g. `REACT_APP_SUBSCRIPTION` as a fallback for
  `REACT_APP_SUBSCRIPTION_SERVICE_URL`).
- **`REACT_GUIDELINES.md`** — short, deliberately curated list of conventions this codebase is
  supposed to follow, including things it currently violates. Read it before writing new components.
