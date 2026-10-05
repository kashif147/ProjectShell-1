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
