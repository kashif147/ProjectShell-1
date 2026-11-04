import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RoutePermissions from "./RoutePermissions";
import {
  profileItems,
  subscriptionItems,
  reportItems,
  filterMenuItemsByAuth,
} from "./SideNavWithAuth";
import { AppLauncher } from "../component/common/Header";
import ProtectedRoute from "../Navigation/ProtectedRoute";

// PDP rollout P2: CRM nav / launcher / route strings must be strings a token can actually carry.
// user-service issues a role's catalogue permission as `${resource}:${action}`.toLowerCase()
// (handlers/role.handler.js getUserPermissions) - NOT the code with "_" -> ":". The rows below are
// the DEV catalogue resource/action pairs (user-service tests/fixtures/p5-dev-catalogue-shape.json)
// plus the P1 reporting family codes (PDP proposal section 2a).
const CATALOGUE = {
  MENU_MEMBERSHIP_ACCESS: ["menu", "membership_access"],
  MENU_FINANCE_ACCESS: ["menu", "finance_access"],
  MENU_CORRESPONDENCE_ACCESS: ["menu", "correspondence_access"],
  MENU_EVENTS_ACCESS: ["menu", "events_access"],
  MENU_CONFIGURATION_ACCESS: ["menu", "configuration_access"],
  MENU_REPORTS_ACCESS: ["menu", "reports_access"],
  CRM_MEMBER_READ: ["crm", "member_read"],
  CORN_MARKET_NEW_GRADUATE_READ: ["Profile_new_graduate", "read"],
  CORN_MARKET_REWARDS_READ: ["Profile.corn_market_rewards", "read"],
  RECRUIT_FRIEND_READ: ["Profile.recruit_friend", "read"],
  NOTIFICATION_READ: ["Notification", "read"],
  "REPORTING.STATISTICS_READ": ["reporting.statistics", "read"],
  "REPORTING.LISTINGS_READ": ["reporting.listings", "read"],
  "REPORTING.FINANCE_READ": ["reporting.finance", "read"],
};
const issued = (code) => `${CATALOGUE[code][0]}:${CATALOGUE[code][1]}`.toLowerCase();
const STATS = issued("REPORTING.STATISTICS_READ");
const LISTINGS = issued("REPORTING.LISTINGS_READ");
const FINANCE = issued("REPORTING.FINANCE_READ");

let mockPermissions = [];
const mockHas = (p) => mockPermissions.includes(p) || mockPermissions.includes("*");
jest.mock("../context/AuthorizationContext", () => ({
  useAuthorization: () => ({
    hasPermission: mockHas,
    hasAnyPermission: (ps) => ps.some(mockHas),
    hasAllPermissions: (ps) => ps.every(mockHas),
    hasRole: () => false,
    hasAnyRole: () => false,
    hasAllRoles: () => false,
    isAuthenticated: true,
    isInitialized: true,
    loading: false,
  }),
}));
jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: (select) => select({ menuLbl: {} }),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/Reports" }),
  Navigate: () => null,
  Outlet: () => null,
}));
jest.mock("../component/common/IdleModal", () => () => null);
jest.mock("../component/common/NotificationPopover", () => () => null);
jest.mock("../component/common/UserProfilePopover", () => () => null);
jest.mock("../component/profile/MemberSearch", () => () => null);
jest.mock("../context/NotificationContext", () => ({ useNotifications: () => ({}) }));
jest.mock("../context/TenantBrandingContext", () => ({ useTenantBranding: () => ({}) }));
jest.mock("../utils/microsoftLogout", () => ({ redirectToMicrosoftLogout: jest.fn() }));
jest.mock("../utils/tenantStorage", () => ({ clearTenantStorage: jest.fn() }));
jest.mock("axios", () => ({ post: jest.fn(), get: jest.fn() }));

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  localStorage.setItem("token", "t");
});
afterEach(() => {
  console.log.mockRestore();
  localStorage.clear();
});

const keys = (items, perms) => filterMenuItemsByAuth(items, perms).map((i) => i.key);

describe("issued forms used by the nav", () => {
  it("derives the expected issued strings from the catalogue rows", () => {
    expect(issued("MENU_MEMBERSHIP_ACCESS")).toBe("menu:membership_access");
    expect(issued("CRM_MEMBER_READ")).toBe("crm:member_read");
    expect(issued("CORN_MARKET_NEW_GRADUATE_READ")).toBe("profile_new_graduate:read");
    expect(issued("CORN_MARKET_REWARDS_READ")).toBe("profile.corn_market_rewards:read");
    expect(issued("RECRUIT_FRIEND_READ")).toBe("profile.recruit_friend:read");
    expect(issued("NOTIFICATION_READ")).toBe("notification:read");
  });
});

describe("AppLauncher module tiles use the issued menu:<x>_access strings", () => {
  const TILES = [
    ["Membership", "MENU_MEMBERSHIP_ACCESS"],
    ["Finance", "MENU_FINANCE_ACCESS"],
    ["Correspondence", "MENU_CORRESPONDENCE_ACCESS"],
    ["Events", "MENU_EVENTS_ACCESS"],
    ["Configuration", "MENU_CONFIGURATION_ACCESS"],
    ["Reports", "MENU_REPORTS_ACCESS"],
  ];
  function openLauncher(permissions) {
    mockPermissions = permissions;
    const { container } = render(<AppLauncher />);
    fireEvent.click(container.querySelector("svg").parentElement);
  }

  it.each(TILES)("%s is shown for the issued string of %s", (tile, code) => {
    openLauncher([issued(code)]);
    expect(screen.getByText(tile)).toBeInTheDocument();
  });

  it.each(TILES)("%s is hidden for the old uncatalogued menu:<x>:access string", (tile, code) => {
    const old = issued(code).replace(/_access$/, ":access");
    openLauncher([old]);
    expect(screen.queryByText(tile)).not.toBeInTheDocument();
  });

  it('"*" shows every module tile', () => {
    openLauncher(["*"]);
    for (const [tile] of TILES) expect(screen.getByText(tile)).toBeInTheDocument();
  });
});

describe("crm:member_read (CRM_MEMBER_READ issued form)", () => {
  it("is the Members route gate", () => {
    expect(RoutePermissions.Members).toBe("crm:member_read");
  });
  it("shows the Membership nav items; the old crm:member:read does not", () => {
    expect(keys(subscriptionItems, ["crm:member_read"])).toEqual(expect.arrayContaining(["Membership", "Payment Forms"]));
    expect(keys(profileItems, ["crm:member_read"])).toEqual(expect.arrayContaining(["Membership", "Leavers", "Joiners"]));
    expect(keys(subscriptionItems, ["crm:member:read"])).not.toContain("Membership");
    expect(keys(profileItems, ["crm:member:read"])).not.toContain("Membership");
  });
});

describe("corn-market / recruit nav gates use the issued strings", () => {
  it.each([
    ["CornMarket New Graduate", "CORN_MARKET_NEW_GRADUATE_READ", "corn:market:new:graduate:read"],
    ["CornMarket Rewards", "CORN_MARKET_REWARDS_READ", "corn:market:rewards:read"],
    ["Recruit a Friend", "RECRUIT_FRIEND_READ", "recruit:friend:read"],
  ])("%s", (key, code, old) => {
    expect(keys(subscriptionItems, [issued(code)])).toContain(key);
    expect(keys(subscriptionItems, [old])).not.toContain(key);
    expect(keys(subscriptionItems, ["*"])).toContain(key);
  });
});

describe("report routes use the per-family reporting codes", () => {
  const FAMILY = {
    [STATS]: ["MembershipDashboard", "ComparisonReport", "LiveStatsReport", "StatisticsReport", "WorkplaceBreakdownReport"],
    [LISTINGS]: ["CancelledMembersReport", "JoinersReport", "LeaversReport", "NewMembersReport", "ResignedMembersReport", "MembershipListingReport", "SuspendedMembersReport"],
    [FINANCE]: ["AccountsReports", "CreditorsListReport", "DebtorsListReport"],
  };
  it.each(Object.entries(FAMILY))("%s gates its pages", (family, pages) => {
    for (const p of pages) expect(RoutePermissions[p]).toBe(family);
  });
  it("the membership-reports hub accepts either membership family", () => {
    expect(RoutePermissions.Reports).toEqual([STATS, LISTINGS]);
  });
  it("no route still uses the uncatalogued reporting:read or crm:member:read", () => {
    const values = Object.values(RoutePermissions).flat();
    expect(values).not.toContain("reporting:read");
    expect(values).not.toContain("crm:member:read");
    expect(values).not.toContain("notifications:read");
  });
});

describe("report side-nav items", () => {
  it.each([
    [[STATS], ["Membership Reports", "Comparison Report"], ["Accounts Reports"]],
    [[LISTINGS], ["Membership Reports"], ["Comparison Report", "Accounts Reports"]],
    [[FINANCE], ["Accounts Reports"], ["Membership Reports", "Comparison Report"]],
    [[], [], ["Membership Reports", "Comparison Report", "Accounts Reports"]],
    [["reporting:read"], [], ["Membership Reports", "Comparison Report", "Accounts Reports"]],
    [["*"], ["Membership Reports", "Comparison Report", "Accounts Reports"], []],
  ])("holding %j", (perms, shown, hidden) => {
    const k = keys(reportItems, perms);
    for (const s of shown) expect(k).toContain(s);
    for (const h of hidden) expect(k).not.toContain(h);
  });
});

describe("Reports hub route (ProtectedRoute requiredPermissions = any family)", () => {
  const renderHub = (perms) => {
    mockPermissions = perms;
    render(
      <ProtectedRoute requiredPermissions={RoutePermissions.Reports}>
        <div>REPORTS HUB</div>
      </ProtectedRoute>
    );
  };
  it.each([[[STATS]], [[LISTINGS]], [["*"]]])("is reachable holding %j", (perms) => {
    renderHub(perms);
    expect(screen.getByText("REPORTS HUB")).toBeInTheDocument();
  });
  it.each([[[]], [[FINANCE]], [["reporting:read"]]])("is denied holding %j", (perms) => {
    renderHub(perms);
    expect(screen.queryByText("REPORTS HUB")).not.toBeInTheDocument();
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });
});
