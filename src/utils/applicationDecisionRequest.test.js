import {
  buildBulkApprovalItems,
  createOperationKeyStore,
  decisionErrorCode,
  describeBulkRow,
  describeDecisionError,
  isRetryableDecisionError,
  newOperationKey,
  reviewVersionOf,
  withDecisionPreconditions,
} from "./applicationDecisionRequest";

const httpError = (status, code) =>
  Object.assign(new Error(code || `HTTP ${status}`), {
    response: {
      status,
      data: code ? { success: false, error: { code, status, message: `server says ${code}` } } : {},
    },
  });

describe("operation keys", () => {
  test("newOperationKey is unique and header/body safe", () => {
    const a = newOperationKey();
    const b = newOperationKey();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[\x21-\x7e]{8,200}$/);
  });

  test("same action reuses its key until settled; different actions differ", () => {
    const store = createOperationKeyStore();
    const k1 = store.keyFor("app-1:approve");
    expect(store.keyFor("app-1:approve")).toBe(k1);
    expect(store.keyFor("app-1:reject")).not.toBe(k1);
  });

  test("success and non-retryable failures end the action; retryable failures keep its key", () => {
    const store = createOperationKeyStore();
    const k1 = store.keyFor("a");
    store.settle("a", Object.assign(new Error("Network Error"), { request: {} }));
    expect(store.keyFor("a")).toBe(k1); // network failure: retry the same action
    store.settle("a", httpError(503));
    expect(store.keyFor("a")).toBe(k1);
    store.settle("a", httpError(409, "DECISION_IN_PROGRESS"));
    expect(store.keyFor("a")).toBe(k1);
    store.settle("a", httpError(409, "REVIEW_VERSION_CONFLICT"));
    const k2 = store.keyFor("a"); // after a reload the next click is a new action
    expect(k2).not.toBe(k1);
    store.settle("a");
    expect(store.keyFor("a")).not.toBe(k2);
  });
});

describe("review version", () => {
  test("reads review payloads, application payloads and grid rows", () => {
    expect(reviewVersionOf({ reviewVersion: 3 })).toBe(3);
    expect(reviewVersionOf({ duplicateReview: { reviewVersion: 2 } })).toBe(2);
    expect(reviewVersionOf({ personalDetails: { duplicateReview: { reviewVersion: 0 } } })).toBe(0);
    expect(reviewVersionOf({ duplicateReviewVersion: 7 })).toBe(7);
  });
  test("unknown or malformed -> undefined (never guessed)", () => {
    expect(reviewVersionOf(null)).toBeUndefined();
    expect(reviewVersionOf({})).toBeUndefined();
    expect(reviewVersionOf({ reviewVersion: "3" })).toBeUndefined();
    expect(reviewVersionOf({ reviewVersion: -1 })).toBeUndefined();
  });
  test("withDecisionPreconditions adds only known values", () => {
    expect(withDecisionPreconditions({ action: "LINK" }, { reviewVersion: 4, idempotencyKey: "k" })).toEqual({
      action: "LINK",
      expectedReviewVersion: 4,
      idempotencyKey: "k",
    });
    expect(withDecisionPreconditions({ action: "LINK" }, {})).toEqual({ action: "LINK" });
    expect(withDecisionPreconditions({ action: "LINK" }, { reviewVersion: 0 })).toEqual({
      action: "LINK",
      expectedReviewVersion: 0,
    });
  });
});

describe("bulk items", () => {
  test("one item per selected row whose version the grid showed", () => {
    const rows = [
      { applicationId: "a1", duplicateReviewVersion: 2 },
      { applicationId: "a2" }, // older grid payload: no version -> omitted
      { applicationId: "a3", duplicateReviewVersion: 0 },
      { applicationId: "a4", duplicateReviewVersion: 9 }, // not selected
    ];
    expect(buildBulkApprovalItems(rows, ["a1", "a2", "a3"])).toEqual([
      { applicationId: "a1", expectedReviewVersion: 2 },
      { applicationId: "a3", expectedReviewVersion: 0 },
    ]);
    expect(buildBulkApprovalItems(null, ["a1"])).toEqual([]);
  });
});

describe("error handling", () => {
  test("reads the profile-service error envelope", () => {
    expect(decisionErrorCode(httpError(409, "REVIEW_VERSION_CONFLICT"))).toBe("REVIEW_VERSION_CONFLICT");
    expect(decisionErrorCode({ response: { data: { code: "X" } } })).toBe("X");
    expect(decisionErrorCode(new Error("boom"))).toBeNull();
  });

  test.each([
    ["REVIEW_VERSION_CONFLICT", true],
    ["REVIEW_CHANGED", true],
    ["REVIEW_CHANGED_AFTER_CAPTURE", true],
    ["REVIEW_VERSION_REQUIRED", true],
    ["IDEMPOTENCY_KEY_REQUIRED", true],
    ["MATCH_NOT_CURRENT", true],
    ["MATCHED_PROFILE_NOT_FOUND", true],
    ["DECISION_IN_PROGRESS", false],
    ["PROFILE_EMAIL_EXISTS", false],
    ["PAYMENT_BINDING_MISSING", false],
    ["PAYMENT_APPLICATION_MISMATCH", false],
  ])("%s: specific message, reloadReview=%s", (code, reload) => {
    const info = describeDecisionError(httpError(code.endsWith("REQUIRED") && code !== "DUPLICATE_REVIEW_REQUIRED" ? 428 : 409, code));
    expect(info.code).toBe(code);
    expect(info.reloadReview).toBe(reload);
    expect(info.text).not.toMatch(/server says/); // a curated message, not the raw server text
  });

  test("unknown codes fall back to the server message", () => {
    const info = describeDecisionError(httpError(400, "SOMETHING_NEW"), "Failed");
    expect(info).toMatchObject({ code: "SOMETHING_NEW", title: "Failed", text: "server says SOMETHING_NEW", reloadReview: false });
  });

  test("retryable classification", () => {
    expect(isRetryableDecisionError(new Error("timeout"))).toBe(true);
    expect(isRetryableDecisionError(httpError(500))).toBe(true);
    expect(isRetryableDecisionError(httpError(409, "IDEMPOTENCY_IN_FLIGHT"))).toBe(true);
    expect(isRetryableDecisionError(httpError(409, "PAYMENT_APPLICATION_MISMATCH"))).toBe(false);
    expect(isRetryableDecisionError(httpError(428, "REVIEW_VERSION_REQUIRED"))).toBe(false);
  });

  test("bulk rows use the curated title when a code is present", () => {
    expect(describeBulkRow({ applicationId: "a1", code: "REVIEW_VERSION_CONFLICT", error: "raw" })).toBe(
      "a1: Duplicate review changed",
    );
    expect(describeBulkRow({ applicationId: "a2", error: "raw" })).toBe("a2: raw");
  });
});
