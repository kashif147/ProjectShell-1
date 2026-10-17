import {
  CONNECT_UNAVAILABLE,
  RECONNECT_BEFORE_ACTIVATING,
  UNKNOWN_ERROR,
  entraActions,
  errorMessage,
  isDirectoryGuid,
  microsoftCallbackErrorMessage,
  primaryEntraConnection,
  statusLabel,
  testResultMessage,
} from "./entraConnectionStatus";

const on = (status, extra = {}) => entraActions({ status, isActive: false, sharedDirectoryException: false, canAdmin: true, ...extra });
const enabled = (a) => Object.keys(a).filter((k) => a[k]).sort();

describe("status labels", () => {
  test.each([
    ["not_connected", "Not connected"],
    ["connected", "Connected"],
    ["disconnected", "Disconnected"],
    ["test_failed", "Connection test failed"],
    ["reconnect_required", "Reconnect required"],
  ])("%s -> %s", (s, label) => expect(statusLabel(s)).toBe(label));
});

describe("status -> action matrix (tenant:admin)", () => {
  test("not_connected (inactive): Connect, Tenant ID editing, provisioning; no Test / Disconnect / Activate", () => {
    expect(enabled(on("not_connected"))).toEqual(["connect", "editDirectory", "editProvisioning"]);
  });
  test("connected: Test, Disconnect, provisioning, Active switch; Tenant ID read-only", () => {
    expect(enabled(on("connected"))).toEqual(["activeSwitch", "disconnect", "editProvisioning", "test"]);
    expect(enabled(on("connected", { isActive: true }))).toEqual(["activeSwitch", "disconnect", "editProvisioning", "test"]);
  });
  test("test_failed: Test Again, Reconnect, Disconnect, provisioning, Active switch", () => {
    expect(enabled(on("test_failed"))).toEqual(["activeSwitch", "disconnect", "editProvisioning", "reconnect", "test"]);
  });
  test("disconnected: Reconnect, Tenant ID editing, provisioning; no Test / Disconnect / Activate", () => {
    expect(enabled(on("disconnected"))).toEqual(["editDirectory", "editProvisioning", "reconnect"]);
  });
  test("reconnect_required: Reconnect; Tenant ID editable only while inactive", () => {
    expect(enabled(on("reconnect_required"))).toEqual(["editDirectory", "editProvisioning", "reconnect"]);
    expect(enabled(on("reconnect_required", { isActive: true }))).toEqual(["deactivateOnly", "editProvisioning", "reconnect"]);
  });
  test("an active connection without verified ownership may only be deactivated (never activated)", () => {
    for (const s of ["not_connected", "disconnected", "reconnect_required"]) {
      const a = on(s, { isActive: true });
      expect(a.deactivateOnly).toBe(true);
      expect(a.activeSwitch).toBe(false);
      expect(a.editDirectory).toBe(false);
    }
  });
  test("Active switch only for connected / test_failed", () => {
    expect(["not_connected", "connected", "disconnected", "test_failed", "reconnect_required"].filter((s) => on(s).activeSwitch)).toEqual(["connected", "test_failed"]);
  });
  test("platform-managed: no Connect / Reconnect / Disconnect / Tenant ID editing; Test and provisioning stay", () => {
    expect(enabled(on("connected", { sharedDirectoryException: true }))).toEqual(["activeSwitch", "editProvisioning", "test"]);
    expect(enabled(on("test_failed", { sharedDirectoryException: true }))).toEqual(["activeSwitch", "editProvisioning", "test"]);
    expect(enabled(on("reconnect_required", { sharedDirectoryException: true }))).toEqual(["editProvisioning"]);
  });
  test("without tenant:admin nothing is offered", () => {
    for (const s of ["not_connected", "connected", "disconnected", "test_failed", "reconnect_required"]) {
      expect(enabled(on(s, { canAdmin: false, isActive: true }))).toEqual([]);
    }
  });
  test("unknown status: nothing but provisioning", () => {
    expect(enabled(on("weird"))).toEqual(["editProvisioning"]);
  });
});

describe("safe error messages", () => {
  test.each([
    ["DIRECTORY_MISMATCH", "The Microsoft account used belongs to a different directory than the one configured for this organisation."],
    ["DIRECTORY_ALREADY_CLAIMED", "This Microsoft directory is already connected to another organisation."],
    ["DIRECTORY_SHARED_EXCEPTION", "This connection is managed by the platform and cannot be changed here."],
    ["CLAIM_METHOD_CONFLICT", "This connection is managed by the platform and cannot be changed here."],
    ["NOT_DIRECTORY_ADMIN", "The Microsoft account used does not have a supported administrator role in that directory."],
    ["INVALID_DIRECTORY", "The configured Microsoft Tenant ID is invalid."],
    ["TOKEN_EXCHANGE_FAILED", CONNECT_UNAVAILABLE],
    ["TOKEN_INVALID", CONNECT_UNAVAILABLE],
    ["CONNECT_STATE_INVALID", "The Microsoft connection request expired. Please start again."],
    ["CONNECTION_CHANGED", "This connection was changed while you were working. Refresh and try again."],
    ["CONNECTION_NOT_FOUND", "This authentication connection no longer exists."],
    ["NOT_ENTRA_CONNECTION", "This action is only available for Microsoft Entra connections."],
    ["NOT_CONNECTED", "This connection is not connected, so there is nothing to disconnect."],
    ["CONNECTION_DISCONNECTED", RECONNECT_BEFORE_ACTIVATING],
    ["ACTOR_REQUIRED", "Your session has expired. Please sign in again."],
    ["DIRECTORY_NOT_CLAIMED", "This connection has not been verified. Connect Microsoft Entra first."],
    ["DIRECTORY_NOT_FOUND", "Microsoft could not find this directory. Check the Tenant ID."],
    ["APP_NOT_CONSENTED", "An administrator of this directory has not approved ProjectShell yet."],
    ["CONFIGURATION_INVALID", "ProjectShell's Microsoft configuration needs attention. Contact ProjectShell support."],
    ["CREDENTIAL_INVALID", "ProjectShell's Microsoft configuration needs attention. Contact ProjectShell support."],
    ["MICROSOFT_UNAVAILABLE", "Microsoft could not be reached. Try again shortly."],
  ])("%s", (code, message) => expect(errorMessage({ status: 409, code }, "save")).toBe(message));

  test("CONNECTION_DISCONNECTED on Test has its own wording", () => {
    expect(errorMessage({ status: 409, code: "CONNECTION_DISCONNECTED" }, "test")).toBe("This connection is disconnected. Reconnect Microsoft Entra to test it.");
  });
  test("401 / 403 / network / 5xx / unknown", () => {
    expect(errorMessage({ status: 401 }, "save")).toBe("Your session has expired. Please sign in again.");
    expect(errorMessage({ status: 403, code: "FORBIDDEN" }, "disconnect")).toBe("You do not have permission to manage authentication for this organisation.");
    expect(errorMessage({ network: true }, "connect")).toBe(CONNECT_UNAVAILABLE);
    expect(errorMessage({ network: true }, "test")).toBe(UNKNOWN_ERROR);
    expect(errorMessage({ status: 500 }, "complete")).toBe(CONNECT_UNAVAILABLE);
    expect(errorMessage({ status: 500 }, "disconnect")).toBe(UNKNOWN_ERROR);
    expect(errorMessage({ status: 418, code: "SOMETHING_NEW" }, "save")).toBe(UNKNOWN_ERROR);
    expect(errorMessage(undefined, "save")).toBe(UNKNOWN_ERROR);
    expect(errorMessage({ status: 400 }, "save")).toBe("Check the connection settings and try again.");
  });
  test("raw server text is never returned", () => {
    const e = Object.assign(new Error("AADSTS700016 raw microsoft text"), { status: 400, code: null, serverMessage: "raw" });
    expect(errorMessage(e, "connect")).not.toMatch(/AADSTS|raw/);
  });
  test("test result messages and Microsoft callback errors", () => {
    expect(testResultMessage("CONNECTED")).toBe("Connection test successful");
    expect(testResultMessage("NEW_CODE")).toBe(UNKNOWN_ERROR);
    expect(microsoftCallbackErrorMessage("access_denied")).toBe("Microsoft sign-in was cancelled.");
    expect(microsoftCallbackErrorMessage("server_error")).toBe(CONNECT_UNAVAILABLE);
  });
});

test("Tenant ID shape check", () => {
  expect(isDirectoryGuid(" 39866a06-30bc-4a89-80c6-9dd9357dd453 ")).toBe(true);
  expect(isDirectoryGuid("common")).toBe(false);
  expect(isDirectoryGuid("")).toBe(false);
});

test("primary Entra connection: the active one, else the most recently updated", () => {
  const E = "Entra ID (Azure AD)";
  const older = { _id: "a", connectionType: E, isActive: false, updatedAt: "2026-10-01" };
  const newer = { _id: "b", connectionType: E, isActive: false, updatedAt: "2026-10-10" };
  const active = { _id: "c", connectionType: E, isActive: true, updatedAt: "2026-09-01" };
  expect(primaryEntraConnection([older, newer])._id).toBe("b");
  expect(primaryEntraConnection([older, active, newer])._id).toBe("c");
  expect(primaryEntraConnection([{ connectionType: "Azure B2C" }])).toBeNull();
});
