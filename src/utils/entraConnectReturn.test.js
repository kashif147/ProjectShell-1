import {
  CONNECT_RETURN_KEY,
  CONNECT_RETURN_MAX_AGE_MS,
  saveConnectReturn,
  takeConnectReturn,
} from "./entraConnectReturn";

const T = "68cbf7806080b4621d469d34";
const C = "68cbf7806080b4621d469d35";
const NOW = 1_800_000_000_000;
const raw = () => sessionStorage.getItem(CONNECT_RETURN_KEY);
const put = (note) => sessionStorage.setItem(CONNECT_RETURN_KEY, typeof note === "string" ? note : JSON.stringify(note));

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

test("the note holds only tenantId, connectionId and startedAt", () => {
  saveConnectReturn({ tenantId: T, connectionId: C }, NOW);
  expect(JSON.parse(raw())).toEqual({ tenantId: T, connectionId: C, startedAt: NOW });
  expect(Object.keys(JSON.parse(raw())).sort()).toEqual(["connectionId", "startedAt", "tenantId"]);
  expect(localStorage.length).toBe(0); // nothing in localStorage
});

test("a fresh note and a non-sign-in state route to Connect, and the note is consumed", () => {
  saveConnectReturn({ tenantId: T, connectionId: C }, NOW);
  expect(takeConnectReturn({ returnedState: "connect-state", signInState: "signin-state", now: NOW + 1000 })).toEqual({ tenantId: T, connectionId: C });
  expect(raw()).toBeNull();
  // single-use: the same callback cannot be routed twice
  expect(takeConnectReturn({ returnedState: "connect-state", signInState: "signin-state", now: NOW + 2000 })).toBeNull();
});

test("absent note -> not a Connect callback", () => {
  expect(takeConnectReturn({ returnedState: "connect-state", signInState: "signin-state", now: NOW })).toBeNull();
});

test("stale note (older than 10 minutes) -> not a Connect callback, and discarded", () => {
  saveConnectReturn({ tenantId: T, connectionId: C }, NOW);
  expect(takeConnectReturn({ returnedState: "s", signInState: null, now: NOW + CONNECT_RETURN_MAX_AGE_MS + 1 })).toBeNull();
  expect(raw()).toBeNull();
});

test("exactly 10 minutes old is still accepted", () => {
  saveConnectReturn({ tenantId: T, connectionId: C }, NOW);
  expect(takeConnectReturn({ returnedState: "s", signInState: null, now: NOW + CONNECT_RETURN_MAX_AGE_MS })).not.toBeNull();
});

test.each([
  ["not JSON", "{not json"],
  ["missing tenantId", { connectionId: C, startedAt: NOW }],
  ["missing connectionId", { tenantId: T, startedAt: NOW }],
  ["missing startedAt", { tenantId: T, connectionId: C }],
  ["startedAt not a number", { tenantId: T, connectionId: C, startedAt: "yesterday" }],
  ["startedAt in the future", { tenantId: T, connectionId: C, startedAt: NOW + 5 * 60 * 1000 }],
  ["tenantId not an id", { tenantId: "../../users", connectionId: C, startedAt: NOW }],
  ["connectionId not an id", { tenantId: T, connectionId: "x/../../disconnect", startedAt: NOW }],
  ["array", [T, C, NOW]],
  ["null", "null"],
])("malformed note (%s) -> never routes to Connect, and is discarded", (_label, note) => {
  put(note);
  expect(takeConnectReturn({ returnedState: "connect-state", signInState: "signin-state", now: NOW })).toBeNull();
  expect(raw()).toBeNull();
});

test("the returned state equal to the ordinary sign-in state -> ordinary sign-in (note left alone)", () => {
  saveConnectReturn({ tenantId: T, connectionId: C }, NOW);
  expect(takeConnectReturn({ returnedState: "signin-state", signInState: "signin-state", now: NOW })).toBeNull();
  expect(raw()).not.toBeNull();
});

test("no returned state -> not a Connect callback", () => {
  saveConnectReturn({ tenantId: T, connectionId: C }, NOW);
  expect(takeConnectReturn({ returnedState: null, signInState: null, now: NOW })).toBeNull();
});
