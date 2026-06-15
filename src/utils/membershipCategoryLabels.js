import AuthorizationAPI from "../services/AuthorizationAPI";

export function isHonoraryMembershipCategoryLabel(label) {
  const combined = String(label ?? "")
    .trim()
    .toLowerCase();
  if (!combined) return false;
  return combined === "honorary" || /\bhonorary\b/.test(combined);
}

export function isPortalTokenUser() {
  const token = localStorage.getItem("token");
  const decoded = AuthorizationAPI.decodeToken(token);
  return String(decoded?.userType || "").toUpperCase() === "PORTAL";
}

export function filterMembershipCategoryOptionsForPortalUser(options) {
  if (!Array.isArray(options) || !isPortalTokenUser()) return options;
  return options.filter(
    (option) => !isHonoraryMembershipCategoryLabel(option?.label),
  );
}
