/** User-facing labels for membership movement enum values (API values unchanged). */

export const NEW_JOIN_COLUMN_LABEL = "New";

const MOVEMENT_LABELS = {
  NewJoin: NEW_JOIN_COLUMN_LABEL,
  Rejoin: "Re-Joined",
  Reinstate: "Reinstated",
  Renewed: "Renewed",
  Renewal: "Renewal",
  Reinstatement: "Reinstatement",
  Transfer: "Transfer",
  Conversion: "Conversion",
};

const MOVEMENT_LABEL_ALIASES = {
  newjoin: NEW_JOIN_COLUMN_LABEL,
  new: NEW_JOIN_COLUMN_LABEL,
  "new join": NEW_JOIN_COLUMN_LABEL,
  "new joiner": NEW_JOIN_COLUMN_LABEL,
  "new joiners": NEW_JOIN_COLUMN_LABEL,
  rejoin: "Re-Joined",
  "re-joined": "Re-Joined",
  "re-joiner": "Re-Joined",
  "re-joiners": "Re-Joined",
  reinstate: "Reinstated",
  "re-instated": "Reinstated",
  renewed: "Renewed",
};

export function formatMembershipMovementLabel(value) {
  if (value == null || value === "") return "";
  const text = String(value).trim();
  if (!text) return "";

  if (MOVEMENT_LABELS[text]) return MOVEMENT_LABELS[text];

  const lower = text.toLowerCase();
  if (MOVEMENT_LABEL_ALIASES[lower]) return MOVEMENT_LABEL_ALIASES[lower];

  for (const [key, label] of Object.entries(MOVEMENT_LABELS)) {
    if (key.toLowerCase() === lower) return label;
  }

  return text;
}
