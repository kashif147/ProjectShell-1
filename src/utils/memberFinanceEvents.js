import { dispatchProfileInvalidate } from "./profileRealtimeEvents";

/** @deprecated Prefer backend Socket.IO + dispatchProfileInvalidate; kept for local finance mutations. */
export function notifyMemberFinanceUpdated(memberId) {
  dispatchProfileInvalidate({
    scopes: ["finance"],
    memberId,
  });
}
