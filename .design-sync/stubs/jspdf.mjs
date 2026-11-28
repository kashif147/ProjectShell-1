// Stub for jspdf: PDF export is inert inside designs. Every method is a chainable no-op.
export class jsPDF {
  constructor() {
    const self = new Proxy(this, {
      get: (t, k) => (k in t ? t[k] : k === 'internal' ? { pageSize: { getWidth: () => 595, getHeight: () => 842, width: 595, height: 842 }, getNumberOfPages: () => 1 } : () => self),
    });
    return self;
  }
}
export default jsPDF;
