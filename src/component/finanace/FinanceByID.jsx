import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Empty, notification, Dropdown, Tooltip, Segmented } from "antd";
import { MoreOutlined, InfoCircleOutlined } from "@ant-design/icons";
import RefundDrawer from "./RefundDrawer";
import WriteOffDrawer from "./WriteOffDrawer";
import ReallocationDrawer from "./ReallocationDrawer";
import dayjs from "dayjs";
import { useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import MyTable from "../common/MyTable";
import { centsToEuro, formatDateOnly } from "../../utils/Utilities";
// import axios from "axios";
import { useTableColumns } from "../../context/TableColumnsContext ";

/** GL doc type values shown with friendlier labels in the Finance grid. */
function displayDocTypeLabel(raw) {
  if (raw == null || String(raw).trim() === "") return "—";
  const s = String(raw).trim();
  const norm = s.toLowerCase();
  if (norm === "ledgersummary") return "Summary";
  return s;
}

function pickFirstNonEmptyString(...candidates) {
  for (let i = 0; i < candidates.length; i += 1) {
    const c = candidates[i];
    if (c != null && String(c).trim() !== "") return String(c).trim();
  }
  return null;
}

function glFromLedgerItem(item) {
  return (
    item?.glTransaction ??
    (Array.isArray(item?.glTransactions) && item.glTransactions.length
      ? item.glTransactions[0]
      : null)
  );
}

/**
 * System timestamps for a ledger line (not Tx/posting date). Used for running balance order.
 */
function createdAtChainRaw(item) {
  const gl = glFromLedgerItem(item);
  return pickFirstNonEmptyString(
    item?.createdAt,
    item?.created_at,
    gl?.createdAt,
    gl?.created_at,
    item?.insertedAt,
    item?.inserted_at,
    item?.updatedAt,
    item?.updated_at,
    gl?.updatedAt,
    gl?.updated_at
  );
}

function createdAtSortKeyMs(item) {
  const raw = createdAtChainRaw(item);
  if (raw && dayjs(raw).isValid()) return dayjs(raw).valueOf();
  return null;
}

/** Oldest-first by createdAt (etc.) only; Tx Date is not used. Tie-break: doc/id. */
function compareLedgerByCreatedAtAsc(a, b) {
  const ka = createdAtSortKeyMs(a);
  const kb = createdAtSortKeyMs(b);
  if (ka != null && kb != null && ka !== kb) return ka - kb;
  if (ka != null && kb == null) return -1;
  if (ka == null && kb != null) return 1;
  const ida = String(a._id ?? a.docNo ?? "");
  const idb = String(b._id ?? b.docNo ?? "");
  return ida.localeCompare(idb);
}

/** Sort by posting Tx date only (column header). */
function compareLedgerByTransactionDateAsc(a, b) {
  const ta = dayjs(a.date).isValid() ? dayjs(a.date).unix() : 0;
  const tb = dayjs(b.date).isValid() ? dayjs(b.date).unix() : 0;
  if (ta !== tb) return ta - tb;
  const ka = String(a._id ?? a.key ?? a.docNo ?? "");
  const kb = String(b._id ?? b.key ?? b.docNo ?? "");
  return ka.localeCompare(kb);
}

function resolveLedgerCreatedAtDisplay(item) {
  const raw = createdAtChainRaw(item);
  return raw && dayjs(raw).isValid() ? raw : "";
}

/** For row ordering: prefer API updatedAt, else transaction date. */
function resolveLedgerUpdatedAt(item, gl, transactionDate) {
  const raw = pickFirstNonEmptyString(
    item.updatedAt,
    item.updated_at,
    gl?.updatedAt,
    gl?.updated_at,
    item.modifiedAt,
    item.modified_at,
    item.lastModified,
    item.last_modified
  );
  if (raw && dayjs(raw).isValid()) return raw;
  if (transactionDate && dayjs(transactionDate).isValid()) return transactionDate;
  return "";
}

/** How the payment was received (ledger / settlement / GL). */
function resolvePaymentTypeSource(item, gl) {
  const st =
    item?.settlement && typeof item.settlement === "object"
      ? item.settlement
      : null;
  return pickFirstNonEmptyString(
    item?.paymentType,
    item?.paymentMethod,
    item?.payMethod,
    item?.method,
    item?.paymentChannel,
    item?.channel,
    st?.provider,
    st?.paymentMethod,
    st?.method,
    st?.type,
    item?.payment?.method,
    item?.payment?.type,
    gl?.paymentType,
    gl?.paymentMethod,
    gl?.payMethod
  );
}

/** Normalize payment method labels for display (deductions, card, DD, etc.). */
function displayPaymentType(raw) {
  if (raw == null || String(raw).trim() === "") return "—";
  const s = String(raw).trim();
  const compact = s.toLowerCase().replace(/[\s_-]+/g, "");
  const aliases = {
    stripe: "Credit Card",
    card: "Credit Card",
    creditcard: "Credit Card",
    directdebit: "Direct Debit",
    standingorder: "Standing Order",
    standingorders: "Standing Order",
    cheque: "Cheque",
    check: "Cheque",
    cash: "Cash",
    cashpayment: "Cash",
    deduction: "Deductions",
    deductions: "Deductions",
    salarydeduction: "Deductions",
    payrolldeduction: "Deductions",
    payroll: "Deductions",
    banktransfer: "Bank Transfer",
    transfer: "Bank Transfer",
    paypal: "PayPal",
    revolut: "Revolut",
  };
  if (aliases[compact]) return aliases[compact];
  return s
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function isClaimDocType(record) {
  const raw = record?.docType ?? record?.doc_type ?? record?.documentType;
  return raw != null && String(raw).trim().toLowerCase() === "claim";
}

function isInvoiceDocType(record) {
  const raw = record?.docType ?? record?.doc_type ?? record?.documentType;
  return raw != null && String(raw).trim().toLowerCase() === "invoice";
}

/** Claim (receipt) lines are shown as paid by credit card in the grid. */
function displayPaymentTypeForRow(record) {
  if (isClaimDocType(record)) return "Credit Card";
  return displayPaymentType(record?.paymentType);
}

const TransactionHistory = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { profileDetails } = useSelector((state) => state.profileDetails || {});

  // Try to get memberId from location state first, then fallback to Redux profileDetails
  const memberId =
    location.state?.memberId ||
    searchParams.get("memberId") ||
    profileDetails?.membershipNumber ||
    profileDetails?.regNo;

  console.log("FinanceByID - location.state:", location.state);
  console.log("FinanceByID - profileDetails:", profileDetails);
  console.log("FinanceByID - decided memberId:", memberId);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const { ProfileDetails } = useTableColumns();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refundDrawerOpen, setRefundDrawerOpen] = useState(false);
  const [prefillRefundEuros, setPrefillRefundEuros] = useState(null);
  const [receiptSummaryText, setReceiptSummaryText] = useState(null);
  const [refundReceiptRows, setRefundReceiptRows] = useState([]);
  const [writeOffDrawerOpen, setWriteOffDrawerOpen] = useState(false);
  const [writeOffLedgerRows, setWriteOffLedgerRows] = useState([]);
  const [reallocationDrawerOpen, setReallocationDrawerOpen] = useState(false);
  const [reallocationSourceRow, setReallocationSourceRow] = useState(null);
  const [ledgerView, setLedgerView] = useState("simple");
  const targetTransactionId = String(
    location.state?.transactionId || searchParams.get("transactionId") || ""
  )
    .trim()
    .toLowerCase();

  useEffect(() => {
    if (!targetTransactionId || !Array.isArray(data) || !data.length) return;

    const matchedRow = data.find((item) => {
      const candidates = [
        item?.docNo,
        item?.reference,
        item?.transactionId,
        item?.id,
        item?._id,
      ]
        .filter(Boolean)
        .map((v) => String(v).trim().toLowerCase());

      return candidates.includes(targetTransactionId);
    });

    if (!matchedRow) return;

  }, [data, location.state?.transactionId, searchParams, targetTransactionId]);

  const fetchLedgerData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_ACCOUNT_SERVICE_URL}/reports/member/${memberId}/ledger`,
        {
          params: { view: ledgerView },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Extract data safely
      const rawData = response.data?.data?.items || [];

      // Normalize memberId for comparison
      const targetId = String(memberId).trim().toLowerCase();

      // Show only data that has entries for the specific memberId
      const filteredRawData = rawData.filter((item) =>
        item.entries?.some((e) =>
          String(e.memberId).trim().toLowerCase() === targetId
        )
      );

      // Oldest-first by createdAt/updatedAt only — running balance does not use Tx Date
      const sortedData = [...filteredRawData].sort(compareLedgerByCreatedAtAsc);

      let cumulativeBalance = 0;
      const ledgerData = sortedData.map((item, index) => {
        // Collect ALL entries for this specific member in this transaction
        const memberEntries = item.entries?.filter((e) =>
          String(e.memberId).trim().toLowerCase() === targetId
        ) || [];

        // Aggregate amounts (handles split entries in a single transaction)
        let totalDebit = 0;
        let totalCredit = 0;

        memberEntries.forEach(e => {
          const amt = Number(e.amount) || 0;
          if (e.dc === "D") totalDebit += amt;
          if (e.dc === "C") totalCredit += amt;
        });

        cumulativeBalance += (totalCredit - totalDebit);

        const gl = glFromLedgerItem(item);

        const docType =
          item.docType ?? item.doc_type ?? item.documentType ??
          gl?.docType ?? gl?.doc_type ?? gl?.documentType;
        const docNo =
          item.docNo ?? item.doc_no ?? item.documentNo ??
          gl?.docNo ?? gl?.doc_no ?? gl?.documentNo;
        const memoField = pickFirstNonEmptyString(
          item.memo,
          gl?.memo,
          item.description
        );
        const paymentType = resolvePaymentTypeSource(item, gl);
        const docTypeDisplayLabel = pickFirstNonEmptyString(
          item.displayLabel,
          gl?.displayLabel,
          item.docTypeDisplayLabel,
          gl?.docTypeDisplayLabel
        );
        const updatedAt = resolveLedgerUpdatedAt(item, gl, item.date);
        const ledgerCreatedAt = resolveLedgerCreatedAtDisplay(item);

        return {
          ...item,
          key: item._id || `ledger-${index}-${item.date}-${cumulativeBalance}`,
          docType,
          docNo,
          memo: memoField,
          paymentType,
          displayLabel: docTypeDisplayLabel || "",
          updatedAt,
          ledgerCreatedAt,
          reference: (item.reference || docNo || "-").trim(),
          debit: totalDebit,
          credit: totalCredit,
          balance: cumulativeBalance,
        };
      }).filter(item => {
        // Strict Filter: Only show rows with a valid date AND a non-zero financial impact
        const hasDate = item.date && dayjs(item.date).isValid();
        const hasAmount = Math.abs(item.debit) > 0.001 || Math.abs(item.credit) > 0.001;
        return hasDate && hasAmount;
      });

      setData(ledgerData);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [memberId, ledgerView]);

  useEffect(() => {
    if (memberId) {
      fetchLedgerData();
    }
  }, [memberId, fetchLedgerData]);

  const closeRefundDrawer = useCallback(() => {
    setRefundDrawerOpen(false);
    setPrefillRefundEuros(null);
    setReceiptSummaryText(null);
    setRefundReceiptRows([]);
  }, []);

  const closeWriteOffDrawer = useCallback(() => {
    setWriteOffDrawerOpen(false);
    setWriteOffLedgerRows([]);
  }, []);

  const closeReallocationDrawer = useCallback(() => {
    setReallocationDrawerOpen(false);
    setReallocationSourceRow(null);
  }, []);

  const openReallocationForSelection = useCallback(() => {
    const rows = data.filter((r) =>
      selectedRowKeys.some((k) => String(k) === String(r.key))
    );
    if (rows.length !== 1) {
      notification.warning({
        message: "Select one payment",
        description:
          "Reallocation applies to a single Receipt (payment) row.",
        placement: "topRight",
      });
      return;
    }
    if (!isClaimDocType(rows[0])) {
      notification.error({
        message: "Reallocation not allowed",
        description:
          "Only Receipt transactions can be reclassified. Change your selection and try again.",
        placement: "topRight",
      });
      return;
    }
    setReallocationSourceRow(rows[0]);
    setReallocationDrawerOpen(true);
  }, [data, selectedRowKeys]);

  const openWriteOffForSelection = useCallback(() => {
    const rows = data.filter((r) =>
      selectedRowKeys.some((k) => String(k) === String(r.key))
    );
    if (!rows.length) {
      notification.warning({
        message: "Nothing selected",
        description: "Select one or more ledger rows to write off.",
        placement: "topRight",
      });
      return;
    }
    const nonInvoice = rows.filter((r) => !isInvoiceDocType(r));
    if (nonInvoice.length) {
      notification.error({
        message: "Write-off not allowed",
        description:
          "Write off is only available for Invoice doc type. Change your selection and try again.",
        placement: "topRight",
      });
      return;
    }
    setWriteOffLedgerRows(rows);
    setWriteOffDrawerOpen(true);
  }, [data, selectedRowKeys]);

  const openRefundForRecords = useCallback((rows) => {
    if (!rows?.length) {
      notification.warning({
        message: "Nothing selected",
        description:
          "Select Receipt rows using the checkboxes, or use Refund from a Receipt row’s menu.",
        placement: "topRight",
      });
      return;
    }
    const nonReceipt = rows.filter((r) => !isClaimDocType(r));
    if (nonReceipt.length) {
      notification.error({
        message: "Refund not allowed",
        description:
          "Only Receipt transactions can be refunded. Your selection includes other doc types — change the selection and try again.",
        placement: "topRight",
      });
      return;
    }
    const totalCents = rows.reduce((s, r) => s + (Number(r.credit) || 0), 0);
    if (totalCents <= 0) {
      notification.warning({
        message: "No payment to refund",
        description: "Selected receipts have no credit (payment) amount.",
        placement: "topRight",
      });
      return;
    }
    const euros = centsToEuro(totalCents);
    const formatted = euros.toLocaleString("en-IE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setRefundReceiptRows(rows);
    setPrefillRefundEuros(euros);
    setReceiptSummaryText(
      `${rows.length} receipt(s) — total payments: €${formatted}`
    );
    setRefundDrawerOpen(true);
  }, []);

  const columns = useMemo(() => {
    const docTypeLabels = new Set();
    const paymentTypeLabels = new Set();
    (data || []).forEach((r) => {
      const dt = displayDocTypeLabel(r.docType ?? r.doc_type ?? r.documentType);
      if (dt !== "—") docTypeLabels.add(dt);
      const pt = displayPaymentTypeForRow(r);
      if (pt !== "—") paymentTypeLabels.add(pt);
    });
    const docTypeFilters = [...docTypeLabels]
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((text) => ({ text, value: text }));
    const paymentTypeFilters = [...paymentTypeLabels]
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((text) => ({ text, value: text }));

    return [
    {
      title: "Created",
      dataIndex: "ledgerCreatedAt",
      key: "ledgerCreatedAt",
      width: 158,
      sorter: {
        compare: (a, b) => {
          const va = dayjs(a.ledgerCreatedAt).isValid()
            ? dayjs(a.ledgerCreatedAt).valueOf()
            : NaN;
          const vb = dayjs(b.ledgerCreatedAt).isValid()
            ? dayjs(b.ledgerCreatedAt).valueOf()
            : NaN;
          const okA = !Number.isNaN(va);
          const okB = !Number.isNaN(vb);
          if (okA && okB && va !== vb) return va - vb;
          if (okA && !okB) return -1;
          if (!okA && okB) return 1;
          return String(a._id ?? a.key ?? "").localeCompare(
            String(b._id ?? b.key ?? "")
          );
        },
      },
      render: (text) =>
        text && dayjs(text).isValid()
          ? dayjs(text).format("DD/MM/YYYY HH:mm")
          : "—",
    },
    {
      title: "Tx Date",
      dataIndex: "date",
      key: "date",
      width: 130,
      sorter: {
        compare: (a, b) => compareLedgerByTransactionDateAsc(a, b),
      },
      render: (text) =>
        text && dayjs(text).isValid() ? formatDateOnly(text) : "-",
    },
    {
      title: "Doc Type",
      dataIndex: "docType",
      key: "docType",
      width: 150,
      ellipsis: true,
      sorter: {
        compare: (a, b) =>
          displayDocTypeLabel(a.docType ?? a.doc_type ?? a.documentType).localeCompare(
            displayDocTypeLabel(b.docType ?? b.doc_type ?? b.documentType),
            undefined,
            { sensitivity: "base" }
          ),
      },
      filters: docTypeFilters,
      onFilter: (value, record) =>
        displayDocTypeLabel(record.docType ?? record.doc_type ?? record.documentType) ===
        value,
      filterSearch: true,
      render: (_, r) => {
        const main = displayDocTypeLabel(
          r.docType ?? r.doc_type ?? r.documentType
        );
        const tip =
          r.displayLabel != null && String(r.displayLabel).trim() !== ""
            ? String(r.displayLabel).trim()
            : "";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              maxWidth: "100%",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {main}
            </span>
            {tip ? (
              <Tooltip title={tip}>
                <InfoCircleOutlined
                  style={{ color: "#8c8c8c", flexShrink: 0, cursor: "help" }}
                  aria-label="Document type description"
                />
              </Tooltip>
            ) : null}
          </span>
        );
      },
    },
    {
      title: "Tx Type",
      dataIndex: "paymentType",
      key: "paymentType",
      width: 150,
      ellipsis: true,
      sorter: {
        compare: (a, b) =>
          displayPaymentTypeForRow(a).localeCompare(displayPaymentTypeForRow(b), undefined, {
            sensitivity: "base",
          }),
      },
      filters: paymentTypeFilters,
      onFilter: (value, record) => displayPaymentTypeForRow(record) === value,
      filterSearch: true,
      render: (_, r) => displayPaymentTypeForRow(r),
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      width: 110,
      align: 'right',
      render: (value) => value ? <span style={{ color: "red" }}>€{centsToEuro(value).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : "",
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      width: 110,
      align: 'right',
      render: (value) => value ? <span style={{ color: "green" }}>€{centsToEuro(value).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : "",
    },
    {
      title: "Running Balance",
      dataIndex: "balance",
      key: "balance",
      width: 140,
      align: 'right',
      render: (value) => (
        <span style={{ color: value < 0 ? "red" : "green" }}>
          €{Math.abs(centsToEuro(value || 0)).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "Memo",
      dataIndex: "memo",
      key: "memo",
      width: 200,
      ellipsis: true,
      render: (v, record) => {
        const memoText =
          v != null && String(v).trim() !== "" ? String(v).trim() : "—";
        const refRaw = record?.reference;
        const refText =
          refRaw != null && String(refRaw).trim() !== "" && String(refRaw).trim() !== "-"
            ? String(refRaw).trim()
            : "—";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              maxWidth: "100%",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                minWidth: 0,
              }}
            >
              {memoText}
            </span>
            <Tooltip title={refText === "—" ? "No reference" : `Reference: ${refText}`}>
              <InfoCircleOutlined
                style={{ color: "#8c8c8c", flexShrink: 0, cursor: "help" }}
                aria-label="Show reference"
              />
            </Tooltip>
          </span>
        );
      },
    },
  ];
  }, [data]);

  const selectedLedgerRows = useMemo(
    () =>
      data.filter((r) =>
        selectedRowKeys.some((k) => String(k) === String(r.key))
      ),
    [data, selectedRowKeys]
  );

  const writeOffMenuEnabled =
    selectedLedgerRows.length > 0 &&
    selectedLedgerRows.every((r) => isInvoiceDocType(r));

  /** Receipt = Claim doc type in ledger. */
  const refundMenuEnabled =
    selectedLedgerRows.length > 0 &&
    selectedLedgerRows.every((r) => isClaimDocType(r));

  const reallocationMenuEnabled =
    selectedLedgerRows.length === 1 &&
    isClaimDocType(selectedLedgerRows[0]);

  if (!memberId) {
    return <div className="mt-4"><Empty description="No Member ID provided" /></div>;
  }

  return (
    <div
      className="mt-2 pe-4 pb-4 mb-2"
      style={{
        height: "calc(92vh - 120px - 4vh)",
        maxHeight: "calc(100vh - 120px - 4vh)",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        // paddingRight: "12px",
        paddingBottom: "200px",
        width: '100%'
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <Segmented
          aria-label="Ledger detail level"
          options={[
            { label: "Simple", value: "simple" },
            { label: "Full detail", value: "full" },
          ]}
          value={ledgerView}
          onChange={(v) => setLedgerView(v)}
        />
        <Dropdown
          menu={{
            items: [
              {
                key: "refund",
                label: "Refund",
                danger: true,
                disabled: !refundMenuEnabled,
                onClick: () =>
                  openRefundForRecords(
                    data.filter((r) =>
                      selectedRowKeys.some((k) => String(k) === String(r.key))
                    )
                  ),
              },
              { type: "divider" },
              {
                key: "writeoff",
                label: "Write off",
                disabled: !writeOffMenuEnabled,
                onClick: () => openWriteOffForSelection(),
              },
              { type: "divider" },
              {
                key: "reallocation",
                label: "Reallocation",
                disabled: !reallocationMenuEnabled,
                onClick: () => openReallocationForSelection(),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button
            size="large"
            type="default"
            icon={<MoreOutlined />}
            aria-label="More actions"
          />
        </Dropdown>
      </div>

      <MyTable
        columns={columns}
        dataSource={data}
        loading={loading}
        selection
        rowSelection={{ selectedRowKeys }}
        onSelectionChange={(keys) => setSelectedRowKeys(keys)}
        tablePadding={{ paddingLeft: "0", paddingRight: "0" }}
        defaultSortField="ledgerCreatedAt"
        defaultSortOrder="descend"
      />

      <RefundDrawer
        open={refundDrawerOpen}
        onClose={closeRefundDrawer}
        hideMemberSearch
        prefillRefundAmountEuro={prefillRefundEuros}
        receiptSummary={receiptSummaryText}
        onSubmit={(values) => {
          console.log("Refund submit", values, refundReceiptRows);
          notification.success({
            message: "Refund",
            description: "Refund request submitted.",
            placement: "topRight",
          });
          setSelectedRowKeys([]);
        }}
      />

      <WriteOffDrawer
        open={writeOffDrawerOpen}
        onClose={closeWriteOffDrawer}
        hideMemberSearch
        onSubmit={(values) => {
          console.log("Write-off submit", values, writeOffLedgerRows);
          notification.success({
            message: "Write-off",
            description: "Write-off request submitted.",
            placement: "topRight",
          });
          setSelectedRowKeys([]);
        }}
      />

      <ReallocationDrawer
        open={reallocationDrawerOpen}
        onClose={closeReallocationDrawer}
        hideMemberSearch
        sourceRow={reallocationSourceRow}
        currentPaymentTypeLabel={
          reallocationSourceRow
            ? displayPaymentTypeForRow(reallocationSourceRow)
            : null
        }
        onSubmit={(values) => {
          console.log("Reallocation submit", values);
          notification.success({
            message: "Reallocation",
            description: "Payment reclassification request submitted.",
            placement: "topRight",
          });
          setSelectedRowKeys([]);
        }}
      />
    </div>
  );
};

export default TransactionHistory;
