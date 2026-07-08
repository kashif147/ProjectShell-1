import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  Modal,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  EyeOutlined,
  MergeCellsOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { FaClone } from "react-icons/fa";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { buildApplicationMgtSearch } from "../../utils/applicationMgtRoute";
import { buildDetailsSearch } from "../../utils/detailsRoute";
import { getApplicationById } from "../../features/ApplicationDetailsSlice";
import MyTable from "../common/MyTable";
import DuplicateProfileMergeDrawer from "./DuplicateProfileMergeDrawer";
import {
  APPLICATION_DUPLICATE_REVIEW_LOCKED_MESSAGE,
  isProcessedApplicationStatus,
} from "../../utils/duplicateReviewApproval";
import "../../styles/MyDrawer.css";
import "./DuplicateProfileReview.css";
import "./DuplicateProfileMergeModal.css";

const { Text } = Typography;

const CLASSIFICATION_COLORS = {
  "Exact Duplicate": "red",
  "Strong Match": "orange",
  "Possible Match": "gold",
  "Weak Match": "blue",
  Ignore: "default",
};

/** Map duplicate-detection score to classification label. */
function classificationFromScore(score) {
  if (score === null || score === undefined || score === "") return null;
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  if (n >= 100) return "Exact Duplicate";
  if (n >= 80) return "Strong Match";
  if (n >= 60) return "Possible Match";
  if (n >= 40) return "Weak Match";
  return "Ignore";
}

function resolveMatchClassification(record = {}) {
  const fromScore = classificationFromScore(record.score);
  if (fromScore) return fromScore;
  const fromApi = String(record.classification || "").trim();
  return fromApi || "—";
}

function membershipCategoryCompareKey(s) {
  if (s == null || s === "") return "";
  return String(s).trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveMembershipCategoryLabel(raw, categoryOptions = []) {
  const str = raw == null || raw === "" ? "" : String(raw).trim();
  if (!str) return "—";

  if (!Array.isArray(categoryOptions) || categoryOptions.length === 0) {
    return str;
  }

  const byId = categoryOptions.find(
    (o) => String(o.value) === str || String(o.key) === str,
  );
  if (byId?.label) return byId.label;

  const key = membershipCategoryCompareKey(str);
  const byLabel = categoryOptions.find(
    (o) => o.label && membershipCategoryCompareKey(o.label) === key,
  );
  if (byLabel?.label) return byLabel.label;

  return str;
}

function withRowKeys(rows = []) {
  const seen = new Set();
  return rows.reduce((acc, row) => {
    const key = `${row.sourceType}-${row.sourceId}`;
    if (seen.has(key)) return acc;
    seen.add(key);
    acc.push({ ...row, key });
    return acc;
  }, []);
}

/** Avoid repeating matched field names when matchReason already lists them. */
function formatMatchDetail(record = {}) {
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

function formatDecisionAction(action) {
  return String(action || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDecisionDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function MatchTable({
  title,
  rows,
  loading,
  onViewDetails,
  onLink,
  onMerge,
  showProfileActions,
  readOnly,
  resolveCategoryLabel,
}) {
  const columns = [
    {
      title: "Classification",
      key: "classification",
      width: 150,
      render: (_, record) => {
        const label = resolveMatchClassification(record);
        if (label === "—") return "—";
        return (
          <Tag color={CLASSIFICATION_COLORS[label] || "default"}>{label}</Tag>
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 160,
      render: (value) => value || "—",
    },
    {
      title: "Category",
      dataIndex: "membershipCategory",
      key: "membershipCategory",
      width: 140,
      render: (value) => resolveCategoryLabel(value),
    },
    {
      title: "Mem. No",
      dataIndex: "membershipNumber",
      key: "membershipNumber",
      width: 100,
      render: (value) => value || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 180,
      render: (value) => value || "—",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      width: 110,
      render: (value) => value || "—",
    },
    {
      title: "Why matched",
      key: "matchDetails",
      width: 280,
      render: (_, record) => formatMatchDetail(record) || "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: showProfileActions ? 148 : 88,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size={4} className="duplicate-review-actions">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewDetails(record)}
            />
          </Tooltip>
          {showProfileActions && (
            <>
              <Tooltip title="Tag this Profile">
                <Button
                  type="text"
                  size="small"
                  icon={<TagOutlined />}
                  disabled={readOnly}
                  onClick={() => onLink(record)}
                />
              </Tooltip>
              <Tooltip title="Merge this Profile">
                <Button
                  type="text"
                  size="small"
                  icon={<MergeCellsOutlined />}
                  disabled={readOnly}
                  onClick={() => onMerge(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const dataSource = useMemo(() => withRowKeys(rows), [rows]);

  return (
    <div className="duplicate-review-section">
      <h4 className="duplicate-review-section-title">{title}</h4>
      <div className="duplicate-review-table-wrap">
        <MyTable
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          selection={false}
          tablePadding={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}
          scroll={{
            x: showProfileActions ? 1180 : 1110,
            y: "min(420px, calc(100vh - 380px))",
          }}
        />
      </div>
    </div>
  );
}

const DuplicateProfileReview = ({
  open,
  onClose,
  applicationId,
  applicationStatus,
  onReviewUpdated,
  runDetectionOnOpen = false,
}) => {
  const dispatch = useDispatch();
  const { membershipCategoryOptions } = useSelector((state) => state.lookups);
  const baseURL = process.env.REACT_APP_PROFILE_SERVICE_URL;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [mergeModal, setMergeModal] = useState({
    open: false,
    record: null,
  });
  const readOnly =
    isProcessedApplicationStatus(applicationStatus) ||
    isProcessedApplicationStatus(data?.applicationStatus) ||
    data?.isReadOnly === true;

  const resolveCategoryLabel = useCallback(
    (value) =>
      resolveMembershipCategoryLabel(value, membershipCategoryOptions),
    [membershipCategoryOptions],
  );

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const loadMatches = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/applications/${applicationId}/duplicate-matches`,
        { headers: authHeaders() },
      );
      setData(response.data?.data || response.data);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to load duplicate matches",
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId, baseURL, authHeaders]);

  const runDetection = useCallback(async () => {
    if (!applicationId) return;
    if (isProcessedApplicationStatus(applicationStatus)) {
      await loadMatches();
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseURL}/applications/${applicationId}/detect-duplicates`,
        {},
        { headers: authHeaders() },
      );
      setData(response.data?.data || response.data);
      message.success("Duplicate detection completed");
      onReviewUpdated?.(response.data?.data || response.data);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Duplicate detection failed",
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId, applicationStatus, baseURL, authHeaders, loadMatches, onReviewUpdated]);

  useEffect(() => {
    if (!open || !applicationId) return;
    if (runDetectionOnOpen) {
      runDetection();
    } else {
      loadMatches();
    }
    // Intentionally run once when the drawer opens for this application.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, applicationId, runDetectionOnOpen]);

  const submitDecision = async ({
    action,
    sourceType,
    sourceId,
    reason,
    mergeFieldChoices,
  }) => {
    if (!applicationId) return false;
    if (readOnly) {
      message.warning(APPLICATION_DUPLICATE_REVIEW_LOCKED_MESSAGE);
      return false;
    }
    setSubmitting(true);
    try {
      const response = await axios.post(
        `${baseURL}/applications/${applicationId}/duplicate-review`,
        {
          action,
          sourceType,
          sourceId,
          decisionReason: reason || undefined,
          mergeFieldChoices,
        },
        { headers: authHeaders() },
      );
      const payload = response.data?.data || response.data;
      setData((prev) => ({ ...(prev || {}), ...payload }));
      message.success("Duplicate review decision saved");
      onReviewUpdated?.(payload);
      await dispatch(getApplicationById({ id: applicationId }));
      onClose?.();
      return true;
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to save duplicate review decision",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const openInNewTab = (path) => {
    const url = `${window.location.origin}${path}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleViewDetails = (record) => {
    if (record.sourceType === "APPLICATION") {
      openInNewTab(
        `/applicationMgt${buildApplicationMgtSearch({
          applicationId: record.sourceId,
          edit: true,
        })}`,
      );
      return;
    }
    openInNewTab(`/Details${buildDetailsSearch(record.sourceId)}`);
  };

  const handleLink = (record) => {
    if (readOnly) {
      message.warning(APPLICATION_DUPLICATE_REVIEW_LOCKED_MESSAGE);
      return;
    }
    Modal.confirm({
      title: "Tag this Profile",
      content:
        "On approval, this application will be linked to the selected profile. Application details will override the existing profile data. Returning members get a new subscription; active members keep their current subscription.",
      okText: "Tag this Profile",
      centered: true,
      onOk: () =>
        submitDecision({
          action: "LINK",
          sourceType: "PROFILE",
          sourceId: record.sourceId,
        }),
    });
  };

  const handleMerge = (record) => {
    if (readOnly) {
      message.warning(APPLICATION_DUPLICATE_REVIEW_LOCKED_MESSAGE);
      return;
    }
    setMergeModal({ open: true, record });
  };

  const handleMergeConfirm = async (mergeFieldChoices) => {
    if (readOnly) {
      message.warning(APPLICATION_DUPLICATE_REVIEW_LOCKED_MESSAGE);
      return;
    }
    const record = mergeModal.record;
    if (!record) return;
    const saved = await submitDecision({
      action: "MERGE",
      sourceType: "PROFILE",
      sourceId: record.sourceId,
      mergeFieldChoices,
    });
    if (saved) {
      setMergeModal({ open: false, record: null });
    }
  };

  const handleCreateNewProfile = () => {
    if (readOnly) {
      message.warning(APPLICATION_DUPLICATE_REVIEW_LOCKED_MESSAGE);
      return;
    }
    Modal.confirm({
      title: "Create New Profile",
      content:
        "Confirm this application is for a new member. All listed matches will be dismissed and a new profile will be created on approval.",
      okText: "Create New Profile",
      centered: true,
      onOk: () => submitDecision({ action: "MARKED_NEW" }),
    });
  };

  const matchingApplications = useMemo(
    () => data?.matchingApplications || [],
    [data],
  );
  const matchingProfiles = useMemo(
    () => data?.matchingProfiles || [],
    [data],
  );
  const reviewStatus = data?.duplicateReview?.status;
  const decisionHistory = Array.isArray(data?.duplicateReview?.auditHistory)
    ? data.duplicateReview.auditHistory
    : [];

  return (
    <>
      <Drawer
        className="duplicate-profile-review-drawer"
        title={
          <div className="duplicate-review-drawer-title">
            <FaClone />
            <span>Duplicate Profiles</span>
          </div>
        }
        open={open}
        onClose={onClose}
        width="min(96vw, 1280px)"
        destroyOnClose
        extra={
          readOnly ? null : (
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={runDetection}
            >
              Refresh
            </Button>
          )
        }
      >
        <div className="duplicate-review-drawer-content">
          <Spin spinning={loading || submitting}>
            {reviewStatus && (
              <div className="duplicate-review-status">
                <Text type="secondary">Review status: </Text>
                <Tag>{reviewStatus}</Tag>
              </div>
            )}

            {decisionHistory.length > 0 && (
              <div className="duplicate-review-decision-history">
                <Text strong>Previous duplicate decisions</Text>
                {decisionHistory.map((entry, index) => (
                  <div
                    className="duplicate-review-decision-history-row"
                    key={`${entry.action || "decision"}-${entry.sourceId || index}`}
                  >
                    <Tag>{formatDecisionAction(entry.action)}</Tag>
                    <Text type="secondary">
                      {[
                        entry.sourceType && entry.sourceId
                          ? `${entry.sourceType}: ${entry.sourceId}`
                          : null,
                        entry.decisionReason
                          ? `Reason: ${entry.decisionReason}`
                          : null,
                        formatDecisionDate(entry.reviewedAt),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </div>
                ))}
              </div>
            )}

            {readOnly && (
              <Alert
                type="info"
                showIcon
                className="duplicate-review-readonly-alert"
                message={APPLICATION_DUPLICATE_REVIEW_LOCKED_MESSAGE}
              />
            )}

            {!readOnly && (
              <div className="duplicate-review-actions-bar">
                <p className="duplicate-review-actions-bar-text">
                  <strong>Ignore Match</strong> dismisses one row at a time
                  (use when some matches are false positives).{" "}
                  <strong>Create New Profile</strong> dismisses all matches at
                  once and records that this is a new member. Both allow
                  approval once complete; Tag and Merge link to an existing
                  profile instead.
                </p>
                <Button
                  type="primary"
                  className="duplicate-review-create-new-btn"
                  icon={<PlusCircleOutlined />}
                  loading={submitting}
                  onClick={handleCreateNewProfile}
                >
                  Create New Profile
                </Button>
              </div>
            )}

            <MatchTable
              title="Matching Profiles"
              rows={matchingProfiles}
              loading={loading}
              onViewDetails={handleViewDetails}
              onLink={handleLink}
              onMerge={handleMerge}
              showProfileActions
              readOnly={readOnly}
              resolveCategoryLabel={resolveCategoryLabel}
            />

            <MatchTable
              title="Matching Applications"
              rows={matchingApplications}
              loading={loading}
              onViewDetails={handleViewDetails}
              onLink={handleLink}
              onMerge={handleMerge}
              showProfileActions={false}
              readOnly={readOnly}
              resolveCategoryLabel={resolveCategoryLabel}
            />
          </Spin>
        </div>
      </Drawer>

      <DuplicateProfileMergeDrawer
        open={!readOnly && mergeModal.open}
        onClose={() => setMergeModal({ open: false, record: null })}
        applicationId={applicationId}
        profileId={mergeModal.record?.sourceId}
        onConfirm={handleMergeConfirm}
        confirming={submitting}
      />

    </>
  );
};

export default DuplicateProfileReview;
