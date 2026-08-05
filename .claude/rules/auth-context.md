# Auth/authorization is a Context, not Redux, and is genuinely load-bearing

`src/context/AuthorizationContext.js` (602 lines) is the real authorization system —
`src/Navigation/ProtectedRoute.js` and `component/common/RoutePermissionWrapper`/
`AuthorizationWrapper` all consume it via `useAuthorization()`. It's wrapped around the router in
`src/Entry.js`, not in `App.js` (see `app-vs-entry.md`). Permission checks in components use the
`hasPermission("resource:action")` canonical-string format matching what `user-service`'s PDP
returns — see `backend/user-service/CLAUDE.md`'s policy-evaluation section for exactly how those
strings get produced.

`ProtectedRoute` waits for `isInitialized` before making any auth decision. If you see a route
flash-redirect to `/` on refresh, check for an initialization-race bug in a new provider inserted
before `AuthorizationProvider` first — that's the far more common cause than a bug in the route
itself.
