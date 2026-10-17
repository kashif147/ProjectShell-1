import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import TenantAuthenticationTab from "./TenantAuthenticationTab";
import * as api from "../../../services/tenantAuthConnectionsApi";

jest.mock("../../../services/tenantAuthConnectionsApi", () => ({
  fetchTenantForAuthentication: jest.fn(),
  fetchEntraConnectionStatus: jest.fn(),
  startEntraConnect: jest.fn(),
  testEntraConnection: jest.fn(),
  disconnectEntraConnection: jest.fn(),
  updateAuthConnection: jest.fn(),
  addAuthConnection: jest.fn(),
  fetchDefaultRoleOptions: jest.fn(),
}));
jest.mock("../../common/MyAlert", () => jest.fn());
const mockPermissions = new Set();
jest.mock("../../../context/AuthorizationContext", () => ({
  useAuthorization: () => ({ hasPermission: (p) => mockPermissions.has(p) }),
}));

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});

const T = "68cbf7806080b4621d469d34";
const ENTRA_ID = "68cbf7806080b4621d469d35";
const B2C_ID = "68cbf7806080b4621d469d36";
const NON_MEMBER = { _id: "6a0000000000000000000002", name: "Non Member", code: "NON-MEMBER" };
const tenant = () => ({
  _id: T,
  name: "MULTIAUTH",
  authenticationConnections: [
    {
      _id: ENTRA_ID,
      connectionType: "Entra ID (Azure AD)",
      directoryId: "39866a06-30bc-4a89-80c6-9dd9357dd453",
      isActive: true,
      autoProvisionUsers: false,
      issuerUrl: "https://issuer.example/ISSUER-MARKER",
      audience: "AUDIENCE-MARKER",
      connectedBy: "RAWUSERID-MARKER",
    },
    {
      _id: B2C_ID,
      connectionType: "Azure B2C",
      directoryId: "B2CDIRECTORY-MARKER",
      isActive: true,
      autoProvisionUsers: true,
      defaultRoleId: NON_MEMBER._id,
      issuerUrl: "https://b2c.example/B2CISSUER-MARKER",
      audience: "B2CAUDIENCE-MARKER",
      appRef: "APPREF-MARKER",
    },
  ],
});
const connectedStatus = { status: "connected", directoryId: "39866a06-30bc-4a89-80c6-9dd9357dd453", isActive: true, sharedDirectoryException: true, autoProvisionUsers: false, connectedAt: null, connectedBy: null };

beforeEach(() => {
  jest.clearAllMocks();
  mockPermissions.clear();
  api.fetchTenantForAuthentication.mockResolvedValue(tenant());
  api.fetchEntraConnectionStatus.mockResolvedValue(connectedStatus);
  api.fetchDefaultRoleOptions.mockResolvedValue([NON_MEMBER]);
});

const renderTab = async (permissions = ["tenant:read", "tenant:admin"]) => {
  permissions.forEach((p) => mockPermissions.add(p));
  const utils = render(<TenantAuthenticationTab tenantId={T} onTenantChanged={jest.fn()} />);
  await screen.findByTestId("connection-status");
  return utils;
};

test("loads the organisation fresh and shows the three providers in order", async () => {
  await renderTab();
  expect(api.fetchTenantForAuthentication).toHaveBeenCalledWith(T);
  const titles = [...document.querySelectorAll(".ant-card-head-title")].map((n) => n.textContent);
  expect(titles).toEqual(["Microsoft Entra ID", "Microsoft Entra External ID", "Azure AD B2C"]);
  expect(api.fetchEntraConnectionStatus).toHaveBeenCalledWith(T, ENTRA_ID);
});

test("30 External ID: static 'Not configured', no controls", async () => {
  await renderTab();
  const card = screen.getByTestId("external-id-card");
  expect(card).toHaveTextContent("Future member identity provider");
  expect(card).toHaveTextContent("Not configured");
  expect(within(card).queryAllByRole("button")).toHaveLength(0);
});

test("29 B2C: status, provisioning, default role; only provisioning is editable; no add / connect / disconnect / remove / configuration", async () => {
  await renderTab();
  const card = screen.getByTestId("b2c-card");
  expect(card).toHaveTextContent("Legacy member authentication");
  expect(card).toHaveTextContent("Active");
  expect(card).toHaveTextContent("Provisioning: Automatic");
  expect(await within(card).findByText("Default role: Non Member (NON-MEMBER)")).toBeInTheDocument();
  expect(within(card).getAllByRole("button").map((b) => b.textContent)).toEqual(["Edit provisioning"]);
  expect(api.fetchDefaultRoleOptions).toHaveBeenCalledWith(T, "Azure B2C");
});

test("B2C provisioning save sends only provisioning fields for that connection, then re-reads the organisation", async () => {
  await renderTab();
  const card = screen.getByTestId("b2c-card");
  await within(card).findByText("Default role: Non Member (NON-MEMBER)");
  fireEvent.click(within(card).getByRole("button", { name: "Edit provisioning" }));
  fireEvent.click(within(card).getByLabelText(/^Pre-authorised/));
  api.updateAuthConnection.mockResolvedValue({});
  fireEvent.click(within(card).getByRole("button", { name: "Save" }));
  await waitFor(() => expect(api.updateAuthConnection).toHaveBeenCalledWith(T, B2C_ID, { autoProvisionUsers: false }));
  await waitFor(() => expect(api.fetchTenantForAuthentication).toHaveBeenCalledTimes(2));
});

test("B2C not present -> 'Not configured' and nothing to add", async () => {
  api.fetchTenantForAuthentication.mockResolvedValue({ ...tenant(), authenticationConnections: [tenant().authenticationConnections[0]] });
  await renderTab();
  const card = screen.getByTestId("b2c-card");
  expect(card).toHaveTextContent("Not configured");
  expect(within(card).queryAllByRole("button")).toHaveLength(0);
});

test("26/27 tenant:read only -> every card read-only; tenant:admin -> controls", async () => {
  const { unmount } = await renderTab(["tenant:read"]);
  expect(screen.queryAllByRole("button")).toHaveLength(0);
  expect(screen.queryByRole("switch")).toBeNull();
  expect(api.fetchDefaultRoleOptions).not.toHaveBeenCalled();
  unmount();
  await renderTab(["tenant:read", "tenant:admin"]);
  expect(screen.getByRole("button", { name: "Test Connection" })).toBeInTheDocument();
});

test("28 no internal field of any provider reaches the DOM", async () => {
  const { container } = await renderTab();
  await within(screen.getByTestId("b2c-card")).findByText(/Default role:/);
  expect(container.innerHTML).not.toMatch(/ISSUER-MARKER|AUDIENCE-MARKER|APPREF-MARKER|RAWUSERID|B2CDIRECTORY-MARKER/);
  expect(container.innerHTML).not.toContain(B2C_ID);
});

test("organisation load failure: safe message + retry", async () => {
  api.fetchTenantForAuthentication.mockRejectedValueOnce({ network: true });
  mockPermissions.add("tenant:admin");
  render(<TenantAuthenticationTab tenantId={T} />);
  expect(await screen.findByText("We couldn't complete this action. Please try again.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByTestId("connection-status")).toBeInTheDocument();
});
