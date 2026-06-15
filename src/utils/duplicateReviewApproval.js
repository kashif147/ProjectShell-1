export const DUPLICATE_REVIEW_APPROVAL_ALLOWED_STATUSES = new Set([
  "NO_MATCH",
  "LINKED",
  "MERGED",
  "MARKED_NEW",
  "IGNORED",
]);

export const DUPLICATE_REVIEW_REQUIRED_MESSAGE =
  "Duplicate review is required before approval. Open Duplicate Profile Review and choose Create New Profile, Ignore Match, Tag this Profile, or Merge this Profile.";

export function isDuplicateReviewBlockingApproval(status) {
  const normalized = status || "NOT_CHECKED";
  return !DUPLICATE_REVIEW_APPROVAL_ALLOWED_STATUSES.has(normalized);
}

function rowApplicationId(row) {
  return (
    row?.applicationId ??
    row?.ApplicationId ??
    row?.application_id ??
    row?._id ??
    row?.id ??
    null
  );
}

export function rowDuplicateReviewStatus(row) {
  return (
    row?.duplicateReviewStatus ||
    row?.personalDetails?.duplicateReview?.status ||
    row?.duplicateReview?.status ||
    "NOT_CHECKED"
  );
}

export function getApplicationDuplicateReview(application) {
  return (
    application?.personalDetails?.duplicateReview ||
    application?.duplicateReview ||
    null
  );
}

export function isMergedDuplicateReview(application) {
  return getApplicationDuplicateReviewStatus(application) === "MERGED";
}

export function getApplicationDuplicateReviewStatus(application) {
  return rowDuplicateReviewStatus(application);
}

export function getMergedDuplicateReviewSummary(application) {
  const review = getApplicationDuplicateReview(application);
  if (!review || review.status !== "MERGED") {
    return null;
  }

  const matchedProfileId = review.matchedProfileId;
  const matchRow = (review.matchSummary || []).find(
    (match) =>
      match.sourceType === "PROFILE" &&
      matchedProfileId != null &&
      String(match.sourceId) === String(matchedProfileId) &&
      !match.ignored,
  );

  const mergeFieldChoices =
    review.mergeFieldChoices && typeof review.mergeFieldChoices === "object"
      ? review.mergeFieldChoices
      : {};

  const choiceEntries = Object.entries(mergeFieldChoices);
  const profileFieldCount = choiceEntries.filter(
    ([, source]) => source === "PROFILE",
  ).length;
  const applicationFieldCount = choiceEntries.filter(
    ([, source]) => source === "APPLICATION",
  ).length;

  return {
    matchedProfileId:
      matchedProfileId != null ? String(matchedProfileId) : null,
    matchName: matchRow?.name || null,
    membershipNumber: matchRow?.membershipNumber || null,
    reviewedAt: review.reviewedAt || null,
    profileFieldCount,
    applicationFieldCount,
    totalChoices: choiceEntries.length,
  };
}

export function getPendingDuplicateReviewApplications(gridData, selectedIds) {
  if (!Array.isArray(gridData) || !selectedIds?.length) return [];

  const idSet = new Set(selectedIds.map((id) => String(id)));
  return gridData.filter((row) => {
    const applicationId = rowApplicationId(row);
    if (applicationId == null || !idSet.has(String(applicationId))) {
      return false;
    }
    return isDuplicateReviewBlockingApproval(rowDuplicateReviewStatus(row));
  });
}

export function bulkSelectionHasPendingDuplicateReview(gridData, selectedIds) {
  return getPendingDuplicateReviewApplications(gridData, selectedIds).length > 0;
}
