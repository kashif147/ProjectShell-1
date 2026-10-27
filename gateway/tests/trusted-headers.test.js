// Source-level checks: trusted-header stripping covers every location, Microsoft RS256 is retired, and
// the tenant boundary is only a verified ProjectShell tenantId. Zero dependencies:
//   node --test gateway/tests/trusted-headers.test.js
// Behaviour against real OpenResty: gateway.integration.test.js (GATEWAY_IT=1).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const read = (f) => fs.readFileSync(path.join(__dirname, "..", f), "utf8");
const stripComments = (s, marker) => s.split("\n").filter((l) => !l.trim().startsWith(marker)).join("\n");
const lua = stripComments(read("lua/verify_jwt.lua"), "--");
const module_ = stripComments(read("lua/trusted_headers.lua"), "--");
const conf = stripComments(read("sites-enabled/default.conf"), "#");

const REQUIRED = ["x-tenant-id", "x-jwt-verified", "x-auth-source", "x-user-id", "x-user-roles", "x-internal-request"];
const headersBlock = module_.slice(module_.indexOf("M.HEADERS"), module_.indexOf("}", module_.indexOf("M.HEADERS")));
const listed = [...headersBlock.matchAll(/"(x-[a-z-]+)"/g)].map((m) => m[1]);

/** Location blocks of the TLS server, with their bodies (brace-matched). */
function locations() {
  const tls = conf.slice(conf.indexOf("listen 443"));
  const out = [];
  const re = /location\s+([^{]+?)\s*\{/g;
  let m;
  while ((m = re.exec(tls))) {
    let depth = 1, i = re.lastIndex;
    while (depth && i < tls.length) { if (tls[i] === "{") depth++; else if (tls[i] === "}") depth--; i++; }
    out.push({ name: m[1].trim(), body: tls.slice(re.lastIndex, i - 1) });
    re.lastIndex = i;
  }
  return out;
}

test("the shared list holds every trusted header (incl. the six required) exactly once", () => {
  for (const h of REQUIRED) assert.ok(listed.includes(h), h);
  assert.equal(new Set(listed).size, listed.length);
  assert.deepEqual([...listed].sort(), ["x-auth-source", "x-gateway-signature", "x-gateway-timestamp", "x-internal-request", "x-jwt-verified", "x-service-caller", "x-service-secret", "x-tenant-id", "x-token-expires-at", "x-user-email", "x-user-id", "x-user-permissions", "x-user-roles", "x-user-type"]);
  assert.doesNotMatch(module_, /x-correlation-id|authorization|x-real-ip/i); // functional headers untouched
});

test("Phase B Z1: every x-platform-* header is stripped by prefix, case-insensitively, over ALL request headers", () => {
  assert.match(module_, /M\.PREFIXES = \{ "x-platform-" \}/);
  const clear = module_.slice(module_.indexOf("function M.clear()"));
  assert.match(clear, /ngx\.req\.get_headers\(0\)/); // 0 = no header-count limit to hide behind
  assert.match(clear, /local lower = name:lower\(\)/);
  assert.match(clear, /lower:sub\(1, #prefix\) == prefix/);
  assert.match(clear, /ngx\.req\.clear_header\(name\)/);
  // the fixed list is still cleared first, unchanged
  assert.ok(clear.indexOf("M.HEADERS") < clear.indexOf("M.PREFIXES"));
});

test("there is ONE list: verify_jwt.lua and default.conf use the module, no hand-copied lists remain", () => {
  assert.match(lua, /require "trusted_headers"/);
  assert.match(lua, /trusted_headers\.clear\(\)/);
  assert.doesNotMatch(lua, /"x-jwt-verified",\s*"x-auth-source"/);
  assert.doesNotMatch(conf, /"x-jwt-verified",\s*"x-auth-source"/);
});

test("server-level strip is present, and every location either inherits it, re-runs it, or runs verify_jwt.lua", () => {
  const tls = conf.slice(conf.indexOf("listen 443"));
  const serverLevel = tls.slice(0, tls.search(/\n\s*location\s/));
  assert.match(serverLevel, /access_by_lua_block\s*\{\s*require\("trusted_headers"\)\.clear\(\)\s*\}/);
  const locs = locations();
  assert.ok(locs.length > 20);
  for (const { name, body } of locs) {
    const files = [...body.matchAll(/access_by_lua_file\s+(\S+);/g)].map((m) => m[1]);
    const blocks = [...body.matchAll(/access_by_lua_block\s*\{([^}]*)\}/g)].map((m) => m[1].trim());
    for (const f of files) assert.equal(f, "/etc/nginx/lua/verify_jwt.lua", `${name}: unexpected access script`);
    for (const b of blocks) assert.equal(b, 'require("trusted_headers").clear()', `${name}: an access block must not replace the strip with something else`);
    assert.doesNotMatch(body, /access_by_lua\s/, name);
  }
});

test("public /user-service/auth/ and /pkce/ stay public (no JWT) and inherit the strip", () => {
  for (const name of ["^~ /user-service/auth/", "^~ /user-service/pkce/"]) {
    const loc = locations().find((l) => l.name === name);
    assert.ok(loc, name);
    assert.doesNotMatch(loc.body, /access_by_lua/, `${name} must inherit the server-level strip`);
  }
});

test("logout is an exact location that requires a verified ProjectShell JWT", () => {
  const loc = locations().find((l) => l.name === "= /user-service/auth/logout");
  assert.ok(loc);
  assert.match(loc.body, /access_by_lua_file\s+\/etc\/nginx\/lua\/verify_jwt\.lua;/);
  assert.match(loc.body, /rewrite \^\/user-service\/\(\.\*\)\$ \/\$1 break;/);
  assert.match(loc.body, /proxy_pass http:\/\/user-service:5001;/);
  // verify_jwt.lua must not bypass any /user-service/auth/ path (it would skip logout's check)
  assert.doesNotMatch(lua, /user%-service\/auth|\/user-service\/auth/);
});

test("Microsoft RS256 is retired: only HS256 is accepted; no tid, Entra role, notifier or verifier subrequest", () => {
  assert.match(lua, /if header\.alg ~= "HS256" then\s*return ngx\.exit\(401\)/);
  for (const re of [/RS256/, /azuread/, /\.tid\b/, /verify-ms-token/, /location\.capture/, /system[.:]notifier/, /NOTIFIER_APP_ID/, /GATEWAY_VERIFY_SECRET/, /x-service-caller/, /x-service-secret/]) {
    assert.doesNotMatch(lua, re, String(re));
  }
  assert.doesNotMatch(conf, /verify-ms-token/); // the internal subrequest location is gone
});

test("x-tenant-id is set exactly once, from the verified token's tenantId, after a strict 24-lowercase-hex check", () => {
  const sets = [...lua.matchAll(/ngx\.req\.set_header\("x-tenant-id",\s*([^)]+)\)/g)].map((m) => m[1].trim());
  assert.deepEqual(sets, ["tenant_id"]);
  assert.match(lua, /local tenant_id = payload\.tenantId/);
  assert.match(lua, /type\(tenant_id\) ~= "string" or #tenant_id ~= 24 or not tenant_id:match\("\^\[0-9a-f\]\+\$"\)/);
  const check = lua.indexOf("#tenant_id ~= 24"), set = lua.indexOf('set_header("x-tenant-id"');
  assert.ok(check > 0 && check < set);
  assert.ok(lua.indexOf("verify_jwt_obj") < check); // only after signature verification
  assert.doesNotMatch(lua, /tenant_?[iI]d:(lower|upper)\(|(lower|upper)\(\s*(payload\.)?tenant_?[iI]d/); // never normalised
});

test("identity never depends on proxy_set_header inheritance (lost when a location sets its own)", () => {
  const tls = conf.slice(conf.indexOf("listen 443"));
  const serverLevel = tls.slice(0, tls.search(/\n\s*location\s/));
  const trusted = new Set(listed);
  // 1. The server level sets no trusted header, so nothing relies on inheriting one.
  for (const [, name] of serverLevel.matchAll(/proxy_set_header\s+(\S+)/g)) assert.ok(!trusted.has(name.toLowerCase()), `server-level ${name}`);
  for (const { name, body } of locations()) {
    const jwt = /access_by_lua_file\s+\/etc\/nginx\/lua\/verify_jwt\.lua;/.test(body);
    for (const [, h, v] of body.matchAll(/proxy_set_header\s+(\S+)\s+([^;]*);/g)) {
      if (!trusted.has(h.toLowerCase())) continue;
      // 2. A trusted header is only ever re-passed where verify_jwt.lua set it, and only as a
      //    pass-through of that (Lua-set, request-header) value - never a constant or other variable.
      assert.ok(jwt, `${name}: sets ${h} without verify_jwt.lua`);
      assert.equal(v.trim(), `$http_${h.toLowerCase().replace(/-/g, "_")}`, `${name}: ${h}`);
    }
  }
  // 3. Locations with their own proxy_set_header lose the server-level X-Real-IP: the PKCE
  //    login-start rate limiter's location sets it itself (from the gateway's peer address).
  const pkce = locations().find((l) => l.name === "^~ /user-service/pkce/");
  assert.match(pkce.body, /proxy_set_header X-Real-IP \$remote_addr;/);
});
