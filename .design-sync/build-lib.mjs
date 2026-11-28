// design-sync library build for the CRM (cfg.buildCmd).
//
// The CRM is a Create React App, not a component library: it has no dist/ and
// no .d.ts, its .js files contain JSX, and its modules read process.env.* at
// runtime (CRA inlines those at build time). This script compiles
// .design-sync/lib-entry.js (named exports of src/component/common/*) into an
// ESM "dist" the design-sync converter can bundle:
//   - app-internal modules (src/**) are bundled; npm packages stay as bare
//     imports, so the converter resolves them from node_modules itself;
//   - .js files are parsed as JSX, like CRA does;
//   - process.env is replaced by an empty object, so NO environment value
//     (gateway URLs, Firebase/MSAL config, keys) can be inlined into the
//     published bundle - every REACT_APP_* reads as undefined;
//   - CSS the components import is emitted as dist/index.css.
//
// Run from the CRM repo root: node .design-sync/build-lib.mjs
// esbuild comes from the staged converter deps in .ds-sync/node_modules.

import { createRequire } from 'node:module';
import { join, relative, resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { rmSync } from 'node:fs';

const require = createRequire(resolve('.ds-sync/node_modules/'));
const { build } = require('esbuild');

// webpack (CRA) lets an import name a missing export and yields undefined;
// esbuild refuses. These are imports the app names but never calls - keep
// webpack's behaviour for exactly these, nothing wider. Re-check on re-sync:
// remove an entry once the source stops importing it.
const MISSING_EXPORTS = {
  'src/features/profiles/filterTransferSlice.js': ['filterTransferById', 'filterTransferFromExistingData'],
};
// App plumbing swapped for inert stubs in THIS build only (owner decision
// 2026-11-28; see .design-sync/stubs/README.md). Keys are bare import
// specifiers, or repo-relative app files.
const STUBS = {
  'xlsx': 'xlsx.mjs',
  'xlsx-js-style': 'xlsx.mjs',
  'jspdf': 'jspdf.mjs',
  'jspdf-autotable': 'jspdf-autotable.mjs',
  'react-to-pdf': 'react-to-pdf.mjs',
  '@react-google-maps/api': 'google-maps.mjs',
  'firebase/app': 'firebase-app.mjs',
  'firebase/messaging': 'firebase-messaging.mjs',
  '@stripe/stripe-js': 'stripe-js.mjs',
  '@stripe/react-stripe-js': 'react-stripe-js.mjs',
  'autoprefixer': 'autoprefixer.mjs',
  'src/config/firebase.js': 'firebase-config.mjs',
};
// Client keys hardcoded in app source (Google Maps, Stripe publishable) and n8n
// webhook IDs are blanked so they never reach the published bundle.
const KEY_RX = [
  [/AIza[0-9A-Za-z_-]{30,}/g, ''],
  [/pk_(?:live|test)_[0-9A-Za-z]{10,}/g, ''],
  // n8n webhook IDs in dev fallback URLs (e.g. the chatbot's localhost:5678/webhook/<id>/chat).
  [/(\/webhook\/)[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '$1redacted'],
];

const appSourceShim = {
  name: 'design-sync-app-source',
  setup(b) {
    const stubDir = resolve('.design-sync/stubs');
    const bare = Object.keys(STUBS).filter((k) => !k.startsWith('src/'));
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    b.onResolve({ filter: new RegExp(`^(${bare.map(esc).join('|')})$`) }, (a) => ({ path: join(stubDir, STUBS[a.path]) }));
    const appStubs = Object.fromEntries(Object.entries(STUBS).filter(([k]) => k.startsWith('src/')).map(([k, v]) => [resolve(k), v]));
    const srcRoot = resolve('src');
    // npm packages stay external, but their stylesheets are bundled into
    // dist/index.css so every CSS rule lands in one file in import order
    // (Bootstrap, antd reset, the app's globals, then component CSS).
    b.onResolve({ filter: /\.css$/ }, (a) => {
      if (a.path.startsWith('.') || a.path.startsWith('/') || a.kind !== 'import-statement') return undefined;
      return { path: createRequire(join(a.resolveDir, 'x.js')).resolve(a.path) };
    });
    // App.css opens with @tailwind directives, which CRA leaves inert (no tailwind
    // config), but they push its `@import "./styles/Theme.css"` past the point
    // where an @import is valid, so esbuild would drop Theme.css. Strip them.
    b.onLoad({ filter: /\.css$/ }, async (a) => {
      if (!a.path.startsWith(srcRoot + '/')) return undefined;
      const css = await readFile(a.path, 'utf8');
      if (!/^@tailwind\b/m.test(css)) return undefined;
      return { contents: css.replace(/^@tailwind\b[^;]*;\s*$/gm, ''), loader: 'css' };
    });
    b.onLoad({ filter: /\.(js|jsx)$/ }, async (a) => {
      if (!a.path.startsWith(srcRoot + '/')) return undefined;
      if (appStubs[a.path]) return { contents: await readFile(join(stubDir, appStubs[a.path]), 'utf8'), loader: 'js', resolveDir: stubDir };
      let src = await readFile(a.path, 'utf8');
      for (const [rx, to] of KEY_RX) src = src.replace(rx, to);
      const names = MISSING_EXPORTS[relative(process.cwd(), a.path)];
      if (names) {
        src += '\n' + names.filter((n) => !new RegExp(`export\\s+(const|function|let|var)\\s+${n}\\b`).test(src))
          .map((n) => `export const ${n} = undefined;`).join('\n') + '\n';
      }
      return { contents: src, loader: 'jsx' };
    });
  },
};

const outdir = resolve('.design-sync/.cache/dist');
rmSync(outdir, { recursive: true, force: true });

const result = await build({
  entryPoints: { index: resolve('.design-sync/lib-entry.js') },
  outdir,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  packages: 'external',
  // Root-absolute url()s in the CRM's CSS are served by the app at runtime; leave them as-is.
  external: ['/public/*'],
  jsx: 'automatic',
  loader: {
    '.js': 'jsx',
    '.png': 'dataurl',
    '.jpg': 'dataurl',
    '.jpeg': 'dataurl',
    '.gif': 'dataurl',
    '.svg': 'dataurl',
    '.webp': 'dataurl',
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
    '.ttf': 'dataurl',
  },
  define: {
    'process.env': '{}',
    'process.env.NODE_ENV': '"production"',
    global: 'window',
  },
  plugins: [appSourceShim],
  metafile: true,
  logLevel: 'warning',
  logLimit: 0,
});

// Brand colour tokens for the artifact's Colors page (appended to dist/index.css,
// the cfg.cssEntry). Theme.css
// derives the CRM palette at runtime from tenant inputs with var() + color-mix(),
// which the Colors page cannot read. With no tenant signed in (always the case in
// the artifact) every one of them resolves to a constant, so this evaluates
// Theme.css's own formulas for the default tenant and writes the results as
// `!important` :root declarations: the page can list them, and at runtime they
// equal what the color-mix() rules compute anyway. Regenerated on every build.
{
  const theme = await readFile(resolve('src/styles/Theme.css'), 'utf8');
  const rootBlock = /:root\s*\{([\s\S]*?)\n\}/.exec(theme)?.[1] ?? '';
  const defs = new Map();
  for (const m of rootBlock.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) defs.set(m[1], m[2].trim());
  const hex = (s) => /^#[0-9a-f]{6}$/i.test(s) ? s.toLowerCase() : null;
  const mix = (a, b, p) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * p + parseInt(b.slice(i, i + 2), 16) * (1 - p)).toString(16).padStart(2, '0')).join('');
  const evalExpr = (v, depth = 0) => {
    if (depth > 8) return null;
    v = v.trim();
    if (hex(v)) return hex(v);
    let m = /^var\(--([a-z0-9-]+)\s*(?:,\s*(#[0-9a-f]{6}))?\)$/i.exec(v);
    if (m) return defs.has(m[1]) ? evalExpr(defs.get(m[1]), depth + 1) : hex(m[2] ?? '');
    m = /^color-mix\(in srgb,\s*(.+?)\s+(\d+)%,\s*(#[0-9a-f]{6}|var\([^)]+\))\)$/i.exec(v);
    if (m) {
      const a = evalExpr(m[1], depth + 1), b = evalExpr(m[3], depth + 1);
      return a && b ? mix(a, b, Number(m[2]) / 100) : null;
    }
    return null;
  };
  const lines = [];
  for (const [name, v] of defs) {
    if (!/(var\(|color-mix\()/.test(v) || /gradient|^0 |shadow/.test(name + ' ' + v)) continue;
    const out = evalExpr(v);
    if (out) lines.push(`  --${name}: ${out} !important;`);
  }
  const { appendFile } = await import('node:fs/promises');
  await appendFile(join(outdir, 'index.css'),
    `\n/* CRM brand colours: Theme.css's color-mix() tokens resolved for the default tenant\n   (primary #215e97). Generated by .design-sync/build-lib.mjs - do not edit. */\n:root {\n${lines.join('\n')}\n}\n`);
  console.error(`build-lib: ${lines.length} brand colour tokens resolved -> appended to index.css`);
}

const inputs = Object.keys(result.metafile.inputs);
console.error(`build-lib: ${inputs.length} app modules bundled -> ${outdir}`);
