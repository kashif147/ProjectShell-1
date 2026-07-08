export function reminderBatchStatusTagColor(statusText, hasTriggeredDate = false) {
  const s = String(statusText || "").toLowerCase();
  if (s === "completed" || s === "executed" || s === "done" || hasTriggeredDate) {
    return "green";
  }
  if (s === "ready") return "blue";
  if (s === "failed" || s === "error") return "red";
  return "gold";
}

export function reminderBatchStatusLabel(statusText, hasTriggeredDate = false) {
  const s = String(statusText || "").trim().toLowerCase();
  if (s === "pending_build") return "Generating members";
  if (s === "ready") return "Ready";
  if (s === "failed") return "Build failed";
  if (s === "completed" || hasTriggeredDate) return "Completed";
  if (s === "draft") return "Pending";
  return s
    ? s.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Pending";
}

export const REMINDER_BATCH_STATUS_TAG_STYLE = {
  margin: 0,
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "18px",
  padding: "0 6px",
};
