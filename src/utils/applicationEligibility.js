/**
 * Disable "Activate Membership" when the subscription being viewed is not the one with the
 * latest `startDate` among all subscriptions for the profile (older cancelled lines cannot
 * be reactivated from here).
 */
export function shouldDisableActivateUnlessLatestSubscriptionByStartDate(
  currentSubscription,
  allSubscriptions
) {
  if (!currentSubscription || !Array.isArray(allSubscriptions) || allSubscriptions.length === 0)
    return false;

  const ts = (d) => {
    if (d == null) return -Infinity;
    const n = new Date(d).getTime();
    return Number.isFinite(n) ? n : -Infinity;
  };

  const currentT = ts(currentSubscription.startDate);
  if (currentT === -Infinity) return false;

  let maxT = -Infinity;
  for (const s of allSubscriptions) {
    maxT = Math.max(maxT, ts(s?.startDate));
  }

  return currentT < maxT;
}
