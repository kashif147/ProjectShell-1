export const PROFILE_INVALIDATE_EVENT = "profile-invalidate";

/** @typedef {'finance' | 'subscription' | 'profile' | 'all'} ProfileInvalidateScope */

/**
 * Tell profile UI to refetch only what changed (no tab-switch polling).
 * @param {{ scopes?: ProfileInvalidateScope[], profileId?: string, memberId?: string }} detail
 */
export function dispatchProfileInvalidate({
  scopes = ["all"],
  profileId = "",
  memberId = "",
} = {}) {
  window.dispatchEvent(
    new CustomEvent(PROFILE_INVALIDATE_EVENT, {
      detail: {
        scopes,
        profileId: String(profileId || "").trim(),
        memberId: String(memberId || "").trim(),
      },
    }),
  );
}

export function profileInvalidateMatchesContext(
  detail,
  { profileId, memberId } = {},
) {
  const eventProfile = String(detail?.profileId || "")
    .trim()
    .toLowerCase();
  const eventMember = String(detail?.memberId || "")
    .trim()
    .toLowerCase();
  const currentProfile = String(profileId || "")
    .trim()
    .toLowerCase();
  const currentMember = String(memberId || "")
    .trim()
    .toLowerCase();

  if (eventProfile && currentProfile && eventProfile !== currentProfile) {
    return false;
  }
  if (eventMember && currentMember && eventMember !== currentMember) {
    return false;
  }
  return true;
}

export function scopesInclude(scopes, scope) {
  const list = Array.isArray(scopes) ? scopes : [];
  return list.includes("all") || list.includes(scope);
}
