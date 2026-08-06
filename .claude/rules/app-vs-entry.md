# `App.js` vs `Entry.js`

`src/App.js` is provider/theming wiring only (Ant Design theme derived from `TenantBrandingContext`,
global providers: auth, FCM, notifications, realtime profile socket, chatbot, tenant branding) — it
does not contain routes. `src/Entry.js` is where `react-router-dom`'s `Routes`/`Route` tree,
`AuthorizationProvider`, and all page-level lazy imports live. New lazy-loaded pages must use
`lazyWithRetry()` (wraps the import with chunk-load-failure auto-reload logic), not a plain
`React.lazy()` — a plain `React.lazy()` page will white-screen on a stale-chunk deploy instead of
auto-reloading.

**`App.js` currently violates its own `REACT_GUIDELINES.md`**: it mutates the module-level
`notification` object (`notification.success = api.success` etc.) directly during render instead of
inside a `useEffect` — this is the exact "bad" example the guidelines doc uses to illustrate the
rule. If you're touching this file, fix that mutation as part of the change; if you're not touching
it, leave it — don't fix it as a drive-by in an unrelated PR.
