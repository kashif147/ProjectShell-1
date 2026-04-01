/** Query string for /Details so profile + subscription survive browser refresh. */
export function buildDetailsSearch(profileId, subscriptionId) {
  if (!profileId) return "";
  const params = new URLSearchParams();
  params.set("profileId", String(profileId));
  if (subscriptionId) params.set("subscriptionId", String(subscriptionId));
  return `?${params.toString()}`;
}
