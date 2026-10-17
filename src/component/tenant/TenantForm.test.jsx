import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TenantForm from "./TenantForm";
import { updateFtn } from "../../utils/Utilities";
import { getAllTenants } from "../../features/TenantSlice";
import { fetchDefaultRoleOptions } from "../../services/tenantAuthConnectionsApi";

// The real form; only the store, HTTP helpers and unrelated child panels are mocked.
const mockDispatch = jest.fn(() => Object.assign(Promise.resolve(), { unwrap: () => Promise.resolve() }));
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  // MyInput reads country data from the store.
  useSelector: (select) => select({ countries: { countriesData: [], loadingC: false } }),
}));
jest.mock("../../features/TenantSlice", () => ({
  getAllTenants: jest.fn(() => ({ type: "tenants/getAll" })),
  updateOrganisationProfile: jest.fn(),
  updateBranding: jest.fn(),
  updateRegionalSettings: jest.fn(),
}));
jest.mock("../../utils/Utilities", () => ({ updateFtn: jest.fn(), insertDataFtn: jest.fn() }));
jest.mock("../../services/tenantAuthConnectionsApi", () => ({ fetchDefaultRoleOptions: jest.fn() }));
jest.mock("../common/MyAlert", () => jest.fn());
jest.mock("./TenantBrandingAssetUpload", () => () => null);
jest.mock("./TenantOfficesPanel", () => () => null);
jest.mock("./TenantDepartmentsPanel", () => () => null);
jest.mock("./TenantPublicHolidaysPanel", () => () => null);
jest.mock("../../context/TenantBrandingContext", () => ({ notifyBrandingRefresh: jest.fn() }));
jest.mock("../../services/tenantBrandingService", () => ({
  clearTenantBrandingCache: jest.fn(),
  resolveTenantId: jest.fn(() => null),
}));

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});

const ENTRA = "Entra ID (Azure AD)";
const REO = { _id: "r-reo", name: "Regional Officer", code: "REO" };
const tenantWith = (connections) => ({
  _id: "t1",
  name: "Original Org",
  code: "ORG",
  description: "Organisation",
  subscription: { plan: "basic" },
  authenticationConnections: connections,
});
const preauthorised = [{ _id: "c1", connectionType: ENTRA, issuerUrl: "https://issuer", directoryId: "d", audience: "a", autoProvisionUsers: false }];

beforeEach(() => {
  jest.clearAllMocks();
  fetchDefaultRoleOptions.mockResolvedValue([REO]);
});

const editName = (value) => fireEvent.change(screen.getByDisplayValue("Original Org"), { target: { value } });
const clickUpdate = () => fireEvent.click(screen.getByRole("button", { name: "Update" }));

test("failed save keeps the drawer open and preserves the user's edits", async () => {
  updateFtn.mockResolvedValue(undefined); // updateFtn already showed the server's 400 message
  const onClose = jest.fn();
  render(<TenantForm tenant={tenantWith(preauthorised)} onClose={onClose} />);
  editName("Edited Org");
  clickUpdate();
  await waitFor(() => expect(updateFtn).toHaveBeenCalledTimes(1));
  await new Promise((r) => setTimeout(r, 0));
  expect(onClose).not.toHaveBeenCalled();
  expect(getAllTenants).not.toHaveBeenCalled(); // no reload
  expect(screen.getByDisplayValue("Edited Org")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
});

test("successful save still closes and reloads", async () => {
  updateFtn.mockResolvedValue({ status: "success", data: {} });
  const onClose = jest.fn();
  render(<TenantForm tenant={tenantWith(preauthorised)} onClose={onClose} />);
  editName("Edited Org");
  clickUpdate();
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(getAllTenants).toHaveBeenCalledTimes(1); // tenants reloaded
  expect(updateFtn.mock.calls[0][1]).toBe("/tenants/t1");
  expect(updateFtn.mock.calls[0][2]).toEqual({ name: "Edited Org" });
});

test("read-only (tenant:read without tenant:write): View Tenant, no Update, fields disabled, nothing can be saved", async () => {
  render(<TenantForm tenant={tenantWith(preauthorised)} onClose={jest.fn()} readOnly />);
  expect(screen.getByText("View Tenant")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Update" })).toBeNull();
  expect(screen.getByText("Close", { selector: "button.butn span, button.butn" })).toBeInTheDocument();
  expect(screen.getByDisplayValue("Original Org")).toBeDisabled();
  expect(updateFtn).not.toHaveBeenCalled();
  // the Authentication tab stays reachable (its controls follow tenant:admin)
  expect(screen.getByRole("tab", { name: "Authentication" })).not.toHaveAttribute("aria-disabled", "true");
});

test("Tenant Details no longer renders the raw connection editor", () => {
  render(<TenantForm tenant={tenantWith(preauthorised)} onClose={jest.fn()} />);
  expect(screen.queryByText("Authentication Connections")).toBeNull();
  expect(screen.queryByText(/Issuer URL/)).toBeNull();
  expect(screen.queryByText(/Audience/)).toBeNull();
  expect(screen.queryByDisplayValue("https://issuer")).toBeNull();
});
