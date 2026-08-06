# Service URLs are centralized, not scattered `axios.create()` calls

`src/config/serviceUrls.js` is the single place resolving each backend service's base URL from
`REACT_APP_*` env vars (see `docs-index.md`'s note on `GATEWAY_ENV_CONFIG.md`). New API modules
under `src/api/`/`src/services/` must import from here rather than reading
`process.env.REACT_APP_*` directly — a module that reads `process.env` directly won't pick up the
legacy fallback names `serviceUrls.js` already handles for a couple of services (e.g.
`REACT_APP_SUBSCRIPTION` as a fallback for `REACT_APP_SUBSCRIPTION_SERVICE_URL`), and will break
silently in environments still using the old name.
