/** Reload hook for the General Ledger page. */
const RELOAD_EVENT = "general-ledger-reload";

export function bumpGeneralLedgerReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeGeneralLedgerReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
