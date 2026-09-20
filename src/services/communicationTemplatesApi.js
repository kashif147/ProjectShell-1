import axios from "axios";
import { resolveContentTemplatesApiUrl } from "../config/contentTemplateRouting";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Word/letter templates only (excludes Email/SMS templates, which use a
// fixed tempolateType of "Email" set by createEmailTemplateRecord - see
// communication-service's template.controller.js) - Template Type/Category
// values themselves are tenant-configurable via Configuration > Lookups
// ("Template Type"/"Template Category"), so this can't hard-filter by an
// exact category string. Used by CreateEventDrawer's Certificate Template
// picker.
export async function fetchDocumentTemplates() {
  const { data } = await axios.get(resolveContentTemplatesApiUrl(), {
    headers: authHeaders(),
  });
  const templates = data?.data?.templates || [];
  return templates.filter((t) => String(t.tempolateType || "").toLowerCase() !== "email");
}
