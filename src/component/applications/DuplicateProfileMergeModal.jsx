import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Modal, Radio, Spin, Table, Tag, Typography, message } from "antd";
import axios from "axios";

const { Text } = Typography;

function buildInitialChoices(fields = []) {
  const choices = {};
  for (const field of fields) {
    choices[field.path] = field.defaultSource || "APPLICATION";
  }
  return choices;
}

const DuplicateProfileMergeModal = ({
  open,
  onClose,
  applicationId,
  profileId,
  profileLabel,
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

  const groupedSections = useMemo(() => {
    const fields = compareData?.fields || [];
    const groups = [];
    let currentSection = null;

    for (const field of fields) {
      if (field.sectionLabel !== currentSection) {
        currentSection = field.sectionLabel;
        groups.push({ sectionLabel: currentSection, fields: [] });
      }
      groups[groups.length - 1].fields.push(field);
    }
    return groups;
  }, [compareData]);

  const handleChoiceChange = (path, value) => {
    setChoices((prev) => ({ ...prev, [path]: value }));
  };

  const handleConfirm = () => {
    onConfirm?.(choices);
  };

  const columns = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
      width: 180,
    },
    {
      title: "Application",
      dataIndex: "applicationValue",
      key: "applicationValue",
      render: (value) => value || "—",
    },
    {
      title: "Profile",
      dataIndex: "profileValue",
      key: "profileValue",
      render: (value) => value || "—",
    },
    {
      title: "Keep",
      key: "keep",
      width: 220,
      render: (_, record) => (
        <Radio.Group
          size="small"
          value={choices[record.path] || record.defaultSource || "APPLICATION"}
          onChange={(e) => handleChoiceChange(record.path, e.target.value)}
        >
          <Radio.Button value="APPLICATION">Application</Radio.Button>
          <Radio.Button value="PROFILE">Profile</Radio.Button>
        </Radio.Group>
      ),
    },
  ];

  return (
    <Modal
      className="duplicate-profile-merge-modal"
      title="Merge this Profile"
      open={open}
      onCancel={onClose}
      width="min(96vw, 1100px)"
      centered
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          loading={confirming}
          disabled={loading || !compareData?.fields?.length}
          onClick={handleConfirm}
        >
          Save merge choices
        </Button>,
      ]}
    >
      <Spin spinning={loading || confirming}>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Choose which values to keep for each field. Your selections are applied
            when this application is approved.
          </Text>
          {(profileLabel || compareData?.profileMembershipNumber) && (
            <div style={{ marginTop: 8 }}>
              <Text strong>
                {profileLabel || compareData?.profileName || "Profile"}
              </Text>
              {compareData?.profileMembershipNumber && (
                <Tag style={{ marginLeft: 8 }}>
                  {compareData.profileMembershipNumber}
                </Tag>
              )}
            </div>
          )}
        </div>

        {groupedSections.map((group) => (
          <div key={group.sectionLabel} style={{ marginBottom: 20 }}>
            <h4 className="duplicate-merge-section-title">{group.sectionLabel}</h4>
            <Table
              className="duplicate-merge-fields-table"
              rowKey="path"
              columns={columns}
              dataSource={group.fields}
              pagination={false}
              size="small"
              bordered
            />
          </div>
        ))}
      </Spin>
    </Modal>
  );
};

export default DuplicateProfileMergeModal;
