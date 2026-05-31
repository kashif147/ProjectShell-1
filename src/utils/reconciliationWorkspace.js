/** Shared handlers between Reconciliation page and table/header actions. */
const RELOAD_EVENT = "reconciliation-reload";

const reconciliationWorkspace = {
  handlers: {},
  supportedClearing: [],
  registerHandlers(handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  },
  clearHandlers() {
    this.handlers = {};
    this.supportedClearing = [];
  },
  getHandlers() {
    return this.handlers;
  },
  setSupportedClearing(codes) {
    this.supportedClearing = Array.isArray(codes) ? codes : [];
  },
  getSupportedClearing() {
    return this.supportedClearing;
  },
};

export function bumpReconciliationReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeReconciliationReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}

export default reconciliationWorkspace;
