import React, { useState } from "react";
import { Form, Select, DatePicker, Checkbox, Button, Divider, Modal } from "antd";
import moment from "moment";

const { Option } = Select;

const AddNew = ({isModalOpen,handleOk, handleCancel}) => {
  const [formData, setFormData] = useState({
    eventType: "One-time",
    frequency: "Daily",
    days: [],
    endDate: null,
  });

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderFrequencyOptions = () => {
    switch (formData.frequency) {
      case "Weekly":
        return (
          <Checkbox.Group
            options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
            onChange={(value) => handleFormChange("days", value)}
          />
        );
      case "Monthly":
        return (
          <Form.Item label="Specific Dates">
            <DatePicker
              onChange={(value) => handleFormChange("days", [moment(value).format("D")])}
              picker="date"
            />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  const generateSummary = () => {
    if (formData.eventType === "One-time") return "This is a one-time event.";

    const daysList =
      formData.frequency === "Weekly" && formData.days.length > 0
        ? ` on ${formData.days.join(", ")}`
        : "";
    const untilDate = formData.endDate
      ? ` until ${moment(formData.endDate).format("MMM DD, YYYY")}`
      : "";

    return `Repeats ${formData.frequency.toLowerCase()}${daysList}${untilDate}.`;
  };

  return (
    <Modal title="Add New Roster" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
    <div >
      <Form layout="vertical">
        <Form.Item label="Event Type">
          <Select
            defaultValue="One-time"
            onChange={(value) => handleFormChange("eventType", value)}
          >
            <Option value="One-time">One-time</Option>
            <Option value="Recurring">Recurring</Option>
          </Select>
        </Form.Item>

        {formData.eventType === "Recurring" && (
          <>
            <Form.Item label="Frequency">
              <Select
                defaultValue="Daily"
                onChange={(value) => handleFormChange("frequency", value)}
              >
                <Option value="Daily">Daily</Option>
                <Option value="Weekly">Weekly</Option>
                <Option value="Monthly">Monthly</Option>
                <Option value="Yearly">Yearly</Option>
              </Select>
            </Form.Item>

            {renderFrequencyOptions()}

            <Form.Item label="End Date">
              <DatePicker
                onChange={(value) => handleFormChange("endDate", value)}
              />
            </Form.Item>
          </>
        )}

        <Divider />

        <div style={{ marginTop: 20 }}>
          <h3>Summary</h3>
          <p>{generateSummary()}</p>
        </div>

        <Button type="primary">Save Event</Button>
      </Form>
    </div>
    </Modal>
  );
};

export default AddNew;
