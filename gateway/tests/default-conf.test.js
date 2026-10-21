// Source-level checks for the DEV gateway site config (gateway/sites-enabled/default.conf).
// Zero dependencies — run with: node --test gateway/tests/default-conf.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const conf = fs.readFileSync(path.join(__dirname, "..", "sites-enabled", "default.conf"), "utf8");
// Ignore commented-out lines so a commented deny can't satisfy a test.
const active = conf
  .split("\n")
  .filter((l) => !l.trim().startsWith("#"))
  .join("\n");

const denyLocations = [...active.matchAll(/location\s*=\s*(\S+)\s*\{\s*return\s+404;\s*\}/g)].map((m) => m[1]);

test("1C-2A: exact-match 404 deny for legacy user-service register/login", () => {
  assert.ok(denyLocations.includes("/user-service/api/users/register"));
  assert.ok(denyLocations.includes("/user-service/api/users/login"));
});

test("0B-6 general-CRM denies are still present", () => {
  assert.ok(denyLocations.includes("/user-service/auth/general-crm/register"));
  assert.ok(denyLocations.includes("/user-service/auth/general-crm/login"));
});

test("no other path is denied (deny list is exactly the four legacy auth paths)", () => {
  assert.deepEqual([...denyLocations].sort(), [
    "/user-service/api/users/login",
    "/user-service/api/users/register",
    "/user-service/auth/general-crm/login",
    "/user-service/auth/general-crm/register",
  ]);
});

test("the denies are exact-match only, not prefix or regex locations", () => {
  assert.doesNotMatch(active, /location\s+(\^~|~\*?)\s*\/user-service\/api\/users/);
});

test("unrelated user-service locations still exist and the API still requires a JWT", () => {
  for (const prefix of ["/user-service/auth/", "/user-service/pkce/", "/user-service/api/"]) {
    assert.match(active, new RegExp(`location\\s+\\^~\\s+${prefix.replace(/\//g, "\\/")}\\s*\\{`));
  }
  const apiBlock = active.slice(active.indexOf("location ^~ /user-service/api/"));
  assert.match(apiBlock.slice(0, apiBlock.indexOf("\n    }")), /access_by_lua_file\s+\/etc\/nginx\/lua\/verify_jwt\.lua;/);
});

// ---------------------------------------------------------------- Azure B2C API connector route
const nginxConf = fs.readFileSync(path.join(__dirname, "..", "nginx.conf"), "utf8");
const verifyJwt = fs.readFileSync(path.join(__dirname, "..", "lua", "verify_jwt.lua"), "utf8");
function block(src, opener) {
  const i = src.indexOf(opener);
  if (i < 0) return null;
  let depth = 0;
  for (let j = src.indexOf("{", i); j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}" && --depth === 0) return src.slice(i, j + 1);
  }
  return null;
}

test("B2C connector: exactly one exact-match public location for POST /user-service/api/users/validate", () => {
  const hits = [...active.matchAll(/location\s+(=|\^~|~\*?)?\s*\/user-service\/api\/users\/validate\b/g)];
  assert.equal(hits.length, 1);
  assert.equal(hits[0][1], "=");
  const b = block(active, "location = /user-service/api/users/validate");
  assert.match(b, /limit_except\s+POST\s*\{\s*deny\s+all;\s*\}/);
  assert.match(b, /client_max_body_size\s+16k;/);
  assert.match(b, /limit_req\s+zone=b2c_connector\s+burst=\d+\s+nodelay;/);
  assert.match(b, /rewrite\s+\^\/user-service\/\(\.\*\)\$\s+\/\$1\s+break;/);
  assert.match(b, /proxy_pass\s+http:\/\/user-service:5001;/);
  assert.match(b, /proxy_set_header\s+Authorization\s+\$http_authorization;/);
  // No JWT script and no own access phase: the server-level trusted-header strip applies.
  assert.doesNotMatch(b, /access_by_lua/);
  // Nothing in it forwards a client-supplied trusted header.
  assert.doesNotMatch(b, /\$http_x_(tenant_id|internal_request|jwt_verified|auth_source|user_)/);
});

test("B2C connector: dedicated rate-limit zone is defined", () => {
  assert.match(nginxConf, /limit_req_zone\s+\$binary_remote_addr\s+zone=b2c_connector:\d+m\s+rate=\d+r\/s;/);
});

test("the only non-404 exact-match /user-service/api/ location is the B2C connector (the rest stays JWT-protected)", () => {
  const exact = [...active.matchAll(/location\s*=\s*(\/user-service\/api\/\S+)\s*\{/g)].map((m) => m[1]);
  const public_ = exact.filter((p) => !denyLocations.includes(p));
  assert.deepEqual(public_, ["/user-service/api/users/validate"]);
});

test("verify_jwt.lua: the dead /api/profile/validate bypass is gone (profile validation is not public)", () => {
  const code = verifyJwt.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(code, /validate/);
  assert.doesNotMatch(active, /location\s+[=~^]*\s*\/profile-service\/api\/profile\/validate/);
});
