/** Reload and associate action for the Refunds summary page. */
const RELOAD_EVENT = "refunds-reload";

let associateHandler = null;

export function registerRefundsListActions({ onAssociate }) {
  associateHandler = onAssociate;
}

export function clearRefundsListActions() {
  associateHandler = null;
}

export function callRefundsAssociate(row) {
  associateHandler?.(row);
}

export function bumpRefundsReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeRefundsReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
