import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppLauncher } from "./Header";

// The "Issues Management" launcher tile must be gated on permission strings the token can
// actually carry. No catalogue code issues `menu:issues_management:access`, so the tile uses
// the BASE issues:read permission that every issue-service list/lookup route requires. A
// team-only read (e.g. ISSUES_COMPLAINTS_READ -> "issues-complaints:read") must NOT advertise
// the page, because the page's base calls would immediately fail with 403. ASU gets "*".

let mockPermissions = [];
jest.mock("../../context/AuthorizationContext", () => ({
  useAuthorization: () => ({
    hasPermission: (p) => mockPermissions.includes(p) || mockPermissions.includes("*"),
    hasAnyRole: () => false,
  }),
}));
jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: (select) => select({ menuLbl: {} }),
}));
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }));
jest.mock("./NotificationPopover", () => () => null);
jest.mock("./UserProfilePopover", () => () => null);
jest.mock("../profile/MemberSearch", () => () => null);
jest.mock("../../context/NotificationContext", () => ({ useNotifications: () => ({}) }));
jest.mock("../../context/TenantBrandingContext", () => ({ useTenantBranding: () => ({}) }));
jest.mock("../../utils/microsoftLogout", () => ({ redirectToMicrosoftLogout: jest.fn() }));
jest.mock("../../utils/tenantStorage", () => ({ clearTenantStorage: jest.fn() }));
jest.mock("axios", () => ({ post: jest.fn(), get: jest.fn() }));

function openLauncher(permissions) {
  mockPermissions = permissions;
  const { container } = render(<AppLauncher />);
  fireEvent.click(container.querySelector("svg").parentElement);
}

describe("AppLauncher Issues Management tile", () => {
  it.each([
    [["issues:read"]],
    [["issues:read", "issues-complaints:read"]],
    [["*"]],
  ])("is shown for a caller holding %j", (perm) => {
    openLauncher(perm);
    expect(screen.getByText("Issues Management")).toBeInTheDocument();
  });

  it.each([
    [[]],
    [["issues:write"]],
    [["issues-complaints:write", "issues-templates:read"]],
    [["menu:membership_access"]],
    // team-only reads: the backend's base issues:read check would deny the page's calls
    [["issues-complaints:read"]],
    [["issues-ftp:read"]],
    [["issues-ir:read"]],
    [["issues-dataprotection:read"]],
    [["issues-complaints:read", "issues-complaints:write", "issues-ftp:read"]],
  ])("is hidden for a caller holding %j", (perms) => {
    openLauncher(perms);
    expect(screen.queryByText("Issues Management")).not.toBeInTheDocument();
  });

  it("no longer depends on the uncatalogued menu:issues_management:access string", () => {
    openLauncher(["menu:issues_management:access"]);
    expect(screen.queryByText("Issues Management")).not.toBeInTheDocument();
  });
});
