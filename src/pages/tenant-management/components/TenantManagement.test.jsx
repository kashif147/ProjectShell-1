import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import TenantManagement from "./TenantManagement";

const T = "68cbf7806080b4621d469d34";
const mockTenants = [{ _id: T, name: "MULTIAUTH", code: "MULTIAUTH", domain: "a", contactEmail: "a@x", status: "ACTIVE" }];
jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: (select) => select({ tenants: { tenants: mockTenants, tenantsLoading: false, error: null } }),
}));
jest.mock("../../../features/TenantSlice", () => ({
  getAllTenants: jest.fn(() => ({ type: "x" })),
  deleteTenant: jest.fn(),
  addTenant: jest.fn(),
  updateTenant: jest.fn(),
}));
jest.mock("../../../utils/Utilities", () => ({ insertDataFtn: jest.fn(), deleteFtn: jest.fn(), baseURL: "" }));
const mockPermissions = new Set(["tenant:read", "tenant:write"]);
jest.mock("../../../context/AuthorizationContext", () => ({
  useAuthorization: () => ({ hasPermission: (p) => mockPermissions.has(p) }),
}));
// Renders only each row's Actions cell, so the View / Edit controls can be asserted.
jest.mock("../../../component/common/MyTable", () => ({ columns, dataSource }) => (
  <div>
    {dataSource.map((row) => (
      <div key={row._id} data-testid="actions">{columns.find((c) => c.key === "actions").render(null, row)}</div>
    ))}
  </div>
));
jest.mock("../../../component/tenant/AuthConnectionTags", () => () => null);
jest.mock("../../../component/tenant/TenantForm", () => (props) => (
  <div data-testid="tenant-form">{`${props.tenant?._id}|${props.initialTab}|readOnly=${props.readOnly}`}</div>
));
let mockLocation;
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useLocation: () => mockLocation, useNavigate: () => mockNavigate }));

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});
const setPermissions = (...p) => {
  mockPermissions.clear();
  p.forEach((x) => mockPermissions.add(x));
};
beforeEach(() => {
  jest.clearAllMocks();
  setPermissions("tenant:read", "tenant:write");
});

test("back from Connect: opens that organisation on the Authentication tab and consumes the router state", async () => {
  mockLocation = { pathname: "/TenantManagement", state: { search: "TenantManagement", openTenantAuthentication: T } };
  render(<TenantManagement />);
  expect(await screen.findByTestId("tenant-form")).toHaveTextContent(`${T}|authentication|readOnly=false`);
  expect(mockNavigate).toHaveBeenCalledWith("/TenantManagement", { replace: true, state: { search: "TenantManagement" } });
});

test("no return state: nothing opens", async () => {
  mockLocation = { pathname: "/TenantManagement", state: { search: "TenantManagement" } };
  render(<TenantManagement />);
  await new Promise((r) => setTimeout(r, 10));
  expect(screen.queryByTestId("tenant-form")).toBeNull();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test("an organisation not in the list (or no edit permission) is not opened", async () => {
  mockLocation = { pathname: "/TenantManagement", state: { openTenantAuthentication: "6acd6119b28a863c61361ae0" } };
  render(<TenantManagement />);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  expect(screen.queryByTestId("tenant-form")).toBeNull();
});

test("tenant:read + tenant:admin without tenant:write: back from Connect opens the drawer VIEW-ONLY on Authentication", async () => {
  setPermissions("tenant:read", "tenant:admin");
  mockLocation = { pathname: "/TenantManagement", state: { openTenantAuthentication: T } };
  render(<TenantManagement />);
  expect(await screen.findByTestId("tenant-form")).toHaveTextContent(`${T}|authentication|readOnly=true`);
});

test("row action: Edit with tenant:write; View (read-only drawer) with only tenant:read; nothing without tenant:read", async () => {
  const { fireEvent } = require("@testing-library/react");
  mockLocation = { pathname: "/TenantManagement", state: null };
  const { unmount } = render(<TenantManagement />);
  expect(screen.queryByLabelText("View Tenant")).toBeNull(); // writers get Edit
  unmount();
  setPermissions("tenant:read", "tenant:admin");
  const second = render(<TenantManagement />);
  expect(screen.queryByRole("button", { name: /Add Tenant/ })).toBeNull(); // no create without tenant:write
  fireEvent.click(screen.getByLabelText("View Tenant"));
  expect(await screen.findByTestId("tenant-form")).toHaveTextContent(`${T}|details|readOnly=true`);
  second.unmount();
  setPermissions("tenant:admin");
  render(<TenantManagement />);
  expect(screen.queryByTestId("actions")).toBeNull(); // the page itself needs tenant:read
});
