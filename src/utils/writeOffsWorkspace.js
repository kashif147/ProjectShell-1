/** Reload and reverse action for the Write-offs summary page. */
const RELOAD_EVENT = "write-offs-reload";

let reverseHandler = null;

export function registerWriteOffListActions({ onReverse }) {
  reverseHandler = onReverse;
}

export function clearWriteOffListActions() {
  reverseHandler = null;
}

export function callWriteOffReverse(row) {
  reverseHandler?.(row);
}

export function bumpWriteOffsReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeWriteOffsReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
