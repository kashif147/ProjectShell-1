export function isLocalNotificationId(id) {
  return String(id || "").startsWith("local-");
}

/**
 * Merge server-fetched notifications with in-memory rows (local batch alerts,
 * socket rows not yet returned by the API).
 */
export function mergeNotificationLists(serverList, existingList = []) {
  const server = Array.isArray(serverList) ? serverList : [];
  const existing = Array.isArray(existingList) ? existingList : [];
  const merged = new Map();

  for (const item of server) {
    const id = String(item?._id || "");
    if (id) merged.set(id, item);
  }

  for (const item of existing) {
    const id = String(item?._id || "");
    if (!id || merged.has(id)) continue;
    merged.set(id, item);
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );
}

export function countUnreadNotifications(list) {
  return (Array.isArray(list) ? list : []).filter((item) => !item?.isRead).length;
}

export function reconcileBadgeCount(serverUnreadCount, mergedList) {
  if (typeof serverUnreadCount !== "number") {
    return countUnreadNotifications(mergedList);
  }
  const localUnread = (mergedList || []).filter(
    (item) => isLocalNotificationId(item?._id) && !item?.isRead,
  ).length;
  return serverUnreadCount + localUnread;
}
