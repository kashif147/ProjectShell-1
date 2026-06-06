# Membership report standard

All membership reports should align to this column, filter, export, and grid UX standard.

## Column groups

| Group | Fields |
|-------|--------|
| Key | Membership No, Name, Membership Category, Grade, Work Location, Region, Branch, Primary Section, Subs Year, isCurrent |
| Dates | Membership Start Date, Expiry Date, Cancelled Date, Resigned Date, Processed At Date, Renewal Date, Last Payment Date |
| Status | Membership Status, Payment Method, Frequency |
| Amounts | Invoice Amount, Arrears Amount, Deferred Amount, Balance |

**Report Run Date** is not a grid column; it is stamped on every export/print as the generation timestamp.

Financial and renewal/payment date columns are included in the grid; values populate when reporting-service ingest exposes them (currently may show empty until warehouse fields are extended).

## Filters

- Categorical filters (category, status, grade, work location, region, branch, section, payment method, frequency) via toolbar chips and Save View templates.
- **Apply vs preview:** changing chips updates the grid on the **already loaded** rows (client-side). Toolbar **Filter** refetches from reporting-service with the current filters; **Reset** clears chips and refetches.
- **Search:** toolbar **Membership No or Name** filters loaded rows immediately (client-side). The same term is sent as `search` on **Filter** for server-side matching.
- Date filters use human labels: **Membership Start Date**, **Expiry Date**, **Cancelled Date**, **Resigned Date**, **Processed At Date** (template keys `*DateRange`). One active range is sent on **Filter**; other date/amount chips filter client-side until the next refetch.
- Numeric amount filters use **NumberFilter** where `filterValueType: "number"` is set on the column.

## Sorting and grouping

- **Sorting:** every visible report column should expose an Ant Design column sorter (Membership Listing Report reference).
- **Grouping:** only when explicitly required for a named report; not enabled by default.

## Export and print

Register the current grid via `reportExportBridge.js`; header **Export** menu (`ReportExportMenu`) calls `reportExportToolkit.js`:

- Export CSV, Export Excel, Export PDF
- Print opens a landscape-friendly HTML layout
- Header block includes report title, **generated date/time**, record count, and **applied filters**

Exports use **visible grid columns** (Save View / column menu), so layout is adjustable per user.

## Grid UX (reports)

On report routes (`membershipReportRoutes.js`):

- No row **Select All** / checkboxes
- No per-row **attachment** icon
- No per-row **⋮** menu

`TableComponent` enforces this for listed paths; Ag Grid reports must not set `rowSelection="multiple"`.

## Reference implementation

- Page: `pages/reports/MembershipListingReport.jsx`
- Columns: `config/grid-column-defaults.json` → `membershiplisting`
- Templates: `templateType` `membershiplisting` on **reporting-service** (`/templates`)
- API: `POST /reports/membership/listing` (reporting-service)

### Seed system default view (required once per environment)

```bash
node scripts/seed-grid-system-defaults.cjs --type=membershiplisting --env=staging --force
```

Or from profile-service npm shortcut (routes to owning service via manifest):

```bash
cd backend/profile-service
npm run seed:grid-system-default -- --type=membershiplisting --env=staging --force
```

Optional tenant scope:

```bash
npm run seed:grid-system-default -- --type=membershiplisting --env=staging --tenant=YOUR_TENANT_ID --force
```
