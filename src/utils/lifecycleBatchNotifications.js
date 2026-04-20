import { notification } from "antd";
import axios from "axios";
import { getAccountServiceBaseUrl } from "../config/serviceUrls";

const localId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const LIFECYCLE_TYPES = {
  REMINDER_GENERATING: "BATCH_REMINDER_GENERATING",
  REMINDER_READY: "BATCH_REMINDER_READY",
  CANCELLATION_GENERATING: "BATCH_CANCELLATION_GENERATING",
  CANCELLATION_READY: "BATCH_CANCELLATION_READY",
};

export function pushLifecycleNotification(
  { setNotifications, setBadge },
  {
    type,
    title,
    body,
    referenceNumber,
    description,
    batchDetailId,
    totalTransactions = 0,
  },
) {
  const notif = {
    _id: localId(),
    title,
    body,
    createdAt: new Date().toISOString(),
    isRead: false,
    metadata: {
      type,
      referenceNumber: referenceNumber ?? "-",
      description: description ?? "-",
      batchDetailId,
      totalTransactions,
    },
  };
  setNotifications((prev) => [notif, ...prev]);
  setBadge((prev) => (Number(prev) || 0) + 1);
  notification.info({
    message: title,
    description: body,
    duration: 4.5,
  });
}

export function notifyBatchGenerating(ctx, variant, payload) {
  const isReminder = variant === "reminder";
  pushLifecycleNotification(ctx, {
    type: isReminder
      ? LIFECYCLE_TYPES.REMINDER_GENERATING
      : LIFECYCLE_TYPES.CANCELLATION_GENERATING,
    title: isReminder
      ? "Reminder batch is being generated"
      : "Cancellation batch is being generated",
    body: `Batch "${payload.description}" is being populated with members. You will be notified when it is ready for processing.`,
    referenceNumber: payload.referenceNumber,
    description: payload.description,
    batchDetailId: payload.batchDetailId,
    totalTransactions: 0,
  });
}

export function notifyBatchReady(ctx, variant, payload) {
  const isReminder = variant === "reminder";
  pushLifecycleNotification(ctx, {
    type: isReminder
      ? LIFECYCLE_TYPES.REMINDER_READY
      : LIFECYCLE_TYPES.CANCELLATION_READY,
    title: isReminder
      ? "Reminder batch is ready"
      : "Cancellation batch is ready",
    body: `Batch "${payload.description}" has member data loaded and is ready for processing.`,
    referenceNumber: payload.referenceNumber,
    description: payload.description,
    batchDetailId: payload.batchDetailId,
    totalTransactions: Number(payload.totalTransactions) || 0,
  });
}

function extractBatchDetail(res) {
  return res?.data?.data ?? res?.data ?? null;
}

function isBatchDetailPopulated(data) {
  if (!data || typeof data !== "object") return false;
  const payments = data.batchPayments;
  if (Array.isArray(payments) && payments.length > 0) return true;
  const n = Number(data.totalRecords ?? data.totalTransactions);
  if (Number.isFinite(n) && n > 0) return true;
  const status = String(data.batchStatus || "")
    .trim()
    .toLowerCase();
  if (status && status !== "pending" && status !== "draft") return true;
  return false;
}

/**
 * Polls account-service until members appear on the batch (or timeout), then shows "ready" notification.
 */
export function watchBatchUntilPopulated({
  batchDetailId,
  variant,
  description,
  referenceNumber,
  notificationCtx,
  intervalMs = 2500,
  maxAttempts = 24,
}) {
  if (!batchDetailId || !notificationCtx) return;

  let attempts = 0;
  const token = localStorage.getItem("token");
  const base = getAccountServiceBaseUrl();
  if (!token || !base) return;

  const tick = async () => {
    attempts += 1;
    try {
      const res = await axios.get(`${base}/batch-details/${batchDetailId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = extractBatchDetail(res);
      if (isBatchDetailPopulated(data)) {
        const total =
          Array.isArray(data?.batchPayments) && data.batchPayments.length > 0
            ? data.batchPayments.length
            : Number(data?.totalRecords ?? data?.totalTransactions ?? 0);
        notifyBatchReady(notificationCtx, variant, {
          batchDetailId,
          description,
          referenceNumber,
          totalTransactions: total,
        });
        return;
      }
    } catch {
      // ignore transient errors until max attempts
    }
    if (attempts < maxAttempts) {
      setTimeout(tick, intervalMs);
    } else {
      notifyBatchReady(notificationCtx, variant, {
        batchDetailId,
        description,
        referenceNumber,
        totalTransactions: 0,
      });
    }
  };

  setTimeout(tick, intervalMs);
}
