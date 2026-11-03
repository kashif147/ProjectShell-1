/**
 * Online Payments grid on account-service GET /payments/attempts (PR #33 contract).
 * Pure helpers (query builder, row mapping, status labels, refund gating) plus the REAL
 * TableColumnsProvider / applyTemplate with the stored onlinepayment system-default shape
 * (account-service gridSystemDefaults.v1.json: still lists email / phone). No network, no PII.
 */
import React from "react";
import { render, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { TableColumnsProvider, useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import {
  ATTEMPT_QUERY_KEYS,
  LIFECYCLE_STATUS_LABELS,
  buildAttemptsQuery,
  canRefundAttempt,
  dateFilterToServerRange,
  hasReceipt,
  isEmptyStatusSelection,
  lifecycleLabel,
  normalizeAttemptRow,
  refundablePrefillEuro,
  serverFiltersFromFiltersState,
  statusFilterToServerStatuses,
  unwrapAttemptsResponse,
  withoutServerSideFilters,
} from "../../utils/onlinePaymentAttempts";
import {
  normalizeOnlinePaymentTemplateForRead,
  withOnlinePaymentAttemptColumns,
} from "../../utils/onlinePaymentGridCompat";
import accountReducer, { fetchPaymentAttempts } from "../../features/AccountSlice";

// ---- fixtures (contract-shaped, synthetic ids, no PII) ------------------------------------------
const base = {
  attemptNumber: 1, isActiveAttempt: true, supersededAt: null, purpose: "applicationFee",
  ledgerDomain: "membership", source: "portal", mode: "stripe", amount: 5000, currency: "eur",
  applicationId: "app-1", registrationId: null, profileId: null, memberId: null, payerUserType: "PORTAL",
  createdAt: "2026-11-02T10:00:00.000Z", authorisedAt: null, capturedAt: null, canceledAt: null,
  capturableUntil: null, failureCode: null, cancellationReason: null, paymentIntentId: "pi_test_1",
  receipt: null, membershipNumber: null, fullName: "Test Applicant", membershipCategory: "General",
  membershipStatus: null, joinDate: null, renewalDate: null, billingCycle: null, paymentMethod: null,
  amountCaptured: 0, amountRefunded: 0, refundableAmount: null, actions: { canRefund: false },
};
const receipt = {
  id: "650000000000000000000001", docNo: "RCP-650000000000000000000002", date: "2026-11-02T10:05:00.000Z",
  settlementStatus: "PENDING", settlementProvider: "Stripe", paidAmount: 5000,
};
const item = (over) => ({ ...base, ...over });
const ITEMS = {
  pending: item({ id: "a1", lifecycleStatus: "pending", providerStatus: "requires_action" }),
  authorised: item({ id: "a2", lifecycleStatus: "authorised", providerStatus: "requires_capture", authorisedAt: "2026-11-02T10:01:00.000Z" }),
  cancelled: item({ id: "a3", lifecycleStatus: "cancelled", providerStatus: "canceled", canceledAt: "2026-11-02T11:00:00.000Z" }),
  failed: item({ id: "a4", lifecycleStatus: "failed", providerStatus: "failed", failureCode: "card_declined" }),
  captured: item({
    id: "a5", lifecycleStatus: "captured", providerStatus: "succeeded", amountCaptured: 5000, amountRefunded: 0,
    capturedAt: "2026-11-02T10:05:00.000Z", receipt, refundableAmount: 5000, actions: { canRefund: true },
  }),
  capturedNoRefund: item({
    id: "a6", lifecycleStatus: "refund_required", providerStatus: "refund_required", amountCaptured: 5000, receipt,
    amountRefunded: 0, refundableAmount: null, actions: { canRefund: false },
  }),
  partial: item({
    id: "a7", lifecycleStatus: "partially_refunded", providerStatus: "partially_refunded", amountCaptured: 5000,
    amountRefunded: null, refundableAmount: null, receipt, actions: { canRefund: false },
  }),
  knownPartial: item({
    id: "a9", lifecycleStatus: "partially_refunded", providerStatus: "partially_refunded", amountCaptured: 5000,
    amountRefunded: 1500, refundableAmount: 3500, receipt, actions: { canRefund: true },
  }),
  unknown: item({ id: "a8", lifecycleStatus: "unknown", providerStatus: "manual_review" }),
};

// ---- query builder ----------------------------------------------------------------------------
describe("buildAttemptsQuery", () => {
  test("emits only allowed keys, always mode=stripe, default limit 200", () => {
    const p = buildAttemptsQuery({ statuses: ["captured", "authorised", "refund_required"], from: "2026-11-01", to: "2026-11-02", tenantId: "x", append: true, requestId: "r" });
    const keys = [...p.keys()];
    keys.forEach((k) => expect(ATTEMPT_QUERY_KEYS).toContain(k));
    expect(keys).not.toContain("tenantId");
    expect(keys).not.toContain("append");
    expect(p.get("mode")).toBe("stripe");
    expect(p.get("status")).toBe("captured,authorised,refund_required");
    expect(p.get("from")).toBe("2026-11-01");
    expect(p.get("to")).toBe("2026-11-02");
    expect(p.get("limit")).toBe("200");
    expect(p.has("cursor")).toBe(false);
  });

  test("limit is clamped to <= 200 and >= 1; cursor passed through unchanged", () => {
    expect(buildAttemptsQuery({ limit: 1000 }).get("limit")).toBe("200");
    expect(buildAttemptsQuery({ limit: 50 }).get("limit")).toBe("50");
    expect(buildAttemptsQuery({ limit: 0 }).get("limit")).toBe("200");
    expect(buildAttemptsQuery({ limit: -5 }).get("limit")).toBe("200");
    expect(buildAttemptsQuery({ cursor: "eyJjIjoiMjAyNi0xMS0wMiJ9" }).get("cursor")).toBe("eyJjIjoiMjAyNi0xMS0wMiJ9");
  });

  test("invalid status codes are never sent; mode cannot be overridden", () => {
    const p = buildAttemptsQuery({ statuses: ["paid", "captured", "bogus"], mode: "external" });
    expect(p.get("status")).toBe("captured");
    expect(p.get("mode")).toBe("stripe");
    expect(buildAttemptsQuery({ statuses: ["bogus"] }).has("status")).toBe(false);
  });
});

describe("server-side filters", () => {
  test("Payment Status labels -> lifecycle codes; != sends the complement", () => {
    expect(statusFilterToServerStatuses({ operator: "==", selectedValues: ["Authorised (not captured)", "Partially refunded"] }))
      .toEqual(["authorised", "partially_refunded"]);
    expect(statusFilterToServerStatuses({ operator: "==", selectedValues: ["Paid"] })).toEqual(["captured"]); // legacy saved views
    const notCancelled = statusFilterToServerStatuses({ operator: "!=", selectedValues: ["Cancelled"] });
    expect(notCancelled).not.toContain("cancelled");
    expect(notCancelled).toHaveLength(8);
    expect(notCancelled).toContain("refund_required");
    expect(statusFilterToServerStatuses({ operator: "==", selectedValues: ["Refund required"] })).toEqual(["refund_required"]);
    expect(statusFilterToServerStatuses({ operator: "==", selectedValues: [] })).toBeNull();
    expect(statusFilterToServerStatuses({ operator: "==", selectedValues: ["Nonsense"] })).toEqual([]);
    expect(isEmptyStatusSelection({ statuses: [] })).toBe(true);
  });

  test("Payment Date -> from/to", () => {
    expect(dateFilterToServerRange({ operator: "between", selectedValues: ["2026-11-01", "2026-11-03"] }))
      .toEqual({ from: "2026-11-01", to: "2026-11-03" });
    expect(dateFilterToServerRange({ operator: "!=", selectedValues: ["2026-11-01"] })).toEqual({});
    expect(dateFilterToServerRange({ operator: "between", selectedValues: [] })).toEqual({});
  });

  test("Payment Status is removed from the client-side pass (substring match would leak Partially refunded)", () => {
    const fs = { "Payment Status": { operator: "==", selectedValues: ["Refunded"] }, "Full Name": { operator: "==", selectedValues: [] } };
    expect(withoutServerSideFilters(fs)).not.toHaveProperty("Payment Status");
    expect(withoutServerSideFilters(fs)).toHaveProperty("Full Name");
    expect(serverFiltersFromFiltersState(fs)).toEqual({ statuses: ["refunded"] });
  });
});

describe("response + reducer", () => {
  test("unwraps the res.success envelope", () => {
    const body = { status: "success", data: { items: [ITEMS.captured], limit: 200, nextCursor: "c1", total: 7 } };
    expect(unwrapAttemptsResponse(body)).toEqual({ items: [ITEMS.captured], limit: 200, nextCursor: "c1", total: 7 });
    expect(unwrapAttemptsResponse({ data: { items: [], nextCursor: null, total: 0 } }).nextCursor).toBeNull();
    expect(unwrapAttemptsResponse(null).items).toEqual([]);
  });

  test("first page replaces, cursor page appends, stale responses ignored", () => {
    let s = accountReducer(undefined, { type: "@@init" });
    s = accountReducer(s, { type: fetchPaymentAttempts.pending.type, meta: { requestId: "r1", arg: {} } });
    s = accountReducer(s, { type: fetchPaymentAttempts.fulfilled.type, meta: { requestId: "r1", arg: {} }, payload: { items: [ITEMS.pending], nextCursor: "c1", total: 2 } });
    expect(s.paymentAttempts).toHaveLength(1);
    s = accountReducer(s, { type: fetchPaymentAttempts.pending.type, meta: { requestId: "r2", arg: { append: true, cursor: "c1" } } });
    s = accountReducer(s, { type: fetchPaymentAttempts.fulfilled.type, meta: { requestId: "r2", arg: { append: true, cursor: "c1" } }, payload: { items: [ITEMS.captured], nextCursor: null, total: 2 } });
    expect(s.paymentAttempts.map((r) => r.id)).toEqual(["a1", "a5"]);
    expect(s.paymentAttemptsNextCursor).toBeNull();
    s = accountReducer(s, { type: fetchPaymentAttempts.pending.type, meta: { requestId: "r3", arg: {} } });
    s = accountReducer(s, { type: fetchPaymentAttempts.fulfilled.type, meta: { requestId: "r2", arg: {} }, payload: { items: [], nextCursor: null, total: 0 } });
    expect(s.paymentAttempts).toHaveLength(2); // r2 is stale once r3 started
  });
});

// ---- row mapping / labels / gating --------------------------------------------------------------
describe("normalizeAttemptRow", () => {
  test("one row per attempt keyed by id; lifecycle labels never call a hold paid/captured", () => {
    const rows = Object.values(ITEMS).map(normalizeAttemptRow);
    expect(new Set(rows.map((r) => r.key)).size).toBe(rows.length);
    expect(rows.map((r) => r.key)).toEqual(Object.values(ITEMS).map((i) => i.id));
    const auth = normalizeAttemptRow(ITEMS.authorised);
    expect(auth.paymentStatus).toBe("Authorised (not captured)");
    expect(auth.paymentStatus).not.toMatch(/^(paid|captured|settled)/i);
    expect(auth.paidAmount).toBe(0);
    expect(auth.amountEuro).toBe(50);
    expect(Object.values(LIFECYCLE_STATUS_LABELS)).toEqual([
      "Pending", "Authorised (not captured)", "Captured", "Refund required", "Cancelled", "Failed", "Refunded", "Partially refunded", "Unknown",
    ]);
    expect(lifecycleLabel("weird")).toBe("Unknown");
    expect(normalizeAttemptRow({ ...ITEMS.pending, lifecycleStatus: "weird" }).paymentStatus).toBe("Unknown");
  });

  test("partially_refunded with null amountRefunded renders safely", () => {
    const r = normalizeAttemptRow(ITEMS.partial);
    expect(r.paymentStatus).toBe("Partially refunded");
    expect(r.amountRefundedEuro).toBeNull();
    expect(r.paidAmount).toBe(50);
    expect(refundablePrefillEuro(ITEMS.partial)).toBeNull();
  });

  test("receipt identity only when a receipt exists", () => {
    const cap = normalizeAttemptRow(ITEMS.captured);
    expect(hasReceipt(cap)).toBe(true);
    expect(cap.transactionId).toBe(receipt.docNo);
    expect(cap.docNo).toBe(receipt.docNo);
    const auth = normalizeAttemptRow(ITEMS.authorised);
    expect(hasReceipt(auth)).toBe(false);
    expect(auth.transactionId).toBeNull();
    expect(auth.docNo).toBeNull();
    expect(auth.memberNo).toBe("app-1"); // unapproved: application id drives the navigation
    expect(auth.isApproved).toBe(false);
  });

  test("refund only when actions.canRefund === true", () => {
    expect(canRefundAttempt(normalizeAttemptRow(ITEMS.captured))).toBe(true);
    ["pending", "authorised", "cancelled", "failed", "capturedNoRefund", "partial", "unknown"].forEach((k) =>
      expect(canRefundAttempt(normalizeAttemptRow(ITEMS[k]))).toBe(false),
    );
    expect(canRefundAttempt({ actions: { canRefund: "true" } })).toBe(false);
    expect(canRefundAttempt({})).toBe(false);
    expect(refundablePrefillEuro({ amountCaptured: 5000, amountRefunded: 1000 })).toBeNull(); // never computed client-side
    expect(canRefundAttempt({ actions: { canRefund: true }, refundableAmount: null })).toBe(false);
    expect(canRefundAttempt({ actions: { canRefund: true }, refundableAmount: 0 })).toBe(false);
    expect(canRefundAttempt({ actions: { canRefund: false }, refundableAmount: 100 })).toBe(false);
    expect(refundablePrefillEuro(ITEMS.authorised)).toBeNull();
  });
});

// ---- stored-template compatibility (pure) -------------------------------------------------------
const STORED_SYSTEM_DEFAULT = Object.freeze({
  columns: Object.freeze(["memberNo", "category", "fullName", "membershipStatus", "renewalDate", "transactionId", "paidAmount", "date", "paymentMethod", "paymentStatus", "billingCycle", "email", "phone", "joinDate"]),
  columnLabels: Object.freeze({
    memberNo: "Member / Application No", category: "Category", fullName: "Full Name", membershipStatus: "Membership Status",
    renewalDate: "Renewal Date", transactionId: "Transaction ID", paidAmount: "Paid Amount", date: "Payment Date",
    paymentMethod: "Payment Method", paymentStatus: "Payment Status", billingCycle: "Billing Cycle", email: "Email",
    phone: "Phone", joinDate: "Join Date", _actions: "Actions",
  }),
});

test("compat: removed columns dropped, new columns added once, inputs untouched", () => {
  const out = withOnlinePaymentAttemptColumns(STORED_SYSTEM_DEFAULT.columns);
  expect(out).not.toContain("email");
  expect(out).not.toContain("phone");
  expect(out.slice(5, 9)).toEqual(["transactionId", "amountEuro", "paidAmount", "amountRefundedEuro"]);
  expect(out.indexOf("purposeLabel")).toBe(out.indexOf("paymentStatus") + 1);
  expect(withOnlinePaymentAttemptColumns(out)).toEqual(out);
  const r = normalizeOnlinePaymentTemplateForRead({ templateColumns: [], masterColumns: STORED_SYSTEM_DEFAULT.columns, templateColumnLabels: STORED_SYSTEM_DEFAULT.columnLabels });
  expect(r.templateColumns).toEqual(out);
  expect(r.templateColumnLabels).not.toHaveProperty("email");
  expect(STORED_SYSTEM_DEFAULT.columns).toContain("email");
  expect(normalizeOnlinePaymentTemplateForRead({ fallbackColumns: ["memberNo"] }).templateColumns[0]).toBe("memberNo");
});

// ---- real provider: applyTemplate + column renders ----------------------------------------------
const STATE = Object.freeze({
  regions: { regions: [], loading: false },
  lookups: { lookups: [], lookupsloading: false },
  contactType: { contactTypes: [], contactTypesloading: false, error: null },
});
const store = { getState: () => STATE, subscribe: () => () => {}, dispatch: () => {} };
let ctx;
function Grab() {
  ctx = useTableColumns();
  return null;
}
const key = (c) => (Array.isArray(c.dataIndex) ? c.dataIndex.join(".") : String(c.dataIndex));
const col = (k) => ctx.columns.OnlinePayment.find((c) => key(c) === k);
const shown = () => ctx.columns.OnlinePayment.filter((c) => c.isGride).map(key);

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});
beforeEach(() => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <TableColumnsProvider>
          <Grab />
        </TableColumnsProvider>
      </MemoryRouter>
    </Provider>,
  );
});

test("stored system default (lists email/phone) applies without crashing and shows the new columns", () => {
  act(() => {
    ctx.applyTemplate("OnlinePayment", [...STORED_SYSTEM_DEFAULT.columns], [...STORED_SYSTEM_DEFAULT.columns], { ...STORED_SYSTEM_DEFAULT.columnLabels }, { ...STORED_SYSTEM_DEFAULT.columnLabels });
  });
  const keys = shown();
  expect(keys).toEqual(expect.arrayContaining(["paymentStatus", "amountEuro", "paidAmount", "amountRefundedEuro", "transactionId"]));
  expect(keys).not.toContain("email");
  expect(keys).not.toContain("phone");
  expect(ctx.columns.OnlinePayment.map(key)).not.toContain("email");
});

test("actions column: refund menu only for canRefund rows", () => {
  const actions = col("_actions");
  expect(actions.render(null, normalizeAttemptRow(ITEMS.captured))).not.toBeNull();
  ["pending", "authorised", "cancelled", "failed", "capturedNoRefund", "partial", "unknown"].forEach((k) =>
    expect(actions.render(null, normalizeAttemptRow(ITEMS[k]))).toBeNull(),
  );
});

test("cells render safely: null refunded amount, status tag label, transaction ref fallback", () => {
  const partial = normalizeAttemptRow(ITEMS.partial);
  expect(col("amountRefundedEuro").render(partial.amountRefundedEuro, partial)).toBe("Unknown");
  const { container } = render(<div>{col("paymentStatus").render(partial.paymentStatus, partial)}</div>);
  expect(container.textContent).toBe("Partially refunded");
  const auth = normalizeAttemptRow(ITEMS.authorised);
  expect(col("transactionId").render(auth.transactionId, auth)).toBe("pi_test_1");
  const cap = normalizeAttemptRow(ITEMS.captured);
  expect(col("transactionId").render(cap.transactionId, cap)).toBe(receipt.docNo);
});

test("client-side filters still work on mapped rows (Captured Amount / Full Name)", () => {
  const rows = Object.values(ITEMS).map(normalizeAttemptRow);
  const out = applyClientSideRowFilters(rows, withoutServerSideFilters({
    "Payment Status": { operator: "==", selectedValues: ["Refunded"] },
    "Full Name": { operator: "==", selectedValues: ["Test"] },
  }), ctx.columns.OnlinePayment);
  expect(out).toHaveLength(rows.length);
});

// ---- refund_required / partial refunds (contract update) ---------------------------------------
describe("refund_required and partial refunds", () => {
  test("refund_required: labelled 'Refund required' (never Captured), captured amount shown, no refund action", () => {
    const r = normalizeAttemptRow(ITEMS.capturedNoRefund);
    expect(r.paymentStatus).toBe("Refund required");
    expect(r.paymentStatus).not.toBe("Captured");
    expect(r.paidAmount).toBe(50);
    expect(col("paidAmount").render(r.paidAmount, r)).not.toBe("—");
    expect(canRefundAttempt(r)).toBe(false);
    expect(col("_actions").render(null, r)).toBeNull();
    expect(refundablePrefillEuro(r)).toBeNull();
  });

  test("unknown partial refund: 'Unknown' refunded amount, no refund action, no prefill", () => {
    const r = normalizeAttemptRow(ITEMS.partial);
    expect(col("amountRefundedEuro").render(r.amountRefundedEuro, r)).toBe("Unknown");
    expect(canRefundAttempt(r)).toBe(false);
    expect(col("_actions").render(null, r)).toBeNull();
    expect(refundablePrefillEuro(r)).toBeNull();
    // even if the server flag were true, an unknown refundable amount gives no action / prefill
    const forced = { ...r, actions: { canRefund: true } };
    expect(canRefundAttempt(forced)).toBe(false);
    expect(refundablePrefillEuro(forced)).toBeNull();
  });

  test("known partial refund: prefill = refundableAmount / 100, refund action shown", () => {
    const r = normalizeAttemptRow(ITEMS.knownPartial);
    expect(refundablePrefillEuro(r)).toBe(35);
    expect(canRefundAttempt(r)).toBe(true);
    expect(col("_actions").render(null, r)).not.toBeNull();
    expect(col("amountRefundedEuro").render(r.amountRefundedEuro, r)).not.toBe("Unknown");
  });

  test("Refund required is offered in the Payment Status filter options", () => {
    const { ONLINE_PAYMENT_STATUS_FILTER_OPTIONS } = require("../../utils/onlinePaymentAttempts");
    expect(ONLINE_PAYMENT_STATUS_FILTER_OPTIONS).toContain("Refund required");
  });
});
