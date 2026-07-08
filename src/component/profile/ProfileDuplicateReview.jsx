import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CloseCircleOutlined,
  EyeOutlined,
  MergeCellsOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { buildDetailsSearch } from "../../utils/detailsRoute";
import MyTable from "../common/MyTable";
import DuplicateProfileMergeDrawer from "../applications/DuplicateProfileMergeDrawer";
import "../applications/DuplicateProfileReview.css";
import "../applications/DuplicateProfileMergeModal.css";

const { Text } = Typography;

const CLASSIFICATION_COLORS = {
  "Exact Duplicate": "red",
  "Strong Match": "orange",
  "Possible Match": "gold",
  "Weak Match": "blue",
  Ignore: "default",
};

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

const ProfileDuplicateReview = ({
  profileId,
  open,
  onClose,
  runDetectionOnOpen = true,
  onMerged,
}) => {
  const baseURL = process.env.REACT_APP_PROFILE_SERVICE_URL;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [ignoredMatchIds, setIgnoredMatchIds] = useState([]);
  const [mergeModal, setMergeModal] = useState({ open: false, record: null });
  const { membershipCategoryOptions } = useSelector((state) => state.lookups);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const resolveCategoryLabel = useCallback(
    (value) =>
      resolveMembershipCategoryLabel(value, membershipCategoryOptions),
    [membershipCategoryOptions],
  );

  const loadMatches = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/profile/${profileId}/duplicate-matches`,
        { headers: authHeaders() },
      );
      setData(response.data?.data || response.data);
    } catch (error) {
      message.error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to load duplicate matches",
      );
    } finally {
      setLoading(false);
    }
  }, [profileId, baseURL, authHeaders]);

  const runDetection = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseURL}/profile/${profileId}/detect-duplicates`,
        {},
        { headers: authHeaders() },
      );
      setData(response.data?.data || response.data);
      setIgnoredMatchIds([]);
      message.success("Duplicate detection completed");
    } catch (error) {
      message.error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Duplicate detection failed",
      );
    } finally {
      setLoading(false);
    }
  }, [profileId, baseURL, authHeaders]);

  useEffect(() => {
    if (!open || !profileId) return;
    if (runDetectionOnOpen) {
      runDetection();
    } else {
      loadMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, profileId, runDetectionOnOpen]);

  const openInNewTab = (path) => {
    const url = `${window.location.origin}${path}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleViewDetails = (record) => {
    openInNewTab(`/Details${buildDetailsSearch(record.sourceId)}`);
  };

  const handleIgnore = (record) => {
    setIgnoredMatchIds((prev) => {
      const id = String(record.sourceId);
      return prev.includes(id) ? prev : [...prev, id];
    });
    message.success("Match dismissed for this session");
  };

  const handleMerge = (record) => {
    setMergeModal({ open: true, record });
  };

  const handleMergeConfirm = async (payload) => {
    const record = mergeModal.record;
    if (!profileId || !record?.sourceId) return;
    const mergeFieldChoices =
      payload?.mergeFieldChoices || payload || {};
    const masterProfileId = payload?.masterProfileId || profileId;
    const absorbedProfileId =
      payload?.absorbedProfileId || record.sourceId;
    setSubmitting(true);
    try {
      await axios.post(
        `${baseURL}/profile/${profileId}/duplicate-merge`,
        {
          masterProfileId,
          absorbedProfileId,
          mergeFieldChoices,
        },
        { headers: authHeaders() },
      );
      message.success(
        "Profiles merged. Historical data has been linked to the master profile.",
      );
      setMergeModal({ open: false, record: null });
      onMerged?.();
      onClose?.();
    } catch (error) {
      message.error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to merge profiles",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const matchingProfiles = useMemo(() => {
    const rows = data?.matchingProfiles || data?.matchSummary || [];
    const ignored = new Set(ignoredMatchIds.map(String));
    return withRowKeys(
      rows.filter(
        (row) =>
          row.sourceType === "PROFILE" &&
          !row.ignored &&
          !ignored.has(String(row.sourceId)),
      ),
    );
  }, [data, ignoredMatchIds]);

  const sourceProfile = data?.sourceProfile || null;

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
      width: 148,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size={4} className="duplicate-review-actions">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Merge this Profile">
            <Button
              type="text"
              size="small"
              icon={<MergeCellsOutlined />}
              onClick={() => handleMerge(record)}
            />
          </Tooltip>
          <Tooltip title="Ignore Match">
            <Button
              type="text"
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleIgnore(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="duplicate-review-drawer-content">
        <Spin spinning={loading || submitting}>
          {sourceProfile ? (
            <div className="duplicate-review-status">
              <Text type="secondary">Current profile: </Text>
              <Tag color="blue">
                {[sourceProfile.name, sourceProfile.membershipNumber]
                  .filter(Boolean)
                  .join(" · ") || profileId}
              </Tag>
            </div>
          ) : null}

          <div className="duplicate-review-actions-bar">
            <p className="duplicate-review-actions-bar-text">
              Review potential duplicate profiles for this member. Choose a
              master profile in merge review; applications, subscriptions, and
              finance from the other profile are linked to the master.
            </p>
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={runDetection}
            >
              Refresh
            </Button>
          </div>

          <div className="duplicate-review-section">
            <h4 className="duplicate-review-section-title">Matching Profiles</h4>
            <div className="duplicate-review-table-wrap">
              <MyTable
                columns={columns}
                dataSource={matchingProfiles}
                loading={loading}
                selection={false}
                scroll={{ x: 1200 }}
              />
            </div>
          </div>
        </Spin>
      </div>

      <DuplicateProfileMergeDrawer
        mode="profile"
        open={mergeModal.open}
        onClose={() => setMergeModal({ open: false, record: null })}
        sourceProfileId={profileId}
        targetProfileId={mergeModal.record?.sourceId}
        onConfirm={handleMergeConfirm}
        confirming={submitting}
      />
    </>
  );
};

export default ProfileDuplicateReview;
