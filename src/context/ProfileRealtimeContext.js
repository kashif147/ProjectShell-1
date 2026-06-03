import React, { useEffect } from "react";
import { subscribeRealtimeSocketEvent } from "../services/realtimeSocket";
import { dispatchProfileInvalidate } from "../utils/profileRealtimeEvents";

const FINANCE_EVENTS = ["memberFinanceUpdated", "member:finance:updated"];
const SUBSCRIPTION_EVENTS = [
  "subscriptionUpdated",
  "subscription:updated",
];
const PROFILE_EVENTS = ["profileUpdated", "profile:updated"];

function idsFromPayload(payload = {}) {
  return {
    profileId:
      payload.profileId ??
      payload.profile_id ??
      payload.profile?._id ??
      payload.profile?.id ??
      "",
    memberId:
      payload.memberId ??
      payload.member_id ??
      payload.membershipNumber ??
      payload.membershipNo ??
      payload.regNo ??
      "",
  };
}

/**
 * Subscribes to Socket.IO profile/finance events (notification service).
 * Backend should emit these when portal payments, subscription, or profile data changes.
 */
export function ProfileRealtimeProvider({ children }) {
  useEffect(() => {
    const unsubs = [];

    FINANCE_EVENTS.forEach((eventName) => {
      unsubs.push(
        subscribeRealtimeSocketEvent(eventName, (payload) => {
          dispatchProfileInvalidate({
            scopes: ["finance"],
            ...idsFromPayload(payload),
          });
        }),
      );
    });

    SUBSCRIPTION_EVENTS.forEach((eventName) => {
      unsubs.push(
        subscribeRealtimeSocketEvent(eventName, (payload) => {
          dispatchProfileInvalidate({
            scopes: ["subscription"],
            ...idsFromPayload(payload),
          });
        }),
      );
    });

    PROFILE_EVENTS.forEach((eventName) => {
      unsubs.push(
        subscribeRealtimeSocketEvent(eventName, (payload) => {
          dispatchProfileInvalidate({
            scopes: ["profile"],
            ...idsFromPayload(payload),
          });
        }),
      );
    });

    // Optional: structured notification payloads (e.g. portal payment posted).
    unsubs.push(
      subscribeRealtimeSocketEvent("notification", (notif) => {
        const type = String(
          notif?.type || notif?.category || notif?.eventType || "",
        ).toLowerCase();
        if (!type) return;

        const ids = idsFromPayload(notif);
        if (/payment|finance|ledger|receipt|portal/.test(type)) {
          dispatchProfileInvalidate({ scopes: ["finance"], ...ids });
        } else if (/subscription|membership/.test(type)) {
          dispatchProfileInvalidate({ scopes: ["subscription"], ...ids });
        } else if (/profile/.test(type)) {
          dispatchProfileInvalidate({ scopes: ["profile"], ...ids });
        }
      }),
    );

    return () => {
      unsubs.forEach((off) => off());
    };
  }, []);

  return children;
}
