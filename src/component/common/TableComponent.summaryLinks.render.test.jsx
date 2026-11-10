/**
 * P8: render test for the two Summary-grid links that open the member Details page.
 * Renders the REAL TableComponent on /Summary with test claims (no live roles, no network):
 *  - profile:read alone      -> both the member-name link and the membership-category link render;
 *  - legacy codes only        -> neither link renders (plain text), crm:member_read / crm:access
 *                                no longer gate them;
 *  - no permission            -> neither link renders.
 * Heavy children (drawers, menus) are stubbed; the columns context supplies the two columns.
 */
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ExcelContext } from "../../context/ExcelContext";

let mockPerms = [];
jest.mock("../../context/AuthorizationContext", () => {
  const value = { hasPermission: (p) => mockPerms.includes("*") || mockPerms.includes(p) };
  return { useAuthorization: () => value };
});
jest.mock("../../context/TableColumnsContext ", () => {
  // One stable context value (a new object per render would re-run the component's effects).
  const value = {
    columns: {
      Profile: [
        { title: "Full Name", dataIndex: "fullName", isGride: true },
        { title: "Membership Category", dataIndex: "membershipCategory", isGride: true },
      ],
    },
    gridData: [],
    setGridData: () => {},
    getProfile: () => {},
    profilNextBtnFtn: () => {},
    ColumnProp: () => {},
    disableFtn: () => {},
    reorderGridColumns: () => {},
  };
  return { useTableColumns: () => value };
});
jest.mock("react-redux", () => {
  // Stable references: selectors must return the same objects on every render.
  const NONE = Object.freeze([]);
  const slice = Object.freeze({ data: NONE, applications: NONE, applicationsLoading: false, permissions: NONE });
  const state = new Proxy({}, { get: () => slice });
  return {
    useSelector: (fn) => {
      try {
        return fn(state);
      } catch {
        return undefined;
      }
    },
    useDispatch: () => () => {},
  };
});
for (const m of [
  "../TransferRequests",
  "../cornmarket/CornMarketDrawer",
  "./Gridmenu",
  "../reminders/TrigerReminderDrawer",
  "./cancallation/CancallationDrawer",
  "../finanace/TrigerBatchMemberDrawer",
  "./MyDrawer",
  "./SimpleMenu",
]) {
  jest.mock(m, () => () => null);
}

const TableComponent = require("./TableComponent").default;

const ROW = Object.freeze({ key: "r1", _id: "p-test-1", profileId: "p-test-1", fullName: "Test Member", membershipCategory: "General" });
const DATA = Object.freeze([ROW]);

const EXCEL = Object.freeze({ selectedRowIndex: null, setSelectedRowIndex: () => {}, selectedRowData: null, setSelectedRowData: () => {}, setExcelData: () => {} });
function renderSummary(perms) {
  mockPerms = perms;
  const excel = EXCEL; // stable
  return render(
    <ExcelContext.Provider value={excel}>
      <MemoryRouter initialEntries={["/Summary"]}>
        <TableComponent data={DATA} screenName="Profile" />
      </MemoryRouter>
    </ExcelContext.Provider>,
  );
}

// Plain DOM lookups (getByRole's accessible-name pass trips jsdom's selector engine on antd CSS).
const linkWithText = (text) => Array.from(document.querySelectorAll("a")).find((a) => a.textContent.trim() === text) || null;
const nameLink = () => linkWithText("Test Member");
const categoryLink = () => linkWithText("General");

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({ matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} }));
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(cleanup);

test("profile:read alone: both Summary links render and open /Details", () => {
  renderSummary(["profile:read"]);
  expect(nameLink()).not.toBeNull();
  expect(categoryLink()).not.toBeNull();
  for (const a of [nameLink(), categoryLink()]) expect(a.getAttribute("href")).toMatch(/^\/Details/);
});

test("legacy crm:member_read + crm:access without profile:read: no Summary links (plain text)", () => {
  renderSummary(["crm:member_read", "crm:access"]);
  expect(nameLink()).toBeNull();
  expect(categoryLink()).toBeNull();
  expect(screen.getByText("Test Member")).toBeTruthy();
  expect(screen.getByText("General")).toBeTruthy();
});

test("no permission: no Summary links", () => {
  renderSummary([]);
  expect(nameLink()).toBeNull();
  expect(categoryLink()).toBeNull();
});
