const SYSTEM_ACTOR_LABELS = {
  "system@reminder-batch": "Reminder batch (system)",
  "system@reminder-clear": "Reminder clear (system)",
  "system@undergraduate-graduation-job": "Undergraduate graduation job (system)",
};

function formatCrmUserDisplay(user) {
  const name =
    (user?.userFullName && String(user.userFullName).trim()) ||
    [user?.userFirstName, user?.userLastName]
      .map((part) => (part ? String(part).trim() : ""))
      .filter(Boolean)
      .join(" ");
  const email = user?.userEmail ? String(user.userEmail).trim() : "";
  if (name) return name;
  return email || null;
}

export function buildUserActorLookup(users = []) {
  const map = new Map();
  for (const user of users) {
    const display = formatCrmUserDisplay(user);
    if (!display) continue;
    const keys = [
      user?._id,
      user?.id,
      user?.userMicrosoftId,
      user?.userSubject,
    ].filter(Boolean);
    for (const key of keys) {
      map.set(String(key).toLowerCase(), display);
    }
  }
  return map;
}

/**
 * @param {{ actorId?: string, actorEmail?: string, actorDisplayName?: string }} item
 * @param {Map<string, string>} [lookup]
 */
export function resolveAuditActorDisplay(item, lookup = new Map()) {
  if (item?.actorDisplayName && item.actorDisplayName !== "—") {
    return item.actorDisplayName;
  }

  const emailRaw = item?.actorEmail ? String(item.actorEmail).trim() : "";
  if (emailRaw) {
    const systemLabel = SYSTEM_ACTOR_LABELS[emailRaw.toLowerCase()];
    if (systemLabel) return systemLabel;
    if (emailRaw.includes("@") && !emailRaw.toLowerCase().startsWith("system@")) {
      return emailRaw;
    }
  }

  const idRaw = item?.actorId ? String(item.actorId).trim() : "";
  if (idRaw) {
    const match = lookup.get(idRaw.toLowerCase());
    if (match) return match;
  }

  if (emailRaw) return emailRaw;
  return "—";
}
