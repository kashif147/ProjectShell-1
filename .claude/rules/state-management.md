# State: one Redux Toolkit slice per domain concept, few global patterns

`src/store/Store.js` wires ~40+ slices from `src/features/*Slice.js` (plus nested folders —
`features/profiles/`, `features/subscription/`, `features/template/`, `features/dashboards/`,
`features/events/`, `features/reports/`, `features/RolesPermission/`, `features/shared/`,
`features/year-end-process/`). There is no single "domain module" abstraction: each entity
(applications, lookups, batches, templates, roles, permissions, transfer requests, ...) gets its own
flat slice file at the top of `features/`, or its own subfolder if the domain has multiple related
slices. When adding a new domain, follow whichever of the two existing entities it's most similar to
rather than inventing a third pattern.

`src/context/*` is reserved for cross-cutting concerns that don't fit the request/response
Redux-slice shape: live sockets (`ProfileRealtimeContext`, `NotificationContext`, `FCMContext`),
in-page UI state shared across deeply nested components (`FilterContext`, `TableColumnsContext`,
toolbar contexts per feature), and tenant/auth state. Don't add a new Redux slice for state that's
actually one of these three cross-cutting shapes — use a Context instead.

After any insert/update/delete, dispatch the slice's `reset*()` action before refetching — see
`docs-index.md`'s note on `docs/DATA_REFRESH_PATTERN.md` for why.
