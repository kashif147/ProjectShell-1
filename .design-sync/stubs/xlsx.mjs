// Stub for xlsx / xlsx-js-style: spreadsheet export is inert inside designs.
const noop = () => ({});
export const utils = new Proxy({}, { get: () => noop });
export const writeFile = () => {};
export const writeFileXLSX = () => {};
export const write = () => new Uint8Array();
export const read = () => ({ SheetNames: [], Sheets: {} });
export const SSF = new Proxy({}, { get: () => noop });
export default { utils, writeFile, writeFileXLSX, write, read, SSF };
