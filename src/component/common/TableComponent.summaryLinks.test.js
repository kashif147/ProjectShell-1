// P8: the two Summary-grid links that open the member Details page use the SAME access check as that
// page (RoutePermissions.Details, enforced by ProtectedRoute), not the legacy crm:member_read /
// crm:access codes that the P8 MO / REO target sets no longer carry. Source-level: TableComponent is
// a large grid component without a render harness.
import fs from "fs";
import path from "path";
import RoutePermissions from "../../constants/RoutePermissions";

const src = fs.readFileSync(path.join(__dirname, "TableComponent.js"), "utf8");

test("the member Details page requires profile:read", () => {
  expect(RoutePermissions.Details).toBe("profile:read");
});

test("Summary name link and membership-category link check RoutePermissions.Details", () => {
  expect(src).toMatch(/const hasMemberReadPermission = hasPermission\(RoutePermissions\.Details\);/);
  expect(src).toMatch(/const hasProfileRead = hasPermission\(RoutePermissions\.Details\);/);
});

test("no grid link is gated on the legacy crm:member_read / crm:access codes", () => {
  expect(src).not.toMatch(/hasPermission\(\s*['"]crm:(member_read|access)['"]\s*\)/);
});
