import {
  DEFAULT_ROLE_OPTIONS_ERROR,
  automaticConnectionError,
  defaultRoleLabel,
  isConnectionChanged,
  provisioningLabel,
} from "./authConnectionDisplay";

const loaded = (roles) => ({ status: "loaded", roles });
const REO = { _id: "r-reo", name: "Regional Officer", code: "REO" };

describe("provisioningLabel", () => {
  test("true displays as Automatic", () => {
    expect(provisioningLabel({ autoProvisionUsers: true })).toBe("Automatic");
  });
  test("explicit false displays as Pre-authorised", () => {
    expect(provisioningLabel({ autoProvisionUsers: false })).toBe("Pre-authorised");
  });
  test("unset displays as Pre-authorised (not set)", () => {
    expect(provisioningLabel({})).toBe("Pre-authorised (not set)");
    expect(provisioningLabel({ autoProvisionUsers: null })).toBe("Pre-authorised (not set)");
  });
});

describe("defaultRoleLabel", () => {
  test("configured role shows name and code", () => {
    expect(defaultRoleLabel({ defaultRoleId: "r-reo" }, loaded([REO]))).toBe(
      "Default role: Regional Officer (REO)",
    );
  });
  test("a saved role no longer returned as eligible shows Unavailable, never another role", () => {
    expect(defaultRoleLabel({ defaultRoleId: "r-gone" }, loaded([REO]))).toBe(
      "Default role: Unavailable",
    );
  });
  test("no configured role shows nothing", () => {
    expect(defaultRoleLabel({ defaultRoleId: null }, loaded([REO]))).toBeNull();
  });
  test("options that could not be loaded are not shown as unavailable", () => {
    expect(defaultRoleLabel({ defaultRoleId: "r-reo" }, { status: "error", roles: [] })).toBe(
      "Default role: could not be loaded",
    );
  });
});

describe("automaticConnectionError (Automatic cannot be saved without a valid role)", () => {
  const stored = [{ _id: "c1", connectionType: "Entra ID (Azure AD)", autoProvisionUsers: false }];

  test("Automatic without a role", () => {
    expect(automaticConnectionError({ _id: "c1", autoProvisionUsers: true }, loaded([REO]), stored)).toBe(
      "Default role is required for automatic provisioning",
    );
  });
  test("changed Automatic connection while options failed to load", () => {
    const c = { _id: "c1", connectionType: "Entra ID (Azure AD)", autoProvisionUsers: true, defaultRoleId: "r-reo" };
    expect(automaticConnectionError(c, { status: "error", roles: [] }, stored)).toBe(DEFAULT_ROLE_OPTIONS_ERROR);
    expect(automaticConnectionError(c, { status: "loading", roles: [] }, stored)).toBe(DEFAULT_ROLE_OPTIONS_ERROR);
  });
  test("changed Automatic connection with a role that is not eligible", () => {
    const c = { _id: "c1", connectionType: "Entra ID (Azure AD)", autoProvisionUsers: true, defaultRoleId: "r-other" };
    expect(automaticConnectionError(c, loaded([REO]), stored)).toBe("Select an eligible default role");
  });
  test("changed Automatic connection with an eligible role is allowed", () => {
    const c = { _id: "c1", connectionType: "Entra ID (Azure AD)", autoProvisionUsers: true, defaultRoleId: "r-reo" };
    expect(automaticConnectionError(c, loaded([REO]), stored)).toBeNull();
  });
  test("an unchanged stored Automatic connection is left to the server", () => {
    const c = { _id: "c9", connectionType: "Azure B2C", autoProvisionUsers: true, defaultRoleId: "r-nm" };
    expect(automaticConnectionError(c, { status: "error", roles: [] }, [{ ...c }])).toBeNull();
  });
  test("pre-authorised connections need no role", () => {
    expect(automaticConnectionError({ autoProvisionUsers: false }, undefined, stored)).toBeNull();
  });
});

describe("isConnectionChanged", () => {
  test("new connection (no _id) is changed", () => {
    expect(isConnectionChanged({ connectionType: "Azure B2C" }, [])).toBe(true);
  });
  test("same type/provisioning/role is unchanged", () => {
    const c = { _id: "c1", connectionType: "Azure B2C", autoProvisionUsers: false };
    expect(isConnectionChanged({ ...c }, [c])).toBe(false);
  });
});
