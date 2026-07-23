import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Tag, Table, Spin, Checkbox, Button, message } from "antd";
import { fetchEventById, approveRegistration } from "../../services/eventsApi";
import { dispatchProfileInvalidate } from "../../utils/profileRealtimeEvents";

const STATUS_COLORS = {
  pending: "gold",
  confirmed: "green",
  cancelled: "red",
  attended: "blue",
  "no-show": "default",
};

const PAYMENT_STATUS_COLORS = {
  pending: "gold",
  succeeded: "green",
  failed: "red",
  waived: "blue",
  manual: "default",
};

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

function formatAmount(amount, currency) {
  return amount != null
    ? `${(amount / 100).toFixed(2)} ${(currency || "eur").toUpperCase()}`
    : "-";
}

function buildAttendeeAddress(snapshot) {
  if (!snapshot) return "-";
  return (
    [
      snapshot.addressLine1,
      snapshot.addressLine2,
      snapshot.townCity,
      snapshot.countyState,
      snapshot.eircode,
      snapshot.country,
    ]
      .map((part) => (part != null ? String(part).trim() : ""))
      .filter(Boolean)
      .join(", ") || "-"
  );
}

const priceBreakdownColumns = [
  { title: "Tier", dataIndex: "tierKey", key: "tierKey" },
  { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  {
    title: "Unit Price",
    dataIndex: "unitPrice",
    key: "unitPrice",
    render: (v) => (v != null ? `€${(v / 100).toFixed(2)}` : "-"),
  },
];

const EventRegistrationViewDrawer = ({ open, onClose, registration, onApproved }) => {
  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [status, setStatus] = useState(registration?.status);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!open || !registration?.eventId || registration.registrationType !== "event") {
      setEvent(null);
      return;
    }
    setEventLoading(true);
    fetchEventById(registration.eventId)
      .then((data) => setEvent(data || null))
      .catch(() => setEvent(null))
      .finally(() => setEventLoading(false));
  }, [open, registration?.eventId, registration?.registrationType]);

  useEffect(() => {
    setStatus(registration?.status);
    setConfirmChecked(false);
  }, [registration?._id, registration?.status]);

  if (!registration) return null;

  const handleApprove = async () => {
    if (!registration?._id) return;
    setApproving(true);
    try {
      const updated = await approveRegistration(registration._id);
      setStatus(updated?.status || "confirmed");
      message.success("Registration confirmed - payment recorded");
      dispatchProfileInvalidate({ scopes: ["events"], profileId: registration.profileId });
      onApproved?.(updated);
    } catch (err) {
      message.error(err?.response?.data?.error?.message || err?.message || "Failed to confirm registration");
    } finally {
      setApproving(false);
    }
  };

  const attendeeName = [
    registration.attendeeSnapshot?.firstName,
    registration.attendeeSnapshot?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "-";

  return (
    <Drawer
      title="Event Registration"
      placement="right"
      open={open}
      onClose={onClose}
      width={560}
    >
      <Descriptions title="Attendee" column={1} size="small" bordered>
        <Descriptions.Item label="Name">{attendeeName}</Descriptions.Item>
        <Descriptions.Item label="Email">
          {registration.attendeeSnapshot?.email || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {registration.attendeeSnapshot?.phone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Work Location">
          {registration.attendeeSnapshot?.workLocation || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Grade">
          {registration.attendeeSnapshot?.grade || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Address">
          {buildAttendeeAddress(registration.attendeeSnapshot)}
        </Descriptions.Item>
      </Descriptions>

      <Descriptions
        title={registration.registrationType === "course" ? "Course" : "Event"}
        column={1}
        size="small"
        bordered
        style={{ marginTop: 24 }}
      >
        <Descriptions.Item label="Title">
          {eventLoading ? <Spin size="small" /> : event?.title || "-"}
        </Descriptions.Item>
        {event?.venue ? (
          <Descriptions.Item label="Venue">{event.venue}</Descriptions.Item>
        ) : null}
        {event?.startDate ? (
          <Descriptions.Item label="Start Date">
            {formatDate(event.startDate)}
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="Sessions">
          {Array.isArray(registration.sessionIds) && registration.sessionIds.length
            ? registration.sessionIds.length
            : "-"}
        </Descriptions.Item>
      </Descriptions>

      <Descriptions
        title="Registration"
        column={1}
        size="small"
        bordered
        style={{ marginTop: 24 }}
      >
        <Descriptions.Item label="Status">
          <Tag color={STATUS_COLORS[status] || "default"}>
            {status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Quantity">{registration.quantity ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Price Category">
          {registration.priceCategory || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Registered Via">
          {registration.registeredVia || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Registered On">
          {formatDateTime(registration.createdAt)}
        </Descriptions.Item>
      </Descriptions>

      {status === "pending" ? (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <Checkbox checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)}>
            Confirm payment received
          </Checkbox>
          <Button type="primary" size="small" disabled={!confirmChecked} loading={approving} onClick={handleApprove}>
            Save
          </Button>
        </div>
      ) : null}

      <Descriptions
        title="Payment"
        column={1}
        size="small"
        bordered
        style={{ marginTop: 24 }}
      >
        <Descriptions.Item label="Payment Status">
          <Tag color={PAYMENT_STATUS_COLORS[registration.paymentStatus] || "default"}>
            {registration.paymentStatus}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Payment Method">
          {registration.paymentMethod || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Amount">
          {formatAmount(registration.amount, registration.currency)}
        </Descriptions.Item>
      </Descriptions>

      {Array.isArray(registration.priceBreakdown) && registration.priceBreakdown.length > 0 ? (
        <div style={{ marginTop: 24 }}>
          <h4>Price Breakdown</h4>
          <Table
            columns={priceBreakdownColumns}
            dataSource={registration.priceBreakdown.map((row, i) => ({ ...row, key: i }))}
            pagination={false}
            size="small"
          />
        </div>
      ) : null}
    </Drawer>
  );
};

export default EventRegistrationViewDrawer;
