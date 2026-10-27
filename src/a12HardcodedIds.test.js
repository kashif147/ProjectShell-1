/**
 * Phase A / A12 source guard: no tenant-owned (or dead) ObjectId literal in CRM runtime code.
 * Test files are excluded (fixtures). Comment-only lines are ignored.
 */
const fs = require("fs");
const path = require("path");

const SRC = __dirname;

// Removed in A-4 (A12). None of them may come back.
const RETIRED_IDS = {
  "68d036e2662428d1c504b3ad": "WORKLOC lookup type",
  "68dae613c5b15073d66b891f": "MEM product type (MULTIAUTH)",
  "68dae699c5b15073d66b892c": "4080 Retired Associate product (MULTIAUTH)",
  "68dae699c5b15073d66b892d": "4090 Undergraduate Student product (MULTIAUTH)",
  "68cbf7806080b4621d469d34": "MULTIAUTH tenant id fallback",
  "68c6b4d1e42306a6836622fa": "IRO / RO role (MULTIAUTH)",
  "68c85f21302e5600dc8477e1": "MaritalStatus (dead: no such lookup type)",
  "68c85f22302e5600dc847809": "Ranks (dead: no such lookup type)",
  "68ea77798ff5d8c2b3f175c4": "MyDrawer contact type (dead)",
  "67f3f9d812b014a0a7a94081": "hardcoded creator userid (dead)",
  "67a1b268a203d65ec4a553e2": "hardcoded profile id (dead)",
  "671822bca0072a28aab883e7": "legacy region type (dead)",
  "671822c6a0072a28aab883e9": "legacy region type (dead)",
};

// A 24-hex run that is not an ObjectId (a mock-API subdomain in a legacy upload URL).
const ALLOWED_HEX = new Set(["660d2bd96ddfa2943b33731c"]);

const runtimeFiles = () => {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|jsx)$/.test(e.name) && !/\.test\.(js|jsx)$/.test(e.name) && !p.includes("__tests__")) out.push(p);
    }
  };
  walk(SRC);
  return out;
};

const codeLines = (file) =>
  fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => !/^\s*(\/\/|\*|\/\*)/.test(line));

test("none of the retired hardcoded ids appear anywhere in CRM runtime source", () => {
  const hits = [];
  for (const f of runtimeFiles()) {
    const text = fs.readFileSync(f, "utf8");
    for (const id of Object.keys(RETIRED_IDS)) if (text.includes(id)) hits.push(`${path.relative(SRC, f)}: ${RETIRED_IDS[id]}`);
  }
  expect(hits).toEqual([]);
});

test("no ObjectId literal at all in CRM runtime code (allow-list: non-ObjectId hex only)", () => {
  const hits = [];
  for (const f of runtimeFiles()) {
    for (const { line, n } of codeLines(f)) {
      for (const m of line.match(/[0-9a-f]{24}/g) || []) {
        if (!ALLOWED_HEX.has(m)) hits.push(`${path.relative(SRC, f)}:${n}`);
      }
    }
  }
  expect(hits).toEqual([]);
});

test("WORKLOC and MEM are resolved by code in the changed paths", () => {
  const read = (p) => fs.readFileSync(path.join(SRC, p), "utf8");
  expect(read("features/GetLocationWithHierarky.js")).toMatch(/by-type-code\/\$\{WORK_LOCATION_TYPE_CODE\}/);
  expect(read("features/CategoryLookupSlice.js")).toMatch(/products\/by-type-code/);
  expect(read("features/CategoryLookupSlice.js")).toMatch(/MEMBERSHIP_PRODUCT_TYPE_CODE = 'MEM'/);
  // No caller-supplied tenant in the batch-notification payload.
  expect(read("pages/Correspondences/CommunicationBatchDetail.js")).not.toMatch(/tenantId:\s*selectedRows/);
});
