// Stub for react-to-pdf.
export const usePDF = () => ({ toPDF: () => {}, targetRef: { current: null } });
export const Margin = { NONE: 0, SMALL: 5, MEDIUM: 10, LARGE: 15 };
export const Resolution = { LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 7, EXTREME: 12 };
const generatePDF = () => Promise.resolve();
export default generatePDF;
