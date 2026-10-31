import { redirectToMicrosoftLogout, rememberMicrosoftLogoutHint } from "./microsoftLogout";

const LOGOUT_URL = "https://login.microsoftonline.com/dir/oauth2/v2.0/logout?post_logout_redirect_uri=x";
let assigned;

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
    json: async () => ({ azureADLogoutUrl: LOGOUT_URL }),
  });
});

test("a remembered hint is sent to /pkce/logout-urls once, then forgotten", async () => {
  rememberMicrosoftLogoutHint("O.abc_12+/=");
  await redirectToMicrosoftLogout();
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/pkce\/logout-urls\?logoutHint=O.abc_12%2B%2F%3D$/);
  expect(assigned).toBe(LOGOUT_URL);
  expect(localStorage.getItem("msLogoutHint")).toBeNull();

  await redirectToMicrosoftLogout();
  expect(global.fetch.mock.calls[1][0]).toMatch(/\/pkce\/logout-urls$/);
});

test("no hint: unchanged request", async () => {
  await redirectToMicrosoftLogout();
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/pkce\/logout-urls$/);
  expect(assigned).toBe(LOGOUT_URL);
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
});
