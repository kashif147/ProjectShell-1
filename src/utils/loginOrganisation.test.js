import {
  forgetRememberedOrganisation,
  getRememberedOrganisation,
  isOrganisationCode,
  readExplicitOrganisation,
  rememberOrganisation,
} from "./loginOrganisation";

beforeEach(() => localStorage.clear());

test("explicit organisation from ?tenant (trimmed); malformed or absent -> null", () => {
  expect(readExplicitOrganisation("?tenant=%20MULTIAUTH%20")).toBe("MULTIAUTH");
  expect(readExplicitOrganisation("?tenant=a%20b")).toBeNull();
  expect(readExplicitOrganisation("?tenant=%7B%24ne%3A1%7D")).toBeNull();
  expect(readExplicitOrganisation("")).toBeNull();
});

test("remember / read / forget store only { code, name }", () => {
  rememberOrganisation({ code: "MULTIAUTH", name: " Digital Informatics ", tenantId: "68cbf7806080b4621d469d34", directoryId: "x" });
  expect(getRememberedOrganisation()).toEqual({ code: "MULTIAUTH", name: "Digital Informatics" });
  expect(Object.keys(localStorage).sort()).toEqual(["login_tenant_code", "login_tenant_name"]);
  forgetRememberedOrganisation();
  expect(getRememberedOrganisation()).toBeNull();
  expect(localStorage.length).toBe(0);
});

test("incomplete or malformed remembered values are ignored", () => {
  localStorage.setItem("login_tenant_code", "MULTIAUTH");
  expect(getRememberedOrganisation()).toBeNull(); // no name
  localStorage.setItem("login_tenant_name", "X");
  localStorage.setItem("login_tenant_code", "not a code!");
  expect(getRememberedOrganisation()).toBeNull();
  rememberOrganisation({ code: "", name: "X" });
  rememberOrganisation({ code: "OK", name: "" });
  expect(localStorage.getItem("login_tenant_code")).toBe("not a code!"); // unchanged: nothing written
});

test("isOrganisationCode", () => {
  expect(isOrganisationCode("DEVTENANTB")).toBe(true);
  expect(isOrganisationCode("x".repeat(65))).toBe(false);
  expect(isOrganisationCode("../x")).toBe(false);
});
