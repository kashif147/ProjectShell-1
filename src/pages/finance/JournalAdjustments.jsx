import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Tag, notification } from "antd";
import { LuRefreshCw } from "react-icons/lu";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import { centsToEuro } from "../../utils/Utilities";
import { buildDetailsSearch } from "../../utils/detailsRoute";
import {
  getProfileServiceApiBase,
  searchProfilesByQuery,
} from "../../services/profileSearchApi";
import MyTable from "../../component/common/MyTable";
import JournalAdjustmentDrawer from "../../component/finanace/JournalAdjustmentDrawer";

const statusColor = {
  Draft: "orange",
  Approved: "green",
  Cancelled: "red",
};

function profileDisplayName(p) {
  if (!p) return "";
  const n = `${p.personalInfo?.forename || ""} ${p.personalInfo?.surname || ""}`.trim();
  return n || String(p.fullName || "").trim() || "";
}

const JournalAdjustments = () => {
  const location = useLocation();
  const highlightDocNo = String(location.state?.highlightDocNo || "").trim();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [memberEnrichment, setMemberEnrichment] = useState({});

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${getAccountServiceBaseUrl()}/finance/journal-adjustments`,
        { headers: authHeaders(), params: { limit: 100 } },
      );
      const payload = res.data?.data ?? res.data;
      setItems(payload?.items || []);
    } catch (error) {
      notification.error({
        message: "Could not load journal adjustments",
        description: error?.response?.data?.message || error.message,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!getProfileServiceApiBase() || !items.length) return;
      const need = items.filter(
        (i) => i.memberId && !(i.memberProfileId || i.memberName),
      );
      const ids = [
        ...new Set(
          need.map((i) => String(i.memberId).trim()).filter((m) => m.length >= 2),
        ),
      ];
      if (!ids.length) return;
      const updates = {};
      await Promise.all(
        ids.map(async (memberNo) => {
          try {
            const results = await searchProfilesByQuery(memberNo);
            const lower = memberNo.toLowerCase();
            const exact =
              results.find(
                (r) =>
                  String(r.membershipNumber || "").trim().toLowerCase() === lower,
              ) || results[0];
            if (exact) {
              updates[memberNo] = {
                memberName: profileDisplayName(exact),
                memberProfileId: exact._id,
              };
            }
          } catch {
            /* ignore */
          }
        }),
      );
      if (!cancelled && Object.keys(updates).length) {
        setMemberEnrichment((prev) => ({ ...prev, ...updates }));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const createAdjustment = async (payload) => {
    const res = await axios.post(
      `${getAccountServiceBaseUrl()}/finance/journal-adjustments`,
      payload,
      { headers: authHeaders() },
    );
    const data = res.data?.data ?? res.data;
    return data?.docNo || payload.docNo;
  };

  const handleSubmitDraft = async (payload) => {
    setSubmitting(true);
    try {
      await createAdjustment(payload);
      notification.success({ message: "Draft journal adjustment created" });
      await load();
      return true;
    } catch (error) {
      notification.error({
        message: "Create failed",
        description: error?.response?.data?.message || error.message,
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApprove = async (payload) => {
    setSubmitting(true);
    try {
      const docNo = await createAdjustment(payload);
      await axios.post(
        `${getAccountServiceBaseUrl()}/finance/journal-adjustments/${encodeURIComponent(docNo)}/approve`,
        {},
        { headers: authHeaders() },
      );
      notification.success({
        message: "Journal adjustment approved",
        description: `GL posted for ${docNo}`,
      });
      await load();
      return true;
    } catch (error) {
      notification.error({
        message: "Approve failed",
        description: error?.response?.data?.message || error.message,
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const approve = useCallback(
    async (docNo) => {
      try {
        await axios.post(
          `${getAccountServiceBaseUrl()}/finance/journal-adjustments/${encodeURIComponent(docNo)}/approve`,
          {},
          { headers: authHeaders() },
        );
        notification.success({ message: `Approved ${docNo}` });
        await load();
      } catch (error) {
        notification.error({
          message: "Approve failed",
          description: error?.response?.data?.message || error.message,
        });
      }
    },
    [authHeaders, load],
  );

  const tableData = useMemo(
    () =>
      items.map((row) => {
        const mid = String(row.memberId || "").trim();
        const enriched = mid ? memberEnrichment[mid] : null;
        return {
          ...row,
          key: row.docNo,
          _memberDisplayName: row.memberName || enriched?.memberName || "",
          _memberProfileId: row.memberProfileId || enriched?.memberProfileId || "",
        };
      }),
    [items, memberEnrichment],
  );

  const columns = useMemo(
    () => [
      {
        title: "Adjustment reference",
        dataIndex: "docNo",
        key: "docNo",
        width: 188,
        ellipsis: { showTitle: true },
        render: (docNo) => {
          const isHighlight =
            highlightDocNo && String(docNo || "").trim() === highlightDocNo;
          return (
            <span
              style={{
                display: "block",
                fontFamily: "ui-monospace, monospace",
                fontSize: 13,
                lineHeight: 1.4,
                whiteSpace: "nowrap",
                ...(isHighlight
                  ? { fontWeight: 700, background: "#fff7e6" }
                  : {}),
              }}
            >
              {docNo || "—"}
            </span>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "approvalStatus",
        key: "approvalStatus",
        width: 110,
        render: (status) => (
          <Tag color={statusColor[status] || "default"}>{status || "—"}</Tag>
        ),
      },
      {
        title: "Debit",
        dataIndex: "debitAccount",
        key: "debitAccount",
        width: 90,
      },
      {
        title: "Credit",
        dataIndex: "creditAccount",
        key: "creditAccount",
        width: 90,
      },
      {
        title: "Amount",
        key: "amount",
        width: 110,
        render: (_, r) => `€${centsToEuro(r.amount || 0).toFixed(2)}`,
      },
      {
        title: "Member",
        key: "member",
        width: 220,
        ellipsis: { showTitle: true },
        render: (_, r) => {
          const mid = String(r.memberId || "").trim();
          if (!mid) return "—";
          const name = String(r._memberDisplayName || "").trim();
          const pid = String(r._memberProfileId || "").trim();
          if (name && pid) {
            return (
              <Link
                to={{
                  pathname: "/Details",
                  search: buildDetailsSearch(pid),
                }}
                style={{ color: "#215E97", fontWeight: 500 }}
                title={`${name} (${mid})`}
              >
                {name}
              </Link>
            );
          }
          return (
            <span style={{ color: "rgba(0,0,0,0.65)" }} title={mid}>
              {mid}
            </span>
          );
        },
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        ellipsis: { showTitle: true },
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 100,
        render: (_, r) =>
          r.approvalStatus === "Draft" ? (
            <Button
              type="link"
              size="small"
              className="butn"
              style={{ color: "#215E97", fontWeight: 500, padding: 0 }}
              onClick={() => approve(r.docNo)}
            >
              Approve
            </Button>
          ) : null,
      },
    ],
    [approve, highlightDocNo],
  );

  return (
    <div style={{ width: "100%", padding: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
          padding: "12px 34px 8px",
          flexWrap: "wrap",
        }}
      >
        <Button
          className="gray-btn butn"
          icon={<LuRefreshCw />}
          onClick={load}
          loading={loading}
        >
          Refresh
        </Button>
        <Button
          className="butn primary-btn"
          type="primary"
          onClick={() => setCreateOpen(true)}
        >
          New adjustment
        </Button>
      </div>

      <MyTable
        dataSource={tableData}
        columns={columns}
        loading={loading}
        selection={false}
        scroll={{ x: "max-content", y: 590 }}
        defaultSortField="docNo"
        defaultSortOrder="descend"
      />

      <JournalAdjustmentDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmitDraft={handleSubmitDraft}
        onSubmitApprove={handleSubmitApprove}
        submitLoading={submitting}
      />
    </div>
  );
};

export default JournalAdjustments;
