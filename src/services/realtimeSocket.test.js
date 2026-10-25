import { io } from "socket.io-client";
import {
  disconnectRealtimeSocket,
  getRealtimeSocket,
  notificationSocketAuth,
  subscribeRealtimeSocketEvent,
} from "./realtimeSocket";

// Synthetic values only.
const TOKEN_A = "synthetic.token-A.marker";
const TOKEN_B = "synthetic.token-B.marker";

jest.mock("socket.io-client", () => ({ io: jest.fn() }));
const sockets = [];

// The socket only connects when a notification-service URL is configured (no built-in host).
const savedNotificationUrl = process.env.REACT_APP_NOTIFICATION_SERVICE_URL;
beforeAll(() => {
  process.env.REACT_APP_NOTIFICATION_SERVICE_URL = "https://notif.example.test/notification-service/api";
});
afterAll(() => {
  if (savedNotificationUrl === undefined) delete process.env.REACT_APP_NOTIFICATION_SERVICE_URL;
  else process.env.REACT_APP_NOTIFICATION_SERVICE_URL = savedNotificationUrl;
});

let consoleSpies;
beforeEach(() => {
  disconnectRealtimeSocket();
  io.mockReset();
  // CRA resets mock implementations before each test, so it is (re)installed here.
  io.mockImplementation(() => {
    const s = { on: jest.fn(), off: jest.fn(), disconnect: jest.fn() };
    sockets.push(s);
    return s;
  });
  localStorage.clear();
  consoleSpies = ["log", "info", "warn", "error", "debug"].map((fn) => jest.spyOn(console, fn).mockImplementation(() => {}));
});
afterEach(() => consoleSpies.forEach((s) => s.mockRestore()));

const authOf = (opts) => {
  let sent;
  opts.auth((data) => (sent = data));
  return sent;
};

test("1/5 no query token is passed to io(); nothing token-shaped outside auth", () => {
  localStorage.setItem("token", TOKEN_A);
  getRealtimeSocket();
  expect(io).toHaveBeenCalledTimes(1);
  const [origin, opts] = io.mock.calls[0];
  expect(opts).not.toHaveProperty("query");
  expect(origin).not.toContain(TOKEN_A);
  expect(opts.path).not.toContain(TOKEN_A);
  expect(JSON.stringify({ ...opts, auth: undefined })).not.toContain(TOKEN_A);
  // existing path / transport preserved
  expect(opts.path).toMatch(/\/notification-service\/api\/socket\.io$/);
  expect(opts.transports).toEqual(["websocket"]);
});

test("2/3 auth is a function that returns the CURRENT token", () => {
  localStorage.setItem("token", TOKEN_A);
  getRealtimeSocket();
  const opts = io.mock.calls[0][1];
  expect(typeof opts.auth).toBe("function");
  expect(authOf(opts)).toEqual({ token: TOKEN_A });
});

test("4 a changed token is picked up on the next (re)connection - never captured once", () => {
  localStorage.setItem("token", TOKEN_A);
  getRealtimeSocket();
  const opts = io.mock.calls[0][1];
  expect(authOf(opts)).toEqual({ token: TOKEN_A });
  localStorage.setItem("token", TOKEN_B); // e.g. a new sign-in
  expect(authOf(opts)).toEqual({ token: TOKEN_B }); // what a reconnect would send
  localStorage.removeItem("token");
  expect(authOf(opts)).toEqual({ token: "" }); // signed out: an empty token the server refuses
});

test("6 no token -> no authenticated socket is created", () => {
  expect(getRealtimeSocket()).toBeNull();
  expect(io).not.toHaveBeenCalled();
  expect(subscribeRealtimeSocketEvent("notification", jest.fn())()).toBeUndefined();
  expect(io).not.toHaveBeenCalled();
});

test("7 logout: disconnect closes the shared socket; with no token a later call does not reconnect", () => {
  localStorage.setItem("token", TOKEN_A);
  const s = getRealtimeSocket();
  localStorage.removeItem("token");
  expect(getRealtimeSocket()).toBeNull(); // token gone -> disconnected, not reused
  expect(s.disconnect).toHaveBeenCalledTimes(1);
  expect(io).toHaveBeenCalledTimes(1);
});

test("8 events: subscribe/unsubscribe on the one shared socket unchanged", () => {
  localStorage.setItem("token", TOKEN_A);
  const handler = jest.fn();
  const off = subscribeRealtimeSocketEvent("notification", handler);
  const s = sockets[sockets.length - 1];
  expect(s.on).toHaveBeenCalledWith("notification", handler);
  off();
  expect(s.off).toHaveBeenCalledWith("notification", handler);
  expect(getRealtimeSocket()).toBe(s); // still one shared socket
  expect(io).toHaveBeenCalledTimes(1);
});

test("9 the token is never logged", () => {
  localStorage.setItem("token", TOKEN_A);
  const opts = (getRealtimeSocket(), io.mock.calls[0][1]);
  authOf(opts);
  const logged = consoleSpies.flatMap((s) => s.mock.calls).flat().map(String).join(" ");
  expect(logged).not.toContain(TOKEN_A);
});

test("10 REST auth is untouched: the stored token is only read, never changed", () => {
  localStorage.setItem("token", TOKEN_A);
  getRealtimeSocket();
  authOf(io.mock.calls[0][1]);
  expect(localStorage.getItem("token")).toBe(TOKEN_A);
});

test("the exported auth helper reads storage at call time", () => {
  const sent = [];
  localStorage.setItem("token", TOKEN_A);
  notificationSocketAuth((d) => sent.push(d.token));
  localStorage.setItem("token", TOKEN_B);
  notificationSocketAuth((d) => sent.push(d.token));
  expect(sent).toEqual([TOKEN_A, TOKEN_B]);
});

test("finance pages: every notification io() call uses the shared auth function and no query token", () => {
  const fs = require("fs");
  const path = require("path");
  for (const page of ["Import.js", "Deductions.js", "StandingOrders.js"]) {
    const src = fs.readFileSync(path.join(__dirname, "../pages/finance", page), "utf8");
    const call = src.slice(src.indexOf("io(origin"), src.indexOf("});", src.indexOf("io(origin")));
    expect(call).toContain("auth: notificationSocketAuth");
    expect(call).not.toMatch(/query\s*:/);
    expect(call).not.toMatch(/auth:\s*\{\s*token/);
  }
});
