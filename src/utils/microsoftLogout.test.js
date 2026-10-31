import { redirectToMicrosoftLogout, rememberMicrosoftLogoutHint, withLogoutHint } from "./microsoftLogout";

const LOGOUT_URL = "https://login.microsoftonline.com/dir/oauth2/v2.0/logout?post_logout_redirect_uri=x";
const B2C_URL = "https://tenant.b2clogin.com/tenant.onmicrosoft.com/b2c_1_signin/oauth2/v2.0/logout?post_logout_redirect_uri=x";
let assigned;
let logSpies;

beforeEach(() => {
  localStorage.clear();
  assigned = null;
  delete window.location;
  window.location = {
    set href(v) {
      assigned = v;
    },
  };
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ azureADLogoutUrl: LOGOUT_URL, b2cLogoutUrl: B2C_URL }),
  });
  logSpies = ["log", "info", "warn", "error", "debug"].map((m) => jest.spyOn(console, m).mockImplementation(() => {}));
});

afterEach(() => jest.restoreAllMocks());

const logged = () => logSpies.flatMap((s) => s.mock.calls).map((args) => args.map(String).join(" ")).join("\n");

test("a remembered hint is appended to the Microsoft Entra URL only, never sent to ProjectShell, then forgotten", async () => {
  rememberMicrosoftLogoutHint("O.abc_12+/=");
  await redirectToMicrosoftLogout();
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/pkce\/logout-urls$/);
  expect(assigned).toBe(`${LOGOUT_URL}&logout_hint=O.abc_12%2B%2F%3D`);
  expect(new URL(assigned).searchParams.get("logout_hint")).toBe("O.abc_12+/=");
  expect(new URL(assigned).searchParams.get("post_logout_redirect_uri")).toBe("x");
  expect(localStorage.getItem("msLogoutHint")).toBeNull();
  expect(logged()).not.toContain("O.abc_12");

  await redirectToMicrosoftLogout();
  expect(global.fetch.mock.calls[1][0]).toMatch(/\/pkce\/logout-urls$/);
  expect(assigned).toBe(LOGOUT_URL);
});

test("no hint: unchanged request and unchanged Microsoft URL (account picker fallback)", async () => {
  await redirectToMicrosoftLogout();
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/pkce\/logout-urls$/);
  expect(assigned).toBe(LOGOUT_URL);
});

test.each([
  ["URL-structural characters", "abc&post_logout_redirect_uri=https://evil.example"],
  ["an oversized value", "a".repeat(2049)],
  ["spaces", "a b"],
])("a stored hint with %s is discarded: logout proceeds without a hint", async (_label, bad) => {
  localStorage.setItem("msLogoutHint", bad);
  await redirectToMicrosoftLogout();
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/pkce\/logout-urls$/);
  expect(assigned).toBe(LOGOUT_URL);
  expect(localStorage.getItem("msLogoutHint")).toBeNull();
});

test("withLogoutHint never adds the hint to a non-Entra URL (B2C, ProjectShell, http)", () => {
  expect(withLogoutHint(B2C_URL, "h1")).toBe(B2C_URL);
  expect(withLogoutHint("https://20.234.37.19:8443/user-service/pkce/logout-urls", "h1")).toBe(
    "https://20.234.37.19:8443/user-service/pkce/logout-urls",
  );
  expect(withLogoutHint("http://login.microsoftonline.com/dir/oauth2/v2.0/logout", "h1")).toBe(
    "http://login.microsoftonline.com/dir/oauth2/v2.0/logout",
  );
  expect(withLogoutHint("not a url", "h1")).toBe("not a url");
  expect(withLogoutHint("https://login.microsoftonline.com/dir/oauth2/v2.0/logout", "h1")).toBe(
    "https://login.microsoftonline.com/dir/oauth2/v2.0/logout?logout_hint=h1",
  );
});

test("a sign-in without a hint drops one left from an earlier session", () => {
  rememberMicrosoftLogoutHint("old-hint");
  rememberMicrosoftLogoutHint(undefined);
  expect(localStorage.getItem("msLogoutHint")).toBeNull();
});

test("backend failure still falls back to / and the hint is not reused", async () => {
  rememberMicrosoftLogoutHint("h1");
  global.fetch.mockResolvedValueOnce({ ok: false });
  await redirectToMicrosoftLogout();
  expect(assigned).toBe("/");
  expect(localStorage.getItem("msLogoutHint")).toBeNull();
  expect(logged()).not.toContain("h1");
});
