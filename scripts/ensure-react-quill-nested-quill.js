/**
 * npm hoists `quill` to the repo root, but webpack/source-map-loader may still
 * resolve paths under react-quill-new/node_modules/quill. Recreate that path
 * as a symlink to the hoisted package (harmless when a real nested install exists).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const hoistedQuill = path.join(root, "node_modules", "quill");
const nestedDir = path.join(root, "node_modules", "react-quill-new", "node_modules");
const nestedQuill = path.join(nestedDir, "quill");

function main() {
  if (!fs.existsSync(hoistedQuill)) {
    console.warn(
      "[ensure-react-quill-nested-quill] Skip: hoisted quill missing at",
      hoistedQuill
    );
    return;
  }

  if (fs.existsSync(nestedQuill)) {
    let st;
    try {
      st = fs.lstatSync(nestedQuill);
    } catch {
      return;
    }
    if (st.isSymbolicLink()) {
      fs.unlinkSync(nestedQuill);
    } else if (st.isDirectory()) {
      return;
    }
  }

  fs.mkdirSync(nestedDir, { recursive: true });
  const rel = path.relative(nestedDir, hoistedQuill);
  try {
    fs.symlinkSync(rel, nestedQuill, "dir");
    console.log("[ensure-react-quill-nested-quill]", nestedQuill, "->", rel);
  } catch (e) {
    if (e && e.code !== "EEXIST") throw e;
  }
}

main();
