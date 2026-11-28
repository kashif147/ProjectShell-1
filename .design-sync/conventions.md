# ProjectShell CRM: how to build with it

This is the staff-facing membership CRM (an Irish police-association membership platform: members,
subscriptions, batches, cases, correspondence). Screens are **Ant Design 5** themed by the CRM, plus the
CRM's own components (`My*` form controls, grids, toolbars, drawers). Everything, antd included, comes from
`window.ProjectShellCRM`. Never load a second copy of antd or its icons: it would be unthemed.

## Wrap everything in `CRMProvider`

`CRMProvider` supplies the Redux store, an in-memory router, the CRM's UI contexts, signed-out auth and the
branded antd theme (primary `#215e97`, radius 6, Roboto). Without it most components throw, or render as
unthemed antd. For a component that only appears on one screen (Save View menu, breadcrumbs, grid
toolbars), wrap it in `<CRMRoute path="/Members">`, inside the provider.

```jsx
const { CRMProvider, CRMRoute, Card, Space, Button, MyInput, MySelect, MyTable, PlusOutlined } = window.ProjectShellCRM;

<CRMProvider>
  <div style={{ padding: 'var(--spacing-lg)', background: 'var(--theme-page-bg)' }}>
    <Card title="Member details" style={{ maxWidth: 720 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <MyInput label="Forename" name="forename" value="Siobhán" onChange={() => {}} required />
        <MySelect placeholder="Select membership category" isSimple
          options={[{ value: 'general', label: 'General' }, { value: 'student', label: 'Student' }]} />
        <Button type="primary" icon={<PlusOutlined />}>Add member</Button>
      </Space>
    </Card>
  </div>
</CRMProvider>
```

There is no backend and no signed-in user. Pass data in through props (`dataSource`, `options`, `value`).
Permission-gated actions stay hidden, and components that fetch on mount show their empty state.

## Styling idiom

- **Controls and layout:** antd components and props (`Card`, `Space`, `Row`/`Col`, `Tabs`, `Table`, `Tag`,
  `Button type="primary"`). For CRM forms prefer `MyInput` (types `text`, `email`, `textarea`, `mobile`,
  `iban`, `bic`), `MySelect`/`CustomSelect`, `MyDatePicker`, and for grids `MyTable`.
- **Icons:** `@ant-design/icons` names, from the same global (`UserOutlined`, `PlusOutlined`, `MoreOutlined`).
- **Tokens** for your own glue CSS, as `var(--…)`:
  - brand: `--theme-color-primary`, `--theme-color-secondary`, `--theme-color-accent`, `--theme-color-surface`
  - text and lines: `--theme-text`, `--theme-text-muted`, `--theme-border`, `--theme-border-strong`
  - surfaces: `--theme-page-bg`, `--theme-card-bg`, `--theme-muted-bg`, `--theme-hover-bg`, `--theme-selected-bg`
  - status: `--success-color`/`--success-bg`, `--warning-color`/`--warning-bg`, `--error-color`/`--error-bg`, `--info-color`/`--info-bg`
  - scale: `--spacing-xs` … `--spacing-2xl` (4–48px), `--radius-sm`/`-md`/`-lg`/`-xl`, `--font-size-xs` … `--font-size-4xl`, `--font-family`, `--theme-shadow`, `--shadow-sm`/`-md`
- **Theme classes**, when plain antd isn't enough: `theme-card` (with `theme-card-header`, `theme-card-title`,
  `theme-card-subtitle`, `theme-card-body`), `theme-kpi-card` / `theme-kpi-title` / `theme-kpi-value`,
  `theme-status theme-status-success|warning|error|info`, `theme-btn theme-btn-primary|secondary|success|warning|error`.
  Bootstrap 5 utilities (`d-flex`, `gap-2`, `ms-3`) are also loaded, as in the live CRM.
- `MyAlert(type, message, description?)` and `MyConfirm({ title, message, onConfirm })` are **functions**
  that open antd notifications and confirm dialogs. Don't render them as JSX.

## Component catalogue: reuse these before writing your own

Read this list, then open only the components you need: `components/<Name>/README.md` (props + examples)
and `components/<Name>/preview.html`. All props are in `components/index.d.ts`. Never read `components/bundle.js`.
Names are the CRM's own, misspellings included. Tier: **P** reusable primitive (driven by props, safe on any
screen), **S** CRM shell or grid pattern (reads route, context or Redux; wrap in `CRMRoute` for a screen),
**B** business screen (bound to CRM data; reference only, not a building block).

- **Forms:** `MyInput` P (labelled text, email, textarea, mobile, IBAN or BIC field with error state), `MySelect` P (searchable select), `CustomSelect` P (labelled select with error state), `MyDatePicker` P (labelled date picker; accepts strings), `MyDatePicker1` P (date picker that needs a `dayjs` value), `MySearchInput` P (search box).
- **Data display:** `MyTable` P (antd table with CRM padding, sort defaults, pagination or infinite footer), `SubTableComp` P (nested detail table), `ReportViewer` P (report page frame: title, summary, export/print/refresh; filed under "general").
- **Pagination:** `UnifiedPagination` P ("x–y of N" pager with page-size choice), `ApiPagination` P (pager that fetches its own pages).
- **Filters** (toolbar chips): `TextFilter` P, `NumberFilter` P, `MultiFilterDropdown` P, `DateRang` P (date range or relative date).
- **Menus and actions:** `MyMenu` P (⋯ menu), `MyDrowpDown` P (hover nav dropdown), `ThreeDotsMenu` P (tab-strip overflow), `ActionDropdown` P (row or batch actions), `CommonPopConfirm` P (inline confirm), `AuthorizedComponents` P (permission-gated button), `ExportCSV` P, `ExportPDF` P, `SimpleMenu` S, `JiraLikeMenu` S.
- **Overlays and feedback:** `MyDrawer` P (the CRM's standard side drawer: Submit/Update footer, optional pagination), `MyAlert()` P (notification function), `MyConfirm()` P (confirm-dialog function), `ErrorBoundary` P.
- **App shell:** `Header` S (top bar), `AppLauncher` S (module grid), `Sidebar` S (module navigation), `SideNav` S (icon rail), `UserProfilePopover` S, `NotificationPopover` S, `Breadcrumb` S (trail from the route), `RoutePermissionWrapper` S.
- **Grid page:** `HeaderDetails` S (grid page header: breadcrumb, actions, filter bar, Save View), `Toolbar` S (filter bar), `SaveViewMenu` S (saved grid views), `Gridmenu` S (column chooser), `TableComponent` S (the configurable members/applications grid).
- **Member record:** `ProfileHeader` S (member summary card), `AppTabs` S (member record tabs), `MyDeatails` B (full profile form), `MyTransfer` B (committee transfer list), `SubscriptionHistoryDetail` B (subscription drawer).
- **Business screens:** `CreateBatchPayment` B, `CreateLifecycleBatchForm` B, `ContactDrawer` B, `CancallationDrawer` B (filed under "cancallation"), `UndoCancellationModal` B, `PopOut` B (work-location grid), `ResizableComp` B (events-history side tab).

## Known limitations

- Previews are signed out: data comes from props, grids and lists that fetch their own data are empty, and permission-gated actions are hidden. Hover and active states aren't shown.
- Contrast: `--success-color`, `--warning-color`, `--error-color` and `--info-color` are below 4.5:1 as text on white or on their `*-bg` tints. Use them for icons, tags and borders, and put status text in `--theme-text`. `--theme-border` (1.7:1) is too faint to be the only edge of a control.
- `SubTableComp` headers render white on a light background (a CRM CSS defect). In new tables, use `MyTable`.
- A disabled `type="primary"` button can look enabled. `disabled` changes nothing visible on `MyMenu` or `MySearchInput`. `Breadcrumb` uses emoji icons.
- Inter and IBM Plex Mono are named in some stylesheets but never loaded: text falls back to Roboto and system monospace, as in production.
- Brand colours on the Colors page are the default tenant's. Live tenants re-derive them from `--primary-color`, `--secoundry-color`, `--accent-color` and `--secoundry-bg-color`.
- Excel and PDF export, push notifications, Stripe and Google Maps are inert in this build.

## Where the truth lives

- `components/bundle.css`: every rule (Bootstrap, antd reset, the CRM's Theme.css and component CSS).
  `tokens.css` / `tokens.json` list the tokens.
- `components/<Name>/README.md` (usage with examples) and `components/index.d.ts` (props) for each CRM
  component; the antd API is antd 5's.
- `guidelines/`: the CRM theme guide (theme classes, token usage rules). Its hex values describe the
  default tenant; the live values are tenant-derived `color-mix()` tokens in `components/bundle.css`.
