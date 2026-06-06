/** Reload signal and row action handlers for online payments grid. */
const RELOAD_EVENT = "online-payments-reload";

let handlers = null;

export function registerOnlinePaymentHandlers(next) {
  handlers = next;
}

export function clearOnlinePaymentHandlers() {
  handlers = null;
}

export function callOnlinePaymentOpenFinance(record) {
  handlers?.onOpenFinance?.(record);
}

export function callOnlinePaymentRefund(record) {
  handlers?.onRefund?.(record);
}

export function isOnlinePaymentRefundableUnapproved(record) {
  return handlers?.isRefundableUnapprovedRow?.(record) ?? false;
}

export function bumpOnlinePaymentsReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeOnlinePaymentsReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
