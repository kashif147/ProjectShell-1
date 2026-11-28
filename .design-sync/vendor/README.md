# Vendored head-of-page styles

What `public/index.html` loads before the app's own CSS, so the design system renders like the live CRM.

- `bootstrap-5.0.2.min.css`: copy of `https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css`,
  verified 2026-11-28 against the SRI hash in `public/index.html`
  (`sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC`). If index.html changes the
  Bootstrap version, replace this file and re-verify.
- `fonts.css`: the same Google Fonts Roboto URL that index.html links.
