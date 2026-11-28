# design-sync notes: ProjectShell CRM

Target: Design System artifact "ProjectShell CRM" (`.design-sync/artifact.json`). First sync 2026-11-28,
from branch `chore/design-sync` cut from `origin/develop` 5aa5174.

## How this repo is built for design-sync

- The CRM is a Create React App, **not a component library**: no `dist/`, no `.d.ts`, JSX inside `.js`,
  runtime `process.env.*`. `cfg.buildCmd` (`node .design-sync/build-lib.mjs`) compiles
  `.design-sync/lib-entry.js` into an ESM "dist" at `.design-sync/.cache/dist/` (gitignored, regenerated),
  which `cfg.entry` points the converter at. Run it **from the CRM repo root, after staging `.ds-sync/`**:
  it takes esbuild from `.ds-sync/node_modules`.
- `lib-entry.js` is the component list: every `src/component/common/*` default export re-exported under its
  file name (plus `cancallation/CancallationDrawer`, `Header`'s named `AppLauncher`, and `CRMProvider`).
  `cfg.componentSrcMap` mirrors it (the converter finds no PascalCase `.d.ts` exports, so the map IS the
  component list). Add or remove a component in BOTH places.
- `build-lib.mjs` does, in this build only (the app is untouched):
  - `process.env` -> `{}`: no `REACT_APP_*` value can be inlined (gateway URLs and keys read as undefined).
  - App plumbing -> inert stubs in `.design-sync/stubs/` (owner decision 2026-11-28): xlsx, xlsx-js-style,
    jspdf, jspdf-autotable, react-to-pdf, @react-google-maps/api, firebase/app, firebase/messaging,
    @stripe/stripe-js, @stripe/react-stripe-js, autoprefixer, and the app's `src/config/firebase.js`.
    Reasons: bundle was 13.6 MB (cap 12 MB), now ~8.5 MB; Firebase `initializeApp` and `loadStripe` ran at
    module load; hardcoded client keys stay out of the artifact.
  - Hardcoded client keys in app source (`AIza…` Google Maps, `pk_…` Stripe) and n8n webhook IDs
    (`/webhook/<uuid>`, the chatbot's dev fallback URL) are blanked by regex (`KEY_RX`).
    After every build, grep `_ds_bundle.js` for `AIza`, `pk_live_`, `pk_test_` - all must be 0.
  - `MISSING_EXPORTS`: `TableComponent.js` imports `filterTransferById` / `filterTransferFromExistingData`,
    which `filterTransferSlice.js` doesn't export (webpack yields undefined; esbuild refuses). Shimmed as
    undefined. Remove when the source stops importing them.
  - `App.css` starts with `@tailwind` directives (inert in CRA: no tailwind config), which made esbuild drop
    its `@import "./styles/Theme.css"` - so all theme tokens went missing. The build strips `@tailwind` lines.
  - Package stylesheets are bundled into `dist/index.css` (not left as JS imports) so every rule is in one
    file in import order; `cfg.cssEntry` points at it. Root-absolute `url(/public/...)` stays external.
- Head-of-page styles from `public/index.html` are vendored in `.design-sync/vendor/` (owner decision):
  Bootstrap 5.0.2 (SRI-verified copy) and the Google Fonts Roboto `@import`.
- Fonts: only Roboto is loaded, as in production. `Inter` (MembershipForm.css, ApplicationForm.css) and
  `IBM Plex Mono` (ProfileHeader.css) are never loaded by the live CRM either: they fall back to Roboto /
  system monospace, by owner decision ("match the live app"). Validate prints `[FONT_REMOTE]` for them: expected.
- `AuthorizationWrapper.jsx` is excluded: it imports `../context/AuthorizationContext`, which doesn't exist
  (dead code, nothing imports it).
- Debug/example files excluded by owner decision: Dummy, ApiPaginationExample, AuthorizationExample,
  FCMTokenExample, PolicyExample, DebugPermissions, LocalStorageDebug, SimpleDebug.

## Categories

- Components-page groups come from `.design-sync/docs/<Name>.md` frontmatter (`category`, `keywords`) via `docsMap`.
  The converter applies a doc category only when the folder-derived group is "general", hence
  `srcDir: src/component/common`. ReportViewer keeps its real sibling doc (no frontmatter, so it stays "general"), and
  CancallationDrawer lives in `cancallation/` (stays "cancallation").

## Guidelines

- Only `src/styles/ThemeGuide.md` ships (`guidelinesGlob`). `docs/MEMBERSHIP_REPORT_STANDARD.md` was left out:
  besides report UX it carries backend seeding commands and internal API paths, which are not design guidance.
  The default globs would pick up all of `docs/*.md` (auth/socket/pagination engineering docs): keep the glob explicit.

## Brand tokens (pre-publication review, 2026-11-28)

- Theme.css's brand colours are `var()`/`color-mix()` chains the Colors page can't read, so the page showed
  only Bootstrap's `--bs-*` palette. `build-lib.mjs` now evaluates Theme.css's own formulas for the default
  tenant and appends them to the end of `dist/index.css` (the `cssEntry`; `cfg.tokensGlob` only reads from a
  `tokensPkg` package, so it can't be used here): resolved hex values as
  `!important` `:root` declarations, so the page can rank them above the color-mix rules. In the artifact
  (never signed in, no tenant branding) they equal the runtime values. Side effect: inside designs, tenant
  re-branding via `--primary-color` etc. no longer propagates to the derived tokens.
- Review also: preview contact data uses `@example.ie` and `087 000 01xx` numbers only. Never use real domains
  (garda.ie, eircom.net) or realistic mobile numbers in previews. The README header (`conventions.md`) carries
  the component catalogue (reuse tiers) and known limitations, including WCAG contrast figures. Keep both in
  step when components change.

## Provider

- `.design-sync/CRMProvider.jsx` (exported from the bundle as `CRMProvider`, `cfg.provider`) mirrors the
  provider stack of `src/index.js` + `App.js` + `Entry.js`: real Redux store, `MemoryRouter`, the index.js UI
  contexts, AuthorizationProvider, AntApp, NotificationProvider, TenantBrandingProvider, branded antd
  ConfigProvider. With no token in localStorage, auth is signed-out, no socket opens, branding stays default.
- Its `BrandedAntTheme` is a COPY of `src/App.js`'s (not exported there).
- Components that dispatch thunks on mount make requests to `undefined/...` (env blanked) and get 404s; the
  error toasts/empty states that follow are the honest signed-out render.

## Browser

- No Playwright browser cache on this machine; renders run in the installed Chrome:
  `export DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` before
  validate/capture/resync, plus `(cd .ds-sync && npm i playwright)`.

## Component scope decisions (owner, 2026-11-28)

- Also excluded: ListModal and Content (empty `<div>` placeholders), QRCodeGen (broken source: uses
  `qrRef`/`QRCode`/`qrValue`/`downloadSVG` without defining or importing them; nothing imports it),
  IdleModal (no props, only appears after 20 min idle). Removed from `lib-entry.js` and `componentSrcMap`.
- SubTableComp ships as production looks: its `.claims-table` header text is white on a light background
  because `src/styles/Theme.css` (~line 175) forces a light `.ant-table-thead > tr > th` background with
  `!important`, while `App.css` `.claims-table .ant-table-thead>tr>th` sets `color: white !important` but its
  dark background without `!important`. App-side fix (separate PR): add `!important` to that background.
  Same class in CancellationDrawer.jsx and ReminderSubCard.jsx. Grades carry an "owner accepted" note.

## Bundle additions beyond src/component/common

- `extraEntries: ["antd", "@ant-design/icons"]`: the CRM's screens use antd directly, so designs need the same
  themed antd instance; antd icons are the CRM's main icon set. Bundle ~10.5 MB (cap 12 MB): watch this.
  react-icons / lucide-react are NOT exported (several previews substitute antd icons for `BsSliders`,
  `BsThreeDotsVertical`).
- `CRMProvider.jsx` also exports `CRMRoute` (moves the provider's MemoryRouter to a path; route-gated
  components such as SaveViewMenu, Breadcrumb, Toolbar variants need it) and `dayjs` (MyDatePicker1 requires a
  Dayjs value). `cfg.provider` is global and has no per-component props; a nested CRMProvider throws.

## Preview authoring gotchas (from the 2026-11-28 waves)

- Components with no `open` prop (ActionDropdown, CommonPopConfirm, DateRang, Gridmenu, MultiFilterDropdown,
  MyDrowpDown, MyMenu, MyDatePicker1) get "Open" cells that click/hover the real trigger 50 ms after mount;
  those components use `cardMode: single` with `primaryStory: "Open"` (or the open cell) because the popup
  is portalled outside the grid cell.
- MyAlert and MyConfirm are imperative functions, not components (`MyAlert(type, message, description?)`,
  `MyConfirm({title, message, onConfirm})`); previews wrap them in a component that fires on mount. Their
  `.d.ts` bodies are comments saying so.
- `AuthorizedComponents` exports only the file's default (`AuthorizedButton`); the other helpers in that file
  are not in the bundle.
- ApiPagination: pass `apiConfig={{ adapter: async (config) => ({ data: {}, status: 200, statusText: 'OK', headers: {}, config }) }}`
  plus `transformResponse` to drive it without a request (works for any component that forwards an axios config).
- ErrorBoundary's caught state is shown by subclassing it with a preset `hasError` state (a real throw makes
  an uncaught pageerror in React dev mode and fails the render check).
- Unscoped `.ant-menu { background: var(--app-sidebar-gradient) !important; }` in App.css: a standalone antd
  `<Menu>` turns dark blue (menus inside a Dropdown are unaffected).
- Header's `.app-top-nav__inner` grid needs ~780px: Header uses a 1400x300 single card, and its preview cancels the card's 24px padding because
  `.app-top-nav` is `width: 100vw`. HeaderDetails previews sit
  at `<CRMRoute path="/Members">` (at "/" no breadcrumb renders, so both cells were identical).
- ProfileHeader.css stacks the top layout at `max-width: 992px` (light band under white text): ProfileHeader
  needs a viewport wider than 992px.
- MyDrawer's `isDisable` defaults to true from TableColumnsContext (shows "Add" instead of Submit/Update):
  previews pass `isDisable={false}`. Avoid title "Registration Request" (mounts MemberSearch).
- Signed-out facts: Sidebar shows only "Executive Dashboard"; AppLauncher/Header tiles hidden;
  UserProfilePopover shows "User"/"Member" (seeding localStorage `userData` would also sign AuthorizationContext in);
  Notification lists are empty (`useNotifications` not exported).
- The capture clock is frozen (dates read May 2024 unless the preview passes one).

## App defects found while previewing (not fixed: app code)

- CreateBatchPayment edit mode reformats `batchDate`/`paymentDate` to "MM/YYYY"/"DD/MM/YYYY" strings that
  MyDatePicker re-parses with plain `dayjs(value)` -> "Invalid Date" or day/month swap; its Work Location vs
  Bank label checks only `pathname === "/StandingOrders"`. Edit-mode previews omit dates.
- ContactDrawer ignores its `title` prop. CancallationDrawer content is hardcoded ("Batch A", "John Doe"),
  "Batch Name" labelled twice. MyDeatails shows "null Yrs" for an empty DOB and two hardcoded sample uploads.
- `disabled` on MyMenu and MySearchInput has no visual effect.
- CreateBatchPayment's summary shows a bare "€" for Total Current / Batch Total: ExcelContext seeds `current`,
  the component reads `totalCurrent`.
- MyDeatails: fixed 46px `.lbl-inpt` rows (MyDetails.css) make some date-picker rows overlap slightly.
- SubTableComp header contrast (above).

## Known render warns

- `[RENDER_THIN] variants render identically` on SaveViewMenu (Members vs Applications look the same) and
  HeaderDetails: expected.
- `[RENDER_THIN] rendered height is 0px` on drawer/modal components (ContactDrawer, MyDrawer,
  SubscriptionHistoryDetail, UndoCancellationModal): content is portalled; the sheets show them open.
- `[FONT_REMOTE]` for Inter / IBM Plex Mono / source-code-pro / Geneva: fallbacks, as in production.

## Incremental re-sync procedure

Run `/design-sync` in Claude Code from `frontend/ProjectShell-1`, on a branch cut from the commit you want to publish.
What it does, and what to do by hand when components change:

1. **Setup (each machine/clone):** stage `.ds-sync/` (the skill does it), `(cd .ds-sync && npm i esbuild ts-morph @types/react playwright)`,
   `export DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
2. **Build:** `node .design-sync/build-lib.mjs` (cfg.buildCmd), then the driver:
   `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json`
   (the skill's `anchor` step writes remote-sync.json from the artifact's `_ds_sync.json`, so components unchanged since the
   last publish are not re-verified; only `verification.changed`/`added` need capture + grading).
3. **Component added** to `src/component/common/`: add an `export { default as <Name> }` line to `.design-sync/lib-entry.js`,
   a `componentSrcMap` entry, a `dtsPropsFor` body, a `docsMap` stub in `.design-sync/docs/<Name>.md` (category + keywords),
   an entry in the catalogue in `.design-sync/conventions.md`, and author `.design-sync/previews/<Name>.tsx`; then grade it.
4. **Component modified:** the driver lists it under `verification.changed`; recapture, re-read the sheet, regrade; update
   `dtsPropsFor` if its props changed (the converter can't read props from plain JSX).
5. **Component removed/renamed:** delete its line in `lib-entry.js` and its `componentSrcMap`, `dtsPropsFor`, `docsMap`,
   `overrides` entries, its preview and docs stub, and its catalogue line; the publish plan then lists the artifact files to remove.
6. **Before publishing:** re-run the security scan on `ds-bundle/.artifact/project` (no `AIza`, `pk_/sk_` keys, JWTs, DB URIs,
   webhook UUIDs, real-domain emails), check validate warns against "Known render warns", then publish via the skill and
   append a row to `.design-sync/SYNC-LOG.md`.

## Re-sync risks

- `CRMProvider.jsx`'s theme copy drifts if `src/App.js` `BrandedAntTheme` changes. A cleaner fix (needs owner
  approval, app code): export the theme config from its own module and import it here.
- `lib-entry.js` + `componentSrcMap` are hand-maintained: a new file in `src/component/common/` is not
  picked up until added to both.
- Stubs export exactly the names the CRM imports today; a new import from a stubbed package fails the build
  with `No matching export in ".design-sync/stubs/..."` - add a no-op.
- `vendor/bootstrap-5.0.2.min.css` must follow `public/index.html` if the Bootstrap version changes.
- `.design-sync/docs/*.md` (category + keywords, via `docsMap`) and the catalogue in `conventions.md` are hand-kept: a
  component's category or description can go stale.
- Previews that click a trigger after mount depend on the trigger's DOM (class names, aria-labels):
  a markup change in the component silently leaves the Open cell closed. Check those sheets on re-sync.
- `.d.ts` props are hand-written in `cfg.dtsPropsFor` (the converter can't infer props from plain JSX):
  they rot when a component's props change.
