import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Button,
  Empty,
  notification,
  Dropdown,
  Tooltip,
  Segmented,
  Tag,
  Modal,
  Alert,
} from "antd";
import {
  MoreOutlined,
  InfoCircleOutlined,
  RollbackOutlined,
  StopOutlined,
  SwapOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import RefundDrawer from "./RefundDrawer";
import WriteOffDrawer from "./WriteOffDrawer";
import ReallocationDrawer from "./ReallocationDrawer";
import CreditNoteDrawer from "./CreditNoteDrawer";
import ApplyMemberCreditDrawer from "./ApplyMemberCreditDrawer";
import MemberFinanceSummaryCards from "./MemberFinanceSummaryCards";
import { FinanceColumnTitle } from "./FinanceInfoIcon";
import {
  LEDGER_BADGE_HELP,
  LEDGER_COLUMN_HELP,
  LEDGER_TX_DOC_HINT,
} from "./financeFieldHelp";
import { deriveRowBadges } from "./ledgerRowBadges";
import { resolveLedgerDocumentLink } from "./ledgerDocumentLinks";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import MyTable from "../common/MyTable";
import { centsToEuro, formatDateOnly } from "../../utils/Utilities";
// import axios from "axios";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useFinanceTabToolbar } from "../../context/FinanceTabToolbarContext";

const financeMoreActionsButtonStyle = {
  backgroundColor: "#45669d",
  borderColor: "#45669d",
  color: "#fff",
};

function displayDocTypeLabel(raw) {
  if (raw == null || String(raw).trim() === "") return "—";
  const s = String(raw).trim();
  const norm = s.toLowerCase();
  if (norm === "ledgersummary") return "Summary";
  if (norm === "invoice") return "Invoice";
  if (norm === "adjustment") return "Adjustment";
  if (norm === "receipt") return "Receipt";
  if (norm === "claim") return "Receipt";
  if (norm === "creditnote") return "Credit Note";
  if (norm === "writeoff") return "Write-Off";
  return s;
}

/** Prefer API simple-view label (ledgerDisplayDocType) when present. */
function resolveLedgerDocTypeDisplay(record) {
  const api = record?.ledgerDisplayDocType;
  if (api != null && String(api).trim() !== "") return displayDocTypeLabel(api);
  return displayDocTypeLabel(
    record?.docType ?? record?.doc_type ?? record?.documentType,
  );
}

function pickFirstNonEmptyString(...candidates) {
  for (let i = 0; i < candidates.length; i += 1) {
    const c = candidates[i];
    if (c != null && String(c).trim() !== "") return String(c).trim();
  }
  return null;
}

/** Ledger Tx Type from API object e.g. `txType: { description: "Credit Card" }` → shown as Card Gateway Clearing. */
function pickFirstTxTypeDescription(...sources) {
  for (let i = 0; i < sources.length; i += 1) {
    const o = sources[i];
    if (o != null && typeof o === "object") {
      const d = pickFirstNonEmptyString(o.description, o.Description);
      if (d) return d;
    }
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
    gl?.updated_at,
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
    item.last_modified,
  );
  if (raw && dayjs(raw).isValid()) return raw;
  if (transactionDate && dayjs(transactionDate).isValid())
    return transactionDate;
  return "";
}

/** How the payment was received (ledger / settlement / GL). */
function resolvePaymentTypeSource(item, gl) {
  const st =
    item?.settlement && typeof item.settlement === "object"
      ? item.settlement
      : null;
  return pickFirstNonEmptyString(
    pickFirstTxTypeDescription(
      item?.txType,
      item?.TxType,
      gl?.txType,
      gl?.TxType,
      st?.txType,
      st?.TxType,
      item?.payment?.txType,
      item?.payment?.TxType,
    ),
    typeof item?.txType === "string" ? item.txType : null,
    typeof item?.TxType === "string" ? item.TxType : null,
    item?.paymentType,
    item?.paymentMethod,
    item?.payMethod,
    item?.method,
    item?.paymentChannel,
    item?.channel,
    item?.gateway,
    item?.paymentProvider,
    st?.provider,
    st?.gateway,
    st?.paymentMethod,
    st?.method,
    st?.type,
    item?.payment?.method,
    item?.payment?.type,
    item?.payment?.provider,
    gl?.paymentType,
    gl?.paymentMethod,
    gl?.payMethod,
    gl?.gateway,
  );
}

/** Operational payment labels (not COA clearing account names). */
function displayPaymentType(raw) {
  if (raw == null || String(raw).trim() === "") return "—";
  const s = String(raw).trim();
  const compact = s.toLowerCase().replace(/[\s_-]+/g, "");
  const lower = s.toLowerCase();
  const aliases = {
    stripe: "Online payment (card)",
    card: "Online payment (card)",
    creditcard: "Online payment (card)",
    cardgatewayclearing: "Online payment (card)",
    directdebit: "Direct debit",
    directdebitclearing: "Direct debit",
    standingorder: "Standing order",
    standingorders: "Standing order",
    standingorderclearing: "Standing order",
    cheque: "Cheque",
    check: "Cheque",
    undepositedcheques: "Cheque",
    cash: "Cash",
    cashpayment: "Cash",
    deduction: "Salary deduction",
    deductions: "Salary deduction",
    salarydeduction: "Salary deduction",
    salarydeductionclearing: "Salary deduction",
    payrolldeduction: "Salary deduction",
    payroll: "Salary deduction",
    banktransfer: "Bank transfer",
    transfer: "Bank transfer",
    paypal: "PayPal",
    revolut: "Revolut",
  };
  if (aliases[compact]) return aliases[compact];
  if (/card.*clearing|gateway.*clearing/.test(lower)) return "Online payment (card)";
  if (/salary.*clearing|deduction.*clearing/.test(lower)) return "Salary deduction";
  if (/standing.*clearing/.test(lower)) return "Standing order";
  if (/direct.*debit.*clearing/.test(lower)) return "Direct debit";
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/** Ledger payment-like docs: API may send `claim` or `receipt` (refund/reallocation use both). */
function isClaimDocType(record) {
  const raw = record?.docType ?? record?.doc_type ?? record?.documentType;
  if (raw == null) return false;
  const norm = String(raw).trim().toLowerCase();
  return norm === "claim" || norm === "receipt";
}

function isInvoiceDocType(record) {
  const raw = record?.docType ?? record?.doc_type ?? record?.documentType;
  return raw != null && String(raw).trim().toLowerCase() === "invoice";
}

function isCreditNoteDocType(record) {
  const raw = record?.docType ?? record?.doc_type ?? record?.documentType;
  const norm = raw != null ? String(raw).trim().toLowerCase() : "";
  return norm === "creditnote" || norm === "credit note";
}

function ledgerDocTypeForActionsApi(record) {
  const raw = record?.docType ?? record?.doc_type ?? record?.documentType;
  if (!raw) return "";
  const norm = String(raw).trim().toLowerCase();
  if (norm === "claim") return "Receipt";
  if (norm === "credit note") return "CreditNote";
  if (norm === "write-off" || norm === "writeoff") return "WriteOff";
  return String(raw).trim();
}

function normalizeLedgerMemberKey(v) {
  if (v == null) return "";
  return String(v).trim().toLowerCase();
}

function ledgerItemDocTypeNormForMember(item, gl) {
  const raw =
    item?.docType ??
    item?.doc_type ??
    item?.documentType ??
    gl?.docType ??
    gl?.doc_type ??
    gl?.documentType;
  return raw != null ? String(raw).trim().toLowerCase() : "";
}

/** Member the claim is for on the document (not arbitrary GL split lines). */
function resolveClaimDocumentMemberId(item) {
  return pickFirstNonEmptyString(
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
  );
}

const CLAIM_LEDGER_DOC = "claim";

/** Include row on this member’s ledger: claims match document member; others match entry lines. */
function ledgerItemIncludedForMember(item, gl, targetId) {
  const tid = normalizeLedgerMemberKey(targetId);
  const dt = ledgerItemDocTypeNormForMember(item, gl);
  const claimMember = resolveClaimDocumentMemberId(item);

  if (
    dt === CLAIM_LEDGER_DOC &&
    claimMember != null &&
    String(claimMember).trim() !== ""
  ) {
    return normalizeLedgerMemberKey(claimMember) === tid;
  }

  return (
    item.entries?.some((e) => normalizeLedgerMemberKey(e.memberId) === tid) ??
    false
  );
}

/** Debit/credit lines to aggregate: for claims, only lines tied to the claim’s member. */
function entriesForMemberLedgerAggregation(item, gl, targetId) {
  const tid = normalizeLedgerMemberKey(targetId);
  const dt = ledgerItemDocTypeNormForMember(item, gl);
  const claimMember = resolveClaimDocumentMemberId(item);
  const list = item.entries || [];

  if (
    dt === CLAIM_LEDGER_DOC &&
    claimMember != null &&
    String(claimMember).trim() !== ""
  ) {
    const cid = normalizeLedgerMemberKey(claimMember);
    if (cid !== tid) return [];
    const byClaim = list.filter(
      (e) => normalizeLedgerMemberKey(e.memberId) === cid,
    );
    if (byClaim.length > 0) return byClaim;
    return list.filter((e) => normalizeLedgerMemberKey(e.memberId) === tid);
  }

  return list.filter((e) => normalizeLedgerMemberKey(e.memberId) === tid);
}

/** Draft credit notes are not in GL until approved; show them on the member ledger for review. */
function draftCreditNotesAsLedgerItems(pendingCreditNotes, memberId) {
  if (!pendingCreditNotes?.length) return [];
  const mid = String(memberId || "").trim();
  return pendingCreditNotes.map((cn) => {
    const amt = Number(cn.amount) || 0;
    const date = cn.effectiveDate || cn.createdAt || new Date().toISOString();
    const createdAt = cn.createdAt || cn.effectiveDate || date;
    const memo =
      cn.reason ||
      (cn.invoiceDocNo
        ? `Credit note (awaiting approval) — invoice ${cn.invoiceDocNo}`
        : "Credit note (awaiting approval)");
    return {
      _id: `draft-cn-${cn.docNo}`,
      date,
      createdAt,
      docType: "CreditNote",
      docNo: cn.docNo,
      reference: cn.invoiceDocNo || cn.docNo,
      memo,
      ledgerDisplayDocType: "Credit Note",
      displayLabel: "Credit Note",
      isDraftCreditNote: true,
      entries: [
        {
          accountCode: "1400",
          dc: "C",
          amount: amt,
          memberId: mid,
          periodBucket: cn.periodBucket || "current",
        },
      ],
    };
  });
}

/**
 * Tx Type column: payment method for receipts/claims; doc hint for invoices/adjustments.
 */
function displayPaymentTypeForRow(record) {
  const label = displayPaymentType(record?.paymentType);
  if (label !== "—") return label;
  if (isClaimDocType(record)) return "Online payment";
  return docTypeTxTypeHint(record);
}

function docTypeTxTypeHint(record) {
  const main = resolveLedgerDocTypeDisplay(record);
  return LEDGER_TX_DOC_HINT[main] || "—";
}

const ONLINE_CARD_PAYMENT_LABELS = new Set([
  "Online payment (card)",
  "Online payment",
]);

/** Underlying settlement method (not the claim-row display override). */
function ledgerRowPaymentTypeLabel(record) {
  const gl = glFromLedgerItem(record);
  return displayPaymentType(resolvePaymentTypeSource(record, gl));
}

const STRIPE_KEY_HINT = /stripe|payment_?intent|charge_?id|^pi_[a-z0-9]+$/i;

/** True if ledger row / settlement looks like Stripe (IDs or provider), even when paymentType is empty. */
function hasStripeLikeSettlementSignal(record) {
  const gl = glFromLedgerItem(record);
  const st =
    record?.settlement && typeof record.settlement === "object"
      ? record.settlement
      : null;
  const pay =
    record?.payment && typeof record.payment === "object"
      ? record.payment
      : null;
  const blobs = [record, gl, st, pay].filter((o) => o && typeof o === "object");
  for (const o of blobs) {
    for (const k of Object.keys(o)) {
      if (!STRIPE_KEY_HINT.test(k)) continue;
      const v = o[k];
      if (v != null && String(v).trim() !== "") return true;
    }
    const prov = o.provider ?? o.gateway ?? o.paymentProvider;
    if (prov != null && /stripe/i.test(String(prov))) return true;
  }
  const raw = resolvePaymentTypeSource(record, gl);
  return raw != null && /stripe/i.test(String(raw));
}

/**
 * Prefer external refund only when we have a clear non–credit-card method.
 * Claim/receipt rows often omit paymentType for Stripe; treat those as card-gateway (Stripe) flows.
 */
function rowPrefersExternalRefundSource(row) {
  if (hasStripeLikeSettlementSignal(row)) return false;
  const label = ledgerRowPaymentTypeLabel(row);
  if (ONLINE_CARD_PAYMENT_LABELS.has(label)) return false;
  if (/online payment|card/i.test(label)) return false;
  if (label === "—" && isClaimDocType(row)) return false;
  return true;
}

function refundInitialModeFromReceiptRows(rows) {
  if (!rows?.length) return "stripe";
  const anyExternal = rows.some((r) => rowPrefersExternalRefundSource(r));
  return anyExternal ? "external" : "stripe";
}

const CLEARING_ACCOUNT_CODES = new Set([
  "1100",
  "1200",
  "1210",
  "1220",
  "1230",
  "1240",
  "1250",
]);

/** Card/cheque/batch payments use clearing settlement; invoices and adjustments do not. */
function ledgerRowUsesClearingSettlement(record) {
  const dt = String(record?.docType || "").toLowerCase();
  if (!["receipt", "claim", "refund"].includes(dt)) return false;

  const settlement = record?.settlement;
  if (settlement?.provider) return true;
  if (hasStripeLikeSettlementSignal(record)) return true;

  const gl = glFromLedgerItem(record);
  if (
    (gl?.entries || []).some((e) => CLEARING_ACCOUNT_CODES.has(e.accountCode))
  ) {
    return true;
  }

  const payLabel = ledgerRowPaymentTypeLabel(record).toLowerCase();
  if (
    payLabel !== "—" &&
    /clearing|cheque|card|direct debit|standing order|salary|deduction|stripe|gateway|batch/i.test(
      payLabel,
    )
  ) {
    return true;
  }

  return false;
}

/** Operational status on member ledger (clearing → badge, not status column). */
function resolveLedgerRowStatus(record, pendingCreditNotes = []) {
  if (record?.isDraftCreditNote) return "Draft";
  const docNo = pickFirstNonEmptyString(record?.docNo, record?.reference);
  if (docNo && pendingCreditNotes.some((cn) => cn.docNo === docNo)) {
    return "Draft";
  }

  const dt = String(record?.docType || "").toLowerCase();
  if (dt === "refund") return "Refunded";
  if (dt === "writeoff") return "Written Off";

  return "Posted";
}

function ledgerStatusTagColor(status) {
  switch (status) {
    case "Draft":
      return "gold";
    case "Refunded":
      return "purple";
    case "Written Off":
      return "red";
    default:
      return "default";
  }
}

function formatLedgerBalanceCents(balanceCents) {
  const n = Number(balanceCents) || 0;
  const euro = Math.abs(centsToEuro(n)).toLocaleString("en-IE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (n > 0) return { text: `€${euro} (Dr)`, color: "#cf1322" };
  if (n < 0) return { text: `€${euro} (Cr)`, color: "#389e0d" };
  return { text: `€${euro}`, color: "#595959" };
}

/** Both debit and credit on row — often nets to zero (internal offset lines). */
function rowHasOffsettingDebitCredit(record) {
  const d = Number(record?.debit) || 0;
  const c = Number(record?.credit) || 0;
  if (d <= 0 || c <= 0) return false;
  return Math.abs(d - c) < 1;
}

const TransactionHistory = () => {
  const financeToolbarApi = useFinanceTabToolbar();
  const navigate = useNavigate();
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
  const [refundInitialMode, setRefundInitialMode] = useState("stripe");
  const [receiptSummaryText, setReceiptSummaryText] = useState(null);
  const [refundReceiptRows, setRefundReceiptRows] = useState([]);
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [writeOffDrawerOpen, setWriteOffDrawerOpen] = useState(false);
  const [writeOffLedgerRows, setWriteOffLedgerRows] = useState([]);
  const [writeOffSubmitting, setWriteOffSubmitting] = useState(false);
  const [reallocationDrawerOpen, setReallocationDrawerOpen] = useState(false);
  const [reallocationSourceRow, setReallocationSourceRow] = useState(null);
  const [ledgerView, setLedgerView] = useState("simple");
  const [financeSummary, setFinanceSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pendingCreditNotes, setPendingCreditNotes] = useState([]);
  const [creditNoteDrawerOpen, setCreditNoteDrawerOpen] = useState(false);
  const [creditNoteDrawerMode, setCreditNoteDrawerMode] = useState("create");
  const [creditNoteTarget, setCreditNoteTarget] = useState({
    invoiceDocNo: "",
    creditNoteDocNo: "",
    prefillEuro: null,
    summary: null,
  });
  const [creditNoteSubmitting, setCreditNoteSubmitting] = useState(false);
  const [applyCreditOpen, setApplyCreditOpen] = useState(false);
  const [applyCreditSubmitting, setApplyCreditSubmitting] = useState(false);
  const [applyCreditPrefillEuro, setApplyCreditPrefillEuro] = useState(null);
  const [applyCreditSummary, setApplyCreditSummary] = useState(null);
  const [rowActionsCache, setRowActionsCache] = useState({});
  const targetTransactionId = String(
    location.state?.transactionId || searchParams.get("transactionId") || "",
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

    setSelectedRowKeys([matchedRow.key]);
  }, [data, location.state?.transactionId, searchParams, targetTransactionId]);

  const fetchPendingCreditNotes = useCallback(
    async ({ ledgerPayload } = {}) => {
      if (Array.isArray(ledgerPayload?.draftCreditNotes)) {
        setPendingCreditNotes(ledgerPayload.draftCreditNotes);
        return ledgerPayload.draftCreditNotes;
      }

      const token = localStorage.getItem("token");
      if (!memberId || !token) {
        setPendingCreditNotes([]);
        return [];
      }

      const headers = { Authorization: `Bearer ${token}` };
      const base = getAccountServiceBaseUrl();
      const paths = [
        `/reports/member/${encodeURIComponent(memberId)}/credit-notes`,
        `/journal/credit-notes`,
      ];

      for (const path of paths) {
        try {
          const cnRes = await axios.get(`${base}${path}`, {
            params: { memberId, status: "Draft" },
            headers,
          });
          const cnPayload = cnRes.data?.data ?? cnRes.data;
          const items = cnPayload?.items || [];
          setPendingCreditNotes(items);
          return items;
        } catch (error) {
          if (error?.response?.status === 404) continue;
          console.warn(
            "Draft credit notes unavailable:",
            error?.response?.status || error,
          );
          break;
        }
      }

      setPendingCreditNotes([]);
      return [];
    },
    [memberId],
  );

  const fetchLedgerData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${getAccountServiceBaseUrl()}/reports/member/${memberId}/ledger`,
        {
          params: { view: ledgerView },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const ledgerPayload = response.data?.data ?? response.data;
      const pendingDrafts = await fetchPendingCreditNotes({
        ledgerPayload,
      });

      // Extract data safely
      const rawData = ledgerPayload?.items || [];

      // Normalize memberId for comparison
      const targetId = String(memberId).trim().toLowerCase();

      // Claims: row belongs to the member on the claim document, not any incidental entry line.
      const filteredRawData = rawData.filter((item) => {
        const gl = glFromLedgerItem(item);
        return ledgerItemIncludedForMember(item, gl, targetId);
      });

      // Oldest-first by createdAt/updatedAt only — running balance does not use Tx Date
      const draftLedgerItems = draftCreditNotesAsLedgerItems(
        pendingDrafts,
        memberId,
      );
      const sortedData = [...filteredRawData, ...draftLedgerItems].sort(
        compareLedgerByCreatedAtAsc,
      );

      let cumulativeBalance = 0;
      const ledgerData = sortedData
        .map((item, index) => {
          const gl = glFromLedgerItem(item);
          const memberEntries = entriesForMemberLedgerAggregation(
            item,
            gl,
            targetId,
          );

          // Aggregate amounts (handles split entries in a single transaction)
          let totalDebit = 0;
          let totalCredit = 0;

          memberEntries.forEach((e) => {
            const amt = Number(e.amount) || 0;
            if (e.dc === "D") totalDebit += amt;
            if (e.dc === "C") totalCredit += amt;
          });

          cumulativeBalance += totalCredit - totalDebit;

          const docType =
            item.docType ??
            item.doc_type ??
            item.documentType ??
            gl?.docType ??
            gl?.doc_type ??
            gl?.documentType;
          const docNo =
            item.docNo ??
            item.doc_no ??
            item.documentNo ??
            gl?.docNo ??
            gl?.doc_no ??
            gl?.documentNo;
          const memoField = pickFirstNonEmptyString(
            item.memo,
            gl?.memo,
            item.description,
          );
          const paymentType = resolvePaymentTypeSource(item, gl);
          const docTypeDisplayLabel = pickFirstNonEmptyString(
            item.displayLabel,
            gl?.displayLabel,
            item.docTypeDisplayLabel,
            gl?.docTypeDisplayLabel,
          );
          const updatedAt = resolveLedgerUpdatedAt(item, gl, item.date);
          const ledgerCreatedAt = resolveLedgerCreatedAtDisplay(item);

          return {
            ...item,
            key:
              item._id || `ledger-${index}-${item.date}-${cumulativeBalance}`,
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
        })
        .filter((item) => {
          // Strict Filter: Only show rows with a valid date AND a non-zero financial impact
          const hasDate = item.date && dayjs(item.date).isValid();
          const hasAmount =
            Math.abs(item.debit) > 0.001 || Math.abs(item.credit) > 0.001;
          return hasDate && hasAmount;
        });

      setData(ledgerData);
      setRowActionsCache({});
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [memberId, ledgerView, fetchPendingCreditNotes]);

  const fetchFinanceSummary = useCallback(async () => {
    if (!memberId) return;
    setSummaryLoading(true);
    const token = localStorage.getItem("token");
    const year = new Date().getFullYear();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const summaryRes = await axios.get(
        `${getAccountServiceBaseUrl()}/reports/member/${encodeURIComponent(memberId)}/summary`,
        { params: { year, scope: "current" }, headers },
      );
      const raw = summaryRes.data?.data ?? summaryRes.data;
      const summaryData =
        raw && typeof raw === "object"
          ? {
              ...raw,
              outstandingBalance: Number(raw.outstandingBalance) || 0,
              availableCredit: Number(raw.availableCredit) || 0,
              refundableBalance:
                Number(raw.refundableBalance ?? raw.availableCredit) || 0,
              deferredIncomeBalance: Number(raw.deferredIncomeBalance) || 0,
              writtenOffBalance: Number(raw.writtenOffBalance) || 0,
              unreconciledClearingBalance:
                Number(raw.unreconciledClearingBalance) || 0,
            }
          : {
              memberId,
              year,
              outstandingBalance: 0,
              availableCredit: 0,
              refundableBalance: 0,
            };
      setFinanceSummary(summaryData);
    } catch (error) {
      console.error("Error fetching finance summary:", error);
      setFinanceSummary({
        memberId,
        year,
        outstandingBalance: 0,
        availableCredit: 0,
        refundableBalance: 0,
        deferredIncomeBalance: 0,
        writtenOffBalance: 0,
        unreconciledClearingBalance: 0,
        _loadError: true,
      });
    } finally {
      await fetchPendingCreditNotes();
      setSummaryLoading(false);
    }
  }, [memberId, fetchPendingCreditNotes]);

  const refreshFinanceViews = useCallback(async () => {
    await Promise.all([fetchLedgerData(), fetchFinanceSummary()]);
  }, [fetchLedgerData, fetchFinanceSummary]);

  useEffect(() => {
    if (memberId) {
      fetchLedgerData();
      fetchFinanceSummary();
    }
  }, [memberId, fetchLedgerData, fetchFinanceSummary]);

  useEffect(() => {
    const handler = (ev) => {
      const mid = ev?.detail?.memberId;
      if (mid && String(mid) === String(memberId)) {
        refreshFinanceViews();
      }
    };
    window.addEventListener("member-finance-updated", handler);
    return () => window.removeEventListener("member-finance-updated", handler);
  }, [memberId, refreshFinanceViews]);

  const closeRefundDrawer = useCallback(() => {
    setRefundDrawerOpen(false);
    setPrefillRefundEuros(null);
    setRefundInitialMode("stripe");
    setReceiptSummaryText(null);
    setRefundReceiptRows([]);
    setRefundSubmitting(false);
  }, []);

  const closeWriteOffDrawer = useCallback(() => {
    setWriteOffDrawerOpen(false);
    setWriteOffLedgerRows([]);
    setWriteOffSubmitting(false);
  }, []);

  const closeReallocationDrawer = useCallback(() => {
    setReallocationDrawerOpen(false);
    setReallocationSourceRow(null);
  }, []);

  const openReallocationForSelection = useCallback(() => {
    const rows = data.filter((r) =>
      selectedRowKeys.some((k) => String(k) === String(r.key)),
    );
    if (rows.length !== 1) {
      notification.warning({
        message: "Select one payment",
        description: "Reallocation applies to a single Receipt (payment) row.",
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
      selectedRowKeys.some((k) => String(k) === String(r.key)),
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
    setRefundInitialMode(refundInitialModeFromReceiptRows(rows));
    setReceiptSummaryText(
      `${rows.length} receipt(s) — total payments: €${formatted}`,
    );
    setRefundDrawerOpen(true);
  }, []);

  const resolvePaymentIntentId = useCallback((row) => {
    return pickFirstNonEmptyString(
      row?.paymentIntentId,
      row?.paymentIntent,
      row?.settlement?.paymentIntentId,
      row?.settlement?.paymentIntent,
      row?.underlyingReceiptGl?.paymentIntentId,
      row?.underlyingReceiptGl?.paymentIntent,
    );
  }, []);

  const buildRefundPayload = useCallback(
    (formValues, rows) => {
      const amountEuros = Number(formValues?.refund);
      const amount = Number.isFinite(amountEuros)
        ? Math.round(amountEuros * 100)
        : NaN;
      if (!Number.isFinite(amount) || amount <= 0) {
        const e = new Error("Refund amount must be greater than 0.");
        e.code = "INVALID_AMOUNT";
        throw e;
      }

      const memberIdValue = String(memberId || "").trim();
      if (!memberIdValue) {
        const e = new Error("Member ID is required for refund.");
        e.code = "MISSING_MEMBER_ID";
        throw e;
      }

      const referenceNo = String(formValues?.refNo || "").trim();
      const memo = String(formValues?.memo || "").trim();
      const refundDate = formValues?.refundDate || null;
      const isExternalMode = formValues?.mode === "external";
      if (isExternalMode) {
        const payoutMethod =
          formValues?.type === "Cheque" ? "cheque" : "bank_transfer";
        return {
          mode: "external",
          memberId: memberIdValue,
          amount,
          payoutMethod,
          currency: "eur",
          refundDate,
          refNo: referenceNo,
          memo,
        };
      }

      const paymentIntentIds = rows.map((row) => resolvePaymentIntentId(row));
      const validPaymentIntentIds = paymentIntentIds.filter(Boolean);
      const hasMixedPaymentIntent =
        validPaymentIntentIds.length !== paymentIntentIds.length;

      if (hasMixedPaymentIntent) {
        const e = new Error(
          "Online refunds require payment intent on every selected receipt.",
        );
        e.code = "MIXED_PAYMENT_INTENT";
        throw e;
      }

      if (!validPaymentIntentIds.length) {
        const e = new Error(
          "Online refunds require a payment intent. Please choose online receipts.",
        );
        e.code = "MISSING_PAYMENT_INTENT";
        throw e;
      }

      const uniquePaymentIntentIds = [...new Set(validPaymentIntentIds)];
      if (uniquePaymentIntentIds.length !== 1) {
        const e = new Error(
          "Selected receipts have different payment intents. Please choose receipts for a single payment intent.",
        );
        e.code = "MULTIPLE_PAYMENT_INTENTS";
        throw e;
      }

      return {
        paymentIntentId: uniquePaymentIntentIds[0],
        payoutMethod: "credit_card",
        mode: "stripe",
        memberId: memberIdValue,
        amount,
        memo,
        refNo: referenceNo,
        refundDate,
      };
    },
    [memberId, resolvePaymentIntentId],
  );

  const submitRefundRequest = useCallback(async (payload) => {
    const token = localStorage.getItem("token");
    return axios.post(
      `${getAccountServiceBaseUrl()}/payments/refunds`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  }, []);

  const buildWriteOffPayload = useCallback(
    (formValues) => {
      const amountEuros = Number(formValues?.amountEuros);
      const amount = Number.isFinite(amountEuros)
        ? Math.round(amountEuros * 100)
        : NaN;
      if (!Number.isFinite(amount) || amount <= 0) {
        const e = new Error("Write-off amount must be greater than 0.");
        e.code = "INVALID_AMOUNT";
        throw e;
      }

      const memberIdValue = String(memberId || "").trim();
      if (!memberIdValue) {
        const e = new Error("Member ID is required for write-off.");
        e.code = "MISSING_MEMBER_ID";
        throw e;
      }

      const date = formValues?.date || null;
      if (!date || !dayjs(date).isValid()) {
        const e = new Error("Write-off date is required.");
        e.code = "INVALID_DATE";
        throw e;
      }

      const periodBucket = String(formValues?.periodBucket || "").trim();
      if (!periodBucket) {
        const e = new Error("Period is required.");
        e.code = "MISSING_PERIOD_BUCKET";
        throw e;
      }

      const docNo = String(formValues?.docNo || "").trim();
      const memo = String(formValues?.memo || "").trim();

      return {
        date,
        docNo,
        memberId: memberIdValue,
        amount,
        periodBucket,
        memo,
      };
    },
    [memberId],
  );

  const submitWriteOffRequest = useCallback(async (payload) => {
    const token = localStorage.getItem("token");
    return axios.post(
      `${getAccountServiceBaseUrl()}/journal/writeoff`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  }, []);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const closeCreditNoteDrawer = useCallback(() => {
    setCreditNoteDrawerOpen(false);
    setCreditNoteTarget({
      invoiceDocNo: "",
      creditNoteDocNo: "",
      prefillEuro: null,
      summary: null,
    });
    setCreditNoteSubmitting(false);
  }, []);

  const createDraftCreditNotesForInvoices = useCallback(
    async (invoiceRows) => {
      if (!invoiceRows?.length || creditNoteSubmitting) return;
      setCreditNoteSubmitting(true);
      let ok = 0;
      let failed = 0;
      try {
        for (const row of invoiceRows) {
          const invoiceDocNo =
            pickFirstNonEmptyString(row.docNo, row.reference) || "";
          if (!invoiceDocNo) continue;
          const debitCents = Number(row.debit) || 0;
          if (debitCents <= 0) {
            failed += 1;
            continue;
          }
          const suffix = `${Date.now().toString(36)}${ok}`.toUpperCase();
          try {
            await axios.post(
              `${getAccountServiceBaseUrl()}/journal/credit-notes`,
              {
                docNo: `CN-${suffix}`,
                memberId: String(memberId || "").trim(),
                invoiceDocNo,
                amount: debitCents,
                date: dayjs().format("YYYY-MM-DD"),
                reason: "Bulk credit note from member ledger",
                notes: "",
              },
              { headers: authHeaders() },
            );
            ok += 1;
          } catch (error) {
            failed += 1;
            notification.error({
              message: `Credit note failed for ${invoiceDocNo}`,
              description:
                error?.response?.data?.message ||
                error?.message ||
                "Could not create draft.",
              placement: "topRight",
            });
          }
        }
        if (ok > 0) {
          notification.success({
            message: "Credit notes",
            description: `${ok} draft credit note(s) created. Approve when ready to post GL.`,
            placement: "topRight",
          });
          window.dispatchEvent(
            new CustomEvent("member-finance-updated", {
              detail: { memberId: String(memberId || "").trim() },
            }),
          );
          await refreshFinanceViews();
        }
        if (failed > 0 && ok === 0) {
          notification.warning({
            message: "No credit notes created",
            description:
              "Each invoice must have a positive debit and remaining creditable balance (existing draft/approved CNs reduce the limit).",
            placement: "topRight",
          });
        }
      } finally {
        setCreditNoteSubmitting(false);
      }
    },
    [authHeaders, creditNoteSubmitting, memberId, refreshFinanceViews],
  );

  const openCreateCreditNote = useCallback(
    (rows) => {
      const invoiceRows = (rows || []).filter((r) => isInvoiceDocType(r));
      if (!invoiceRows.length) {
        notification.warning({
          message: "Select invoice(s)",
          description: "Credit notes reverse invoice revenue — select invoice row(s).",
          placement: "topRight",
        });
        return;
      }
      if (invoiceRows.length > 1) {
        Modal.confirm({
          title: `Create ${invoiceRows.length} draft credit notes?`,
          content:
            "One draft credit note per invoice at the full invoice amount on each row. Amount is validated against remaining creditable balance (existing draft/approved CNs count toward the limit).",
          okText: "Create drafts",
          onOk: () => createDraftCreditNotesForInvoices(invoiceRows),
        });
        return;
      }
      const row = invoiceRows[0];
      const docNo = pickFirstNonEmptyString(row.docNo, row.reference) || "";
      const debitCents = Number(row.debit) || 0;
      setCreditNoteTarget({
        invoiceDocNo: docNo,
        creditNoteDocNo: "",
        prefillEuro:
          debitCents > 0
            ? Math.round(centsToEuro(debitCents) * 100) / 100
            : null,
        summary: `Invoice ${docNo} — debit €${centsToEuro(debitCents).toFixed(2)}. Max creditable amount may be lower if draft/approved CNs already exist for this invoice.`,
      });
      setCreditNoteDrawerMode("create");
      setCreditNoteDrawerOpen(true);
    },
    [createDraftCreditNotesForInvoices],
  );

  const openApprovePendingCreditNote = useCallback((cn) => {
    if (!cn?.docNo) return;
    setCreditNoteTarget({
      invoiceDocNo: cn.invoiceDocNo || "",
      creditNoteDocNo: cn.docNo,
      prefillEuro: cn.amount ? centsToEuro(cn.amount) : null,
      summary: `Draft CN ${cn.docNo}${cn.invoiceDocNo ? ` for invoice ${cn.invoiceDocNo}` : ""}`,
    });
    setCreditNoteDrawerMode("approve");
    setCreditNoteDrawerOpen(true);
  }, []);

  const openApproveCreditNote = useCallback(
    (row) => {
      const docNo = pickFirstNonEmptyString(row.docNo, row.reference) || "";
      const pending = pendingCreditNotes.find((cn) => cn.docNo === docNo);
      if (!pending && !isCreditNoteDocType(row)) {
        notification.info({
          message: "Not a draft credit note",
          description:
            "Draft credit notes appear in Pending approval above, or select a credit note row.",
          placement: "topRight",
        });
        return;
      }
      setCreditNoteTarget({
        invoiceDocNo: pending?.invoiceDocNo || "",
        creditNoteDocNo: docNo,
        prefillEuro: null,
        summary: pending
          ? `Draft CN ${docNo} for invoice ${pending.invoiceDocNo}`
          : null,
      });
      setCreditNoteDrawerMode("approve");
      setCreditNoteDrawerOpen(true);
    },
    [pendingCreditNotes],
  );

  const handleCreditNoteCreate = useCallback(
    async (payload) => {
      if (creditNoteSubmitting) return false;
      try {
        setCreditNoteSubmitting(true);
        await axios.post(
          `${getAccountServiceBaseUrl()}/journal/credit-notes`,
          payload,
          { headers: authHeaders() },
        );
        notification.success({
          message: "Credit note",
          description: "Draft saved. Approve when ready to post GL.",
          placement: "topRight",
        });
        window.dispatchEvent(
          new CustomEvent("member-finance-updated", {
            detail: { memberId: String(memberId || "").trim() },
          }),
        );
        await refreshFinanceViews();
        return true;
      } catch (error) {
        notification.error({
          message: "Credit note failed",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Could not create credit note.",
          placement: "topRight",
        });
        return false;
      } finally {
        setCreditNoteSubmitting(false);
      }
    },
    [authHeaders, creditNoteSubmitting, memberId, refreshFinanceViews],
  );

  const handleCreditNoteApprove = useCallback(
    async ({ docNo }) => {
      if (creditNoteSubmitting) return false;
      try {
        setCreditNoteSubmitting(true);
        await axios.post(
          `${getAccountServiceBaseUrl()}/journal/credit-notes/${encodeURIComponent(docNo)}/approve`,
          {},
          { headers: authHeaders() },
        );
        notification.success({
          message: "Credit note approved",
          description: "GL posted and member credit updated if applicable.",
          placement: "topRight",
        });
        window.dispatchEvent(
          new CustomEvent("member-finance-updated", {
            detail: { memberId: String(memberId || "").trim() },
          }),
        );
        await refreshFinanceViews();
        return true;
      } catch (error) {
        notification.error({
          message: "Approval failed",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Could not approve credit note.",
          placement: "topRight",
        });
        return false;
      } finally {
        setCreditNoteSubmitting(false);
      }
    },
    [authHeaders, creditNoteSubmitting, memberId, refreshFinanceViews],
  );

  const handleCreditNoteCancel = useCallback(
    async (docNo) => {
      try {
        await axios.post(
          `${getAccountServiceBaseUrl()}/journal/credit-notes/${encodeURIComponent(docNo)}/cancel`,
          {},
          { headers: authHeaders() },
        );
        notification.success({
          message: "Credit note cancelled",
          placement: "topRight",
        });
        await refreshFinanceViews();
      } catch (error) {
        notification.error({
          message: "Cancel failed",
          description: error?.response?.data?.message || error?.message,
          placement: "topRight",
        });
      }
    },
    [authHeaders, refreshFinanceViews],
  );

  const handleApplyCreditSubmit = useCallback(
    async (payload) => {
      if (applyCreditSubmitting) return false;
      setApplyCreditSubmitting(true);
      try {
        await axios.post(
          `${getAccountServiceBaseUrl()}/journal/apply-member-credit`,
          payload,
          { headers: authHeaders() },
        );
        notification.success({
          message: "Credit applied",
          description: "Member credit allocated to outstanding balance.",
          placement: "topRight",
        });
        window.dispatchEvent(
          new CustomEvent("member-finance-updated", {
            detail: { memberId: String(memberId || "").trim() },
          }),
        );
        await refreshFinanceViews();
        setApplyCreditOpen(false);
        return true;
      } catch (error) {
        notification.error({
          message: "Apply credit failed",
          description: error?.response?.data?.message || error?.message,
          placement: "topRight",
        });
        return false;
      } finally {
        setApplyCreditSubmitting(false);
      }
    },
    [applyCreditSubmitting, authHeaders, memberId, refreshFinanceViews],
  );

  const fetchRowLedgerActions = useCallback(
    async (record) => {
      const key = String(record.key);
      const token = localStorage.getItem("token");
      const docType = ledgerDocTypeForActionsApi(record);
      const docNo =
        pickFirstNonEmptyString(record.docNo, record.reference) || "";
      try {
        const res = await axios.get(
          `${getAccountServiceBaseUrl()}/reports/member/${memberId}/ledger-actions`,
          {
            params: {
              docType,
              docNo,
              status: resolveLedgerRowStatus(record, pendingCreditNotes),
              year: new Date().getFullYear(),
            },
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const payload = res.data?.data || res.data;
        setRowActionsCache((prev) => ({ ...prev, [key]: payload }));
        return payload;
      } catch {
        return { actions: [], badges: [] };
      }
    },
    [memberId, pendingCreditNotes],
  );

  const runLedgerAction = useCallback(
    async (actionId, record) => {
      switch (actionId) {
        case "create-credit-note":
          openCreateCreditNote([record]);
          break;
        case "write-off-balance":
          setSelectedRowKeys([record.key]);
          setWriteOffLedgerRows([record]);
          setWriteOffDrawerOpen(true);
          break;
        case "refund":
          openRefundForRecords([record]);
          break;
        case "refund-credit": {
          const refundable = financeSummary?.refundableBalance || 0;
          if (refundable <= 0) {
            notification.warning({
              message: "No refundable balance",
              placement: "topRight",
            });
            break;
          }
          setRefundReceiptRows([]);
          setPrefillRefundEuros(
            Math.round(centsToEuro(refundable) * 100) / 100,
          );
          setRefundInitialMode("external");
          setReceiptSummaryText(
            `Refund from available credit — max €${centsToEuro(refundable).toFixed(2)}`,
          );
          setRefundDrawerOpen(true);
          break;
        }
        case "approve":
          openApproveCreditNote(record);
          break;
        case "cancel": {
          const docNo = pickFirstNonEmptyString(record.docNo, record.reference);
          if (docNo) await handleCreditNoteCancel(docNo);
          break;
        }
        case "apply-member-credit":
        case "apply-credit": {
          const avail = financeSummary?.availableCredit || 0;
          const out = financeSummary?.outstandingBalance || 0;
          if (avail <= 0 || out <= 0) {
            notification.warning({
              message: "Nothing to apply",
              description:
                "Member needs available credit and an outstanding balance.",
              placement: "topRight",
            });
            break;
          }
          setApplyCreditPrefillEuro(
            Math.round(centsToEuro(Math.min(avail, out)) * 100) / 100,
          );
          setApplyCreditSummary(
            record?.docNo
              ? `Apply credit — invoice/ref ${record.docNo}`
              : "Apply member credit to outstanding balance",
          );
          setApplyCreditOpen(true);
          break;
        }
        case "reverse-receipt": {
          const receiptDocNo = pickFirstNonEmptyString(
            record.docNo,
            record.reference,
          );
          if (!receiptDocNo) break;
          Modal.confirm({
            title: "Reverse receipt?",
            content: `Post a reversing journal for receipt ${receiptDocNo}.`,
            okText: "Reverse",
            okButtonProps: { danger: true },
            onOk: async () => {
              const revNo = `RVR-${receiptDocNo}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
              await axios.post(
                `${getAccountServiceBaseUrl()}/journal/reverse-receipt`,
                {
                  receiptDocNo,
                  reversalDocNo: revNo,
                  memberId,
                },
                { headers: authHeaders() },
              );
              notification.success({
                message: "Receipt reversed",
                placement: "topRight",
              });
              window.dispatchEvent(
                new CustomEvent("member-finance-updated", {
                  detail: { memberId: String(memberId || "").trim() },
                }),
              );
              await refreshFinanceViews();
            },
          });
          break;
        }
        case "print":
          window.open(
            `${getAccountServiceBaseUrl()}/reports/member/${encodeURIComponent(memberId)}/statement`,
            "_blank",
            "noopener,noreferrer",
          );
          break;
        case "send": {
          const ref = pickFirstNonEmptyString(
            record.docNo,
            record.reference,
            record.memo,
          );
          if (ref && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(ref);
          }
          notification.info({
            message: "Reference copied",
            description: ref
              ? `${ref} — open Correspondence to email this member with the document reference.`
              : "No document reference on this row.",
            placement: "topRight",
          });
          break;
        }
        case "view-source-batch": {
          const link = resolveLedgerDocumentLink(record);
          if (link) {
            navigate(link.path, { state: link.state });
          } else {
            notification.info({
              message: "No linked batch",
              description:
                pickFirstNonEmptyString(record.docNo, record.reference) ||
                "This document type is not tied to a payment batch.",
              placement: "topRight",
            });
          }
          break;
        }
        case "retain-credit":
          Modal.info({
            title: "Credit retained on account",
            content:
              "No further action is required. Available credit remains on Payment on Account (2020) and can be applied to invoices or refunded when eligible.",
          });
          break;
        case "reverse":
        case "recovery-note": {
          const woRef = pickFirstNonEmptyString(
            record.docNo,
            record.reference,
          );
          Modal.info({
            title:
              actionId === "reverse"
                ? "Reverse write-off"
                : "Recovery note",
            content: (
              <span>
                Write-off reversal is not automated. Finance may post a journal
                adjustment with audit trail. Document: {woRef || "—"}
              </span>
            ),
            okText: "Open journal adjustments",
            onOk: () =>
              navigate("/JournalAdjustments", {
                state: {
                  search: "Journal adjustments",
                  highlightDocNo: woRef,
                },
              }),
          });
          break;
        }
        default:
          notification.info({
            message: actionId,
            description: "Action not available for this row.",
            placement: "topRight",
          });
      }
    },
    [
      authHeaders,
      financeSummary,
      handleCreditNoteCancel,
      memberId,
      navigate,
      openApproveCreditNote,
      openCreateCreditNote,
      openRefundForRecords,
      refreshFinanceViews,
    ],
  );

  const handleWriteOffSubmit = useCallback(
    async (values) => {
      if (writeOffSubmitting) return false;
      try {
        setWriteOffSubmitting(true);
        const payload = buildWriteOffPayload(values);
        await submitWriteOffRequest(payload);
        notification.success({
          message: "Write-off",
          description: "Write-off request submitted.",
          placement: "topRight",
        });
        window.dispatchEvent(
          new CustomEvent("member-finance-updated", {
            detail: { memberId: String(memberId || "").trim() },
          }),
        );
        setSelectedRowKeys([]);
        await refreshFinanceViews();
        closeWriteOffDrawer();
        return true;
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message;
        notification.error({
          message: "Write-off failed",
          description: backendMessage || "Unable to submit write-off request.",
          placement: "topRight",
        });
        return false;
      } finally {
        setWriteOffSubmitting(false);
      }
    },
    [
      buildWriteOffPayload,
      closeWriteOffDrawer,
      refreshFinanceViews,
      memberId,
      submitWriteOffRequest,
      writeOffSubmitting,
    ],
  );

  const handleRefundSubmit = useCallback(
    async (values) => {
      if (refundSubmitting) return false;
      try {
        setRefundSubmitting(true);
        const payload = buildRefundPayload(values, refundReceiptRows);
        await submitRefundRequest(payload);
        notification.success({
          message: "Refund",
          description: "Refund request submitted.",
          placement: "topRight",
        });
        window.dispatchEvent(
          new CustomEvent("member-finance-updated", {
            detail: { memberId: String(memberId || "").trim() },
          }),
        );
        setSelectedRowKeys([]);
        await refreshFinanceViews();
        closeRefundDrawer();
        return true;
      } catch (error) {
        const remainingRefundableCentsRaw =
          error?.response?.data?.remainingRefundableCents ??
          error?.response?.data?.data?.remainingRefundableCents;
        const remainingRefundableCents = Number(remainingRefundableCentsRaw);
        const hasRemainingRefundableCents = Number.isFinite(
          remainingRefundableCents,
        );
        const maxRefundableAmount = hasRemainingRefundableCents
          ? `€${centsToEuro(remainingRefundableCents).toLocaleString("en-IE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : null;
        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message;
        const errorDescription = hasRemainingRefundableCents
          ? `${backendMessage || "Unable to submit refund request."} Max refundable amount: ${maxRefundableAmount}.`
          : backendMessage || "Unable to submit refund request.";
        notification.error({
          message: "Refund failed",
          description: errorDescription,
          placement: "topRight",
        });
        return false;
      } finally {
        setRefundSubmitting(false);
      }
    },
    [
      buildRefundPayload,
      closeRefundDrawer,
      refreshFinanceViews,
      refundReceiptRows,
      refundSubmitting,
      submitRefundRequest,
    ],
  );

  const columns = useMemo(() => {
    const docTypeLabels = new Set();
    const paymentTypeLabels = new Set();
    (data || []).forEach((r) => {
      const dt = resolveLedgerDocTypeDisplay(r);
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
        title: (
          <FinanceColumnTitle label="Tx Date" help={LEDGER_COLUMN_HELP.date} />
        ),
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
        title: (
          <FinanceColumnTitle
            label="Doc Type"
            help={LEDGER_COLUMN_HELP.docType}
          />
        ),
        dataIndex: "docType",
        key: "docType",
        width: 150,
        ellipsis: true,
        sorter: {
          compare: (a, b) =>
            resolveLedgerDocTypeDisplay(a).localeCompare(
              resolveLedgerDocTypeDisplay(b),
              undefined,
              { sensitivity: "base" },
            ),
        },
        filters: docTypeFilters,
        onFilter: (value, record) =>
          resolveLedgerDocTypeDisplay(record) === value,
        filterSearch: true,
        render: (_, r) => {
          const main = resolveLedgerDocTypeDisplay(r);
          const tipRaw =
            r.displayLabel != null && String(r.displayLabel).trim() !== ""
              ? String(r.displayLabel).trim()
              : "";
          const tip = tipRaw && tipRaw !== main ? tipRaw : "";
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
        title: (
          <FinanceColumnTitle
            label="Tx Type"
            help={LEDGER_COLUMN_HELP.paymentType}
          />
        ),
        dataIndex: "paymentType",
        key: "paymentType",
        width: 150,
        ellipsis: true,
        sorter: {
          compare: (a, b) =>
            displayPaymentTypeForRow(a).localeCompare(
              displayPaymentTypeForRow(b),
              undefined,
              {
                sensitivity: "base",
              },
            ),
        },
        filters: paymentTypeFilters,
        onFilter: (value, record) => displayPaymentTypeForRow(record) === value,
        filterSearch: true,
        render: (_, r) => {
          const tx = displayPaymentTypeForRow(r);
          const tip = isClaimDocType(r)
            ? "Online payment from membership application, linked to this member when subscription was created."
            : tx === docTypeTxTypeHint(r) && tx !== "—"
              ? "Document category (not a payment method)."
              : null;
          return tip ? (
            <Tooltip title={tip}>
              <span>{tx}</span>
            </Tooltip>
          ) : (
            tx
          );
        },
      },
      {
        title: (
          <FinanceColumnTitle label="Status" help={LEDGER_COLUMN_HELP.status} />
        ),
        key: "status",
        width: 100,
        render: (_, r) => {
          const st = resolveLedgerRowStatus(r, pendingCreditNotes);
          return <Tag color={ledgerStatusTagColor(st)}>{st}</Tag>;
        },
      },
      {
        title: (
          <FinanceColumnTitle label="Badges" help={LEDGER_COLUMN_HELP.badges} />
        ),
        key: "badges",
        width: 168,
        render: (_, r) => {
          const st = resolveLedgerRowStatus(r, pendingCreditNotes);
          const badges = deriveRowBadges(r, st);
          if (!badges.length) return "—";
          return (
            <span style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {badges.map((b) => (
                <Tooltip key={b} title={LEDGER_BADGE_HELP[b] || b}>
                  <Tag style={{ margin: 0, fontSize: 10, cursor: "help" }}>
                    {b}
                  </Tag>
                </Tooltip>
              ))}
            </span>
          );
        },
      },
      {
        title: (
          <FinanceColumnTitle label="Source" help={LEDGER_COLUMN_HELP.sourceLink} />
        ),
        key: "sourceLink",
        width: 118,
        render: (_, r) => {
          const link = resolveLedgerDocumentLink(r, memberId);
          if (!link) return "—";
          return (
            <Link
              to={link.path}
              state={{ ...link.state, memberId }}
              style={{ fontSize: 12 }}
            >
              {link.label}
            </Link>
          );
        },
      },
      {
        title: (
          <FinanceColumnTitle label="Debit" help={LEDGER_COLUMN_HELP.debit} />
        ),
        dataIndex: "debit",
        key: "debit",
        width: 110,
        align: "right",
        render: (value, record) => {
          if (!value) return "";
          const cell = (
            <span style={{ color: "red" }}>
              €
              {centsToEuro(value).toLocaleString("en-IE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
          if (rowHasOffsettingDebitCredit(record)) {
            return (
              <Tooltip title="This row has both debit and credit lines; balance uses the net (see column help).">
                {cell}
              </Tooltip>
            );
          }
          return cell;
        },
      },
      {
        title: (
          <FinanceColumnTitle label="Credit" help={LEDGER_COLUMN_HELP.credit} />
        ),
        dataIndex: "credit",
        key: "credit",
        width: 110,
        align: "right",
        render: (value, record) => {
          if (!value) return "";
          const cell = (
            <span style={{ color: "green" }}>
              €
              {centsToEuro(value).toLocaleString("en-IE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
          if (rowHasOffsettingDebitCredit(record)) {
            return (
              <Tooltip title="This row has both debit and credit lines; balance uses the net (see column help).">
                {cell}
              </Tooltip>
            );
          }
          return cell;
        },
      },
      {
        title: (
          <FinanceColumnTitle
            label="Balance"
            help={LEDGER_COLUMN_HELP.balance}
          />
        ),
        dataIndex: "balance",
        key: "balance",
        width: 148,
        align: "right",
        render: (value) => {
          const { text, color } = formatLedgerBalanceCents(value);
          return <span style={{ color, fontVariantNumeric: "tabular-nums" }}>{text}</span>;
        },
      },
      {
        title: (
          <FinanceColumnTitle label="Memo" help={LEDGER_COLUMN_HELP.memo} />
        ),
        dataIndex: "memo",
        key: "memo",
        width: 200,
        ellipsis: true,
        render: (v, record) => {
          const memoText =
            v != null && String(v).trim() !== "" ? String(v).trim() : "—";
          const refRaw = record?.reference;
          const refText =
            refRaw != null &&
            String(refRaw).trim() !== "" &&
            String(refRaw).trim() !== "-"
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
              <Tooltip
                title={
                  refText === "—" ? "No reference" : `Reference: ${refText}`
                }
              >
                <InfoCircleOutlined
                  style={{ color: "#8c8c8c", flexShrink: 0, cursor: "help" }}
                  aria-label="Show reference"
                />
              </Tooltip>
            </span>
          );
        },
      },
      {
        title: (
          <FinanceColumnTitle
            label="Created"
            help={LEDGER_COLUMN_HELP.ledgerCreatedAt}
          />
        ),
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
              String(b._id ?? b.key ?? ""),
            );
          },
        },
        render: (text) =>
          text && dayjs(text).isValid()
            ? dayjs(text).format("DD/MM/YYYY HH:mm")
            : "—",
      },
      {
        title: (
          <FinanceColumnTitle
            label="Actions"
            help={LEDGER_COLUMN_HELP.actions}
          />
        ),
        key: "actions",
        width: 88,
        fixed: "right",
        render: (_, record) => {
          const cached = rowActionsCache[record.key];
          const menuItems = (cached?.actions || []).map((a) => ({
            key: a.id,
            label: a.label,
            onClick: () => runLedgerAction(a.id, record),
          }));
          if (!menuItems.length) {
            menuItems.push({
              key: "loading",
              label: "Load actions…",
              onClick: async () => {
                const payload = await fetchRowLedgerActions(record);
                if (payload?.actions?.length) {
                  const first = payload.actions[0];
                  runLedgerAction(first.id, record);
                }
              },
            });
          }
          return (
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              onOpenChange={(open) => {
                if (open) fetchRowLedgerActions(record);
              }}
            >
              <Button type="link" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          );
        },
      },
    ];
  }, [
    data,
    fetchRowLedgerActions,
    memberId,
    pendingCreditNotes,
    rowActionsCache,
    runLedgerAction,
  ]);

  const selectedLedgerRows = useMemo(
    () =>
      data.filter((r) =>
        selectedRowKeys.some((k) => String(k) === String(r.key)),
      ),
    [data, selectedRowKeys],
  );

  const writeOffInvoiceSummary = useMemo(() => {
    const rows = writeOffLedgerRows;
    if (!rows?.length) return null;
    const totalDebitCents = rows.reduce(
      (s, r) => s + (Number(r.debit) || 0),
      0,
    );
    const euroStr = centsToEuro(totalDebitCents).toLocaleString("en-IE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const refs = rows
      .map((r) =>
        pickFirstNonEmptyString(r.docNo, r.reference, r.doc_no, r.documentNo),
      )
      .filter(Boolean);
    const unique = [...new Set(refs)];
    const refPart =
      unique.length <= 3
        ? unique.join(", ")
        : `${unique.slice(0, 3).join(", ")}…`;
    return `${rows.length} invoice(s) selected — row debits total: €${euroStr}. Doc ref(s): ${refPart || "—"}`;
  }, [writeOffLedgerRows]);

  const prefillWriteOffAmountEuro = useMemo(() => {
    const rows = writeOffLedgerRows;
    if (!rows?.length) return null;
    const totalDebitCents = rows.reduce(
      (s, r) => s + (Number(r.debit) || 0),
      0,
    );
    if (totalDebitCents <= 0) return null;
    return Math.round(centsToEuro(totalDebitCents) * 100) / 100;
  }, [writeOffLedgerRows]);

  const writeOffMenuEnabled =
    selectedLedgerRows.length > 0 &&
    selectedLedgerRows.every((r) => isInvoiceDocType(r));

  const creditNoteMenuEnabled =
    selectedLedgerRows.length > 0 &&
    selectedLedgerRows.every((r) => isInvoiceDocType(r));

  const applyCreditMenuEnabled =
    (financeSummary?.availableCredit || 0) > 0 &&
    (financeSummary?.outstandingBalance || 0) > 0;

  /** Refund from payment-like rows: Claim (app credit → member) or Receipt (cash in). */
  const refundMenuEnabled =
    selectedLedgerRows.length > 0 &&
    selectedLedgerRows.every((r) => isClaimDocType(r));

  /** Reclassification applies only to posted payment documents (receipt/claim), not invoices or adjustments. */
  const reallocationMenuEnabled =
    selectedLedgerRows.length === 1 && isClaimDocType(selectedLedgerRows[0]);

  useLayoutEffect(() => {
    const setExtras = financeToolbarApi?.setFinanceTabBarExtra;
    if (!setExtras) return undefined;
    if (!memberId) {
      setExtras(null);
      return undefined;
    }
    setExtras(
      <>
        <Segmented
          aria-label="Ledger detail level"
          options={[
            { label: "Summary", value: "simple" },
            { label: "Full View", value: "full" },
          ]}
          value={ledgerView}
          onChange={(v) => setLedgerView(v)}
        />
        <Dropdown
          menu={{
            items: [
              {
                key: "approve-cn",
                label:
                  pendingCreditNotes.length > 0
                    ? `Approve credit notes (${pendingCreditNotes.length})`
                    : "Approve credit notes",
                icon: <CheckCircleOutlined />,
                disabled: pendingCreditNotes.length === 0,
                onClick: () =>
                  openApprovePendingCreditNote(pendingCreditNotes[0]),
              },
              {
                key: "creditnote",
                label:
                  selectedLedgerRows.length > 1
                    ? `Create credit notes (${selectedLedgerRows.length})`
                    : "Create credit note",
                icon: <FileTextOutlined />,
                disabled: !creditNoteMenuEnabled,
                onClick: () => openCreateCreditNote(selectedLedgerRows),
              },
              {
                key: "apply-credit",
                label: "Apply member credit",
                icon: <SwapOutlined />,
                disabled: !applyCreditMenuEnabled,
                onClick: () => {
                  const avail = financeSummary?.availableCredit || 0;
                  const out = financeSummary?.outstandingBalance || 0;
                  setApplyCreditPrefillEuro(
                    Math.round(centsToEuro(Math.min(avail, out)) * 100) / 100,
                  );
                  setApplyCreditSummary(
                    "Apply member credit to outstanding balance",
                  );
                  setApplyCreditOpen(true);
                },
              },
              {
                key: "refund",
                label: "Refund",
                icon: <RollbackOutlined />,
                danger: true,
                disabled: !refundMenuEnabled,
                onClick: () =>
                  openRefundForRecords(
                    data.filter((r) =>
                      selectedRowKeys.some((k) => String(k) === String(r.key)),
                    ),
                  ),
              },
              { type: "divider" },
              {
                key: "writeoff",
                label: "Write off",
                icon: <StopOutlined />,
                disabled: !writeOffMenuEnabled,
                onClick: () => openWriteOffForSelection(),
              },
              { type: "divider" },
              {
                key: "reallocation",
                label: "Reallocation",
                icon: <SwapOutlined />,
                disabled: !reallocationMenuEnabled,
                onClick: () => openReallocationForSelection(),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button
            type="default"
            style={financeMoreActionsButtonStyle}
            icon={<MoreOutlined />}
            aria-label="More actions"
          />
        </Dropdown>
      </>,
    );
    return () => setExtras(null);
  }, [
    financeToolbarApi,
    memberId,
    ledgerView,
    refundMenuEnabled,
    writeOffMenuEnabled,
    reallocationMenuEnabled,
    selectedRowKeys,
    data,
    openRefundForRecords,
    openWriteOffForSelection,
    openReallocationForSelection,
    openCreateCreditNote,
    creditNoteMenuEnabled,
    applyCreditMenuEnabled,
    financeSummary,
    pendingCreditNotes,
    openApprovePendingCreditNote,
  ]);

  if (!memberId) {
    return (
      <div className="mt-4">
        <Empty description="No Member ID provided" />
      </div>
    );
  }

  return (
    <div
      className="mt-2 pe-3"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0%",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          flexGrow: 0,
          width: "100%",
          overflow: "visible",
          zIndex: 1,
        }}
      >
        <MemberFinanceSummaryCards
          summary={financeSummary}
          loading={summaryLoading}
          pendingCreditNotes={pendingCreditNotes}
          onApprovePending={openApprovePendingCreditNote}
        />
        {pendingCreditNotes.length > 0 ? (
          <Alert
            type="warning"
            banner
            showIcon
            style={{ marginTop: 4, marginBottom: 0, padding: "2px 8px" }}
            message={
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  flexWrap: "wrap",
                  fontSize: 12,
                  lineHeight: 1.35,
                }}
              >
                <span>
                  {pendingCreditNotes.length} draft credit note
                  {pendingCreditNotes.length === 1 ? "" : "s"} — approve to post
                </span>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  style={{ flexShrink: 0 }}
                  onClick={() =>
                    openApprovePendingCreditNote(pendingCreditNotes[0])
                  }
                >
                  Approve
                </Button>
              </span>
            }
          />
        ) : null}
      </div>
      <div
        style={{
          flex: "1 1 0%",
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
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
          alwaysFirstSortField="ledgerCreatedAt"
          alwaysFirstSortOrder="descend"
          footerVariant="infinite"
          infiniteLoadOnScroll={false}
          scroll={{ x: "max-content" }}
        />
      </div>

      <RefundDrawer
        open={refundDrawerOpen}
        onClose={closeRefundDrawer}
        hideMemberSearch
        prefillRefundAmountEuro={prefillRefundEuros}
        initialRefundMode={refundInitialMode}
        receiptSummary={receiptSummaryText}
        submitLoading={refundSubmitting}
        onSubmit={handleRefundSubmit}
      />

      <WriteOffDrawer
        open={writeOffDrawerOpen}
        onClose={closeWriteOffDrawer}
        hideMemberSearch
        invoiceSummary={writeOffInvoiceSummary}
        prefillWriteOffAmountEuro={prefillWriteOffAmountEuro}
        submitLoading={writeOffSubmitting}
        onSubmit={handleWriteOffSubmit}
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

      <CreditNoteDrawer
        open={creditNoteDrawerOpen}
        onClose={closeCreditNoteDrawer}
        mode={creditNoteDrawerMode}
        memberId={memberId}
        invoiceDocNo={creditNoteTarget.invoiceDocNo}
        creditNoteDocNo={creditNoteTarget.creditNoteDocNo}
        prefillAmountEuro={creditNoteTarget.prefillEuro}
        invoiceSummary={creditNoteTarget.summary}
        submitLoading={creditNoteSubmitting}
        onSubmitCreate={handleCreditNoteCreate}
        onSubmitApprove={handleCreditNoteApprove}
      />

      <ApplyMemberCreditDrawer
        open={applyCreditOpen}
        onClose={() => setApplyCreditOpen(false)}
        memberId={memberId}
        availableCreditCents={financeSummary?.availableCredit || 0}
        outstandingCents={financeSummary?.outstandingBalance || 0}
        prefillAmountEuro={applyCreditPrefillEuro}
        invoiceSummary={applyCreditSummary}
        submitLoading={applyCreditSubmitting}
        onSubmit={handleApplyCreditSubmit}
      />
    </div>
  );
};

export default TransactionHistory;
