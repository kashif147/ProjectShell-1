/** Row-action handlers for the Events summary grid, registered by EventsSummary. */
let handlers = null;

export function registerEventsHandlers(next) {
  handlers = next;
}

export function clearEventsHandlers() {
  handlers = null;
}

export function callEventsEdit(record) {
  handlers?.onEdit?.(record);
}

export function callEventsClone(record) {
  handlers?.onClone?.(record);
}

export function callEventsDelete(record) {
  handlers?.onDelete?.(record);
}

export function isEventsDeletable(record) {
  return handlers?.isDeletable?.(record) ?? false;
}

/** Save View / Toolbar reload signal for the Events summary grid. */
const RELOAD_EVENT = "events-reload";

export function bumpEventsReload() {
  window.dispatchEvent(new CustomEvent(RELOAD_EVENT));
}

export function subscribeEventsReload(handler) {
  window.addEventListener(RELOAD_EVENT, handler);
  return () => window.removeEventListener(RELOAD_EVENT, handler);
}
