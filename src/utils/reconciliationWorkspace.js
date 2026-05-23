/** Shared handlers between Reconciliation page and table/header actions. */
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

export default reconciliationWorkspace;
