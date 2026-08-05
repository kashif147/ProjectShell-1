# Grid/report pages follow a shared convention, not ad hoc tables

`src/config/gridColumnDefaults.js`/`grid-column-defaults.json`, `gridTemplateRouting.js`, and the
`template-filters-columns` skill together define the "Save View" pattern used across every grid page
in this app — saved filter/column templates are fetched per `templateType` and mirror the same
`Template` model shape implemented independently in several backend services (see
`TEMPLATE_IMPLEMENTATION_PLAYBOOK.md` at the repo root for exactly which service owns which grid's
template storage).

`contentTemplateRouting.js` is a separate, unrelated routing table for *content* (mail-merge/email)
templates — don't confuse the two despite the similar naming; a change to grid template routing
belongs in `gridTemplateRouting.js`, a change to content/mail-merge templates belongs in
`contentTemplateRouting.js`.
