import React, { useEffect, useState } from "react";
import { Tag } from "antd";
import MyTable from "../common/MyTable";
import EventRegistrationViewDrawer from "./EventRegistrationViewDrawer";
import { fetchRegistrationsByProfile } from "../../services/eventsApi";
import {
  PROFILE_INVALIDATE_EVENT,
  profileInvalidateMatchesContext,
  scopesInclude,
} from "../../utils/profileRealtimeEvents";

const STATUS_COLORS = {
  pending: "gold",
  confirmed: "green",
  cancelled: "red",
  attended: "blue",
  "no-show": "default",
};

const columns = [
  {
    title: "Type",
    dataIndex: "registrationType",
    key: "registrationType",
    render: (v) => (v === "course" ? "Course" : "Event"),
  },
  {
    title: "Payment status",
    dataIndex: "paymentStatus",
    key: "paymentStatus",
  },
  {
    title: "Payment method",
    dataIndex: "paymentMethod",
    key: "paymentMethod",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (amount, row) => (amount != null ? `${(amount / 100).toFixed(2)} ${(row.currency || "eur").toUpperCase()}` : "-"),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => <Tag color={STATUS_COLORS[status] || "default"}>{status}</Tag>,
  },
  {
    title: "Registered via",
    dataIndex: "registeredVia",
    key: "registeredVia",
  },
  {
    title: "Registered on",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
  },
];

const ProfileEventsTab = ({ profileId }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const load = React.useCallback(() => {
    if (!profileId) {
      setRegistrations([]);
      return;
    }
    setLoading(true);
    fetchRegistrationsByProfile(profileId)
      .then((data) => setRegistrations(Array.isArray(data) ? data : []))
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = (ev) => {
      const detail = ev?.detail || {};
      if (!scopesInclude(detail.scopes, "events")) return;
      if (!profileInvalidateMatchesContext(detail, { profileId })) return;
      load();
    };
    window.addEventListener(PROFILE_INVALIDATE_EVENT, handler);
    return () => window.removeEventListener(PROFILE_INVALIDATE_EVENT, handler);
  }, [load, profileId]);

  return (
    <>
      <MyTable
        columns={columns}
        dataSource={registrations.map((r) => ({ ...r, key: r._id }))}
        loading={loading}
        selection={false}
        tablePadding={{ paddingLeft: "0", paddingRight: "0" }}
        onRowClick={(record) => setSelectedRegistration(record)}
      />
      <EventRegistrationViewDrawer
        open={Boolean(selectedRegistration)}
        onClose={() => setSelectedRegistration(null)}
        registration={selectedRegistration}
      />
    </>
  );
};

export default ProfileEventsTab;
