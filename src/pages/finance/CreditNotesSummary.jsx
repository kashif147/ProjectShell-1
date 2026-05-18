import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Tag, notification } from "antd";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import { centsToEuro } from "../../utils/Utilities";
import { buildDetailsSearch } from "../../utils/detailsRoute";
import MyTable from "../../component/common/MyTable";

const statusColor = {
  Draft: "orange",
  Approved: "green",
  Cancelled: "red",
  Posted: "blue",
};

const CreditNotesSummary = () => {
  const location = useLocation();
  const highlightDocNo = String(
    location.state?.highlightDocNo || "",
  ).trim();
  const filterMemberId = String(location.state?.memberId || "").trim();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (filterMemberId) params.memberId = filterMemberId;
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get(
        `${getAccountServiceBaseUrl()}/journal/credit-notes`,
        { headers: authHeaders(), params },
      );
      const payload = res.data?.data ?? res.data;
      setItems(payload?.items || []);
    } catch (error) {
      notification.error({
        message: "Could not load credit notes",
        description: error?.response?.data?.message || error?.message,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, filterMemberId, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo(
    () => [
      {
        title: "CN ref",
        dataIndex: "docNo",
        key: "docNo",
        width: 140,
        render: (docNo, row) => {
          const isHighlight =
            highlightDocNo &&
            String(docNo || "").trim() === highlightDocNo;
          return (
            <span
              style={
                isHighlight
                  ? { fontWeight: 700, background: "#fff7e6", padding: "0 4px" }
                  : undefined
              }
            >
              {docNo || "—"}
            </span>
          );
        },
      },
      {
        title: "Invoice",
        dataIndex: "invoiceDocNo",
        key: "invoiceDocNo",
        width: 130,
      },
      {
        title: "Member",
        dataIndex: "memberId",
        key: "memberId",
        width: 110,
        render: (mid) =>
          mid ? (
            <Link
              to={{
                pathname: "/Details",
                search: buildDetailsSearch({ memberId: mid }),
              }}
            >
              {mid}
            </Link>
          ) : (
            "—"
          ),
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        width: 100,
        align: "right",
        render: (cents) =>
          `€${centsToEuro(Number(cents) || 0).toLocaleString("en-IE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (st) => (
          <Tag color={statusColor[st] || "default"}>{st || "—"}</Tag>
        ),
      },
      {
        title: "Effective",
        dataIndex: "effectiveDate",
        key: "effectiveDate",
        width: 110,
        render: (d) =>
          d ? new Date(d).toLocaleDateString("en-IE") : "—",
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        ellipsis: true,
      },
    ],
    [highlightDocNo],
  );

  return (
    <div className="p-3">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600 }}>Credit notes</span>
        {filterMemberId ? (
          <Tag>Member {filterMemberId}</Tag>
        ) : null}
        <Button size="small" onClick={() => setStatusFilter("")}>
          All
        </Button>
        <Button size="small" onClick={() => setStatusFilter("Draft")}>
          Draft
        </Button>
        <Button size="small" onClick={() => setStatusFilter("Approved")}>
          Approved
        </Button>
        <Button size="small" type="link" onClick={load}>
          Refresh
        </Button>
      </div>
      <MyTable
        columns={columns}
        dataSource={items.map((row, i) => ({
          ...row,
          key: row.docNo || row._id || `cn-${i}`,
        }))}
        loading={loading}
        footerVariant="infinite"
        infiniteLoadOnScroll={false}
      />
    </div>
  );
};

export default CreditNotesSummary;
