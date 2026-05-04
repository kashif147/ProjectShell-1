/** Soft fills + muted text — Correspondence / profile comms, reminder/cancellation batch status */

export const SOFT_TAG_BASE = {
  marginInlineEnd: 0,
  fontWeight: 400,
  borderRadius: 6,
  padding: "1px 7px",
  lineHeight: "20px",
  border: "1px solid transparent",
};

export const SOFT_DELIVERY_STYLES = {
  delivered: {
    ...SOFT_TAG_BASE,
    background: "#ecfdf5",
    color: "#047857",
    borderColor: "#a7f3d0",
  },
  sent: {
    ...SOFT_TAG_BASE,
    background: "#eff6ff",
    color: "#1d4ed8",
    borderColor: "#bfdbfe",
  },
  pending: {
    ...SOFT_TAG_BASE,
    background: "#fffbeb",
    color: "#b45309",
    borderColor: "#fde68a",
  },
  failed: {
    ...SOFT_TAG_BASE,
    background: "#fff1f2",
    color: "#be123c",
    borderColor: "#fecdd3",
  },
  default: {
    ...SOFT_TAG_BASE,
    background: "#f4f4f5",
    color: "#57534e",
    borderColor: "#e4e4e7",
  },
};

export const SOFT_READ_TAG = {
  read: {
    ...SOFT_TAG_BASE,
    background: "#f0fdf4",
    color: "#15803d",
    borderColor: "#bbf7d0",
  },
  unread: {
    ...SOFT_TAG_BASE,
    background: "#f8fafc",
    color: "#64748b",
    borderColor: "#e2e8f0",
  },
};

/** Batch Completed / Pending — same chrome as Correspondence delivery delivered / pending */
export const SOFT_BATCH_STATUS_TAGS = {
  completed: SOFT_DELIVERY_STYLES.delivered,
  pending: SOFT_DELIVERY_STYLES.pending,
};
