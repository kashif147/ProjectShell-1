import axios from "axios";
import { getIssueServiceBaseUrl } from "../config/serviceUrls";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

// Issues
export async function fetchIssues(params = {}) {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issues`, {
    params,
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// Not consumed by the Issues grid yet - needed by the CasesDetails.js rewrite
// (a separate, later task), building it now since it's trivial and belongs
// alongside fetchIssues in the same client module.
export async function fetchIssueById(id) {
  const { data } = await axios.get(`${getIssueServiceBaseUrl()}/issues/${id}`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}
