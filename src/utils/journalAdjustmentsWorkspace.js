/** Reload signal and approve handler for journal adjustments list. */
const RELOAD_EVENT = "journal-adjustments-reload";

let approveHandler = null;

export function registerJournalAdjustmentApprove(handler) {
  approveHandler = handler;
}

export function clearJournalAdjustmentApprove() {
  approveHandler = null;
}

export function callJournalAdjustmentApprove(docNo) {
  approveHandler?.(docNo);
}

export function bumpJournalAdjustmentsReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeJournalAdjustmentsReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
