// Shared duplicate-match classification helpers - used by every UI that
// shows candidates from the platform's duplicate-detection scoring
// (services/duplicate.matching.js server-side): the profile page's "Check
// Duplicate" review (ProfileDuplicateReview.jsx), the application duplicate
// review, and the event attendee-registration dedupe check. Keeping this in
// one place is what makes those UIs actually consistent rather than
// independently re-implemented.

export const CLASSIFICATION_COLORS = {
  "Exact Duplicate": "red",
  "Strong Match": "orange",
  "Possible Match": "gold",
  "Weak Match": "blue",
  Ignore: "default",
};

export function classificationFromScore(score) {
  if (score === null || score === undefined || score === "") return null;
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  if (n >= 100) return "Exact Duplicate";
  if (n >= 80) return "Strong Match";
  if (n >= 60) return "Possible Match";
  if (n >= 40) return "Weak Match";
  return "Ignore";
}

export function resolveMatchClassification(record = {}) {
  const fromScore = classificationFromScore(record.score);
  if (fromScore) return fromScore;
  const fromApi = String(record.classification || "").trim();
  return fromApi || "—";
}

export function formatMatchDetail(record = {}) {
  const reason = String(record.matchReason || "").trim();
  const fields = Array.isArray(record.matchedFields)
    ? [
        ...new Set(
          record.matchedFields
            .map((field) => String(field || "").trim())
            .filter(Boolean),
        ),
      ]
    : [];
  if (!reason && fields.length === 0) return "";
  if (!reason) return fields.join(", ");
  if (fields.length === 0) return reason;
  const reasonLower = reason.toLowerCase();
  const extraFields = fields.filter(
    (field) => !reasonLower.includes(field.toLowerCase()),
  );
  if (extraFields.length === 0) return reason;
  return `${reason} · ${extraFields.join(", ")}`;
}
