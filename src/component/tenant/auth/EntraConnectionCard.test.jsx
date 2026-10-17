import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import EntraConnectionCard from "./EntraConnectionCard";
import * as api from "../../../services/tenantAuthConnectionsApi";
import MyAlert from "../../common/MyAlert";
import { CONNECT_RETURN_KEY } from "../../../utils/entraConnectReturn";

jest.mock("../../../services/tenantAuthConnectionsApi", () => ({
  fetchEntraConnectionStatus: jest.fn(),
  startEntraConnect: jest.fn(),
  testEntraConnection: jest.fn(),
  disconnectEntraConnection: jest.fn(),
  updateAuthConnection: jest.fn(),
  addAuthConnection: jest.fn(),
  fetchDefaultRoleOptions: jest.fn(),
}));
jest.mock("../../common/MyAlert", () => jest.fn());

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
});

const T = "68cbf7806080b4621d469d34";
const C = "68cbf7806080b4621d469d35";
const DIR = "39866a06-30bc-4a89-80c6-9dd9357dd453";
const ENTRA = "Entra ID (Azure AD)";
const ROLE = { _id: "6a0000000000000000000001", name: "Regional Officer", code: "REO" };
// Values that must never reach the DOM.
const SECRET_FIELDS = {
  issuerUrl: "https://issuer.example/ISSUER-MARKER",
  audience: "AUDIENCE-MARKER",
  appRef: "APPREF-MARKER",
  clientId: "CLIENTID-MARKER",
  directoryOwnership: { verifiedBy: "OWNERSHIP-MARKER" },
  verificationEvidence: { directoryUserId: "EVIDENCE-MARKER", roleTemplateId: "WIDS-MARKER" },
  claimId: "CLAIMID-MARKER",
  connectedBy: "RAWUSERID-CONNECTED",
  disconnectedBy: "RAWUSERID-DISCONNECTED",
};
const MARKERS = /ISSUER-MARKER|AUDIENCE-MARKER|APPREF-MARKER|CLIENTID-MARKER|OWNERSHIP-MARKER|EVIDENCE-MARKER|WIDS-MARKER|CLAIMID-MARKER|RAWUSERID/;

const connectionOf = (extra = {}) => ({ _id: C, connectionType: ENTRA, directoryId: DIR, isActive: false, autoProvisionUsers: false, ...SECRET_FIELDS, ...extra });
const statusOf = (status, extra = {}) => ({
  status,
  directoryId: DIR,
  isActive: false,
  sharedDirectoryException: false,
  autoProvisionUsers: false,
  connectedAt: null,
  connectedBy: null,
  ...extra,
});

let onChanged;
async function renderCard({ status, connection = connectionOf(), canAdmin = true } = {}) {
  if (status) api.fetchEntraConnectionStatus.mockResolvedValue(status);
  const utils = render(<EntraConnectionCard tenantId={T} connection={connection} canAdmin={canAdmin} onChanged={onChanged} />);
  if (status) await screen.findByTestId("connection-status");
  return utils;
}
const button = (name) => screen.queryByRole("button", { name });
const card = () => screen.getByTestId("entra-card");

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  onChanged = jest.fn().mockResolvedValue(undefined);
  api.fetchDefaultRoleOptions.mockResolvedValue([ROLE]);
  delete window.location;
  window.location = { assign: jest.fn(), href: "", search: "", pathname: "/TenantManagement" };
});

describe("states", () => {
  test("1 not_connected: Connect + Edit Tenant ID + provisioning; no Test / Disconnect / Active switch", async () => {
    await renderCard({ status: statusOf("not_connected") });
    expect(screen.getByTestId("connection-status")).toHaveTextContent("Not connected");
    expect(button("Connect Microsoft Entra")).toBeInTheDocument();
    expect(button("Edit Tenant ID")).toBeInTheDocument();
    expect(button("Edit provisioning")).toBeInTheDocument();
    expect(button("Test Connection")).toBeNull();
    expect(button("Disconnect")).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.getByText("Connect Microsoft Entra before activating this connection.")).toBeInTheDocument();
  });

  test("2 connected: Test + Disconnect + Active switch; Tenant ID read-only", async () => {
    await renderCard({ status: statusOf("connected", { isActive: true, connectedAt: "2026-10-17T07:06:00Z", connectedBy: "RAWUSERID-CONNECTED" }) });
    expect(screen.getByTestId("connection-status")).toHaveTextContent("Connected");
    expect(button("Test Connection")).toBeInTheDocument();
    expect(button("Disconnect")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Active for sign-in" })).toBeChecked();
    expect(button("Edit Tenant ID")).toBeNull();
    expect(button("Connect Microsoft Entra")).toBeNull();
    expect(button("Reconnect Microsoft Entra")).toBeNull();
    expect(card()).toHaveTextContent(/Connected on:.*by an administrator/);
  });

  test("3 test_failed: Test Again + Reconnect + Disconnect + Active switch", async () => {
    await renderCard({ status: statusOf("test_failed", { lastTestedAt: "2026-10-17T07:06:00Z", lastTestResult: { ok: false, code: "APP_NOT_CONSENTED" } }) });
    expect(screen.getByTestId("connection-status")).toHaveTextContent("Connection test failed");
    expect(button("Test Again")).toBeInTheDocument();
    expect(button("Reconnect Microsoft Entra")).toBeInTheDocument();
    expect(button("Disconnect")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(button("Edit Tenant ID")).toBeNull();
    expect(card()).toHaveTextContent("An administrator of this directory has not approved ProjectShell yet.");
  });

  test("4 disconnected: Reconnect + Edit Tenant ID; no Test / Disconnect / Active switch; audit shown safely", async () => {
    await renderCard({
      status: statusOf("disconnected", { disconnectedAt: "2026-10-17T08:00:00Z", disconnectedBy: "RAWUSERID-DISCONNECTED", connectedAt: "2026-10-16T08:00:00Z", connectedBy: "RAWUSERID-CONNECTED" }),
    });
    expect(screen.getByTestId("connection-status")).toHaveTextContent("Disconnected");
    expect(button("Reconnect Microsoft Entra")).toBeInTheDocument();
    expect(button("Edit Tenant ID")).toBeInTheDocument();
    expect(button("Test Connection")).toBeNull();
    expect(button("Disconnect")).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
    expect(card()).toHaveTextContent(/Disconnected on:.*by an administrator/);
    expect(screen.getByText("Reconnect Microsoft Entra before activating this connection.")).toBeInTheDocument();
  });

  test("5 reconnect_required: Reconnect only; Tenant ID editable only while inactive; active -> Deactivate only", async () => {
    const { unmount } = await renderCard({ status: statusOf("reconnect_required") });
    expect(button("Reconnect Microsoft Entra")).toBeInTheDocument();
    expect(button("Edit Tenant ID")).toBeInTheDocument();
    expect(button("Test Connection")).toBeNull();
    expect(button("Disconnect")).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
    unmount();
    await renderCard({ status: statusOf("reconnect_required", { isActive: true }) });
    expect(button("Edit Tenant ID")).toBeNull();
    expect(button("Deactivate")).toBeInTheDocument();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  test("6 platform-managed: 'Managed by the platform'; Test + provisioning only", async () => {
    await renderCard({ status: statusOf("connected", { isActive: true, sharedDirectoryException: true }) });
    expect(screen.getByText("Managed by the platform")).toBeInTheDocument();
    expect(button("Test Connection")).toBeInTheDocument();
    expect(button("Edit provisioning")).toBeInTheDocument();
    for (const name of ["Connect Microsoft Entra", "Reconnect Microsoft Entra", "Disconnect", "Edit Tenant ID"]) expect(button(name)).toBeNull();
  });

  test("status load failure: safe message + retry, no actions", async () => {
    api.fetchEntraConnectionStatus.mockRejectedValueOnce({ status: 403, code: "FORBIDDEN" });
    render(<EntraConnectionCard tenantId={T} connection={connectionOf()} canAdmin onChanged={onChanged} />);
    expect(await screen.findByText("You do not have permission to manage authentication for this organisation.")).toBeInTheDocument();
    expect(button("Connect Microsoft Entra")).toBeNull();
    api.fetchEntraConnectionStatus.mockResolvedValueOnce(statusOf("connected"));
    fireEvent.click(button("Retry"));
    expect(await screen.findByTestId("connection-status")).toHaveTextContent("Connected");
  });
});

describe("Connect / Reconnect", () => {
  test("7 Connect start: redirects to the returned URL and keeps only the approved return note", async () => {
    await renderCard({ status: statusOf("not_connected") });
    const url = "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?state=STATE-VALUE&nonce=NONCE-VALUE&code_challenge=CHALLENGE";
    api.startEntraConnect.mockResolvedValue({ authorizationUrl: url });
    jest.spyOn(Date, "now").mockReturnValue(1_800_000_000_000);
    fireEvent.click(button("Connect Microsoft Entra"));
    await waitFor(() => expect(window.location.assign).toHaveBeenCalledWith(url));
    expect(api.startEntraConnect).toHaveBeenCalledWith(T, C);
    expect(JSON.parse(sessionStorage.getItem(CONNECT_RETURN_KEY))).toEqual({ tenantId: T, connectionId: C, startedAt: 1_800_000_000_000 });
    const stored = [...Object.values(sessionStorage), ...Object.values(localStorage)].join(" ");
    expect(stored).not.toMatch(/STATE-VALUE|NONCE-VALUE|CHALLENGE/);
    expect(api.updateAuthConnection).not.toHaveBeenCalled();
    Date.now.mockRestore();
  });

  test("Connect start refused (DIRECTORY_ALREADY_CLAIMED): mapped message, no redirect, no note", async () => {
    await renderCard({ status: statusOf("not_connected") });
    api.startEntraConnect.mockRejectedValue({ status: 409, code: "DIRECTORY_ALREADY_CLAIMED" });
    fireEvent.click(button("Connect Microsoft Entra"));
    expect(await screen.findByText("This Microsoft directory is already connected to another organisation.")).toBeInTheDocument();
    expect(window.location.assign).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(CONNECT_RETURN_KEY)).toBeNull();
  });

  test("a non-https authorize URL is never followed", async () => {
    await renderCard({ status: statusOf("not_connected") });
    api.startEntraConnect.mockResolvedValue({ authorizationUrl: "javascript:alert(1)" });
    fireEvent.click(button("Connect Microsoft Entra"));
    expect(await screen.findByText("We could not complete the Microsoft connection. Please try again.")).toBeInTheDocument();
    expect(window.location.assign).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(CONNECT_RETURN_KEY)).toBeNull();
  });

  test("19 Reconnect starts the Connect flow and never sets isActive", async () => {
    await renderCard({ status: statusOf("disconnected") });
    api.startEntraConnect.mockResolvedValue({ authorizationUrl: "https://login.microsoftonline.com/x" });
    fireEvent.click(button("Reconnect Microsoft Entra"));
    await waitFor(() => expect(window.location.assign).toHaveBeenCalled());
    expect(api.startEntraConnect).toHaveBeenCalledWith(T, C);
    expect(api.updateAuthConnection).not.toHaveBeenCalled();
  });
});

describe("Test Connection", () => {
  test("14 success: toast, then organisation + status re-read", async () => {
    await renderCard({ status: statusOf("connected") });
    api.testEntraConnection.mockResolvedValue({ ok: true, code: "CONNECTED" });
    fireEvent.click(button("Test Connection"));
    await waitFor(() => expect(MyAlert).toHaveBeenCalledWith("success", "Connection test successful"));
    await waitFor(() => expect(api.fetchEntraConnectionStatus).toHaveBeenCalledTimes(2));
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["DIRECTORY_NOT_CLAIMED", "This connection has not been verified. Connect Microsoft Entra first."],
    ["DIRECTORY_NOT_FOUND", "Microsoft could not find this directory. Check the Tenant ID."],
    ["APP_NOT_CONSENTED", "An administrator of this directory has not approved ProjectShell yet."],
    ["CONFIGURATION_INVALID", "ProjectShell's Microsoft configuration needs attention. Contact ProjectShell support."],
    ["CREDENTIAL_INVALID", "ProjectShell's Microsoft configuration needs attention. Contact ProjectShell support."],
    ["MICROSOFT_UNAVAILABLE", "Microsoft could not be reached. Try again shortly."],
  ])("15 failed test %s -> fixed message; status re-read", async (code, message) => {
    await renderCard({ status: statusOf("connected") });
    api.testEntraConnection.mockResolvedValue({ ok: false, code });
    fireEvent.click(button("Test Connection"));
    expect(await within(card()).findByText(message)).toBeInTheDocument();
    await waitFor(() => expect(api.fetchEntraConnectionStatus).toHaveBeenCalledTimes(2));
    expect(MyAlert).not.toHaveBeenCalledWith("success", expect.anything());
  });

  test.each([
    [{ status: 409, code: "CONNECTION_DISCONNECTED" }, "This connection is disconnected. Reconnect Microsoft Entra to test it."],
    [{ status: 400, code: "CONNECTION_CHANGED" }, "This connection was changed while you were working. Refresh and try again."],
    [{ network: true }, "We couldn't complete this action. Please try again."],
  ])("Test request error %o -> fixed message", async (error, message) => {
    await renderCard({ status: statusOf("connected") });
    api.testEntraConnection.mockRejectedValue(error);
    fireEvent.click(button("Test Connection"));
    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  test("31 double click sends one request; buttons disabled while running", async () => {
    await renderCard({ status: statusOf("connected", { isActive: true }) });
    let resolve;
    api.testEntraConnection.mockReturnValue(new Promise((r) => (resolve = r)));
    const testButton = button("Test Connection");
    fireEvent.click(testButton);
    fireEvent.click(testButton);
    expect(api.testEntraConnection).toHaveBeenCalledTimes(1);
    expect(button("Disconnect")).toBeDisabled();
    await act(async () => resolve({ ok: true, code: "CONNECTED" }));
  });
});

describe("Disconnect", () => {
  test("16 Cancel sends nothing", async () => {
    await renderCard({ status: statusOf("connected") });
    fireEvent.click(button("Disconnect"));
    expect(await screen.findByText("Disconnect Microsoft Entra?")).toBeInTheDocument();
    expect(screen.getByText(/Existing ProjectShell users, roles and permissions will not be deleted/)).toBeInTheDocument();
    fireEvent.click(button("Cancel"));
    expect(api.disconnectEntraConnection).not.toHaveBeenCalled();
  });

  test("17 confirm: one request, no optimistic change, then re-read -> Disconnected", async () => {
    await renderCard({ status: statusOf("connected", { isActive: true }) });
    fireEvent.click(button("Disconnect"));
    let resolve;
    api.disconnectEntraConnection.mockReturnValue(new Promise((r) => (resolve = r)));
    fireEvent.click(await screen.findByRole("button", { name: "Disconnect Microsoft Entra" }));
    expect(screen.getByTestId("connection-status")).toHaveTextContent("Connected"); // nothing optimistic
    api.fetchEntraConnectionStatus.mockResolvedValue(statusOf("disconnected", { disconnectedAt: "2026-10-17T08:00:00Z", disconnectedBy: "RAWUSERID-DISCONNECTED" }));
    await act(async () => resolve({ status: "disconnected" }));
    await waitFor(() => expect(screen.getByTestId("connection-status")).toHaveTextContent("Disconnected"));
    expect(api.disconnectEntraConnection).toHaveBeenCalledWith(T, C);
    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(MyAlert).toHaveBeenCalledWith("success", "Microsoft Entra has been disconnected.");
  });

  test.each([
    ["DIRECTORY_SHARED_EXCEPTION", "This connection is managed by the platform and cannot be changed here."],
    ["CLAIM_METHOD_CONFLICT", "This connection is managed by the platform and cannot be changed here."],
    ["NOT_CONNECTED", "This connection is not connected, so there is nothing to disconnect."],
    ["CONNECTION_CHANGED", "This connection was changed while you were working. Refresh and try again."],
    ["CONNECTION_NOT_FOUND", "This authentication connection no longer exists."],
    ["NOT_ENTRA_CONNECTION", "This action is only available for Microsoft Entra connections."],
    ["ACTOR_REQUIRED", "Your session has expired. Please sign in again."],
  ])("18 refused (%s) -> fixed message, status re-read", async (code, message) => {
    await renderCard({ status: statusOf("connected") });
    api.disconnectEntraConnection.mockRejectedValue({ status: 409, code });
    fireEvent.click(button("Disconnect"));
    fireEvent.click(await screen.findByRole("button", { name: "Disconnect Microsoft Entra" }));
    expect(await within(card()).findByText(message)).toBeInTheDocument();
    await waitFor(() => expect(api.fetchEntraConnectionStatus).toHaveBeenCalledTimes(2));
  });
});

describe("activation", () => {
  test("20 the Active switch saves only isActive and re-reads", async () => {
    await renderCard({ status: statusOf("connected", { isActive: false }) });
    api.updateAuthConnection.mockResolvedValue({});
    fireEvent.click(screen.getByRole("switch", { name: "Active for sign-in" }));
    await waitFor(() => expect(api.updateAuthConnection).toHaveBeenCalledWith(T, C, { isActive: true }));
    await waitFor(() => expect(api.fetchEntraConnectionStatus).toHaveBeenCalledTimes(2));
  });

  test("21 409 CONNECTION_DISCONNECTED on save -> 'Reconnect Microsoft Entra before activating this connection.'", async () => {
    await renderCard({ status: statusOf("test_failed", { isActive: false }) });
    api.updateAuthConnection.mockRejectedValue({ status: 409, code: "CONNECTION_DISCONNECTED" });
    fireEvent.click(screen.getByRole("switch"));
    expect(await within(card()).findByText("Reconnect Microsoft Entra before activating this connection.", { selector: ".ant-alert-message" })).toBeInTheDocument();
  });

  test("an active, unverified (older) connection may only be deactivated", async () => {
    await renderCard({ status: statusOf("not_connected", { isActive: true }) });
    expect(screen.queryByRole("switch")).toBeNull();
    api.updateAuthConnection.mockResolvedValue({});
    fireEvent.click(button("Deactivate"));
    await waitFor(() => expect(api.updateAuthConnection).toHaveBeenCalledWith(T, C, { isActive: false }));
  });
});

describe("Tenant ID editing", () => {
  test("22 invalid Tenant ID is refused client-side; a valid one saves only directoryId", async () => {
    await renderCard({ status: statusOf("disconnected") });
    fireEvent.click(button("Edit Tenant ID"));
    const input = screen.getByRole("textbox", { name: "Microsoft Tenant ID" });
    fireEvent.change(input, { target: { value: "common" } });
    fireEvent.click(within(card()).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("The configured Microsoft Tenant ID is invalid.")).toBeInTheDocument();
    expect(api.updateAuthConnection).not.toHaveBeenCalled();
    const NEW_DIR = "11111111-2222-3333-4444-555555555555";
    fireEvent.change(input, { target: { value: ` ${NEW_DIR} ` } });
    api.updateAuthConnection.mockResolvedValue({});
    fireEvent.click(within(card()).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(api.updateAuthConnection).toHaveBeenCalledWith(T, C, { directoryId: NEW_DIR }));
    expect(api.updateAuthConnection.mock.calls[0][2]).not.toHaveProperty("isActive"); // never activates
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  test("no Tenant ID editing while connected / test_failed / platform-managed / read-only", async () => {
    for (const status of [statusOf("connected"), statusOf("test_failed"), statusOf("not_connected", { sharedDirectoryException: true })]) {
      const { unmount } = await renderCard({ status });
      expect(button("Edit Tenant ID")).toBeNull();
      unmount();
    }
    await renderCard({ status: statusOf("not_connected"), canAdmin: false });
    expect(button("Edit Tenant ID")).toBeNull();
  });
});

describe("provisioning", () => {
  test("23 Automatic: description and the resolved default role", async () => {
    await renderCard({ status: statusOf("connected"), connection: connectionOf({ autoProvisionUsers: true, defaultRoleId: ROLE._id }) });
    expect(screen.getByText(/Valid users from the connected Microsoft directory can be created in ProjectShell/)).toBeInTheDocument();
    expect(await screen.findByText("Default role: Regional Officer (REO)")).toBeInTheDocument();
  });

  test("24 Pre-authorised: description, no default role line", async () => {
    await renderCard({ status: statusOf("connected"), connection: connectionOf({ autoProvisionUsers: false, defaultRoleId: ROLE._id }) });
    expect(screen.getByText("Only users already created in ProjectShell can sign in.")).toBeInTheDocument();
    expect(screen.queryByText(/Default role:/)).toBeNull();
  });

  test("25 an ineligible saved role shows Unavailable; options that cannot load are explained", async () => {
    const { unmount } = await renderCard({ status: statusOf("connected"), connection: connectionOf({ autoProvisionUsers: true, defaultRoleId: "6a00000000000000000000ff" }) });
    expect(await screen.findByText("Default role: Unavailable")).toBeInTheDocument();
    unmount();
    api.fetchDefaultRoleOptions.mockRejectedValue(Object.assign(new Error("Forbidden"), { status: 403 }));
    await renderCard({ status: statusOf("connected"), connection: connectionOf({ autoProvisionUsers: true, defaultRoleId: ROLE._id }) });
    expect(await screen.findByText("Default role: could not be loaded")).toBeInTheDocument();
  });

  test("Automatic requires a default role; switching to Pre-authorised saves only autoProvisionUsers", async () => {
    await renderCard({ status: statusOf("connected"), connection: connectionOf({ autoProvisionUsers: false, defaultRoleId: null }) });
    fireEvent.click(button("Edit provisioning"));
    fireEvent.click(screen.getByLabelText(/^Automatic/));
    fireEvent.click(within(screen.getByTestId("provisioning-edit")).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Default role is required for automatic provisioning")).toBeInTheDocument();
    expect(api.updateAuthConnection).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText(/^Pre-authorised/));
    api.updateAuthConnection.mockResolvedValue({});
    fireEvent.click(within(screen.getByTestId("provisioning-edit")).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(api.updateAuthConnection).toHaveBeenCalledWith(T, C, { autoProvisionUsers: false }));
  });

  test("Automatic cannot be saved while role options could not be loaded (403)", async () => {
    api.fetchDefaultRoleOptions.mockRejectedValue(Object.assign(new Error("Forbidden"), { status: 403 }));
    await renderCard({ status: statusOf("connected"), connection: connectionOf({ autoProvisionUsers: false, defaultRoleId: ROLE._id }) });
    await waitFor(() => expect(api.fetchDefaultRoleOptions).toHaveBeenCalled());
    fireEvent.click(button("Edit provisioning"));
    fireEvent.click(screen.getByLabelText(/^Automatic/));
    expect(await screen.findByText("Default role options could not be loaded for this organisation.")).toBeInTheDocument();
    fireEvent.click(within(screen.getByTestId("provisioning-edit")).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Default role options could not be loaded for this organisation.", { selector: ".ant-alert-message" })).toBeInTheDocument();
    expect(api.updateAuthConnection).not.toHaveBeenCalled();
  });

  test("Automatic with an eligible role saves autoProvisionUsers + defaultRoleId", async () => {
    await renderCard({ status: statusOf("connected"), connection: connectionOf({ autoProvisionUsers: false, defaultRoleId: ROLE._id }) });
    await waitFor(() => expect(api.fetchDefaultRoleOptions).toHaveBeenCalledWith(T, ENTRA));
    fireEvent.click(button("Edit provisioning"));
    fireEvent.click(screen.getByLabelText(/^Automatic/));
    api.updateAuthConnection.mockResolvedValue({});
    fireEvent.click(within(screen.getByTestId("provisioning-edit")).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(api.updateAuthConnection).toHaveBeenCalledWith(T, C, { autoProvisionUsers: true, defaultRoleId: ROLE._id }));
  });
});

describe("permissions and leakage", () => {
  test("27 read-only (no tenant:admin): status and details, no mutation controls, no admin-only role lookup", async () => {
    await renderCard({ status: statusOf("connected", { isActive: true }), canAdmin: false, connection: connectionOf({ autoProvisionUsers: true, defaultRoleId: ROLE._id }) });
    expect(screen.getByTestId("connection-status")).toHaveTextContent("Connected");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.getByText("Default role: Configured")).toBeInTheDocument();
    expect(api.fetchDefaultRoleOptions).not.toHaveBeenCalled();
  });

  test("28 no internal / backend security field is ever rendered, in any state", async () => {
    for (const s of ["not_connected", "connected", "disconnected", "test_failed", "reconnect_required"]) {
      const { container, unmount } = await renderCard({
        status: statusOf(s, { connectedAt: "2026-10-17T07:00:00Z", connectedBy: "RAWUSERID-CONNECTED", disconnectedAt: "2026-10-17T08:00:00Z", disconnectedBy: "RAWUSERID-DISCONNECTED", ...SECRET_FIELDS }),
      });
      expect(container.innerHTML).not.toMatch(MARKERS);
      expect(container.innerHTML).not.toContain(C); // nor the connection's internal id
      unmount();
    }
  });

  test("33 nothing about the flow is logged", async () => {
    const spies = ["log", "info", "warn", "error"].map((fn) => jest.spyOn(console, fn).mockImplementation(() => {}));
    await renderCard({ status: statusOf("not_connected") });
    api.startEntraConnect.mockResolvedValue({ authorizationUrl: "https://login.microsoftonline.com/x?state=STATE-VALUE" });
    fireEvent.click(button("Connect Microsoft Entra"));
    await waitFor(() => expect(window.location.assign).toHaveBeenCalled());
    const logged = spies.flatMap((s) => s.mock.calls).flat().map(String).join(" ");
    expect(logged).not.toMatch(/STATE-VALUE|login\.microsoftonline|68cbf78060/);
    spies.forEach((s) => s.mockRestore());
  });
});

describe("no Entra connection yet", () => {
  test("Add Microsoft Entra creates an INACTIVE, pre-authorised connection; invalid Tenant ID refused", async () => {
    render(<EntraConnectionCard tenantId={T} connection={null} canAdmin onChanged={onChanged} />);
    expect(card()).toHaveTextContent("Not configured");
    fireEvent.change(screen.getByRole("textbox", { name: "Microsoft Tenant ID" }), { target: { value: "organizations" } });
    fireEvent.click(button("Add Microsoft Entra"));
    expect(await screen.findByText("The configured Microsoft Tenant ID is invalid.")).toBeInTheDocument();
    expect(api.addAuthConnection).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox", { name: "Microsoft Tenant ID" }), { target: { value: DIR } });
    api.addAuthConnection.mockResolvedValue({});
    fireEvent.click(button("Add Microsoft Entra"));
    await waitFor(() =>
      expect(api.addAuthConnection).toHaveBeenCalledWith(T, { connectionType: ENTRA, directoryId: DIR, isActive: false, autoProvisionUsers: false }),
    );
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  test("read-only users only see 'Not configured'", () => {
    render(<EntraConnectionCard tenantId={T} connection={null} canAdmin={false} onChanged={onChanged} />);
    expect(card()).toHaveTextContent("Not configured");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
