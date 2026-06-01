const STORAGE_PREFIX = "exec-chart-expand:";
const MAX_AGE_MS = 30 * 60 * 1000;
const MAX_STORED_CHARTS = 24;

export const CHART_EXPAND_PATH = "/MembershipDashboard/chart";

function storageKey(key) {
  return `${STORAGE_PREFIX}${key}`;
}

/** sessionStorage is per-tab; localStorage is shared across tabs on the same origin. */
function getStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function purgeExpiredChartExpandRecords(storage) {
  const now = Date.now();
  const keys = [];

  for (let i = 0; i < storage.length; i += 1) {
    const name = storage.key(i);
    if (name?.startsWith(STORAGE_PREFIX)) keys.push(name);
  }

  keys
    .sort((a, b) => {
      const ta = Number(JSON.parse(storage.getItem(a) || "{}").createdAt) || 0;
      const tb = Number(JSON.parse(storage.getItem(b) || "{}").createdAt) || 0;
      return ta - tb;
    })
    .forEach((name, index) => {
      try {
        const record = JSON.parse(storage.getItem(name) || "null");
        const expired =
          !record?.createdAt || now - record.createdAt > MAX_AGE_MS;
        const overLimit = index < keys.length - MAX_STORED_CHARTS;
        if (expired || overLimit) storage.removeItem(name);
      } catch {
        storage.removeItem(name);
      }
    });
}

function serializeRecord(record) {
  return JSON.stringify(record, (_key, value) => {
    if (value === undefined) return null;
    if (typeof value === "bigint") return Number(value);
    return value;
  });
}

export function openChartInNewTab(title, payload) {
  if (!payload?.type) return false;

  const storage = getStorage();
  if (!storage) return false;

  const key = `${payload.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record = { title, payload, createdAt: Date.now() };

  try {
    purgeExpiredChartExpandRecords(storage);
    storage.setItem(storageKey(key), serializeRecord(record));
  } catch (err) {
    console.error("Failed to store chart expand payload", err);
    return false;
  }

  const url = `${window.location.origin}${CHART_EXPAND_PATH}?key=${encodeURIComponent(key)}`;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  return Boolean(opened);
}

export function loadChartExpandPayload(key) {
  if (!key) return null;

  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(storageKey(key));
    if (!raw) return null;

    const record = JSON.parse(raw);
    if (!record?.payload) return null;

    if (record.createdAt && Date.now() - record.createdAt > MAX_AGE_MS) {
      storage.removeItem(storageKey(key));
      return null;
    }

    return record;
  } catch {
    return null;
  }
}
