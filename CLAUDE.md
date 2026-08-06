# CLAUDE.md

The CRM/staff-facing React app (Create React App, not customized/ejected) for the membership
platform — the counterpart to the backend services under `backend/`. It talks to every backend
service over HTTP through the gateway (`REACT_APP_GATEWAY_URL`), never directly. `README.md` is the
unmodified CRA boilerplate — ignore it.

## Commands
@.claude/rules/dev-commands.md

## Which docs to trust
@.claude/rules/docs-index.md

## Architecture

### Auth/authorization is a Context, not Redux
@.claude/rules/auth-context.md

### `App.js` vs `Entry.js`
@.claude/rules/app-vs-entry.md

### State: Redux Toolkit slices, plus Context for cross-cutting concerns
@.claude/rules/state-management.md

### Grid/report pages follow a shared convention
@.claude/rules/grid-report-pages.md

### Service URLs are centralized
@.claude/rules/service-urls.md
