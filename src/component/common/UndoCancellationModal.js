import React, { useState } from "react";
import { Modal, Button } from "antd";
import CustomSelect from "./CustomSelect";
import MyAlert from "./MyAlert";
import axios from "axios";

const UndoCancellationModal = ({
  visible,
  onClose,
  record,
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const reasons = [
    { key: "rejoin", label: "Member wishes to re-join" },
    { key: "admin_error", label: "Administrative Error" },
    { key: "other", label: "Other" },
  ];

  const handleSubmit = async () => {
    if (!reason) {
      MyAlert("error", "Please select a reason.");
      return;
    }

    if (!record || !record._id) {
      MyAlert("error", "No record specified.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_SUBSCRIPTION}/subscriptions/undo-resign/${record._id}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      MyAlert("success", "Membership cancellation has been undone.");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.request
          ? "No response from server. Please check your connection."
          : "Error setting up request.");
      MyAlert("error", `Failed to undo cancellation: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Undo Cancellation"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={!reason}
        >
          Undo Cancellation
        </Button>,
      ]}
    >
      <div style={{ margin: "20px 0" }}>
        <CustomSelect
          label="Reason for Undoing Cancellation"
          placeholder="Select a reason"
          options={reasons}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default UndoCancellationModal;