/**
 * POST /payments/refunds outcomes (account-service #38) as the two CRM callers handle them:
 * Online Payments (antd `message` adapter) and the member Finance tab (antd `notification`
 * adapter). Each response shape is run through runRefundRequest with the same hooks the callers
 * pass (completed / pending / uncertain -> refresh + close; failed -> keep the drawer open).
 */
import {
  REFUND_CONFLICT_MESSAGES,
  REFUND_PENDING_TEXT,
  REFUND_UNCERTAIN_TEXT,
  interpretRefundError,
  interpretRefundSuccess,
  notifyViaMessage,
  notifyViaNotification,
  runRefundRequest,
  withRemainingRefundableHint,
} from "./refundOutcome";

const ok = (data) => Promise.resolve({ status: 200, data: { status: "success", message: "Success", data } });
const fail = (status, body) => {
  const e = new Error(`Request failed with status code ${status}`);
  e.response = { status, data: { status: "fail", ...body } };
  return Promise.reject(e);
};

const CALLERS = {
  "Online Payments": () => {
    const api = { success: jest.fn(), info: jest.fn(), warning: jest.fn(), error: jest.fn() };
    return { api, notify: notifyViaMessage(api), textOf: (fn) => fn.mock.calls[0][0] };
  },
  "member Finance tab": () => {
    const api = { success: jest.fn(), info: jest.fn(), warning: jest.fn(), error: jest.fn() };
    return {
      api,
      notify: notifyViaNotification(api),
      textOf: (fn) => fn.mock.calls[0][0].description,
      describeError: (interpreted, error) =>
        interpreted.outcome === "error" ? withRemainingRefundableHint(error, interpreted.message) : interpreted.message,
    };
  },
};

async function run(caller, request) {
  const c = CALLERS[caller]();
  const hooks = { onCompleted: jest.fn(), onPending: jest.fn(), onUncertain: jest.fn(), onFailed: jest.fn() };
  const result = await runRefundRequest({
    request: jest.fn(request),
    notify: c.notify,
    successText: "Refund processed successfully",
    describeError: c.describeError,
    ...hooks,
  });
  return { ...c, hooks, result };
}

describe.each(Object.keys(CALLERS))("%s refund caller", (caller) => {
  test("200 pending -> 'Refund submitted, pending with provider', not success; refresh, not completed", async () => {
    const { api, hooks, result, textOf } = await run(caller, () =>
      ok({ status: "pending", providerStatus: "pending", refundId: "re_x", operationId: "650000000000000000000009", pending: true }),
    );
    expect(api.success).not.toHaveBeenCalled();
    expect(textOf(api.info)).toBe(REFUND_PENDING_TEXT);
    expect(hooks.onPending).toHaveBeenCalledTimes(1);
    expect(hooks.onCompleted).not.toHaveBeenCalled();
    expect(result).toMatchObject({ outcome: "pending", operationId: "650000000000000000000009", ok: true });
  });

  test("200 succeeded -> success as today", async () => {
    const { api, hooks, result, textOf } = await run(caller, () => ok({ status: "succeeded", refundId: "re_y" }));
    expect(textOf(api.success)).toBe("Refund processed successfully");
    expect(hooks.onCompleted).toHaveBeenCalledTimes(1);
    expect(hooks.onPending).not.toHaveBeenCalled();
    expect(result.outcome).toBe("succeeded");
  });

  test("200 with no status (legacy / external refund) -> success", async () => {
    const { api, hooks } = await run(caller, () => ok({ refundDocId: "r1", glPosted: true }));
    expect(api.success).toHaveBeenCalledTimes(1);
    expect(hooks.onCompleted).toHaveBeenCalledTimes(1);
  });

  test("503 REFUND_OUTCOME_UNCERTAIN -> uncertain warning, refresh, no success, drawer closes", async () => {
    const { api, hooks, result, textOf } = await run(caller, () =>
      fail(503, { code: "REFUND_OUTCOME_UNCERTAIN", message: "The refund outcome is not known yet" }),
    );
    expect(textOf(api.warning)).toBe(REFUND_UNCERTAIN_TEXT);
    expect(REFUND_UNCERTAIN_TEXT).toMatch(/do not retry with a different amount/);
    expect(api.success).not.toHaveBeenCalled();
    expect(api.error).not.toHaveBeenCalled();
    expect(hooks.onUncertain).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ outcome: "uncertain", ok: true });
  });

  test("502 REFUND_PROVIDER_FAILED -> failure, no refresh hooks, drawer stays open", async () => {
    const { api, hooks, result, textOf } = await run(caller, () =>
      fail(502, { code: "REFUND_PROVIDER_FAILED", message: "The payment provider failed the refund" }),
    );
    expect(textOf(api.error)).toMatch(/^Refund failed at the payment provider/);
    expect(api.success).not.toHaveBeenCalled();
    Object.values(hooks).forEach((h) => expect(h).not.toHaveBeenCalled());
    expect(result).toMatchObject({ outcome: "failed", ok: false });
  });

  test("502 without a code -> failure", async () => {
    const { api, result } = await run(caller, () => fail(502, { message: "Bad gateway" }));
    expect(api.error).toHaveBeenCalledTimes(1);
    expect(result.outcome).toBe("failed");
  });

  test.each([
    "REFUND_FLOW_UNSUPPORTED",
    "REFUND_PENDING_FINANCE_ALLOCATION",
    "REFUND_INCONSISTENT_APPROVED_NO_TRANSFER",
    "REFUND_INCONSISTENT_NO_LEDGER_RECEIPT",
    "REFUND_APPLICATION_STATE_UNAVAILABLE",
    "REFUND_APPLICATION_STATE_UNVERIFIED",
    "REFUND_CREDIT_PERIOD_UNRESOLVED",
    "REFUND_MEMBER_CREDIT_UNAVAILABLE",
    "REFUND_TARGET_MISMATCH",
    "REFUND_LINK_CONFLICT",
  ])("409 %s -> clear blocked message", async (code) => {
    const { api, hooks, result, textOf } = await run(caller, () => fail(409, { code, message: "raw server text" }));
    const text = textOf(api.error);
    expect(text).not.toBe("raw server text");
    expect(text.length).toBeGreaterThan(20);
    if (REFUND_CONFLICT_MESSAGES[code]) expect(text).toBe(REFUND_CONFLICT_MESSAGES[code]);
    expect(api.success).not.toHaveBeenCalled();
    Object.values(hooks).forEach((h) => expect(h).not.toHaveBeenCalled());
    expect(result).toMatchObject({ outcome: "blocked", code, ok: false });
  });

  test("other errors keep the backend message", async () => {
    const { api, textOf } = await run(caller, () => fail(400, { message: "Refund amount must be greater than 0" }));
    expect(textOf(api.error)).toMatch(/^Refund amount must be greater than 0/);
  });
});

test("member Finance tab keeps its max-refundable hint on generic errors only", async () => {
  const { api, textOf } = await run("member Finance tab", () =>
    fail(409, { code: "REFUND_AMOUNT_UNAVAILABLE", message: "Refund exceeds the remaining refundable amount", remainingRefundableCents: 1250 }),
  );
  expect(textOf(api.error)).toBe("Refund exceeds the remaining refundable amount Max refundable amount: €12.50.");
  expect(withRemainingRefundableHint({ response: { data: {} } }, "x")).toBe("x");
});

test("notification adapter headings (Finance tab)", () => {
  const api = { success: jest.fn(), info: jest.fn(), warning: jest.fn(), error: jest.fn() };
  const n = notifyViaNotification(api);
  n("info", REFUND_PENDING_TEXT);
  n("warning", REFUND_UNCERTAIN_TEXT);
  n("success", "Refund request submitted.");
  expect(api.info.mock.calls[0][0]).toMatchObject({ message: "Refund pending", description: REFUND_PENDING_TEXT });
  expect(api.warning.mock.calls[0][0].message).toBe("Refund outcome uncertain");
  expect(api.success.mock.calls[0][0]).toMatchObject({ message: "Refund", description: "Refund request submitted." });
});

test("interpreters read the res.success data / error code", () => {
  expect(interpretRefundSuccess({ status: "success", data: { status: "pending" } }).outcome).toBe("pending");
  // the envelope's own top-level "success" status is not the refund status
  expect(interpretRefundSuccess({ status: "success", data: {} }).outcome).toBe("succeeded");
  expect(interpretRefundSuccess(undefined).outcome).toBe("succeeded");
  expect(interpretRefundSuccess({ data: { status: "failed" } }).outcome).toBe("failed");
  expect(interpretRefundError({ response: { status: 503, data: { code: "REFUND_OUTCOME_UNCERTAIN" } } }).outcome).toBe("uncertain");
  expect(interpretRefundError(new Error("Network Error"))).toMatchObject({ outcome: "error", message: "Network Error" });
});
