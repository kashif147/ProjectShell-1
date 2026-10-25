import fs from "fs";
import path from "path";
import { io } from "socket.io-client";
import {
  disconnectRealtimeSocket,
  getNotificationServiceUrl,
  getNotificationSocketConfig,
  getRealtimeSocket,
  resolveNotificationServiceUrl,
} from "./realtimeSocket";

// Synthetic hosts only - no real environment is named in this file.
const NOTIF = "https://notif.example.test/notification-service/api";
const GATEWAY = "https://gw.example.test";

jest.mock("socket.io-client", () => ({ io: jest.fn() }));

const ENV_KEYS = ["REACT_APP_NOTIFICATION_SERVICE_URL", "REACT_APP_GATEWAY_URL"];
const savedEnv = {};
let warnSpy;
beforeEach(() => {
  ENV_KEYS.forEach((k) => {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  });
  disconnectRealtimeSocket();
  io.mockReset();
  io.mockImplementation(() => ({ on: jest.fn(), off: jest.fn(), disconnect: jest.fn() }));
  localStorage.clear();
  warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  ENV_KEYS.forEach((k) => {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  });
  warnSpy.mockRestore();
});

test("a valid notification-service URL is used directly", () => {
  expect(resolveNotificationServiceUrl(NOTIF, GATEWAY)).toBe(NOTIF);
  expect(resolveNotificationServiceUrl(`  ${NOTIF}  `, undefined)).toBe(NOTIF);
});

test("notification URL absent + valid gateway URL -> gateway origin + /notification-service/api", () => {
  expect(resolveNotificationServiceUrl(undefined, GATEWAY)).toBe(`${GATEWAY}/notification-service/api`);
  expect(resolveNotificationServiceUrl("", "https://gw.example.test:9443/any/path/")).toBe(
    "https://gw.example.test:9443/notification-service/api",
  );
});

test.each([
  ["not a url"],
  ["ftp://notif.example.test/notification-service/api"],
  ["https://notif.example.test/other-service/api"],
  ["https://user:pass@notif.example.test/notification-service/api"],
  ["/notification-service/api"],
])("invalid notification URL %p + valid gateway URL -> derived from the gateway", (bad) => {
  expect(resolveNotificationServiceUrl(bad, GATEWAY)).toBe(`${GATEWAY}/notification-service/api`);
});

test.each([
  [undefined, undefined],
  ["", ""],
  ["not a url", "also not a url"],
  ["https://notif.example.test/other-service/api", "data:text/plain,gw"],
  [undefined, "https://user:pass@gw.example.test"],
])("both missing/invalid (%p, %p) -> null", (n, g) => {
  expect(resolveNotificationServiceUrl(n, g)).toBeNull();
});

test("env wiring: the helpers read REACT_APP_NOTIFICATION_SERVICE_URL, then REACT_APP_GATEWAY_URL", () => {
  process.env.REACT_APP_GATEWAY_URL = GATEWAY;
  expect(getNotificationServiceUrl()).toBe(`${GATEWAY}/notification-service/api`);
  expect(getNotificationSocketConfig()).toEqual({
    origin: GATEWAY,
    path: "/notification-service/api/socket.io",
  });
  process.env.REACT_APP_NOTIFICATION_SERVICE_URL = NOTIF;
  expect(getNotificationSocketConfig()).toEqual({
    origin: "https://notif.example.test",
    path: "/notification-service/api/socket.io",
  });
});

test("nothing configured -> no socket config, no connection attempt, one non-sensitive warning", () => {
  localStorage.setItem("token", "synthetic.token.marker");
  expect(getNotificationServiceUrl()).toBeNull();
  expect(getNotificationSocketConfig()).toBeNull();
  expect(getRealtimeSocket()).toBeNull();
  expect(getRealtimeSocket()).toBeNull();
  expect(io).not.toHaveBeenCalled();
  const messages = warnSpy.mock.calls.map((c) => c.join(" "));
  expect(messages.length).toBeLessThanOrEqual(1);
  messages.forEach((m) => expect(m).not.toContain("synthetic.token.marker"));
});

test("no environment-specific socket fallback remains in CRM source (no :8443, no gateway hostname)", () => {
  const src = path.join(__dirname, "..");
  const offenders = [];
  (function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (/\.(js|jsx|ts|tsx)$/.test(name) && !/\.test\.(js|jsx|ts|tsx)$/.test(name)) {
        if (fs.readFileSync(p, "utf8").includes(":8443")) offenders.push(path.relative(src, p));
      }
    }
  })(src);
  expect(offenders).toEqual([]);
  const socketSource = fs.readFileSync(path.join(__dirname, "realtimeSocket.js"), "utf8");
  expect(socketSource).not.toMatch(/cloudapp\.azure\.com/);
});
