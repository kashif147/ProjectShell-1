import RoutePermissions from "./RoutePermissions";
import {
  correspondenceItems,
  subscriptionItems,
  filterMenuItemsByAuth,
} from "./SideNavWithAuth";

// PDP rollout P2 / Q6: the catalogue code NOTIFICATION_READ is resource "Notification", action
// "read", so user-service issues it in tokens as `${resource}:${action}`.toLowerCase() =
// "notification:read". The nav previously required "notifications:read", which no catalogue
// code issues, so the notification pages were reachable only through "*".

const keys = (items) => items.map((i) => i.key);

beforeEach(() => jest.spyOn(console, "log").mockImplementation(() => {}));
afterEach(() => console.log.mockRestore());

describe("notification nav permission strings", () => {
  it("the four notification route entries require the issued notification:read", () => {
    expect(RoutePermissions.RemindersSummary).toBe("notification:read");
    expect(RoutePermissions.InAppNotifications).toBe("notification:read");
    expect(RoutePermissions.UserNotifications).toBe("notification:read");
    expect(RoutePermissions["/UserNotifications"]).toBe("notification:read");
  });

  it("notification:read shows InAppNotifications and Reminders", () => {
    expect(keys(filterMenuItemsByAuth(correspondenceItems, ["notification:read"]))).toContain("InAppNotifications");
    expect(keys(filterMenuItemsByAuth(subscriptionItems, ["notification:read"]))).toContain("Reminders");
  });

  it("the old uncatalogued notifications:read shows neither (regression guard)", () => {
    expect(keys(filterMenuItemsByAuth(correspondenceItems, ["notifications:read"]))).not.toContain("InAppNotifications");
    expect(keys(filterMenuItemsByAuth(subscriptionItems, ["notifications:read"]))).not.toContain("Reminders");
  });

  it('"*" shows both', () => {
    expect(keys(filterMenuItemsByAuth(correspondenceItems, ["*"]))).toContain("InAppNotifications");
    expect(keys(filterMenuItemsByAuth(subscriptionItems, ["*"]))).toContain("Reminders");
  });
});
