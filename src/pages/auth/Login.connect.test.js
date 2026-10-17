import React from "react";
import { render, waitFor } from "@testing-library/react";
import Login from "./Login";
import { CONNECT_RETURN_KEY } from "../../utils/entraConnectReturn";

// "Connect Microsoft Entra" returns to the CRM sign-in callback (/auth/azure-crm). Same isolation
// as Login.test.js; navigate is a stable mock so the return target can be asserted.
jest.mock("@azure/msal-react", () => ({ useMsal: () => ({ inProgress: "None" }) }));
jest.mock("@azure/msal-browser", () => ({ InteractionStatus: { None: "None" } }));
jest.mock("react-redux", () => ({ useDispatch: () => jest.fn(), useSelector: () => ({ loading: false }) }));
jest.mock("../../context/AuthorizationContext", () => ({ useAuthorization: () => ({ setUserData: jest.fn() }) }));
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate, Link: ({ children }) => <>{children}</> }));
jest.mock("../../component/common/MyAlert", () => jest.fn());
jest.mock("../../component/msft/msalConfig", () => ({ getRedirectUri: () => "http://localhost:3000/auth/azure-crm" }));
jest.mock("../../utils/authReadyEvent", () => ({ bumpAuthReady: jest.fn() }));
jest.mock("../../context/TenantBrandingContext", () => ({ notifyBrandingRefresh: jest.fn() }));
jest.mock("../../utils/roleHomeModule", () => ({ getHomeMenuKeyFromRoles: () => "Dashboard", getHomeRouteFromRoles: () => "/" }));
jest.mock("../../features/AuthSlice", () => ({ loginUser: jest.fn() }));
jest.mock("../../features/MenuLblSlice", () => ({ updateMenuLbl: jest.fn() }));

const MyAlert = require("../../component/common/MyAlert");
const BASE_URL = "http://backend.test";
const T = "68cbf7806080b4621d469d34";
const C = "68cbf7806080b4621d469d35";
const COMPLETE_URL = `${BASE_URL}/api/tenants/${T}/auth-connections/${C}/connect/complete`;
const CODE = "AUTHCODE-VALUE";
const CONNECT_STATE = "CONNECTSTATE-VALUE";
const SIGNIN_STATE = "SIGNINSTATE-VALUE";
const note = (extra = {}) => JSON.stringify({ tenantId: T, connectionId: C, startedAt: Date.now(), ...extra });
const ok = (data) => ({ ok: true, status: 200, json: async () => ({ status: "success", data }) });
const fail = (status, code) => ({ ok: false, status, json: async () => ({ success: false, error: { code, message: "raw server text" } }) });
const completeCalls = () => global.fetch.mock.calls.filter(([url]) => String(url).includes("/connect/complete"));

let consoleSpies;
const originalLocation = window.location;
beforeEach(() => {
  jest.clearAllMocks();
  process.env.REACT_APP_BASE_URL_DEV = BASE_URL;
  delete process.env.REACT_APP_POLICY_SERVICE_URL;
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("token", "header.payload.sig");
  localStorage.setItem("userData", JSON.stringify({ roles: [] }));
  consoleSpies = ["log", "info", "warn", "error"].map((fn) => jest.spyOn(console, fn).mockImplementation(() => {}));
  jest.spyOn(window.history, "replaceState").mockImplementation(() => {});
  delete window.location;
  window.location = { href: "", search: `?code=${CODE}&state=${CONNECT_STATE}`, pathname: "/auth/azure-crm" };
  global.fetch = jest.fn();
});
afterEach(() => {
  window.location = originalLocation;
  jest.restoreAllMocks();
});
const logged = () => consoleSpies.flatMap((s) => s.mock.calls).flat().map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ");

test("8/12 a fresh note + a non-sign-in state completes Connect; the note is removed BEFORE the request; back to the organisation", async () => {
  sessionStorage.setItem(CONNECT_RETURN_KEY, note());
  localStorage.setItem("pkce_state", SIGNIN_STATE);
  let noteAtRequest = "unset";
  global.fetch.mockImplementation(async () => {
    noteAtRequest = sessionStorage.getItem(CONNECT_RETURN_KEY);
    return ok({ status: "connected" });
  });
  render(<Login />);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  expect(completeCalls()).toHaveLength(1);
  const [url, init] = completeCalls()[0];
  expect(url).toBe(COMPLETE_URL);
  expect(init.method).toBe("POST");
  expect(JSON.parse(init.body)).toEqual({ code: CODE, state: CONNECT_STATE });
  expect(noteAtRequest).toBeNull();
  expect(window.history.replaceState).toHaveBeenCalledWith({}, expect.anything(), "/auth/azure-crm");
  expect(mockNavigate).toHaveBeenCalledWith("/TenantManagement", { state: { search: "TenantManagement", openTenantAuthentication: T } });
  expect(MyAlert).toHaveBeenCalledWith("success", "Microsoft Entra has been connected successfully.");
  // the ordinary sign-in exchange never ran and nothing was stored
  expect(global.fetch.mock.calls.some(([u]) => String(u).endsWith("/auth/azure-crm"))).toBe(false);
  expect(localStorage.getItem("pkce_state")).toBe(SIGNIN_STATE);
});

test("failure: fixed message, still back to the organisation, the note is NOT restored", async () => {
  sessionStorage.setItem(CONNECT_RETURN_KEY, note());
  global.fetch.mockResolvedValue(fail(409, "DIRECTORY_ALREADY_CLAIMED"));
  render(<Login />);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  expect(MyAlert).toHaveBeenCalledWith("error", "Microsoft Entra was not connected", "This Microsoft directory is already connected to another organisation.");
  expect(JSON.stringify(MyAlert.mock.calls)).not.toMatch(/raw server text/);
  expect(sessionStorage.getItem(CONNECT_RETURN_KEY)).toBeNull();
  expect(mockNavigate).toHaveBeenCalledWith("/TenantManagement", expect.anything());
});

test("Microsoft cancel (error=access_denied) with a valid note: no request, cancel message", async () => {
  sessionStorage.setItem(CONNECT_RETURN_KEY, note());
  window.location.search = `?error=access_denied&state=${CONNECT_STATE}`;
  render(<Login />);
  await waitFor(() => expect(MyAlert).toHaveBeenCalledWith("error", "Microsoft Entra was not connected", "Microsoft sign-in was cancelled."));
  expect(global.fetch).not.toHaveBeenCalled();
});

test.each([
  ["9 stale", () => note({ startedAt: Date.now() - 11 * 60 * 1000 })],
  ["10 absent", () => null],
  ["11 malformed JSON", () => "{oops"],
  ["11 malformed ids", () => note({ tenantId: "../../users" })],
  ["11 missing startedAt", () => JSON.stringify({ tenantId: T, connectionId: C })],
])("%s note -> never Connect completion; the ordinary callback handling runs unchanged", async (_label, make) => {
  const value = make();
  if (value !== null) sessionStorage.setItem(CONNECT_RETURN_KEY, value);
  localStorage.setItem("pkce_state", SIGNIN_STATE); // the returned state is not the sign-in state
  render(<Login />);
  await new Promise((r) => setTimeout(r, 20));
  expect(completeCalls()).toHaveLength(0);
  // ordinary sign-in path: state mismatch -> it stops before calling the backend (existing behaviour)
  expect(global.fetch).not.toHaveBeenCalled();
  expect(sessionStorage.getItem(CONNECT_RETURN_KEY)).toBeNull(); // a bad note is discarded
});

test("13 ordinary CRM sign-in is unaffected even while a Connect note exists", async () => {
  sessionStorage.setItem(CONNECT_RETURN_KEY, note());
  localStorage.setItem("pkce_state", SIGNIN_STATE);
  localStorage.setItem("pkce_code_verifier", "verifier");
  window.location.search = `?code=${CODE}&state=${SIGNIN_STATE}`;
  global.fetch.mockResolvedValue({ ok: false, status: 400, statusText: "Bad Request", json: async () => ({ message: "x" }) });
  render(<Login />);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/auth/azure-crm`, expect.anything()));
  expect(completeCalls()).toHaveLength(0);
  expect(sessionStorage.getItem(CONNECT_RETURN_KEY)).not.toBeNull(); // not consumed by a sign-in
});

test("signed out by the time Microsoft returns: no token -> session message, back to sign-in", async () => {
  sessionStorage.setItem(CONNECT_RETURN_KEY, note());
  localStorage.removeItem("token");
  render(<Login />);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  expect(MyAlert).toHaveBeenCalledWith("error", "Microsoft Entra was not connected", "Your session has expired. Please sign in again.");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("33 the code, state and note are never logged or stored", async () => {
  sessionStorage.setItem(CONNECT_RETURN_KEY, note());
  global.fetch.mockResolvedValue(ok({ status: "connected" }));
  render(<Login />);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  expect(logged()).not.toMatch(/AUTHCODE-VALUE|CONNECTSTATE-VALUE|68cbf7806080b4621d469d3/);
  const stored = [...Object.values(localStorage), ...Object.values(sessionStorage)].join(" ");
  expect(stored).not.toMatch(/AUTHCODE-VALUE|CONNECTSTATE-VALUE/);
});

test("8 regression: the 'already signed in' redirect never interrupts a running Connect completion", async () => {
  // The user is signed in (token + userData) and re-renders happen while completion is pending;
  // before the fix the effect re-ran and sent the user to their home route mid-Connect.
  sessionStorage.setItem(CONNECT_RETURN_KEY, note());
  let finish;
  global.fetch.mockImplementation(() => new Promise((r) => (finish = r)));
  render(<Login />);
  await waitFor(() => expect(completeCalls()).toHaveLength(1));
  await new Promise((r) => setTimeout(r, 30));
  expect(mockNavigate).not.toHaveBeenCalled(); // no home redirect while pending
  finish(ok({ status: "connected" }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  expect(mockNavigate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith("/TenantManagement", expect.anything());
});

test("13b signed-in user opening the sign-in page without a callback still goes to their home route (unchanged)", async () => {
  window.location.search = "";
  render(<Login />);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/", { state: { search: "Dashboard" } }));
  expect(global.fetch).not.toHaveBeenCalled();
});
