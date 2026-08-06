import {
  AccountBookOutlined,
  SyncOutlined,
  BankOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";

/** Chart row metadata (no placeholder amounts). */
export const LIFECYCLE_PAYMENT_METHOD_ROWS = [
  {
    label: "Deductions",
    dataKey: "deductions",
    color: "var(--app-brand-primary)",
    icon: AccountBookOutlined,
  },
  {
    label: "Standing Orders",
    dataKey: "standingOrders",
    color: "#1677ff",
    icon: SyncOutlined,
  },
  {
    label: "Direct Debit",
    dataKey: "directDebit",
    color: "#597ef7",
    icon: BankOutlined,
  },
  {
    label: "Credit Card",
    dataKey: "creditCard",
    color: "#fa8c16",
    icon: CreditCardOutlined,
  },
  {
    label: "Cheque",
    dataKey: "cheque",
    color: "#13c2c2",
    icon: FileTextOutlined,
  },
  {
    label: "Cash",
    dataKey: "cash",
    color: "#8c8c8c",
    icon: MoneyCollectOutlined,
  },
];

const PAYMENT_TYPE_TO_DATA_KEY = {
  "salary deduction": "deductions",
  "payroll deduction": "deductions",
  deductions: "deductions",
  "standing order": "standingOrders",
  "sbo payment": "standingOrders",
  standingorders: "standingOrders",
  "direct debit": "directDebit",
  directdebit: "directDebit",
  "credit card": "creditCard",
  "card payment": "creditCard",
  creditcard: "creditCard",
  cheque: "cheque",
  check: "cheque",
  cash: "cash",
};

function parseMoney(value) {
  if (value == null) return 0;
  const n = parseFloat(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function memberAmount(member) {
  const balance = parseMoney(member?.outstandingBalance);
  if (balance > 0) return balance;
  return parseMoney(member?.membershipFee ?? member?.lastPaymentAmount);
}

function resolvePaymentDataKey(member) {
  const raw = member?.paymentType ?? member?.paymentMethod ?? "";
  const normalized = String(raw).trim().toLowerCase();
  if (!normalized) return null;
  if (PAYMENT_TYPE_TO_DATA_KEY[normalized]) {
    return PAYMENT_TYPE_TO_DATA_KEY[normalized];
  }
  const compact = normalized.replace(/[^a-z]/g, "");
  return PAYMENT_TYPE_TO_DATA_KEY[compact] || null;
}

function findDominantRow(rows) {
  if (!rows?.length) return null;
  return rows.reduce(
    (best, row) => (row.amount > (best?.amount ?? -1) ? row : best),
    null,
  );
}

/**
 * Build payment-method breakdown from the members currently shown in the batch list.
 */
export function buildPaymentMethodAnalysis(
  members,
  rowDefs = LIFECYCLE_PAYMENT_METHOD_ROWS,
) {
  const emptyRows = rowDefs.map((row) => ({
    ...row,
    amount: 0,
    pct: 0,
    memberCount: 0,
  }));

  if (!members?.length) {
    return {
      rows: emptyRows,
      total: 0,
      dominant: null,
      hasData: false,
    };
  }

  const buckets = new Map(
    rowDefs.map((row) => [
      row.dataKey,
      { ...row, amount: 0, memberCount: 0 },
    ]),
  );

  for (const member of members) {
    const dataKey = resolvePaymentDataKey(member);
    if (!dataKey || !buckets.has(dataKey)) continue;
    const bucket = buckets.get(dataKey);
    bucket.amount += memberAmount(member);
    bucket.memberCount += 1;
  }

  const rows = [...buckets.values()].map((row) => ({
    ...row,
    pct: 0,
  }));
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const rowsWithPct = rows.map((row) => ({
    ...row,
    pct: total > 0 ? Math.round((row.amount / total) * 1000) / 10 : 0,
  }));

  return {
    rows: rowsWithPct,
    total,
    dominant: findDominantRow(rowsWithPct.filter((row) => row.amount > 0)),
    hasData: members.length > 0 && total > 0,
  };
}
