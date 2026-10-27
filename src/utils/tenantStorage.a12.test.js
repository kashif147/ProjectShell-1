/**
 * Phase A / A12 - tenant-keyed CRM browser storage (utils/tenantStorage.js).
 */
import {
  clearTenantStorage,
  purgeForeignTenantStorage,
  readTenantItem,
  sessionTenantId,
  sessionUserId,
  tenantKey,
  writeTenantItem,
} from "./tenantStorage";

const A = "68cbf7806080b4621d469d34"; // MULTIAUTH
const B = "6acd6119b28a863c61361ae0"; // DEVTENANTB
const D = "6ad4e0c941376f7df605fd57"; // DEVDIRB
const USER = "65a0000000000000000000aa";

const b64url = (o) =>
  btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const tokenFor = (claims) => `${b64url({ alg: "HS256" })}.${b64url(claims)}.sig`;
const signIn = (claims) => localStorage.setItem("token", tokenFor(claims));

beforeEach(() => localStorage.clear());

test("tenant comes from the session token claim only (not userData / tenantId keys)", () => {
  localStorage.setItem("userData", JSON.stringify({ tenantId: B }));
  localStorage.setItem("tenantId", B);
  expect(sessionTenantId()).toBeNull();
  signIn({ tenantId: A, id: USER });
  expect(sessionTenantId()).toBe(A);
  expect(sessionUserId()).toBe(USER);
});

test("placeholder / malformed / missing tenant fails closed: no key, nothing read or written", () => {
  for (const t of [undefined, "", "default", "unknown", "system", "null", "not-an-id", `${A}x`]) {
    localStorage.clear();
    signIn({ tenantId: t });
    expect(sessionTenantId()).toBeNull();
    expect(tenantKey("hierarchicalLookups")).toBeNull();
    expect(writeTenantItem("hierarchicalLookups", "[1]")).toBe(false);
    expect(readTenantItem("hierarchicalLookups")).toBeNull();
    expect(Object.keys(localStorage).filter((k) => k !== "token")).toEqual([]);
  }
});

test("values are stored under <base>:v2:<tenantId>", () => {
  signIn({ tenantId: A });
  expect(writeTenantItem("hierarchicalLookups", "[\"a\"]")).toBe(true);
  expect(localStorage.getItem(`hierarchicalLookups:v2:${A}`)).toBe("[\"a\"]");
  expect(localStorage.getItem("hierarchicalLookups")).toBeNull();
});

test("tenant change cannot reuse the prior tenant's metadata", () => {
  signIn({ tenantId: A });
  writeTenantItem("hierarchicalLookups", "[\"tenant-A\"]");
  for (const t of [B, D]) {
    signIn({ tenantId: t });
    expect(readTenantItem("hierarchicalLookups")).toBeNull();
  }
  signIn({ tenantId: B });
  purgeForeignTenantStorage();
  expect(localStorage.getItem(`hierarchicalLookups:v2:${A}`)).toBeNull();
});

test("legacy global keys are never read and are purged; other tenants' entries are dropped", () => {
  localStorage.setItem("hierarchicalLookups", "[\"legacy-global\"]");
  localStorage.setItem("gardaApplicationDrafts", "[]");
  localStorage.setItem(`hierarchicalLookups:v2:${A}`, "[\"A\"]");
  localStorage.setItem(`hierarchicalLookups:v2:${D}`, "[\"D\"]");
  signIn({ tenantId: D });
  expect(readTenantItem("hierarchicalLookups")).toBe("[\"D\"]");
  const removed = purgeForeignTenantStorage();
  expect(removed.sort()).toEqual(["gardaApplicationDrafts", "hierarchicalLookups", `hierarchicalLookups:v2:${A}`].sort());
  expect(localStorage.getItem(`hierarchicalLookups:v2:${D}`)).toBe("[\"D\"]");
});

test("clearTenantStorage (logout / idle / clearAuth / expiry) removes all tenant metadata, keeps preferences", () => {
  signIn({ tenantId: A });
  localStorage.setItem(`hierarchicalLookups:v2:${A}`, "[]");
  localStorage.setItem(`hierarchicalLookups:v2:${B}`, "[]");
  localStorage.setItem("hierarchicalLookups", "[]");
  localStorage.setItem("sidebar-pinned", "true");
  localStorage.setItem("profile-header-layout", "{}");
  localStorage.setItem("ps:gridVisibleFilters:members:65a0000000000000000000bb", "[]");
  clearTenantStorage();
  expect(Object.keys(localStorage).sort()).toEqual(
    ["profile-header-layout", "ps:gridVisibleFilters:members:65a0000000000000000000bb", "sidebar-pinned", "token"].sort(),
  );
});
