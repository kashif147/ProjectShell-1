import React, { useState, useEffect } from "react";
import axios from "axios";
import { Drawer, Empty, Table, Row, Col } from "antd";
import {
  IdcardOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { formatDateOnly, centsToEuro } from "../../utils/Utilities";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";

const STATUS_PILL = {
  Active: { bg: "#E8F8EE", color: "#0C8043" },
  Lapsed: { bg: "#FFF4E5", color: "#B45309" },
  Suspended: { bg: "#FFF7E6", color: "#AD6800" },
  Archived: { bg: "#F1F5F9", color: "#475569" },
  Cancelled: { bg: "#FEE2E2", color: "#B91C1C" },
  Resigned: { bg: "#FCE7E7", color: "#C0392B" },
};

const COLORS = {
  sectionTitle: "#0F2A47",
  label: "#94A3B8",
  value: "#0F172A",
  panel: "#F8FAFC",
  panelBorder: "#E2E8F0",
  divider: "#E5E7EB",
  reminderEmpty: "#94A3B8",
  reminderEmptyBg: "#F1F5F9",
  reminderEmptyBorder: "#E2E8F0",
  balanceBg: "#0F172A",
  balanceText: "#FFFFFF",
};

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function formatText(value) {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function formatBool(value) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "—";
}

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "€0.00";
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function formatCentsAsCurrency(cents) {
  const n = Number(cents);
  if (!Number.isFinite(n)) return "€0.00";
  return formatCurrency(centsToEuro(n));
}

function SectionHeader({ icon, title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: COLORS.sectionTitle,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {icon}
      <span>{title}</span>
    </div>
  );
}

function Field({ label, value, span = 6, valueStyle }) {
  return (
    <Col xs={24} sm={12} md={span} style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: COLORS.label,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.value,
          wordBreak: "break-word",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          ...valueStyle,
        }}
      >
        {value}
      </div>
    </Col>
  );
}

function StatusPill({ status }) {
  if (!status) return <span>—</span>;
  const theme = STATUS_PILL[status] || {
    bg: "#F1F5F9",
    color: "#334155",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: theme.bg,
        color: theme.color,
      }}
    >
      {status}
    </span>
  );
}

function PanelBox({ children, style }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.panelBorder}`,
        borderRadius: 8,
        padding: "14px 16px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatusTag({ value, color, bg }) {
  return (
    <span
      style={{
        color,
        background: bg,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: 4,
      }}
    >
      {value}
    </span>
  );
}

const paymentHistoryColumns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    width: 110,
    render: (v) => formatDateOnly(v) || "—",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Debit",
    dataIndex: "debit",
    key: "debit",
    align: "right",
    width: 100,
    render: (v) =>
      v ? (
        <span style={{ color: "#B91C1C", fontWeight: 600 }}>
          {formatCentsAsCurrency(v)}
        </span>
      ) : (
        ""
      ),
  },
  {
    title: "Credit",
    dataIndex: "credit",
    key: "credit",
    align: "right",
    width: 100,
    render: (v) =>
      v ? (
        <span style={{ color: "#0C8043", fontWeight: 600 }}>
          {formatCentsAsCurrency(v)}
        </span>
      ) : (
        ""
      ),
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    align: "right",
    width: 110,
    render: (v) => (
      <span
        style={{
          color: Number(v) < 0 ? "#B91C1C" : COLORS.value,
          fontWeight: 700,
        }}
      >
        {formatCentsAsCurrency(Math.abs(Number(v) || 0))}
        {Number(v) < 0 ? " CR" : ""}
      </span>
    ),
  },
];

function resolvePaymentTypeLabel(item) {
  const docType = String(
    item?.docType || item?.doc_type || item?.documentType || "",
  )
    .trim()
    .toLowerCase();
  if (docType === "claim") return "Online Payment Receipt";
  return (
    item?.paymentType ||
    item?.displayLabel ||
    item?.ledgerDisplayDocType ||
    item?.docType ||
    item?.doc_type ||
    item?.documentType ||
    "Transaction"
  );
}

function getEntryDateMs(value) {
  if (!value) return NaN;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? NaN : t;
}

function getLedgerCreatedAtMs(item) {
  const gl =
    item?.glTransaction ??
    (Array.isArray(item?.glTransactions) && item.glTransactions.length
      ? item.glTransactions[0]
      : null);
  const candidates = [
    item?.createdAt,
    item?.created_at,
    gl?.createdAt,
    gl?.created_at,
    item?.insertedAt,
    item?.inserted_at,
    item?.updatedAt,
    item?.updated_at,
    gl?.updatedAt,
    gl?.updated_at,
    item?.date,
  ];
  for (let i = 0; i < candidates.length; i += 1) {
    const v = candidates[i];
    if (v != null && v !== "") {
      const t = new Date(v).getTime();
      if (!Number.isNaN(t)) return t;
    }
  }
  return 0;
}

function normalizeLedgerMemberKey(v) {
  if (v == null) return "";
  return String(v).trim().toLowerCase();
}

function ledgerItemDocTypeNormForMember(item) {
  const raw = item?.docType ?? item?.doc_type ?? item?.documentType ?? "";
  return String(raw).trim().toLowerCase();
}

function resolveClaimDocumentMemberId(item) {
  const candidates = [
    item?.memberId,
    item?.member_id,
    item?.claimMemberId,
    item?.claimMemberNumber,
    item?.claim?.memberId,
    item?.claim?.member_id,
    item?.claim?.membershipNumber,
    item?.claim?.regNo,
    item?.membershipNumber,
    item?.regNo,
  ];
  for (let i = 0; i < candidates.length; i += 1) {
    const c = candidates[i];
    if (c != null && String(c).trim() !== "") return String(c).trim();
  }
  return null;
}

/** Mirrors FinanceByID.entriesForMemberLedgerAggregation. */
function entriesForMemberLedgerAggregation(item, targetId) {
  const tid = normalizeLedgerMemberKey(targetId);
  const dt = ledgerItemDocTypeNormForMember(item);
  const claimMember = resolveClaimDocumentMemberId(item);
  const list = Array.isArray(item?.entries) ? item.entries : [];

  if (
    dt === "claim" &&
    claimMember != null &&
    String(claimMember).trim() !== ""
  ) {
    const cid = normalizeLedgerMemberKey(claimMember);
    if (cid !== tid) return [];
    const byClaim = list.filter(
      (e) => normalizeLedgerMemberKey(e?.memberId) === cid,
    );
    if (byClaim.length > 0) return byClaim;
    return list.filter((e) => normalizeLedgerMemberKey(e?.memberId) === tid);
  }

  return list.filter((e) => normalizeLedgerMemberKey(e?.memberId) === tid);
}

/** Mirrors FinanceByID.ledgerItemIncludedForMember. */
function ledgerItemIncludedForMember(item, targetId) {
  const tid = normalizeLedgerMemberKey(targetId);
  const dt = ledgerItemDocTypeNormForMember(item);
  const claimMember = resolveClaimDocumentMemberId(item);

  if (
    dt === "claim" &&
    claimMember != null &&
    String(claimMember).trim() !== ""
  ) {
    return normalizeLedgerMemberKey(claimMember) === tid;
  }
  return (
    Array.isArray(item?.entries) &&
    item.entries.some((e) => normalizeLedgerMemberKey(e?.memberId) === tid)
  );
}

function reduceLedgerEntryAmounts(item, targetMemberId) {
  const memberEntries = entriesForMemberLedgerAggregation(item, targetMemberId);
  let debit = 0;
  let credit = 0;
  memberEntries.forEach((e) => {
    const amt = Number(e?.amount) || 0;
    const dc = String(e?.dc || e?.drCr || "").toUpperCase();
    if (dc === "D") debit += amt;
    else if (dc === "C") credit += amt;
  });
  return { debit, credit };
}

function SubscriptionHistoryDetail({ open, onClose, subscription }) {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [computedTotals, setComputedTotals] = useState({
    membershipFee: null,
    totalPaid: null,
    balance: null,
    lastPaymentDate: null,
    lastPaymentAmount: null,
  });

  useEffect(() => {
    if (open && subscription) {
      console.log("[SubscriptionHistoryDetail] opened for subscription:", {
        _id: subscription?._id,
        membershipNumber: subscription?.membershipNumber,
        personalDetails: subscription?.personalDetails,
        startDate: subscription?.startDate,
        endDate: subscription?.endDate,
        subscriptionYear: subscription?.subscriptionYear,
        subscriptionStatus: subscription?.subscriptionStatus,
        cancellation: subscription?.cancellation,
        resignation: subscription?.resignation,
        full: subscription,
      });
    }
  }, [open, subscription]);

  const personalDetails = subscription?.personalDetails || {};
  const professionalDetails = subscription?.professionalDetails || {};
  const cancellation = subscription?.cancellation || {};
  const resignation = subscription?.resignation || {};
  const reminders = subscription?.reminders || {};

  const status = subscription?.subscriptionStatus;

  const memberName =
    personalDetails.fullName ||
    subscription?.user?.userFullName ||
    subscription?.memberName ||
    null;

  const membershipNo =
    personalDetails.membershipNo ||
    subscription?.membershipNumber ||
    subscription?.membershipNo ||
    null;

  const resignedOrCancelledDate =
    resignation.dateResigned || cancellation.dateCancelled || null;

  const resignedOrCancelledReason =
    resignation.reason || cancellation.reason || null;

  const effectiveEndDate = (() => {
    const endMs = subscription?.endDate
      ? new Date(subscription.endDate).getTime()
      : NaN;
    const earlyMs = resignedOrCancelledDate
      ? new Date(resignedOrCancelledDate).getTime()
      : NaN;
    if (!Number.isNaN(earlyMs) && (Number.isNaN(endMs) || earlyMs < endMs)) {
      return resignedOrCancelledDate;
    }
    return subscription?.endDate || null;
  })();

  const endDateLabel = (() => {
    if (!effectiveEndDate) return "End Date";
    const effMs = new Date(effectiveEndDate).getTime();
    const resMs = resignation.dateResigned
      ? new Date(resignation.dateResigned).getTime()
      : NaN;
    const canMs = cancellation.dateCancelled
      ? new Date(cancellation.dateCancelled).getTime()
      : NaN;
    if (!Number.isNaN(resMs) && resMs === effMs) return "Resigned Date";
    if (!Number.isNaN(canMs) && canMs === effMs) return "Cancelled Date";
    return "End Date";
  })();

  useEffect(() => {
    if (!open || !subscription) {
      setPaymentHistory([]);
      setComputedTotals({
        membershipFee: null,
        totalPaid: null,
        balance: null,
        lastPaymentDate: null,
        lastPaymentAmount: null,
      });
      return undefined;
    }
    const memberKey = membershipNo;
    if (!memberKey) {
      setPaymentHistory([]);
      return undefined;
    }
    let cancelled = false;
    const startMs = getEntryDateMs(subscription.startDate);
    const endMs = getEntryDateMs(effectiveEndDate);
    const subYearRaw = subscription?.subscriptionYear;
    const subYearNum = subYearRaw == null ? NaN : Number(subYearRaw);
    const hasSubYear = Number.isFinite(subYearNum);

    const fetchLedger = async () => {
      setPaymentHistoryLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${getAccountServiceBaseUrl()}/reports/member/${memberKey}/ledger`,
          {
            params: { view: "simple" },
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (cancelled) return;
        const items = res?.data?.data?.items || [];
        const memberFiltered = items.filter((it) =>
          ledgerItemIncludedForMember(it, memberKey),
        );
        const hasRange =
          !Number.isNaN(startMs) || !Number.isNaN(endMs);
        const matchesByRange = (it) => {
          const t = getEntryDateMs(it?.date);
          if (Number.isNaN(t)) return false;
          if (!Number.isNaN(startMs) && t < startMs) return false;
          if (!Number.isNaN(endMs) && t > endMs + 24 * 60 * 60 * 1000)
            return false;
          return true;
        };
        const matchesByYear = (it) => {
          if (!hasSubYear) return false;
          const t = getEntryDateMs(it?.date);
          if (Number.isNaN(t)) return false;
          return new Date(t).getFullYear() === subYearNum;
        };
        const inRange = hasRange
          ? memberFiltered.filter(matchesByRange)
          : hasSubYear
            ? memberFiltered.filter(matchesByYear)
            : [];

        const inRangeAsc = [...inRange].sort(
          (a, b) => getLedgerCreatedAtMs(a) - getLedgerCreatedAtMs(b),
        );

        let totalDebit = 0;
        let totalCredit = 0;
        let invoiceTotal = 0;
        let runningBalance = 0;
        let hasAnyEntry = false;
        const rows = [];
        inRangeAsc.forEach((it, idx) => {
          const { debit, credit } = reduceLedgerEntryAmounts(it, memberKey);
          if (debit === 0 && credit === 0) return;
          hasAnyEntry = true;
          totalDebit += debit;
          totalCredit += credit;
          runningBalance += debit - credit;

          const rawDocType = String(
            it?.docType || it?.doc_type || it?.documentType || "",
          )
            .trim()
            .toLowerCase();
          if (rawDocType === "invoice") invoiceTotal += debit;

          rows.push({
            key: it?._id || `entry-${idx}`,
            date: it?.date,
            type: resolvePaymentTypeLabel(it),
            debit,
            credit,
            balance: runningBalance,
            amount: credit > 0 ? credit : debit,
            isCredit: credit > 0,
            status: "VERIFIED",
          });
        });

        const lastPayment = [...rows].reverse().find((r) => r.isCredit) || null;

        const rowsDesc = [...rows].reverse();

        if (!cancelled) {
          setPaymentHistory(rowsDesc);
          setComputedTotals({
            membershipFee: invoiceTotal || null,
            totalPaid: totalCredit || null,
            balance: hasAnyEntry ? totalDebit - totalCredit : null,
            lastPaymentDate: lastPayment?.date || null,
            lastPaymentAmount: lastPayment?.amount ?? null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setPaymentHistory([]);
          setComputedTotals({
            membershipFee: null,
            totalPaid: null,
            balance: null,
            lastPaymentDate: null,
            lastPaymentAmount: null,
          });
        }
      } finally {
        if (!cancelled) setPaymentHistoryLoading(false);
      }
    };

    fetchLedger();
    return () => {
      cancelled = true;
    };
  }, [
    open,
    membershipNo,
    subscription?._id,
    subscription?.startDate,
    subscription?.subscriptionYear,
    effectiveEndDate,
  ]);

  const membershipFeeValue = computedTotals.membershipFee;
  const lastPaymentAmountValue = computedTotals.lastPaymentAmount;
  const lastPaymentDateValue = computedTotals.lastPaymentDate;

  return (
    <Drawer
      title="Subscription Details"
      open={open}
      onClose={onClose}
      width={750}
      destroyOnClose
      maskClosable
      placement="right"
      styles={{
        body: {
          padding: 0,
          background: "#FFFFFF",
        },
        header: { fontWeight: 600 },
      }}
    >
      {!subscription ? (
        <Empty description="No subscription selected" />
      ) : (
        <div
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px 20px 20px",
            background: "#FFFFFF",
            height: "100%",
          }}
        >
          {/* MEMBER IDENTITY & WORKSPACE */}
          <SectionHeader
            icon={<IdcardOutlined />}
            title="Member Identity & Workspace"
          />
          <PanelBox style={{ marginBottom: 18 }}>
            <Row gutter={[24, 16]}>
              <Field label="Member Name" value={formatText(memberName)} />
              <Field label="Membership No" value={formatText(membershipNo)} />
              <Field
                label="Subscription Year"
                value={formatText(subscription.subscriptionYear)}
              />
              <Field
                label="First Join Date"
                value={formatDateOnly(subscription.startDate) || "—"}
              />
            </Row>
            <div
              style={{
                height: 1,
                background: COLORS.panelBorder,
                margin: "14px 0",
              }}
            />
            <Row gutter={[24, 16]}>
              <Field
                label="Work Location"
                span={8}
                value={formatText(professionalDetails.workLocation)}
              />
              <Field
                label="Grade"
                span={8}
                value={formatText(professionalDetails.grade)}
              />
              <Field
                label="Section"
                span={8}
                value={formatText(professionalDetails.primarySection)}
              />
            </Row>
          </PanelBox>

          {/* SUBSCRIPTION & LIFECYCLE */}
          <SectionHeader
            icon={<CalendarOutlined />}
            title="Subscription & Lifecycle"
          />
          <PanelBox style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                columnGap: 24,
                rowGap: 16,
              }}
            >
              <Row gutter={[0, 16]}>
                <Field
                  label="Membership Category"
                  span={24}
                  value={formatText(subscription.membershipCategory)}
                />
                <Field
                  label="Start Date"
                  span={24}
                  value={formatDateOnly(subscription.startDate) || "—"}
                />
                <Field
                  label="Reminder 1"
                  span={24}
                  value={formatDateOnly(reminders.reminder1At) || "—"}
                />
              </Row>

              <Row gutter={[0, 16]}>
                <Field
                  label="Status"
                  span={24}
                  value={<StatusPill status={status} />}
                />
                <Field
                  label={endDateLabel}
                  span={24}
                  value={formatDateOnly(effectiveEndDate) || "—"}
                />
                <Field
                  label="Reminder 2"
                  span={24}
                  value={formatDateOnly(reminders.reminder2At) || "—"}
                />
              </Row>

              <Row gutter={[0, 16]}>
                <Field
                  label="Reinstated"
                  span={24}
                  value={formatBool(cancellation.reinstated)}
                />
                <Field
                  label="Resignation Reason"
                  span={24}
                  value={formatText(resignedOrCancelledReason)}
                />
                <Field
                  label="Reminder 3"
                  span={24}
                  value={formatDateOnly(reminders.reminder3At) || "—"}
                />
              </Row>
            </div>
          </PanelBox>

          {/* FINANCIALS & PAYMENT */}
          <SectionHeader
            icon={<CreditCardOutlined />}
            title="Financials & Payment"
          />
          <PanelBox style={{ marginBottom: 18 }}>
            <Row gutter={[24, 16]}>
              <Field
                label="Payment Method"
                span={6}
                value={formatText(subscription.paymentType)}
              />
              <Field
                label="Frequency"
                span={6}
                value={formatText(subscription.paymentFrequency)}
              />
              <Field
                label="Payroll No"
                span={6}
                value={formatText(subscription.payrollNo)}
              />
              <Field
                label="NMBI Number"
                span={6}
                value={formatText(professionalDetails.nmbiNumber)}
              />
              <Field
                label="Membership Fee"
                span={6}
                value={
                  membershipFeeValue == null
                    ? "—"
                    : formatCentsAsCurrency(membershipFeeValue)
                }
              />
              <Field
                label="Last Payment Amount"
                span={6}
                value={
                  lastPaymentAmountValue == null
                    ? "—"
                    : formatCentsAsCurrency(lastPaymentAmountValue)
                }
              />
              <Field
                label="Last Payment Date"
                span={6}
                value={formatDateOnly(lastPaymentDateValue) || "—"}
              />
              <Field
                label="Last Modified"
                span={6}
                value={formatDateTime(subscription.lastModifiedAt)}
              />
            </Row>
          </PanelBox>

          {/* LEDGER */}
          <SectionHeader icon={<HistoryOutlined />} title="Ledger" />
          <PanelBox style={{ padding: 0, overflow: "hidden" }}>
            <Table
              size="small"
              columns={paymentHistoryColumns}
              dataSource={paymentHistory}
              loading={paymentHistoryLoading}
              pagination={false}
              locale={{
                emptyText: "Historical records archived below this line",
              }}
              style={{ background: "transparent" }}
            />
          </PanelBox>
        </div>
      )}
    </Drawer>
  );
}

export default SubscriptionHistoryDetail;
