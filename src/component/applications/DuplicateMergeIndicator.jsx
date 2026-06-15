import React, { useMemo } from "react";
import { Button, Tag } from "antd";
import { MergeCellsOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { buildDetailsSearch } from "../../utils/detailsRoute";
import {
  getMergedDuplicateReviewSummary,
  isMergedDuplicateReview,
} from "../../utils/duplicateReviewApproval";

function formatReviewedAt(value) {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : null;
}

const DuplicateMergeIndicator = ({ application, onViewMergeReview }) => {
  const summary = useMemo(
    () => getMergedDuplicateReviewSummary(application),
    [application],
  );

  if (!isMergedDuplicateReview(application) || !summary) {
    return null;
  }

  const reviewedLabel = formatReviewedAt(summary.reviewedAt);
  const memberLabel = [summary.matchName, summary.membershipNumber]
    .filter(Boolean)
    .join(summary.matchName && summary.membershipNumber ? " · " : "");

  const openProfile = () => {
    if (!summary.matchedProfileId) return;
    const url = `${window.location.origin}/Details${buildDetailsSearch(
      summary.matchedProfileId,
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="duplicate-merge-indicator" role="status" aria-live="polite">
      <div className="duplicate-merge-indicator__main">
        <div className="duplicate-merge-indicator__title-row">
          <MergeCellsOutlined className="duplicate-merge-indicator__icon" />
          <span className="duplicate-merge-indicator__title">
            Merged with existing profile
          </span>
          <Tag color="blue" className="duplicate-merge-indicator__tag">
            Form updated
          </Tag>
        </div>

        <p className="duplicate-merge-indicator__message">
          This application form reflects your merge selections.
          {summary.totalChoices > 0 ? (
            <>
              {" "}
              <strong>{summary.profileFieldCount}</strong> field
              {summary.profileFieldCount === 1 ? "" : "s"} kept from the member
              profile and <strong>{summary.applicationFieldCount}</strong> from
              the application.
            </>
          ) : null}
          {memberLabel ? (
            <>
              {" "}
              Linked profile: <strong>{memberLabel}</strong>.
            </>
          ) : null}
          {reviewedLabel ? (
            <>
              {" "}
              Reviewed {reviewedLabel}.
            </>
          ) : null}
        </p>
      </div>

      <div className="duplicate-merge-indicator__actions">
        <Button
          size="small"
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={onViewMergeReview}
        >
          View merge review
        </Button>
        {summary.matchedProfileId ? (
          <Button size="small" onClick={openProfile}>
            Open profile
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default DuplicateMergeIndicator;
