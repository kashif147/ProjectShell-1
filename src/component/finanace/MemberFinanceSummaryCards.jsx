import React from "react";
import { Alert, Spin, Tag } from "antd";
import { centsToEuro } from "../../utils/Utilities";
import FinanceInfoIcon, { FinanceLabelWithInfo } from "./FinanceInfoIcon";
import {
  SUMMARY_FOOTER_HELP,
  SUMMARY_METRIC_HELP,
} from "./financeFieldHelp";

function formatEuroCents(cents) {
  const n = Number(cents) || 0;
  return `€${centsToEuro(n).toLocaleString("en-IE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const METRICS = [
  {
    key: "outstandingBalance",
    label: "Outstanding",
    valueColor: "#cf1322",
    help: SUMMARY_METRIC_HELP.outstandingBalance,
  },
  {
    key: "availableCredit",
    label: "Available credit",
    valueColor: "#389e0d",
    help: SUMMARY_METRIC_HELP.availableCredit,
  },
  {
    key: "refundableBalance",
    label: "Refundable",
    valueColor: "#1677ff",
    help: SUMMARY_METRIC_HELP.refundableBalance,
  },
  {
    key: "deferredIncomeBalance",
    label: "Deferred",
    valueColor: "#262626",
    help: SUMMARY_METRIC_HELP.deferredIncomeBalance,
  },
  {
    key: "writtenOffBalance",
    label: "Written off",
    valueColor: "#262626",
    help: SUMMARY_METRIC_HELP.writtenOffBalance,
  },
  {
    key: "unreconciledClearingBalance",
    label: "Unreconciled",
    valueColor: "#262626",
    help: SUMMARY_METRIC_HELP.unreconciledClearingBalance,
  },
];

function MiniCard({ label, value, valueColor, help }) {
  return (
    <div
      style={{
        flex: "1 1 0%",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "8px 10px",
        background: "#fafafa",
        border: "1px solid #d9d9d9",
        borderRadius: 6,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
      }}
    >
      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        <FinanceLabelWithInfo
          label={label}
          help={help}
          labelStyle={{
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.3,
            color: "#434343",
          }}
        />
      </span>
      <span
        style={{
          flex: "0 0 auto",
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.25,
          color: valueColor,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

const MemberFinanceSummaryCards = ({
  summary,
  loading,
  pendingCreditNotes = [],
  onApprovePending,
}) => {
  if (loading && !summary) {
    return (
      <div style={{ padding: "6px 0", minHeight: 36, textAlign: "center" }}>
        <Spin size="small" />
      </div>
    );
  }

  const s = summary || {
    outstandingBalance: 0,
    availableCredit: 0,
    refundableBalance: 0,
    deferredIncomeBalance: 0,
    writtenOffBalance: 0,
    unreconciledClearingBalance: 0,
  };

  return (
    <div style={{ marginBottom: 8, width: "100%" }}>
      {s._loadError ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 6, padding: "2px 8px", fontSize: 11 }}
          message="Summary API unavailable — values may be incomplete."
        />
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "stretch",
          gap: 6,
          width: "100%",
        }}
      >
        {METRICS.map(({ key, label, valueColor, help }) => (
          <MiniCard
            key={key}
            label={label}
            help={help}
            value={formatEuroCents(s[key])}
            valueColor={valueColor}
          />
        ))}
      </div>

      {(s.lastPayment || s.latestInvoice || pendingCreditNotes?.length > 0) && (
        <div
          style={{
            marginTop: 4,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "4px 10px",
            fontSize: 12,
            color: "#595959",
            lineHeight: 1.4,
          }}
        >
          {s.lastPayment ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              Last payment {formatEuroCents(s.lastPayment.amount)}
              {s.lastPayment.date
                ? ` · ${new Date(s.lastPayment.date).toLocaleDateString("en-IE")}`
                : ""}
              <FinanceInfoIcon
                title={SUMMARY_FOOTER_HELP.lastPayment}
                ariaLabel="About last payment"
              />
            </span>
          ) : null}
          {s.latestInvoice ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              Last invoice {formatEuroCents(s.latestInvoice.amount)} ·{" "}
              {s.latestInvoice.docNo || "—"}
              <FinanceInfoIcon
                title={SUMMARY_FOOTER_HELP.lastInvoice}
                ariaLabel="About last invoice"
              />
            </span>
          ) : null}
          {pendingCreditNotes?.length > 0 ? (
            <>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                Pending CN:
                <FinanceInfoIcon
                  title={SUMMARY_FOOTER_HELP.pendingCreditNote}
                  ariaLabel="About pending credit notes"
                />
              </span>
              {pendingCreditNotes.map((cn) => (
                <Tag
                  key={cn.docNo}
                  color="orange"
                  style={{
                    margin: 0,
                    fontSize: 10,
                    lineHeight: "16px",
                    padding: "0 5px",
                    cursor: onApprovePending ? "pointer" : "default",
                  }}
                  onClick={() => onApprovePending?.(cn)}
                >
                  {cn.docNo} {formatEuroCents(cn.amount)}
                </Tag>
              ))}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MemberFinanceSummaryCards;
