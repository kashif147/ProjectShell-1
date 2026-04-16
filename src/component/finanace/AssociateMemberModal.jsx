import React, { useEffect, useMemo, useRef, useState } from "react";
import { Row, Col, Input, Dropdown, Checkbox, message, Alert, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import {
  getProfileServiceApiBase,
  searchProfilesByQuery,
} from "../../services/profileSearchApi";
import MemberSearchOptionLabel from "../profile/MemberSearchOptionLabel";

const buildAssociateMemberUrl = () => {
  const base = (process.env.REACT_APP_ACCOUNT_SERVICE_URL || "").replace(/\/$/, "");
  return base ? `${base}/payments/associate-member` : "";
};

const VARIANT_CONFIG = {
  refunds: {
    title: "Associate refund to member",
    contextTag: "Refunds",
    description:
      "Sets the membership number on this refund in account-service. Posted GL journals are not changed.",
    checkboxLabel: "Update this refund record",
    applicationHelp:
      "Optional. Prefilled from the row when available; also used to match other refunds for the same application.",
  },
  receipts: {
    title: "Associate payment to member",
    contextTag: "Online payments",
    description:
      "Sets the membership number on the underlying payment record for this Stripe receipt. Posted GL journals are not changed.",
    checkboxLabel: "Update this payment record",
    applicationHelp:
      "Optional. Prefilled from the row when available; also used to match other payments for the same application.",
  },
};

/** GL receipt docNo is RCP-<24-char hex payment _id>. */
export function paymentMongoIdsFromReceiptRows(rows) {
  const ids = [];
  for (const r of rows || []) {
    const docNo = r?.docNo ?? r?.transactionId;
    if (!docNo) continue;
    const m = String(docNo).trim().match(/^RCP-([a-fA-F0-9]{24})$/i);
    if (m) ids.push(m[1]);
  }
  return [...new Set(ids)];
}

export function refundMongoIdsFromRows(rows) {
  return [
    ...new Set(
      (rows || [])
        .map((r) => r?._id ?? r?.id)
        .filter(Boolean)
        .map((id) => String(id))
    ),
  ];
}

function firstApplicationIdFromRows(rows) {
  for (const r of rows || []) {
    const v =
      r?.applicationNo ??
      r?.applicationId ??
      r?.ApplicationId ??
      r?.appId ??
      null;
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

/**
 * Manual backfill: POST /api/payments/associate-member
 * @param {'refunds'|'receipts'} variant — Refunds page vs Online payment page
 */
export default function AssociateMemberModal({
  open,
  onClose,
  onSuccess,
  selectedRows = [],
  variant = "refunds",
}) {
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.refunds;

  /** Parents often pass `selectedRows={[row]}` — new array ref every render; do not reset form on that. */
  const selectedRowsIdentity = useMemo(() => {
    const rows = selectedRows || [];
    const parts = rows.map((r) =>
      [String(r?._id ?? r?.id ?? ""), String(r?.docNo ?? r?.transactionId ?? "")].join(":")
    );
    return `${variant}:${parts.join("|")}`;
  }, [selectedRows, variant]);

  const [memberId, setMemberId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  /** Single scope toggle: refunds → includeRefunds; receipts → includePayments */
  const [updateRecord, setUpdateRecord] = useState(true);
  const [onlyIfMissingMemberId, setOnlyIfMissingMemberId] = useState(true);
  const [loading, setLoading] = useState(false);
  /** null = no search yet for current query; [] = searched, no rows; else hits */
  const [memberResults, setMemberResults] = useState(null);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const memberSearchTimerRef = useRef(null);
  const memberSearchGenRef = useRef(0);

  useEffect(() => {
    return () => {
      if (memberSearchTimerRef.current) {
        clearTimeout(memberSearchTimerRef.current);
        memberSearchTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setMemberId("");
    setApplicationId(firstApplicationIdFromRows(selectedRows));
    setUpdateRecord(true);
    setOnlyIfMissingMemberId(true);
    setMemberResults(null);
    setMemberSearchLoading(false);
    if (memberSearchTimerRef.current) {
      clearTimeout(memberSearchTimerRef.current);
      memberSearchTimerRef.current = null;
    }
    memberSearchGenRef.current += 1;
  }, [open, variant, selectedRowsIdentity]);

  const scheduleMemberSearch = (raw) => {
    if (memberSearchTimerRef.current) {
      clearTimeout(memberSearchTimerRef.current);
      memberSearchTimerRef.current = null;
    }
    const t = String(raw || "").trim();
    if (t.length < 2) {
      setMemberResults(null);
      setMemberSearchLoading(false);
      return;
    }
    const profileBase = getProfileServiceApiBase();
    if (!profileBase) {
      setMemberResults(null);
      return;
    }
    memberSearchTimerRef.current = setTimeout(async () => {
      const gen = ++memberSearchGenRef.current;
      setMemberSearchLoading(true);
      setMemberResults(null);
      try {
        const rows = await searchProfilesByQuery(t);
        if (gen !== memberSearchGenRef.current) return;
        const list = rows
          .filter((r) => r?.membershipNumber)
          .map((r) => ({ ...r, membershipNumber: String(r.membershipNumber).trim() }))
          .slice(0, 20);
        setMemberResults(list);
      } catch (err) {
        if (gen !== memberSearchGenRef.current) return;
        setMemberResults([]);
        message.warning(err?.message || "Member search failed");
      } finally {
        if (gen === memberSearchGenRef.current) {
          setMemberSearchLoading(false);
        }
        memberSearchTimerRef.current = null;
      }
    }, 300);
  };

  const handleMemberInputChange = (e) => {
    const v = e.target.value;
    setMemberId(v);
    scheduleMemberSearch(v);
  };

  const memberPickerOpen =
    memberId.trim().length >= 2 &&
    !!getProfileServiceApiBase() &&
    (memberSearchLoading || memberResults !== null);

  const memberPickerPanel = (
    <div
      style={{
        maxHeight: 400,
        overflowY: "auto",
        minWidth: 420,
        padding: 4,
        borderRadius: 4,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        background: "#fff",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {memberSearchLoading ? (
        <div style={{ padding: 16, textAlign: "center" }}>
          <Spin size="small" />
        </div>
      ) : !memberResults?.length ? (
        <div style={{ padding: 12, color: "#999" }}>No matches</div>
      ) : (
        memberResults.map((m) => (
          <div
            key={m._id || m.membershipNumber}
            role="option"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setMemberId(m.membershipNumber);
              memberSearchGenRef.current += 1;
              setMemberSearchLoading(false);
              setMemberResults(null);
            }}
            style={{
              padding: "4px 8px",
              cursor: "pointer",
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <MemberSearchOptionLabel member={m} />
          </div>
        ))
      )}
    </div>
  );

  const paymentIds = paymentMongoIdsFromReceiptRows(selectedRows);
  const refundIds = refundMongoIdsFromRows(selectedRows);

  const includePayments = variant === "receipts" && updateRecord;
  const includeRefunds = variant === "refunds" && updateRecord;

  const handleSubmit = async () => {
    const url = buildAssociateMemberUrl();
    if (!url) {
      message.error("REACT_APP_ACCOUNT_SERVICE_URL is not configured.");
      return;
    }
    const mid = String(memberId || "").trim();
    if (!mid) {
      message.error("Member ID is required.");
      return;
    }
    const app = String(applicationId || "").trim();
    const body = {
      memberId: mid,
      ...(app ? { applicationId: app } : {}),
      ...(paymentIds.length ? { paymentIds } : {}),
      ...(refundIds.length ? { refundIds } : {}),
      includePayments,
      includeRefunds,
      onlyIfMissingMemberId,
    };
    if (!app && !paymentIds.length && !refundIds.length) {
      message.error(
        "This row has no linkable id. Enter an Application ID, or open the action from a row that has a refund or RCP receipt id."
      );
      return;
    }
    if (!includePayments && !includeRefunds) {
      message.error("Enable the update option to continue.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = res?.data?.data ?? res?.data;
      const pu = data?.payments?.updated ?? 0;
      const ru = data?.refunds?.updated ?? 0;
      if (variant === "refunds") {
        message.success(ru > 0 ? `Refund updated (${ru}).` : "No refund rows required an update.");
      } else {
        message.success(pu > 0 ? `Payment updated (${pu}).` : "No payment rows required an update.");
      }
      onSuccess?.(data);
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error?.message ||
        e?.message ||
        "Associate member failed";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const rowHint =
    variant === "refunds"
      ? refundIds.length
        ? `Refund id: ${refundIds[0]}`
        : "No refund id on row"
      : paymentIds.length
        ? `Payment id: ${paymentIds[0]}`
        : "No RCP payment id on receipt (docNo should look like RCP-… )";

  const drawerTitle = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <span>{cfg.title}</span>
      <span style={{ color: "rgba(0,0,0,0.45)", fontSize: 13, fontWeight: 400 }}>
        {cfg.contextTag}
      </span>
    </div>
  );

  const memberSearchHelp = getProfileServiceApiBase()
    ? "Type at least 2 characters to search profiles, or enter a membership number manually."
    : "Set REACT_APP_PROFILE_SERVICE_URL (e.g. …/profile-service/api) to enable member search.";

  return (
    <MyDrawer
      title={drawerTitle}
      open={open}
      onClose={onClose}
      width={700}
      isPagination={false}
      add={handleSubmit}
      isLoading={loading}
    >
      <div style={{ padding: "10px" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Alert type="info" showIcon message={cfg.description} />
          </Col>
          <Col span={24}>
            <div className="my-input-wrapper" style={{ marginBottom: 0 }}>
              <label className="my-input-label">
                Member ID (membership no.) <span className="star">*</span>
              </label>
              <Dropdown
                menu={{ items: [] }}
                trigger={[]}
                open={memberPickerOpen}
                onOpenChange={(nextOpen) => {
                  if (!nextOpen) {
                    memberSearchGenRef.current += 1;
                    setMemberSearchLoading(false);
                    setMemberResults(null);
                  }
                }}
                getPopupContainer={(n) =>
                  n.closest(".drawer-main-cntainer") ||
                  n.closest(".ant-drawer-body") ||
                  n.parentNode
                }
                placement="bottomLeft"
                dropdownRender={() => memberPickerPanel}
              >
                <div style={{ width: "100%" }}>
                  <Input
                    allowClear
                    value={memberId}
                    onChange={handleMemberInputChange}
                    placeholder="e.g. B00003 — search or type membership no."
                    suffix={memberSearchLoading ? <LoadingOutlined /> : null}
                    style={{
                      width: "100%",
                      borderRadius: 4,
                      border: "1px solid #d9d9d9",
                      height: 40,
                      fontSize: 16,
                      lineHeight: "24px",
                      backgroundColor: "#fff",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </Dropdown>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(0,0,0,0.45)",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                {memberSearchHelp}
              </p>
            </div>
          </Col>
          <Col span={24}>
            <MyInput
              label="Application ID"
              name="applicationId"
              placeholder="UUID (optional)"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
            />
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", marginTop: 6, marginBottom: 0 }}>
              {cfg.applicationHelp}
            </p>
          </Col>
          <Col span={24}>
            <div className="my-input-wrapper" style={{ marginBottom: 0 }}>
              <Checkbox
                checked={updateRecord}
                onChange={(e) => setUpdateRecord(e.target.checked)}
              >
                {cfg.checkboxLabel}
              </Checkbox>
            </div>
          </Col>
          <Col span={24}>
            <div className="my-input-wrapper" style={{ marginBottom: 0 }}>
              <Checkbox
                checked={onlyIfMissingMemberId}
                onChange={(e) => setOnlyIfMissingMemberId(e.target.checked)}
              >
                Only if member ID is missing (recommended)
              </Checkbox>
            </div>
          </Col>
          <Col span={24}>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", margin: 0 }}>{rowHint}</p>
          </Col>
        </Row>
      </div>
    </MyDrawer>
  );
}
