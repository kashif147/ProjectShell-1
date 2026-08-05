# Commands

```bash
npm start     # react-scripts start, --experimental-https, 4GB heap (large app)
npm run build # react-scripts build, sourcemaps disabled, CI=false (warnings don't fail the build)
```

There is no `test` script in `package.json` despite CRA's default Jest setup being present
(`@testing-library/*` deps, `src/App.test.js`, `src/setupTests.js`) — run `npx react-scripts test`
directly if you need to run tests; don't expect `npm test` to work.

`npm install` runs `scripts/ensure-react-quill-nested-quill.js` via `postinstall`, and both `start`/
`build` run `scripts/generate-sw.js` first (custom service worker generation for FCM push — see
`FCM_SETUP.md`/`FCM_DEBUG_CONSOLE.md`). Don't remove these hooks without understanding why they're
gating start/build specifically.
