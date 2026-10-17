import {
  AuthConnectionApiError,
  addAuthConnection,
  completeEntraConnect,
  disconnectEntraConnection,
  fetchEntraConnectionStatus,
  fetchTenantForAuthentication,
  startEntraConnect,
  testEntraConnection,
  updateAuthConnection,
} from "./tenantAuthConnectionsApi";

const BASE = "http://gateway.test/user-service/api";
const T = "68cbf7806080b4621d469d34";
const C = "68cbf7806080b4621d469d35";
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

beforeEach(() => {
  process.env.REACT_APP_POLICY_SERVICE_URL = BASE;
  localStorage.clear();
  localStorage.setItem("token", "header.payload.sig");
  global.fetch = jest.fn();
  for (const fn of ["log", "info", "warn", "error"]) jest.spyOn(console, fn).mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

const call = () => global.fetch.mock.calls[0];

test.each([
  ["status", () => fetchEntraConnectionStatus(T, C), "GET", `/tenants/${T}/auth-connections/${C}/status`, undefined],
  ["tenant", () => fetchTenantForAuthentication(T), "GET", `/tenants/${T}`, undefined],
  ["connect", () => startEntraConnect(T, C), "POST", `/tenants/${T}/auth-connections/${C}/connect`, {}],
  ["complete", () => completeEntraConnect(T, C, { code: "c", state: "s" }), "POST", `/tenants/${T}/auth-connections/${C}/connect/complete`, { code: "c", state: "s" }],
  ["test", () => testEntraConnection(T, C), "POST", `/tenants/${T}/auth-connections/${C}/test`, {}],
  ["disconnect", () => disconnectEntraConnection(T, C), "POST", `/tenants/${T}/auth-connections/${C}/disconnect`, {}],
  ["add", () => addAuthConnection(T, { connectionType: "Entra ID (Azure AD)" }), "POST", `/tenants/${T}/auth-connections`, { connectionType: "Entra ID (Azure AD)" }],
  ["update", () => updateAuthConnection(T, C, { isActive: false }), "PUT", `/tenants/${T}/auth-connections/${C}`, { isActive: false }],
])("%s: method, path, body, bearer token; resolves with data", async (_n, fn, method, path, body) => {
  global.fetch.mockResolvedValue(reply(200, { status: "success", data: { ok: true } }));
  await expect(fn()).resolves.toEqual({ ok: true });
  const [url, init] = call();
  expect(url).toBe(`${BASE}${path}`);
  expect(init.method).toBe(method);
  expect(init.headers.Authorization).toBe("Bearer header.payload.sig");
  expect(init.body === undefined ? undefined : JSON.parse(init.body)).toEqual(body);
});

test("ids are path-encoded", async () => {
  global.fetch.mockResolvedValue(reply(200, { data: {} }));
  await fetchEntraConnectionStatus("a/b", "c?d");
  expect(call()[0]).toBe(`${BASE}/tenants/a%2Fb/auth-connections/c%3Fd/status`);
});

test("an error carries status + backend code only (never the server message)", async () => {
  global.fetch.mockResolvedValue(reply(409, { success: false, error: { code: "DIRECTORY_SHARED_EXCEPTION", message: "raw server text", status: 409 } }));
  const err = await disconnectEntraConnection(T, C).catch((e) => e);
  expect(err).toBeInstanceOf(AuthConnectionApiError);
  expect(err).toMatchObject({ status: 409, code: "DIRECTORY_SHARED_EXCEPTION", network: false });
  expect(err.message).not.toMatch(/raw server text/);
});

test("a failed Test Connection resolves as a result (ok false + code)", async () => {
  global.fetch.mockResolvedValue(reply(424, { status: "fail", data: { ok: false, code: "APP_NOT_CONSENTED", testedAt: "x" } }));
  await expect(testEntraConnection(T, C)).resolves.toMatchObject({ ok: false, code: "APP_NOT_CONSENTED" });
});

test("a Test Connection request error (e.g. 409 CONNECTION_DISCONNECTED) still rejects", async () => {
  global.fetch.mockResolvedValue(reply(409, { success: false, error: { code: "CONNECTION_DISCONNECTED" } }));
  await expect(testEntraConnection(T, C)).rejects.toMatchObject({ code: "CONNECTION_DISCONNECTED" });
});

test("network failure / non-JSON body / no token", async () => {
  global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
  await expect(startEntraConnect(T, C)).rejects.toMatchObject({ network: true });
  global.fetch.mockResolvedValue({ ok: false, status: 502, json: async () => { throw new Error("html"); } });
  await expect(startEntraConnect(T, C)).rejects.toMatchObject({ status: 502, code: null });
  localStorage.removeItem("token");
  global.fetch.mockClear();
  await expect(startEntraConnect(T, C)).rejects.toMatchObject({ status: 401 });
  expect(global.fetch).not.toHaveBeenCalled();
});

test("nothing is logged and nothing new is stored", async () => {
  global.fetch.mockResolvedValue(reply(200, { data: { status: "connected" } }));
  await completeEntraConnect(T, C, { code: "AUTH-CODE-VALUE", state: "STATE-VALUE" });
  for (const fn of ["log", "info", "warn", "error"]) expect(console[fn]).not.toHaveBeenCalled();
  expect(Object.keys(localStorage)).toEqual(["token"]);
  expect(sessionStorage.length).toBe(0);
});
