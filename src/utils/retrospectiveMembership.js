import { Modal } from "antd";
import dayjs from "dayjs";

const RETROSPECTIVE_LAG_DAYS = 90;

/** Whole calendar days from anchor to reference (local); null if invalid. */
export function calendarDaysAnchorToReference(anchorRaw, referenceRaw) {
  const a = dayjs(anchorRaw).startOf("day");
  const r = dayjs(referenceRaw).startOf("day");
  if (!a.isValid() || !r.isValid()) return null;
  return r.diff(a, "day");
}

/**
 * True if any anchor is strictly more than RETROSPECTIVE_LAG_DAYS before reference (default: today local).
 */
export function isRetrospectiveMembershipLag(anchorValues, referenceDayjs = dayjs()) {
  const list = Array.isArray(anchorValues)
    ? anchorValues
    : anchorValues != null && anchorValues !== ""
      ? [anchorValues]
      : [];
  for (const raw of list) {
    if (raw == null || raw === "") continue;
    const days = calendarDaysAnchorToReference(raw, referenceDayjs);
    if (days != null && days > RETROSPECTIVE_LAG_DAYS) return true;
  }
  return false;
}

/**
 * Any anchor in a calendar year before the reference date's year (local).
 * Catches late-December join / submission approved in January without needing 90+ elapsed days.
 */
export function isPriorCalendarYearVsReference(anchorValues, referenceDayjs = dayjs()) {
  const list = Array.isArray(anchorValues)
    ? anchorValues
    : anchorValues != null && anchorValues !== ""
      ? [anchorValues]
      : [];
  const refY = referenceDayjs.year();
  for (const raw of list) {
    if (raw == null || raw === "") continue;
    const d = dayjs(raw);
    if (!d.isValid()) continue;
    if (d.year() < refY) return true;
  }
  return false;
}

/** User prompt + backend inactive-pricing path: 90-day lag OR cross-calendar-year anchors vs reference. */
export function isRetrospectivePricingScenario(anchorValues, referenceDayjs = dayjs()) {
  return (
    isRetrospectiveMembershipLag(anchorValues, referenceDayjs) ||
    isPriorCalendarYearVsReference(anchorValues, referenceDayjs)
  );
}

export function retrospectiveAnchorsFromSubmissionLike(obj) {
  if (!obj || typeof obj !== "object") return [];
  const sub = obj.subscriptionDetails || {};
  const out = [];
  const push = (x) => {
    if (x != null && x !== "") out.push(x);
  };
  push(sub.dateJoined);
  push(sub.submissionDate);
  push(sub.applicationDate);
  push(obj.applicationDate);
  return out;
}

/**
 * @deprecated Prefer isRetrospectiveMembershipLag(retrospectiveAnchorsFromSubmissionLike(obj)).
 * Keeps name for callers: pass membership start string or submission-like object.
 */
export function isRetrospectiveMembershipStart(rawOrSubmission, referenceDayjs = dayjs()) {
  if (
    rawOrSubmission != null &&
    typeof rawOrSubmission === "object" &&
    !dayjs.isDayjs(rawOrSubmission)
  ) {
    return isRetrospectivePricingScenario(
      retrospectiveAnchorsFromSubmissionLike(rawOrSubmission),
      referenceDayjs,
    );
  }
  return isRetrospectivePricingScenario(rawOrSubmission, referenceDayjs);
}

export function membershipJoinDateFromSubmissionLike(obj) {
  if (!obj || typeof obj !== "object") return null;
  const sub = obj.subscriptionDetails || {};
  const prof = obj.professionalDetails || {};
  const raw = sub.dateJoined ?? prof.startDate ?? null;
  return raw != null && raw !== "" ? raw : null;
}

function gridRowRetrospectiveAnchors(row) {
  if (!row || typeof row !== "object") return [];
  const paths = [
    row.dateJoined,
    row["Date Joined"],
    row["date joined"],
    row.subscriptionDetails?.dateJoined,
    row.subscriptionDetails?.submissionDate,
    row.subscriptionDetails?.applicationDate,
    row.latestSubmission?.subscriptionDetails?.dateJoined,
    row.latestSubmission?.subscriptionDetails?.submissionDate,
    row.latestSubmission?.subscriptionDetails?.applicationDate,
    row.pendingSubmission?.subscriptionDetails?.dateJoined,
    row.pendingSubmission?.subscriptionDetails?.submissionDate,
    row.submission?.subscriptionDetails?.dateJoined,
    row.submission?.subscriptionDetails?.submissionDate,
    row.effective?.subscriptionDetails?.dateJoined,
    row.effective?.subscriptionDetails?.submissionDate,
    row.effective?.subscriptionDetails?.applicationDate,
    row.submissionDate,
    row["Submission Date"],
    row.applicationDate,
    row.professionalDetails?.startDate,
    row["Start Date"],
  ];
  const out = [];
  const seen = new Set();
  for (const p of paths) {
    if (p == null || p === "") continue;
    const key = String(p);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

export function bulkSelectionHasRetrospective(
  gridData,
  selectedIds,
  referenceDayjs = dayjs(),
) {
  if (!Array.isArray(gridData) || !selectedIds?.length) return false;
  const idSet = new Set(selectedIds.map((x) => String(x)));
  return gridData.some((row) => {
    const rid =
      row.applicationId ??
      row.ApplicationId ??
      row.application_id ??
      row._id ??
      row.id;
    if (rid == null || !idSet.has(String(rid))) return false;
    return isRetrospectivePricingScenario(
      gridRowRetrospectiveAnchors(row),
      referenceDayjs,
    );
  });
}

/**
 * If retrospective vs today (local): 90+ day lag or prior calendar year on any anchor. Resolves false if user cancels.
 */
export function confirmRetrospectiveMembershipModal(submissionLike) {
  const ref = dayjs();
  const anchors =
    submissionLike != null &&
    typeof submissionLike === "object" &&
    !dayjs.isDayjs(submissionLike)
      ? retrospectiveAnchorsFromSubmissionLike(submissionLike)
      : submissionLike != null && submissionLike !== ""
        ? [submissionLike]
        : [];

  if (!isRetrospectivePricingScenario(anchors, ref)) return Promise.resolve(true);

  return new Promise((resolve) => {
    Modal.confirm({
      title: "Delayed application / membership pricing",
      content:
        "Date joined, submission, or application date is either more than 90 days before today or falls in a previous calendar year. Billing may use catalogue pricing for that membership period, including rows marked inactive (e.g. prior-year fees). Continue?",
      okText: "Yes, continue",
      cancelText: "Cancel",
      centered: true,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
