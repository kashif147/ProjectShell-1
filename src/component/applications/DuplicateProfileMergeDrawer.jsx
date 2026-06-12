import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Drawer, Spin, Typography, message } from "antd";
import { MergeCellsOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import axios from "axios";
import { formatMembershipMovementLabel } from "../../utils/membershipMovementLabels";

const { Text } = Typography;

const SECTION_ORDER = ["Personal", "Professional", "Subscription"];

function membershipCategoryCompareKey(s) {
  if (s == null || s === "") return "";
  return String(s).trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveMembershipCategoryLabel(raw, categoryOptions = []) {
  const str = raw == null || raw === "" ? "" : String(raw).trim();
  if (!str) return null;

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

function formatFieldDisplayValue(field, value, categoryOptions) {
  if (value == null || value === "") return "—";
  if (field.path === "subscriptionDetails.membershipCategory") {
    return resolveMembershipCategoryLabel(value, categoryOptions) || "—";
  }
  if (field.path === "subscriptionDetails.membershipMovement") {
    return formatMembershipMovementLabel(value) || "—";
  }
  return value;
}

function groupFieldsBySection(fields = []) {
  const map = new Map();
  const seenPaths = new Set();
  for (const field of fields) {
    if (!field?.path || seenPaths.has(field.path)) continue;
    seenPaths.add(field.path);
    const sectionLabel = field.sectionLabel || "Other";
    if (!map.has(sectionLabel)) map.set(sectionLabel, []);
    map.get(sectionLabel).push(field);
  }
  return SECTION_ORDER.filter((label) => map.has(label)).map((sectionLabel) => ({
    sectionLabel,
    fields: map.get(sectionLabel),
  }));
}

function buildInitialChoices(fields = []) {
  const choices = {};
  for (const field of fields) {
    if (field.displayOnly) continue;
    choices[field.path] = field.defaultSource || "APPLICATION";
  }
  return choices;
}

function renderFieldValue(field, value, categoryOptions) {
  if (value == null || value === "") return "—";
  return formatFieldDisplayValue(field, value, categoryOptions);
}

function shouldShowApplicationColumnHint(field) {
  const hint = String(field?.applicationColumnHint || "").trim();
  const label = String(field?.label || "").trim();
  const value = String(field?.applicationValue ?? "").trim();
  if (!hint) return false;
  if (hint.toLowerCase() === label.toLowerCase()) return false;
  const hintLower = hint.toLowerCase();
  if (value.toLowerCase().startsWith(`${hintLower}:`)) return false;
  if (value.toLowerCase().startsWith(hintLower)) return false;
  return true;
}

const DuplicateProfileMergeDrawer = ({
  open,
  onClose,
  applicationId,
  profileId,
  onConfirm,
  confirming = false,
}) => {
  const baseURL = process.env.REACT_APP_PROFILE_SERVICE_URL;
  const [loading, setLoading] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [choices, setChoices] = useState({});
  const { membershipCategoryOptions } = useSelector((state) => state.lookups);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const loadCompareData = useCallback(async () => {
    if (!applicationId || !profileId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/applications/${applicationId}/duplicate-merge-compare/${profileId}`,
        { headers: authHeaders() },
      );
      const payload = response.data?.data || response.data;
      setCompareData(payload);
      setChoices(buildInitialChoices(payload?.fields || []));
    } catch (error) {
      message.error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to load merge comparison",
      );
      onClose?.();
    } finally {
      setLoading(false);
    }
  }, [applicationId, profileId, baseURL, authHeaders, onClose]);

  useEffect(() => {
    if (!open) return;
    loadCompareData();
  }, [open, loadCompareData]);

  const handleChoiceChange = (path, source) => {
    setChoices((prev) => ({ ...prev, [path]: source }));
  };

  const handleConfirm = () => {
    onConfirm?.(choices);
  };

  const fields = compareData?.fields || [];
  const groupedSections = useMemo(
    () => groupFieldsBySection(fields),
    [fields],
  );

  return (
    <Drawer
      className="duplicate-profile-merge-drawer"
      title="Merge Profile"
      open={open}
      onClose={onClose}
      width="min(96vw, 1100px)"
      zIndex={1100}
      destroyOnClose
      extra={
        <Button
          type="primary"
          className="butn primary-btn duplicate-merge-confirm-btn"
          icon={<MergeCellsOutlined />}
          loading={confirming}
          disabled={loading || !fields.length}
          onClick={handleConfirm}
        >
          Merge
        </Button>
      }
    >
      <Spin spinning={loading || confirming}>
        <Text type="secondary" className="duplicate-merge-intro">
          Tick the value to keep for each field. On approval, the active
          subscription is cancelled and a new one is created from the merged
          details.
        </Text>

        <div className="duplicate-merge-compare-panel">
          <div className="duplicate-merge-compare-header">
            <div className="duplicate-merge-header-spacer" />
            <div className="duplicate-merge-header-app">Application Details</div>
            <div className="duplicate-merge-header-member">Member&apos;s Details</div>
          </div>

          <div className="duplicate-merge-compare-body">
            {groupedSections.map((section) => (
              <div key={section.sectionLabel} className="duplicate-merge-section">
                <div className="duplicate-merge-section-header">
                  {section.sectionLabel}
                </div>
                {section.fields.map((field) => {
                  const selected =
                    choices[field.path] || field.defaultSource || "APPLICATION";
                  return (
                    <div
                      key={field.path}
                      className={`duplicate-merge-compare-row${
                        field.hasConflict
                          ? " duplicate-merge-compare-row--conflict"
                          : ""
                      }`}
                    >
                      <div className="duplicate-merge-col-field">
                        <span className="duplicate-merge-field-name">
                          {field.label}
                        </span>
                      </div>

                      <div className="duplicate-merge-col-app">
                        {field.displayOnly && field.profileOnly ? (
                          <span className="duplicate-merge-value-text duplicate-merge-value-text--empty">
                            —
                          </span>
                        ) : (
                          <label className="duplicate-merge-value-option">
                            {!field.displayOnly && (
                              <Checkbox
                                checked={selected === "APPLICATION"}
                                onChange={() =>
                                  handleChoiceChange(field.path, "APPLICATION")
                                }
                              />
                            )}
                            <span className="duplicate-merge-value-text">
                              {shouldShowApplicationColumnHint(field) ? (
                                <span className="duplicate-merge-value-hint">
                                  {field.applicationColumnHint}:{" "}
                                </span>
                              ) : null}
                              {renderFieldValue(
                                field,
                                field.applicationValue,
                                membershipCategoryOptions,
                              )}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="duplicate-merge-col-member">
                        {field.displayOnly && field.applicationOnly ? (
                          <span className="duplicate-merge-value-text duplicate-merge-value-text--empty">
                            —
                          </span>
                        ) : (
                          <label className="duplicate-merge-value-option">
                            {!field.displayOnly && (
                              <Checkbox
                                checked={selected === "PROFILE"}
                                onChange={() =>
                                  handleChoiceChange(field.path, "PROFILE")
                                }
                              />
                            )}
                            <span className="duplicate-merge-value-text">
                              {renderFieldValue(
                                field,
                                field.profileValue,
                                membershipCategoryOptions,
                              )}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Spin>
    </Drawer>
  );
};

export default DuplicateProfileMergeDrawer;
