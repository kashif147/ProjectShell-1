import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Tag, Table, Spin, Checkbox, Button, Popconfirm, message } from "antd";
import { fetchEventById, approveRegistration, cancelRegistration } from "../../services/eventsApi";
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
    // unitPrice is stored in euros already (pricingResolution.service.js's
    // resolveLineItemsAmount pushes unitPriceEuros directly) - unlike
    // registration.amount, which is in cents. Don't divide by 100 here.
    render: (v) => (v != null ? `€${Number(v).toFixed(2)}` : "-"),
  },
];

const EventRegistrationViewDrawer = ({ open, onClose, registration, onApproved }) => {
  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [status, setStatus] = useState(registration?.status);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  // Local override for a stale registration.paymentStatus prop, set right
  // after a capture conflict (see handleApprove's catch) - this drawer has no
  // retry UI of its own, but without this override the checkbox+Approve
  // combo stays clickable and re-fails identically forever, since the
  // registration prop itself never refetches mid-session.
  const [paymentStatusOverride, setPaymentStatusOverride] = useState(null);

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
    setPaymentStatusOverride(null);
  }, [registration?._id, registration?.status]);

  if (!registration) return null;

  const effectivePaymentStatus = paymentStatusOverride || registration.paymentStatus;

  // A stripe registration whose card was never actually confirmed, or whose
  // authorization hold has since expired (Stripe auto-releases uncaptured
  // manual-capture holds after several days), always fails capture at
  // approval with a 409 - block Approve here too (this drawer has no retry
  // UI of its own; CreateAttendeeDrawer's view mode does).
  const stripePaymentNotAuthorized =
    registration.paymentMethod === "stripe" &&
    !["authorized", "succeeded"].includes(effectivePaymentStatus);

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
      const stripeStatus = err?.response?.data?.error?.details?.stripeStatus;
      if (stripeStatus && stripeStatus !== "requires_capture") {
        setPaymentStatusOverride(stripeStatus === "succeeded" ? "succeeded" : "failed");
      }
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!registration?._id) return;
    setRejecting(true);
    try {
      const updated = await cancelRegistration(registration._id);
      setStatus(updated?.status || "cancelled");
      message.success("Registration rejected");
      dispatchProfileInvalidate({ scopes: ["events"], profileId: registration.profileId });
      onApproved?.(updated);
    } catch (err) {
      message.error(err?.response?.data?.error?.message || err?.message || "Failed to reject registration");
    } finally {
      setRejecting(false);
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
      width={640}
      styles={{ body: { padding: "20px 28px" } }}
    >
      <Descriptions title="Attendee" column={2} size="small" bordered>
        <Descriptions.Item label="Title">
          {registration.attendeeSnapshot?.title || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Name">{attendeeName}</Descriptions.Item>
        <Descriptions.Item label="Gender">
          {registration.attendeeSnapshot?.gender || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Date of Birth">
          {formatDate(registration.attendeeSnapshot?.dateOfBirth)}
        </Descriptions.Item>
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
        <Descriptions.Item label="NMBI No.">
          {registration.attendeeSnapshot?.nmbiNumber || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>
          {buildAttendeeAddress(registration.attendeeSnapshot)}
        </Descriptions.Item>
      </Descriptions>

      <Descriptions
        title={registration.registrationType === "course" ? "Course" : "Event"}
        column={2}
        size="small"
        bordered
        style={{ marginTop: 16 }}
      >
        <Descriptions.Item label="Title" span={2}>
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
        column={2}
        size="small"
        bordered
        style={{ marginTop: 16 }}
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
        <Descriptions.Item label="Registered On" span={2}>
          {formatDateTime(registration.createdAt)}
        </Descriptions.Item>
      </Descriptions>

      {status === "pending" ? (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Checkbox checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)}>
            Confirm payment received
          </Checkbox>
          <Button
            type="primary"
            size="small"
            disabled={!confirmChecked || stripePaymentNotAuthorized}
            loading={approving}
            onClick={handleApprove}
          >
            Approve
          </Button>
          <Popconfirm
            title="Reject this registration?"
            description="The registration will be cancelled and the seat released."
            okText="Reject"
            okButtonProps={{ danger: true }}
            onConfirm={handleReject}
          >
            <Button danger size="small" loading={rejecting}>
              Reject
            </Button>
          </Popconfirm>
          {stripePaymentNotAuthorized && (
            <div style={{ width: "100%", color: "#cf1322", fontSize: 12 }}>
              This card was never successfully charged, or the authorization has expired (payment status "
              {effectivePaymentStatus}") - approving would fail. Open this attendee from the Attendees grid to
              retry payment.
            </div>
          )}
        </div>
      ) : null}

      <Descriptions
        title="Payment"
        column={2}
        size="small"
        bordered
        style={{ marginTop: 16 }}
      >
        <Descriptions.Item label="Payment Status">
          <Tag color={PAYMENT_STATUS_COLORS[effectivePaymentStatus] || "default"}>
            {effectivePaymentStatus}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Payment Method">
          {registration.paymentMethod || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Amount" span={2}>
          {formatAmount(registration.amount, registration.currency)}
        </Descriptions.Item>
      </Descriptions>

      {Array.isArray(registration.priceBreakdown) && registration.priceBreakdown.length > 0 ? (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 8 }}>Price Breakdown</h4>
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
