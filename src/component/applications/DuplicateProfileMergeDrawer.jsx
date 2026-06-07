import React, { useCallback, useEffect, useState } from "react";
import { Button, Checkbox, Drawer, Spin, Typography, message } from "antd";
import axios from "axios";

const { Text } = Typography;

function buildInitialChoices(fields = []) {
  const choices = {};
  for (const field of fields) {
    choices[field.path] = field.defaultSource || "APPLICATION";
  }
  return choices;
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

  return (
    <Drawer
      className="duplicate-profile-merge-drawer"
      title="Merge this Profile"
      open={open}
      onClose={onClose}
      width="min(96vw, 1100px)"
      zIndex={1100}
      destroyOnClose
      extra={
        <Button
          type="primary"
          loading={confirming}
          disabled={loading || !fields.length}
          onClick={handleConfirm}
        >
          Save merge choices
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
            {fields.map((field) => {
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
                    <label className="duplicate-merge-value-option">
                      <Checkbox
                        checked={selected === "APPLICATION"}
                        onChange={() =>
                          handleChoiceChange(field.path, "APPLICATION")
                        }
                      />
                      <span className="duplicate-merge-value-text">
                        {field.applicationValue || "—"}
                      </span>
                    </label>
                  </div>

                  <div className="duplicate-merge-col-member">
                    <label className="duplicate-merge-value-option">
                      <Checkbox
                        checked={selected === "PROFILE"}
                        onChange={() =>
                          handleChoiceChange(field.path, "PROFILE")
                        }
                      />
                      <span className="duplicate-merge-value-text">
                        {field.profileValue || "—"}
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Spin>
    </Drawer>
  );
};

export default DuplicateProfileMergeDrawer;
