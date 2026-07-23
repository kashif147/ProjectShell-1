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

/** Save View / Toolbar reload signal for the Attendees grid. */
const ATTENDEES_RELOAD_EVENT = "attendees-reload";

export function bumpAttendeesReload() {
  window.dispatchEvent(new CustomEvent(ATTENDEES_RELOAD_EVENT));
}

export function subscribeAttendeesReload(handler) {
  window.addEventListener(ATTENDEES_RELOAD_EVENT, handler);
  return () => window.removeEventListener(ATTENDEES_RELOAD_EVENT, handler);
}

/** Row-action handlers for the Attendees grid (registered by AttendeesSummary),
 * used by the static "_actions" column render in TableColumnsContext to open
 * the Registration Details drawer - the column has no React state of its own. */
let attendeesRowHandlers = null;

export function registerAttendeesRowActions(next) {
  attendeesRowHandlers = next;
}

export function clearAttendeesRowActions() {
  attendeesRowHandlers = null;
}

export function callAttendeesOpenRegistration(record) {
  attendeesRowHandlers?.onOpenRegistration?.(record);
}
