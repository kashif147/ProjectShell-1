import React from "react";
import {
  AppstoreOutlined,
  BankOutlined,
  ContainerOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { centsToEuro } from "../../utils/Utilities";

const CLEARING_CHIP_THEMES = {
  all: {
    label: "All",
    icon: <AppstoreOutlined />,
    iconColor: "#3b82f6",
    iconBg: "#dbeafe",
  },
  "1210": {
    label: "Cheque",
    icon: <FileTextOutlined />,
    iconColor: "#ef4444",
    iconBg: "#fee2e2",
  },
  "1220": {
    label: "Card",
    icon: <CreditCardOutlined />,
    iconColor: "#22c55e",
    iconBg: "#dcfce7",
  },
  "1230": {
    label: "Salary",
    icon: <UserOutlined />,
    iconColor: "#a855f7",
    iconBg: "#f3e8ff",
  },
  "1240": {
    label: "Standing Order",
    icon: <ContainerOutlined />,
    iconColor: "#f97316",
    iconBg: "#ffedd5",
  },
  "1250": {
    label: "Direct Debit",
    icon: <BankOutlined />,
    iconColor: "#14b8a6",
    iconBg: "#ccfbf1",
  },
};

function formatEuro(cents) {
  return `€${centsToEuro(Number(cents) || 0).toFixed(2)}`;
}

function formatItemCount(count) {
  const n = Number(count) || 0;
  return `${n} item${n === 1 ? "" : "s"}`;
}

function getTheme(code) {
  return (
    CLEARING_CHIP_THEMES[code] ||
    CLEARING_CHIP_THEMES[String(code)] || {
      label: code,
      icon: <AppstoreOutlined />,
      iconColor: "#64748b",
      iconBg: "#f1f5f9",
    }
  );
}

function chipCardStyle(isActive) {
  return {
    flex: "1 1 0",
    minWidth: 0,
    padding: "10px 12px",
    textAlign: "left",
    cursor: "pointer",
    border: isActive ? "1.5px solid #215e97" : "1px solid #e2e8f0",
    borderRadius: 12,
    background: isActive ? "#f8fbff" : "#ffffff",
    boxShadow: isActive
      ? "0 2px 8px rgba(33, 94, 151, 0.1)"
      : "0 1px 3px rgba(15, 23, 42, 0.06)",
    transition:
      "border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease",
    color: "#0f172a",
    fontFamily: "inherit",
    appearance: "none",
  };
}

function SummaryStat({ label, value, valueColor = "#0f172a" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 5,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor }}>
        {value}
      </span>
    </span>
  );
}

function SummaryDivider() {
  return (
    <span
      style={{
        width: 1,
        height: 14,
        backgroundColor: "#e2e8f0",
        flexShrink: 0,
      }}
    />
  );
}


function ReconciliationSummaryStats({
  openAmountLabel,
  openAmountCents,
  unmatchedCount,
  autoMatched,
  manualMatched,
  suspenseCount,
  settled,
  filterTotal,
}) {
  return (
    <>
      <SummaryStat
        label={openAmountLabel}
        value={formatEuro(openAmountCents)}
      />
      <SummaryDivider />
      <SummaryStat
        label="Unmatched"
        value={unmatchedCount}
        valueColor={unmatchedCount > 0 ? "#ef4444" : "#0f172a"}
      />
      <SummaryDivider />
      <SummaryStat label="Auto matched" value={autoMatched} />
      <SummaryDivider />
      <SummaryStat label="Manual matched" value={manualMatched} />
      <SummaryDivider />
      <SummaryStat
        label="Suspense"
        value={suspenseCount}
        valueColor={suspenseCount > 0 ? "#d97706" : "#0f172a"}
      />
      <SummaryDivider />
      <SummaryStat label="Settled" value={settled} />
      <SummaryDivider />
      <SummaryStat label="Filter total" value={filterTotal} />
    </>
  );
}

function ReconciliationClearingChip({
  code,
  openAmountCents,
  itemCount,
  isActive,
  onClick,
  title,
}) {
  const theme = getTheme(code);

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={chipCardStyle(isActive)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: theme.iconBg,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.iconColor,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {theme.icon}
        </span>
        <span style={{ flex: "1 1 auto", minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 500,
              color: "#64748b",
              lineHeight: 1.2,
              marginBottom: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {theme.label}
          </span>
          <span
            style={{
              display: "block",
              fontSize: 16,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.15,
            }}
          >
            {formatEuro(openAmountCents)}
          </span>
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "#94a3b8",
            whiteSpace: "nowrap",
            flexShrink: 0,
            alignSelf: "center",
          }}
        >
          {formatItemCount(itemCount)}
        </span>
      </div>
    </button>
  );
}

export default function ReconciliationClearingTabBar({
  clearingCode,
  dashboard,
  onSelect,
  summary,
  summaryOnly = false,
}) {
  const {
    openAmountLabel = "All open",
    openAmountCents = 0,
    unmatchedCount = 0,
    autoMatched = 0,
    manualMatched = 0,
    suspenseCount = 0,
    settled = 0,
    filterTotal = 0,
  } = summary || {};

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "8px 0 10px",
        borderBottom: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      {!summaryOnly ? (
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            width: "100%",
            gap: 10,
          }}
        >
          <ReconciliationClearingChip
            code="all"
            openAmountCents={dashboard?.totals?.openAmount ?? 0}
            itemCount={dashboard?.totals?.unreconciledCount ?? 0}
            isActive={clearingCode === "all"}
            onClick={() => onSelect("all")}
            title={
              dashboard?.totals
                ? `All clearing accounts · Open ${formatEuro(dashboard.totals.openAmount)} · ${formatItemCount(dashboard.totals.unreconciledCount)} unreconciled`
                : "All clearing accounts"
            }
          />
          {(dashboard?.accounts || []).map((acc) => {
            const code = acc.clearingAccountCode;
            const theme = getTheme(code);
            const tooltip = [
              `${code} — ${theme.label}`,
              `Open ${formatEuro(acc.openAmount)}`,
              `${formatItemCount(acc.unreconciledCount)} unreconciled`,
              `Pending GL: ${acc.pendingGlCount ?? 0}`,
              acc.lastReconciledAt
                ? `Last: ${new Date(acc.lastReconciledAt).toLocaleDateString("en-IE")}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <ReconciliationClearingChip
                key={code}
                code={code}
                openAmountCents={acc.openAmount ?? 0}
                itemCount={acc.unreconciledCount ?? 0}
                isActive={clearingCode === code}
                onClick={() => onSelect(code)}
                title={tooltip}
              />
            );
          })}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          width: "100%",
        }}
      >
        <ReconciliationSummaryStats
          openAmountLabel={openAmountLabel}
          openAmountCents={openAmountCents}
          unmatchedCount={unmatchedCount}
          autoMatched={autoMatched}
          manualMatched={manualMatched}
          suspenseCount={suspenseCount}
          settled={settled}
          filterTotal={filterTotal}
        />
      </div>
    </div>
  );
}

/* Legacy exports — kept for any external imports */
export function ReconciliationClearingPillRow({ children, style }) {
  return <div style={style}>{children}</div>;
}

export function ReconciliationClearingPillAll() {
  return null;
}

export function ReconciliationClearingPillAccount() {
  return null;
}
