/** Reload and list actions for the Credit Notes summary page. */
const RELOAD_EVENT = "credit-notes-reload";

let approveHandler = null;
let cancelHandler = null;

export function registerCreditNoteListActions({ onApprove, onCancel }) {
  approveHandler = onApprove;
  cancelHandler = onCancel;
}

export function clearCreditNoteListActions() {
  approveHandler = null;
  cancelHandler = null;
}

export function callCreditNoteApprove(docNo) {
  approveHandler?.(docNo);
}

export function callCreditNoteCancel(docNo) {
  cancelHandler?.(docNo);
}

export function bumpCreditNotesReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeCreditNotesReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}

export function buildCreditNoteApiParams(filtersState = {}, { memberIdFromNav } = {}) {
  const params = { limit: 500 };

  const statusFilter = filtersState["CN Status"];
  if (
    statusFilter?.selectedValues?.length > 0 &&
    (statusFilter.operator || "==") === "=="
  ) {
    const status = statusFilter.selectedValues.find((v) => String(v).trim());
    if (status) params.status = status;
  }

  const memberFilter = filtersState.Member;
  if (
    memberFilter?.selectedValues?.length > 0 &&
    (memberFilter.operator || "==") === "=="
  ) {
    const memberId = memberFilter.selectedValues.find((v) => String(v).trim());
    if (memberId) params.memberId = memberId;
  }

  if (memberIdFromNav) {
    params.memberId = memberIdFromNav;
  }

  return params;
}
