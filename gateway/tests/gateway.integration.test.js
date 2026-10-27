// Real-OpenResty integration tests for the DEV gateway (gateway/nginx.conf, sites-enabled/default.conf,
// lua/*.lua - the tracked files, mounted read-only). Every upstream is a local echo server
// (integration/echo-upstream.js) that records exactly what reached it. Needs Docker; nothing here
// touches a real environment. All secrets are random per run.
//
// Run: GATEWAY_IT=1 node --test gateway/tests/gateway.integration.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");
const crypto = require("crypto");
const https = require("https");
const http = require("http");
const path = require("path");

const RUN = process.env.GATEWAY_IT === "1";
const GW = process.env.GATEWAY_IT_DIR || path.join(__dirname, ".."); // override only to run against another copy (e.g. the live baseline)
const ID = crypto.randomBytes(4).toString("hex");
const NET = `psgw-it-${ID}`;
const ECHO = `psgw-echo-${ID}`;
const GATE = `psgw-gw-${ID}`;
const IMAGE = "projectshell-gateway-it:openresty-1.25.3.1-focal";
const JWT_SECRET = crypto.randomBytes(32).toString("hex"); // test-only
const NOTIFIER_APP_ID = crypto.randomUUID(); // test-only; configured, yet must not be accepted
const ALIASES = ["user-service", "portal-service", "subscription-service", "profile-service", "account-service", "communication-service", "notification-service", "n8n", "rabbitmq", "reporting-service", "audit-service", "events-service", "issue-service"];

const TRUSTED = ["x-jwt-verified", "x-auth-source", "x-user-id", "x-tenant-id", "x-user-email", "x-user-type", "x-user-roles", "x-user-permissions", "x-token-expires-at", "x-service-caller", "x-gateway-signature", "x-gateway-timestamp", "x-service-secret", "x-internal-request"];
const TENANT_A = "68c6ad231ae58311ab99aaaa";
const TENANT_B = "6acd6119b28a863c61361bbb";
const USER_A = "6ab3fbeb0000000000000aaa";
const USER_B = "6ace0cca0000000000000bbb";
const SPOOF = {
  "x-jwt-verified": "true",
  "x-auth-source": "gateway",
  "x-user-id": USER_B,
  "x-tenant-id": TENANT_B,
  "x-user-email": "victim@example.test",
  "x-user-type": "CRM",
  "x-user-roles": '["SU"]',
  "x-user-permissions": '["*"]',
  "x-token-expires-at": "99999999999999",
  "x-service-caller": "system.notifier",
  "x-gateway-signature": "spoof",
  "x-gateway-timestamp": "1",
  "x-service-secret": "spoof",
  "x-internal-request": "true",
};

const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
function hs256(payload, secret = JWT_SECRET, header = { alg: "HS256", typ: "JWT" }) {
  const h = b64(header), p = b64(payload);
  return `${h}.${p}.${crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url")}`;
}
const { privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
function rs256(payload) {
  const h = b64({ alg: "RS256", typ: "JWT", kid: "test" }), p = b64(payload);
  return `${h}.${p}.${crypto.sign("RSA-SHA256", Buffer.from(`${h}.${p}`), privateKey).toString("base64url")}`;
}
const now = () => Math.floor(Date.now() / 1000);
const claims = (extra = {}) => ({ id: USER_A, tenantId: TENANT_A, userType: "CRM", email: "a@example.test", roles: ["REO"], permissions: ["tenant:read"], iat: now(), exp: now() + 600, ...extra });

let gwPort, ctlPort;
function request(method, urlPath, headers = {}, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ host: "127.0.0.1", port: gwPort, method, path: urlPath, rejectUnauthorized: false, servername: "projectshell-vm.northeurope.cloudapp.azure.com", headers: { host: "projectshell-vm.northeurope.cloudapp.azure.com", ...headers } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}
async function call(method, urlPath, headers, body) {
  for (let i = 0; i < 20; i++) {
    const r = await request(method, urlPath, headers, body);
    if (r.status !== 503) return r; // limit_req (5 r/s, burst 50) - pace and retry
    await new Promise((s) => setTimeout(s, 400));
  }
  throw new Error("rate limited");
}
function received() {
  return new Promise((resolve, reject) => {
    http.get({ host: "127.0.0.1", port: ctlPort, path: "/__requests" }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    }).on("error", reject);
  });
}
let n = 0;
const u = (p) => `${p}${p.includes("?") ? "&" : "?"}it=${++n}`; // unique URL: no proxy_cache reuse
const bearer = (t) => ({ authorization: `Bearer ${t}` });

/** One request; returns the single upstream request it produced (or null). */
async function through(method, urlPath, headers = {}, body) {
  await received(); // clear
  const res = await call(method, u(urlPath), { "x-correlation-id": `it-corr-${n + 1}`, ...headers }, body);
  const got = await received();
  return { res, up: got.length ? got[0] : null, count: got.length };
}
function assertNoTrusted(up, label) {
  for (const h of TRUSTED) assert.equal(up.headers[h], undefined, `${label}: ${h} must not reach the upstream`);
}

test.describe("gateway (real OpenResty, tracked config)", { skip: !RUN && "set GATEWAY_IT=1 (needs Docker)" }, () => {
  test.before(() => {
    sh("docker", ["build", "-q", "-t", IMAGE, path.join(__dirname, "integration")], { timeout: 600000 });
    sh("docker", ["network", "create", NET]);
    sh("docker", ["run", "-d", "--rm", "--name", ECHO, "--network", NET, ...ALIASES.flatMap((a) => ["--network-alias", a]), "-p", "127.0.0.1::9999", "-v", `${path.join(__dirname, "integration", "echo-upstream.js")}:/echo.js:ro`, "node:22-alpine", "node", "/echo.js"]);
    sh("docker", ["run", "-d", "--rm", "--name", GATE, "--network", NET, "-p", "127.0.0.1::443",
      "-e", `JWT_SECRET=${JWT_SECRET}`, "-e", `GATEWAY_VERIFY_SECRET=${crypto.randomBytes(16).toString("hex")}`, "-e", `NOTIFIER_APP_ID=${NOTIFIER_APP_ID}`,
      "-v", `${path.join(GW, "nginx.conf")}:/usr/local/openresty/nginx/conf/nginx.conf:ro`,
      "-v", `${path.join(GW, "sites-enabled")}:/etc/nginx/conf.d:ro`,
      "-v", `${path.join(GW, "lua")}:/etc/nginx/lua:ro`, IMAGE]);
    ctlPort = Number(sh("docker", ["port", ECHO, "9999/tcp"]).split(":").pop());
    gwPort = Number(sh("docker", ["port", GATE, "443/tcp"]).split(":").pop());
  });
  test.after(() => {
    for (const c of [GATE, ECHO]) try { sh("docker", ["rm", "-f", c]); } catch (_) {}
    try { sh("docker", ["network", "rm", NET]); } catch (_) {}
  });

  test("gateway config is valid and the gateway is up", async () => {
    for (let i = 0; i < 40; i++) {
      try { if ((await request("GET", "/health")).status === 200) break; } catch (_) {}
      await new Promise((s) => setTimeout(s, 250));
    }
    assert.match(sh("docker", ["exec", GATE, "openresty", "-t"], { stdio: ["ignore", "pipe", "pipe"] }) + "ok", /ok/);
    assert.equal((await request("GET", "/health")).status, 200);
  });

  // ---------------------------------------------------------------- normal ProjectShell JWT (1-7)
  test("1-7 normal API: spoofed trusted headers are replaced by the verified token's identity; internal tenantId forwarded", async () => {
    const { res, up } = await through("GET", "/user-service/api/roles", { ...SPOOF, ...bearer(hs256(claims())) });
    assert.equal(res.status, 200);
    assert.equal(up.headers["x-tenant-id"], TENANT_A);
    assert.equal(up.headers["x-user-id"], USER_A);
    assert.equal(up.headers["x-jwt-verified"], "true");
    assert.equal(up.headers["x-auth-source"], "gateway");
    assert.equal(up.headers["x-user-roles"], '["REO"]');
    assert.equal(up.headers["x-user-permissions"], '["tenant:read"]');
    assert.equal(up.headers["x-user-email"], "a@example.test");
    for (const h of ["x-internal-request", "x-service-caller", "x-gateway-signature", "x-gateway-timestamp", "x-service-secret"]) assert.equal(up.headers[h], undefined, h);
    assert.match(up.headers["x-correlation-id"], /^it-corr-/); // functional header untouched
  });

  test("every JWT-protected location forwards only the token's tenant (never a spoofed one)", async () => {
    const routes = ["/portal-service/api/x", "/subscription-service/api/v1/x", "/profile-service/api/x", "/account-service/api/x", "/communication-service/api/x", "/reporting-service/api/x", "/notification-service/api/x", "/audit-service/api/x", "/events-service/api/x", "/issue-service/api/x"];
    for (const r of routes) {
      const { res, up } = await through("GET", r, { ...SPOOF, ...bearer(hs256(claims())) });
      assert.equal(res.status, 200, r);
      assert.equal(up.headers["x-tenant-id"], TENANT_A, r);
      assert.equal(up.headers["x-user-id"], USER_A, r);
      assert.equal(up.headers["x-internal-request"], undefined, r);
    }
  });

  test("8 malformed tenantId is refused (401, nothing forwarded)", async () => {
    const bad = [TENANT_A.toUpperCase(), TENANT_A.slice(1), TENANT_A + "a", "68c6ad231ae58311ab99aaag", "", " " + TENANT_A.slice(1), "00000000-0000-0000-0000-0000000000aa", 12345, { $ne: null }, [TENANT_A], true];
    for (const tenantId of bad) {
      const { res, count } = await through("GET", "/user-service/api/roles", { ...SPOOF, ...bearer(hs256(claims({ tenantId }))) });
      assert.equal(res.status, 401, JSON.stringify(tenantId));
      assert.equal(count, 0, JSON.stringify(tenantId));
    }
  });

  test("9 missing tenantId (and missing id) is refused", async () => {
    const noTenant = claims(); delete noTenant.tenantId;
    const noId = claims(); delete noId.id;
    for (const p of [noTenant, noId, { ...claims(), tenantId: null }]) {
      const { res, count } = await through("GET", "/user-service/api/roles", { "x-tenant-id": TENANT_A, ...bearer(hs256(p)) });
      assert.equal(res.status, 401);
      assert.equal(count, 0);
    }
  });

  test("10 invalid signature / expired / not-yet-valid / alg none / no token are refused", async () => {
    const cases = [
      hs256(claims(), "wrong-secret"),
      hs256(claims({ exp: now() - 120 })),
      hs256(claims({ nbf: now() + 600 })),
      `${b64({ alg: "none", typ: "JWT" })}.${b64(claims())}.`,
      "not-a-jwt",
    ];
    for (const t of cases) {
      const { res, count } = await through("GET", "/user-service/api/roles", { ...SPOOF, ...bearer(t) });
      assert.equal(res.status, 401);
      assert.equal(count, 0);
    }
    const { res, count } = await through("GET", "/user-service/api/roles", SPOOF);
    assert.equal(res.status, 401);
    assert.equal(count, 0);
  });

  // ---------------------------------------------------------------- Microsoft RS256 (11-13, 14-17)
  test("11-13 delegated Microsoft RS256 token is rejected outright: no tenant from tid, no SU from an Entra role, no verifier call", async () => {
    const delegated = rs256({ iss: "https://login.microsoftonline.com/00000000-0000-0000-0000-0000000000aa/v2.0", aud: "api://backend", tid: "00000000-0000-0000-0000-0000000000aa", oid: "11111111-1111-1111-1111-111111111111", scp: "access_as_user", roles: ["SU"], preferred_username: "x@example.test", exp: now() + 600 });
    for (const r of ["/user-service/api/roles", "/audit-service/api/x", "/user-service/auth/logout", "/notification-service/api/x"]) {
      const { res, count } = await through(r.endsWith("logout") ? "POST" : "GET", r, { ...SPOOF, ...bearer(delegated) });
      assert.equal(res.status, 401, r);
      assert.equal(count, 0, `${r}: nothing (not even /api/internal/verify-ms-token) may be called`);
    }
  });

  test("14-17 app-only Microsoft tokens are rejected - including the configured NOTIFIER_APP_ID (path retired); no system identity, no tenant", async () => {
    const appOnly = (appid) => rs256({ iss: "https://login.microsoftonline.com/00000000-0000-0000-0000-0000000000aa/v2.0", aud: "api://backend", tid: "00000000-0000-0000-0000-0000000000aa", idtyp: "app", appid, roles: ["system.notifier"], exp: now() + 600 });
    for (const t of [appOnly(NOTIFIER_APP_ID), appOnly(crypto.randomUUID())]) {
      const { res, count } = await through("POST", "/notification-service/api/x", { ...bearer(t), "content-type": "application/json" }, "{}");
      assert.equal(res.status, 401);
      assert.equal(count, 0);
    }
  });

  test("the internal Microsoft verifier location no longer exists (not reachable, not even internally)", async () => {
    const { res, count } = await through("POST", "/_internal/verify-ms-token", { "content-type": "application/json" }, '{"token":"x"}');
    assert.equal(count, 0);
    assert.notEqual(res.status, 401); // falls to the gateway default location (no upstream)
  });

  // ---------------------------------------------------------------- public locations (18-20)
  test("18/20 /user-service/auth/ callbacks stay public and spoofed trusted headers are stripped", async () => {
    for (const p of ["/user-service/auth/azure-crm", "/user-service/auth/azure-portal", "/user-service/auth/refresh"]) {
      const { res, up } = await through("POST", p, { ...SPOOF, "content-type": "application/json" }, "{}");
      assert.equal(res.status, 200, p);
      assert.equal(up.port, 5001);
      assert.ok(up.url.startsWith(p.replace("/user-service", "")), p);
      assertNoTrusted(up, p);
      assert.match(up.headers["x-correlation-id"], /^it-corr-/);
    }
  });

  test("19/20 /user-service/pkce/generate stays public, trusted headers stripped, X-Real-IP is the gateway's peer (not client-supplied)", async () => {
    const { res, up } = await through("GET", "/user-service/pkce/generate?tenant=MULTIAUTH", { ...SPOOF, "x-real-ip": "203.0.113.9" });
    assert.equal(res.status, 200);
    assert.ok(up.url.startsWith("/pkce/generate?tenant=MULTIAUTH"));
    assertNoTrusted(up, "pkce");
    assert.notEqual(up.headers["x-real-ip"], "203.0.113.9");
  });

  test("20 every other no-JWT location strips spoofed trusted headers (webhook, Socket.IO, n8n, rabbitmq, audit health)", async () => {
    const cases = [
      ["POST", "/account-service/api/webhook/stripe", 4000],
      ["GET", "/notification-service/api/socket.io/?EIO=4&transport=polling", 4010],
      ["GET", "/n8n/", 5678, { authorization: "Basic " + Buffer.from("it:it").toString("base64") }], // behind auth_basic (test-only htpasswd)
      ["GET", "/n8n/static/x.js", 5678], ["GET", "/n8n/assets/x.js", 5678],
      ["GET", "/rabbitmq/", 15672],
      ["GET", "/audit-service/health", 4006],
    ];
    for (const [m, p, port, extra] of cases) {
      const { up } = await through(m, p, { ...SPOOF, "content-type": "application/json", ...(extra || {}) }, m === "POST" ? "{}" : undefined);
      assert.ok(up, `${p} should reach its upstream`);
      assert.equal(up.port, port, p);
      assertNoTrusted(up, p);
    }
  });

  // ---------------------------------------------------------------- logout (21-24)
  test("Phase B Z1: client x-platform-* headers never reach an upstream (any case, any suffix, after many headers); x-correlation-id kept", async () => {
    const PLATFORM = { "x-platform-principal": "6a0000000000000000000a01", "X-Platform-Permissions": '["platform:tenant:create"]', "X-PLATFORM-TARGET-TENANT": TENANT_B, "x-Platform-Auth": "true" };
    const filler = Object.fromEntries(Array.from({ length: 150 }, (_, i) => [`x-filler-${i}`, "1"]));
    const cases = [
      ["GET", "/user-service/api/roles", { ...SPOOF, ...PLATFORM, ...bearer(hs256(claims({ plat: { v: 1, pid: "6a0000000000000000000a01", rev: 1 } }))) }],
      // Authorization first: verify_jwt.lua reads the default first 100 headers (beyond that it fails closed, 401).
      ["GET", "/user-service/api/roles", { ...bearer(hs256(claims())), ...filler, ...PLATFORM }],
      ["POST", "/user-service/auth/azure-crm", { ...SPOOF, ...PLATFORM, "content-type": "application/json" }, "{}"],
      ["GET", "/user-service/pkce/generate?tenant=MULTIAUTH", { ...filler, ...PLATFORM }],
    ];
    for (const [m, p, h, body] of cases) {
      const { res, up } = await through(m, p, h, body);
      assert.ok(up, `${p} reached upstream (gateway status ${res.status}, filler=${"x-filler-0" in h}, jwt=${!!h.authorization})`);
      const left = Object.keys(up.headers).filter((k) => k.toLowerCase().startsWith("x-platform-"));
      assert.deepEqual(left, [], `${p}: x-platform-* must not reach the upstream`);
      assert.ok(up.headers["x-correlation-id"], `${p}: x-correlation-id kept`);
      if (!h.authorization) assertNoTrusted(up, p); // JWT locations: verify_jwt.lua sets the verified values
      else assert.equal(up.headers["x-tenant-id"], TENANT_A, `${p}: tenant from the verified token only`);
    }
  });

  test("21 logout with no token -> 401, user-service never called", async () => {
    const { res, count } = await through("POST", "/user-service/auth/logout", { "content-type": "application/json" }, "{}");
    assert.equal(res.status, 401);
    assert.equal(count, 0);
  });

  test("22 logout with spoofed gateway headers and no valid JWT -> 401", async () => {
    for (const h of [SPOOF, { ...SPOOF, ...bearer(hs256(claims(), "wrong-secret")) }, { ...SPOOF, ...bearer("garbage") }]) {
      const { res, count } = await through("POST", "/user-service/auth/logout", { ...h, "content-type": "application/json" }, "{}");
      assert.equal(res.status, 401);
      assert.equal(count, 0);
    }
  });

  test("23 logout with a valid ProjectShell JWT reaches user-service /auth/logout with that user's verified identity", async () => {
    const { res, up } = await through("POST", "/user-service/auth/logout", { ...bearer(hs256(claims())), "content-type": "application/json" }, "{}");
    assert.equal(res.status, 200);
    assert.equal(up.port, 5001);
    assert.ok(up.url.startsWith("/auth/logout"));
    assert.equal(up.headers["x-user-id"], USER_A);
    assert.equal(up.headers["x-tenant-id"], TENANT_A);
    assert.equal(up.headers["x-auth-source"], "gateway");
    assert.ok(up.headers.authorization.startsWith("Bearer "));
  });

  test("24 a valid JWT for user A cannot nominate user/tenant B through headers", async () => {
    const { up } = await through("POST", "/user-service/auth/logout", { ...SPOOF, ...bearer(hs256(claims())), "content-type": "application/json" }, "{}");
    assert.equal(up.headers["x-user-id"], USER_A);
    assert.equal(up.headers["x-tenant-id"], TENANT_A);
    assert.equal(up.headers["x-user-roles"], '["REO"]');
    assert.equal(up.headers["x-internal-request"], undefined);
  });

  test("logout path variants that miss the exact location (trailing slash, case) still carry NO trusted headers", async () => {
    for (const p of ["/user-service/auth/logout/", "/user-service/auth/LOGOUT", "/user-service/auth/Logout"]) {
      const { up } = await through("POST", p, { ...SPOOF, "content-type": "application/json" }, "{}");
      assert.ok(up, p);
      assertNoTrusted(up, p); // user-service then falls back to verifying the Bearer itself
    }
  });

  test("CORS preflight on logout still answers 204 without a token", async () => {
    const { res, count } = await through("OPTIONS", "/user-service/auth/logout", { origin: "https://project-shell-crm-dev.vercel.app", "access-control-request-method": "POST" });
    assert.equal(res.status, 204);
    assert.equal(count, 0);
    assert.equal(res.headers["access-control-allow-origin"], "https://project-shell-crm-dev.vercel.app");
  });

  test("legacy denies unchanged (404 at the gateway)", async () => {
    for (const p of ["/user-service/auth/general-crm/login", "/user-service/auth/general-crm/register", "/user-service/api/users/login", "/user-service/api/users/register"]) {
      const { res, count } = await through("POST", p, { "content-type": "application/json" }, "{}");
      assert.equal(res.status, 404, p);
      assert.equal(count, 0, p);
    }
  });

  // ---------------------------------------------------------------- Azure B2C API connector
  const BASIC = { authorization: `Basic ${Buffer.from("b2c-test-user:test-only-password").toString("base64")}` };
  const B2C_BODY = JSON.stringify({ email: "new.member@example.test", client_id: "00000000-0000-0000-0000-00000000b2c0", step: "PostAttributeCollection" });
  const JSON_CT = { "content-type": "application/json" };

  test("B2C connector: POST reaches user-service /api/users/validate without a ProjectShell JWT; Basic auth forwarded; spoofed trusted headers stripped", async () => {
    const { res, up, count } = await through("POST", "/user-service/api/users/validate", { ...SPOOF, ...BASIC, ...JSON_CT }, B2C_BODY);
    assert.equal(res.status, 200);
    assert.equal(count, 1);
    assert.equal(up.port, 5001);
    assert.match(up.url, /^\/api\/users\/validate\?it=\d+$/);
    assert.equal(up.headers.authorization, BASIC.authorization); // user-service does the Basic check
    assertNoTrusted(up, "b2c connector");
  });

  test("B2C connector: no or wrong Basic credentials are still passed to user-service (which rejects them), never trusted headers", async () => {
    for (const auth of [{}, { authorization: "Basic d3Jvbmc6d3Jvbmc=" }, bearer(hs256(claims()))]) {
      const { res, up } = await through("POST", "/user-service/api/users/validate", { ...SPOOF, ...auth, ...JSON_CT }, B2C_BODY);
      assert.equal(res.status, 200);
      assertNoTrusted(up, JSON.stringify(Object.keys(auth))); // even a valid JWT sets no identity here
    }
  });

  test("B2C connector: only POST (GET/PUT/DELETE/PATCH -> 403, nothing forwarded)", async () => {
    for (const m of ["GET", "PUT", "DELETE", "PATCH"]) {
      const { res, count } = await through(m, "/user-service/api/users/validate", { ...BASIC, ...JSON_CT }, m === "GET" ? undefined : B2C_BODY);
      assert.equal(res.status, 403, m);
      assert.equal(count, 0, m);
    }
  });

  test("B2C connector: oversized body -> 413, nothing forwarded", async () => {
    const big = JSON.stringify({ email: "x@example.test", pad: "a".repeat(20 * 1024) });
    const { res, count } = await through("POST", "/user-service/api/users/validate", { ...BASIC, ...JSON_CT }, big);
    assert.equal(res.status, 413);
    assert.equal(count, 0);
  });

  test("B2C connector is exact: neighbouring user-service paths without a JWT stay 401", async () => {
    for (const p of ["/user-service/api/users/validate/", "/user-service/api/users/VALIDATE", "/user-service/api/users/validatex", "/user-service/api/users", "/user-service/api/users/validate/../me", "/user-service/api/me"]) {
      const { res, count } = await through("POST", p, { ...SPOOF, ...BASIC, ...JSON_CT }, B2C_BODY);
      assert.equal(res.status, 401, p);
      assert.equal(count, 0, p);
    }
  });

  test("profile-service validate is not public: 401 without a JWT; with a JWT no internal/trusted headers from the client", async () => {
    const anon = await through("POST", "/profile-service/api/profile/validate", { ...SPOOF, ...BASIC, ...JSON_CT }, B2C_BODY);
    assert.equal(anon.res.status, 401);
    assert.equal(anon.count, 0);
    const withJwt = await through("POST", "/profile-service/api/profile/validate", { ...SPOOF, ...bearer(hs256(claims())), ...JSON_CT }, B2C_BODY);
    assert.equal(withJwt.up.headers["x-internal-request"], undefined); // profile-service then refuses (not internal)
    assert.equal(withJwt.up.headers["x-tenant-id"], TENANT_A);
  });

  test("B2C connector: dedicated rate limit (burst beyond the zone -> 503)", async () => {
    await new Promise((s) => setTimeout(s, 3000)); // drain the zone used by the tests above
    await received();
    const rs = await Promise.all(Array.from({ length: 60 }, () => request("POST", "/user-service/api/users/validate", { ...BASIC, ...JSON_CT }, B2C_BODY)));
    const limited = rs.filter((r) => r.status === 503).length;
    assert.ok(limited > 0, "some requests rate-limited");
    assert.ok(rs.filter((r) => r.status === 200).length >= 20, "burst allowance served");
    await new Promise((s) => setTimeout(s, 3000)); // let the zone drain
  });

});
