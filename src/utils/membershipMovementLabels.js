/** User-facing labels for subscription-service MEMBERSHIP_MOVEMENT enum values. */

export const NEW_JOIN_COLUMN_LABEL = "New";

/** Select options aligned with subscription-service MEMBERSHIP_MOVEMENT enum. */
export const MEMBERSHIP_MOVEMENT_OPTIONS = [
  { value: "NewJoin", label: NEW_JOIN_COLUMN_LABEL },
  { value: "Rejoin - Cancelled", label: "Rejoined - Cancelled" },
  { value: "Rejoin - Resigned", label: "Rejoined - Resigned" },
  { value: "Reinstate - Suspended", label: "Reinstated - Suspended" },
  { value: "Reinstate - Archived", label: "Reinstated - Archived" },
  { value: "Renewed", label: "Renewed" },
];

const MOVEMENT_LABELS = {
  NewJoin: NEW_JOIN_COLUMN_LABEL,
  Rejoin: "Re-Joined",
  "Rejoin - Cancelled": "Rejoined - Cancelled",
  "Rejoin - Resigned": "Rejoined - Resigned",
  Reinstate: "Reinstated",
  "Reinstate - Suspended": "Reinstated - Suspended",
  "Reinstate - Archived": "Reinstated - Archived",
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
  "rejoin - cancelled": "Rejoined - Cancelled",
  "rejoined - cancelled": "Rejoined - Cancelled",
  "rejoin - resigned": "Rejoined - Resigned",
  "rejoined - resigned": "Rejoined - Resigned",
  reinstate: "Reinstated",
  "re-instated": "Reinstated",
  "reinstate - suspended": "Reinstated - Suspended",
  "reinstated - suspended": "Reinstated - Suspended",
  "reinstate - archived": "Reinstated - Archived",
  "reinstated - archived": "Reinstated - Archived",
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
