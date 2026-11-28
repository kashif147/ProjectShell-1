# design-sync log: ProjectShell CRM

One entry per publish. The artifact's own `project/_ds_sync.json` is machine-written content hashes (it carries no
free text); this file is the human-readable record that goes with it. See NOTES.md "Incremental re-sync procedure".

## 2026-11-28: first publish

| Field | Value |
|---|---|
| Artifact | https://claude.ai/artifact/9VuFn8PgjKK3kKsC61Ztxj ("ProjectShell CRM", Design System type) |
| Artifact version | Version 2, version id `1795842993-443e` (version 1 was the empty artifact) |
| Visibility | Private: readable only by the owner (service: "readable by only you"; plan `sharedWith: owner`). Page is read-only (changes come from code + /design-sync). |
| Source | `frontend/ProjectShell-1`, branch `chore/design-sync` from `origin/develop` `5aa5174` (Merge PR #78). App source unmodified. |
| Sync config | committed with this log on `chore/design-sync` (see `git log -- .design-sync`) |
| Scope | 54 components (8 debug/example files + AuthorizationWrapper, ListModal, Content, QRCodeGen, IdleModal excluded by owner decision), 151 preview cells, all graded good |
| Bundle | `components/bundle.js` 10,792,416 bytes, sha256 `f38df935d5984adbbcc7b653f3bb1a76…`; CRM components + antd 5.29.3 + @ant-design/icons + CRMProvider/CRMRoute/dayjs; React 18.3.1 shipped as `components/lib/react.js` |
| Published | 119 files, 13,215,156 bytes, one call, 0 removed |

Verification results:

- Driver (`resync.mjs`): build, diff, validate and capture all ok; 0 pending grades, 0 grades cleared, no learnings left.
- Render check: 54/54 render; known warns recorded in NOTES.md.
- Layout check: no errors; 97 of 139 custom properties shown as tokens (CRM brand colours included), one light theme.
- Security scan of the exact upload set: 0 Google/Stripe keys, 0 JWTs, 0 private keys, 0 DB/AMQP URIs, 0 bearer tokens,
  0 webhook UUIDs, 0 secret/password literals, 0 real-domain emails. Remaining: the app's own placeholder mock records
  (e.g. "John Doe", `0891234567`) in Redux initial state, and dev `localhost` / public Vercel URLs in the app code.
- Post-publish check (`artifact-publish.mjs check`): CLEAN, 119 of 119 files identical, 0 differ, 0 to remove.
  Independent sha256 comparison against the service's `_files.json`: 117 layout files byte-identical (plus the index and
  sync record written by the planner); 54 components, each with `preview.html` and `README.md`.
