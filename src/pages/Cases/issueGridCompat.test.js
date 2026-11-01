/**
 * Issue grids vs the stored Save View templates on DEV (Issue Display Names compatibility).
 *
 * Renders the REAL TableColumnsProvider and calls its REAL applyTemplate with fixtures shaped exactly
 * like the DEV templates (issue-service `templates` collection, 2026-11-01), then runs the REAL
 * applyClientSideRowFilters on DEV-like issue rows. No DB access; fixtures are copied by value.
 *
 * Root cause reproduced (F): every issue route renders the shared "Issues" columns, and the Open
 * Issues page applies the user's default summary view. Two DEV summary views (blank name, created
 * 2026-10-18) have columns: [] - applyTemplate shows a column only if the view lists it, so every
 * column becomes hidden: the rows are loaded ("1-22 of 22") but the table renders no cells, and the
 * other issue pages then show the same empty grid.
 */
import React from "react";
import { render, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { TableColumnsProvider, useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters, getLabelToKeyMap } from "../../utils/filterUtils";

// ---- DEV-shaped fixtures (enum/code-backed; no PII) -------------------------------------------
const OLD_ISSUE_COLUMNS = [
  "caseTitle", "memberIds", "membershipNo", "caseFileNumber", "nmbiReference", "location",
  "dateReceived", "criteriaLetterStatus", "legislation", "issueStatus", "priority", "ownerTeam",
];
const OLD_LABELS = {
  caseTitle: "Issue", memberIds: "Member Name", membershipNo: "Membership No", caseFileNumber: "Case File Number",
  nmbiReference: "NMBI Reference No", location: "Location", dateReceived: "Date Received",
  criteriaLetterStatus: "Criteria Letter", legislation: "Legislation", issueStatus: "Case Status",
  priority: "Priority", ownerTeam: "Owner",
};
const deepFreeze = (o) => { Object.values(o).forEach((v) => v && typeof v === "object" && deepFreeze(v)); return Object.freeze(o); };
const fixtures = () => deepFreeze({
  // blank-named user summary view, no filters, NO columns (the two DEV views from 2026-10-18)
  blankSummaryView: { name: "", templateType: "issuessummary", columns: [], columnLabels: {}, visibleFilters: [], filters: {} },
  // the user's older named summary view: old columns, legacy ownerTeam label "Owner"
  oldSummaryView: { name: "Issues View", templateType: "issuessummary", columns: [...OLD_ISSUE_COLUMNS], columnLabels: { ...OLD_LABELS }, visibleFilters: ["Priority", "Case Status"], filters: {} },
  // system default for Complaints (tenantless)
  complaintsSystemDefault: {
    name: "System default", templateType: "issuescomplaints", columns: [...OLD_ISSUE_COLUMNS], columnLabels: { ...OLD_LABELS },
    filters: { priority: { operator: "equal_to", values: [] }, issueStatus: { operator: "not_equal_to", values: ["CLOSED"] }, ownerTeam: { operator: "equal_to", values: [] } },
  },
});

const rows = [
  { key: "1", caseTitle: "35-25", issueType: "COMPLAINT", issueStatus: "OPEN", priority: "HIGH", ownerTeam: "COMPLAINTS", ownerName: "Olly Owner", createdBy: "Kate Creator", memberIds: ["p1"], memberNames: ["Mary Smith"] },
  { key: "2", caseTitle: "36-25", issueType: "IR", issueStatus: "OPEN", priority: "LOW", ownerTeam: "IR", ownerName: "Ira Owner", createdBy: "Kate Creator", memberIds: ["p2"], memberNames: ["Tom Jones"] },
  { key: "3", caseTitle: "37-25", issueType: "FTP", issueStatus: "OPEN", priority: "LOW", ownerTeam: "FTP", ownerName: "Olly Owner", createdBy: "Sam Staff", memberIds: [], memberNames: [] },
];

// ---- harness: the real provider with a minimal store / router ---------------------------------
// One stable state object: selectors must see the same references on every render.
const STATE = Object.freeze({
  regions: { regions: [], loading: false },
  lookups: { lookups: [], lookupsloading: false },
  contactType: { contactTypes: [], contactTypesloading: false, error: null },
});
const store = {
  getState: () => STATE,
  subscribe: () => () => {},
  dispatch: () => {},
};
let ctx;
function Grab() {
  ctx = useTableColumns();
  return null;
}
function mount() {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <TableColumnsProvider>
          <Grab />
        </TableColumnsProvider>
      </MemoryRouter>
    </Provider>,
  );
}
const apply = (view, master = { columns: [], columnLabels: {} }) =>
  act(() => {
    ctx.applyTemplate("Issues", view.columns, master.columns, view.columnLabels, master.columnLabels);
  });
const shown = () => ctx.columns.Issues.filter((c) => c.isGride);
const key = (c) => (Array.isArray(c.dataIndex) ? c.dataIndex.join(".") : String(c.dataIndex));
const col = (k) => ctx.columns.Issues.find((c) => key(c) === k);

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});
beforeEach(() => mount());

test("F (root cause): a stored summary view with no columns and no filters keeps valid issue rows visible", () => {
  const f = fixtures();
  apply(f.blankSummaryView);
  expect(shown().length).toBeGreaterThan(0); // before the fix: 0 - every column hidden, rows render no cells
  expect(shown().map(key)).toEqual(expect.arrayContaining(["caseTitle", "memberIds", "issueStatus", "ownerName", "ownerTeam", "createdBy"]));
  const visibleRows = applyClientSideRowFilters(rows, {}, ctx.columns.Issues);
  expect(visibleRows).toHaveLength(3);
});

test("A/B: legacy ownerTeam labelled 'Owner' renders as Team; ownerName renders as Owner", () => {
  apply(fixtures().oldSummaryView);
  expect(col("ownerTeam").title).toBe("Team");
  expect(col("ownerName").title).toBe("Owner");
  expect(col("createdBy").title).toBe("Created By");
});

test("C/D/E: older view without ownerName / createdBy still shows them, deterministic placement, no duplicate or scrambled Owner header", () => {
  apply(fixtures().oldSummaryView);
  const keys = shown().map(key);
  expect(keys.slice(-3)).toEqual(["ownerName", "ownerTeam", "createdBy"]); // Owner next to Team, Created By after
  expect(keys.slice(0, 11)).toEqual(OLD_ISSUE_COLUMNS.slice(0, 11)); // stored order preserved
  const titles = shown().map((c) => c.title);
  expect(titles.filter((t) => t === "Owner")).toHaveLength(1);
  expect(new Set(titles).size).toBe(titles.length);
  expect(shown().every((c) => !c.contextLabel)).toBe(true); // no de-duplication suffixes
});

test("no duplicates when a stored view already lists the new columns", () => {
  apply({ columns: [...OLD_ISSUE_COLUMNS.slice(0, 11), "createdBy", "ownerName", "ownerTeam"], columnLabels: { ...OLD_LABELS } });
  const keys = shown().map(key);
  expect(keys.filter((k) => k === "ownerName")).toHaveLength(1);
  expect(keys.filter((k) => k === "createdBy")).toHaveLength(1);
});

test("system-default fallback: an empty user view falls back to the system default's columns", () => {
  const f = fixtures();
  apply(f.blankSummaryView, f.complaintsSystemDefault);
  expect(shown().map(key)).toEqual(expect.arrayContaining([...OLD_ISSUE_COLUMNS, "ownerName", "createdBy"]));
});

test("G: a legacy ownerTeam filter (stored as 'Team', or the old 'Owner' chip) still filters the TEAM, never the assigned person", () => {
  apply(fixtures().oldSummaryView);
  const cols = ctx.columns.Issues;
  expect(getLabelToKeyMap(cols).Team).toBe("ownerTeam");
  expect(getLabelToKeyMap(cols).Owner).toBe("ownerTeam");
  const byTeam = applyClientSideRowFilters(rows, { Team: { operator: "==", selectedValues: ["COMPLAINTS"] } }, cols);
  expect(byTeam.map((r) => r.key)).toEqual(["1"]);
  const legacyChip = applyClientSideRowFilters(rows, { Owner: { operator: "==", selectedValues: ["COMPLAINTS"] } }, cols);
  expect(legacyChip.map((r) => r.key)).toEqual(["1"]);
});

test("H: Assigned To filters ownerName; Created By filters createdBy", () => {
  apply(fixtures().oldSummaryView);
  const cols = ctx.columns.Issues;
  expect(applyClientSideRowFilters(rows, { "Assigned To": { operator: "==", selectedValues: ["Olly Owner"] } }, cols).map((r) => r.key)).toEqual(["1", "3"]);
  expect(applyClientSideRowFilters(rows, { "Created By": { operator: "==", selectedValues: ["Sam Staff"] } }, cols).map((r) => r.key)).toEqual(["3"]);
});

test("I: stored view objects (user-saved and system default) are never mutated", () => {
  const f = fixtures(); // deep-frozen: any write would throw in strict mode
  const snapshot = JSON.stringify(f);
  apply(f.oldSummaryView, f.complaintsSystemDefault);
  apply(f.blankSummaryView, f.complaintsSystemDefault);
  expect(JSON.stringify(f)).toBe(snapshot);
});
