/** Query string for /Details so profile + subscription survive browser refresh. */
export function buildDetailsSearch(profileId, subscriptionId) {
  const normalizedProfileId = normalizeRouteId(profileId);
  if (!normalizedProfileId) return "";
  const params = new URLSearchParams();
  params.set("profileId", normalizedProfileId);
  const normalizedSubscriptionId = normalizeRouteId(subscriptionId);
  if (normalizedSubscriptionId) params.set("subscriptionId", normalizedSubscriptionId);
  return `?${params.toString()}`;
}

function normalizeRouteId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const lowered = raw.toLowerCase();
  if (lowered === "undefined" || lowered === "null") return "";
  return raw;
}
