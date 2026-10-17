import axios from "axios";
import { fetchTenantRecord } from "./tenantBrandingService";
import AuthorizationAPI from "./AuthorizationAPI";

// 27: the remembered sign-in organisation comes ONLY from the authenticated session's own
// organisation record (code + name), and the authenticated organisation wins over a stale locator.
jest.mock("axios", () => ({ get: jest.fn() }));
jest.mock("./AuthorizationAPI", () => ({ __esModule: true, default: { decodeToken: jest.fn() } }));

const SESSION_TENANT = "68cbf7806080b4621d469d34";
const OTHER_TENANT = "6acd6119b28a863c61361ae0";
const record = (code, name) => ({ _id: "x", code, name, authenticationConnections: [{ directoryId: "39866a06-30bc-4a89-80c6-9dd9357dd453" }] });

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("token", "header.payload.sig");
  AuthorizationAPI.decodeToken.mockReturnValue({ tenantId: SESSION_TENANT });
});

test("the session's own organisation record is remembered as { code, name } only", async () => {
  axios.get.mockResolvedValue({ data: { data: record("MULTIAUTH", "Digital Informatics") } });
  await fetchTenantRecord(null, { force: true });
  expect(localStorage.getItem("login_tenant_code")).toBe("MULTIAUTH");
  expect(localStorage.getItem("login_tenant_name")).toBe("Digital Informatics");
  const stored = Object.entries(localStorage).filter(([k]) => k.startsWith("login_tenant"));
  expect(JSON.stringify(stored)).not.toMatch(/68cbf780|39866a06/); // no internal tenant id / directory
});

test("the authenticated organisation wins over a different remembered locator", async () => {
  localStorage.setItem("login_tenant_code", "DEVTENANTB");
  localStorage.setItem("login_tenant_name", "Old Name");
  axios.get.mockResolvedValue({ data: { data: record("MULTIAUTH", "Digital Informatics") } });
  await fetchTenantRecord(SESSION_TENANT, { force: true });
  expect(localStorage.getItem("login_tenant_code")).toBe("MULTIAUTH");
  expect(localStorage.getItem("login_tenant_name")).toBe("Digital Informatics");
});

test("another organisation's record (e.g. an admin viewing a tenant) is never remembered", async () => {
  axios.get.mockResolvedValue({ data: { data: record("DEVTENANTB", "Tenant B") } });
  await fetchTenantRecord(OTHER_TENANT, { force: true });
  expect(localStorage.getItem("login_tenant_code")).toBeNull();
  expect(localStorage.getItem("login_tenant_name")).toBeNull();
});

test("no session (no token) -> nothing fetched or remembered", async () => {
  localStorage.removeItem("token");
  AuthorizationAPI.decodeToken.mockReturnValue(null);
  expect(await fetchTenantRecord(SESSION_TENANT, { force: true })).toBeNull();
  expect(localStorage.getItem("login_tenant_code")).toBeNull();
});

test("a malformed code or missing name is not remembered", async () => {
  axios.get.mockResolvedValue({ data: { data: record("bad code!", "Name") } });
  await fetchTenantRecord(null, { force: true });
  expect(localStorage.getItem("login_tenant_code")).toBeNull();
  axios.get.mockResolvedValue({ data: { data: record("MULTIAUTH", "") } });
  await fetchTenantRecord(null, { force: true });
  expect(localStorage.getItem("login_tenant_code")).toBeNull();
});

test("a 403 from GET /tenants/:id (ordinary staff, no tenant:read) leaves the callback-remembered organisation intact", async () => {
  localStorage.setItem("login_tenant_code", "MULTIAUTH");
  localStorage.setItem("login_tenant_name", "Digital Informatics");
  axios.get.mockRejectedValue(Object.assign(new Error("Forbidden"), { response: { status: 403 } }));
  await expect(fetchTenantRecord(null, { force: true })).rejects.toThrow();
  expect(localStorage.getItem("login_tenant_code")).toBe("MULTIAUTH");
  expect(localStorage.getItem("login_tenant_name")).toBe("Digital Informatics");
});
