import React from "react";
import { render, screen } from "@testing-library/react";
import AuthConnectionTags from "./AuthConnectionTags";
import { fetchDefaultRoleOptions } from "../../services/tenantAuthConnectionsApi";
import { clearDefaultRoleOptionsCache } from "../../hooks/useDefaultRoleOptions";

jest.mock("../../services/tenantAuthConnectionsApi", () => ({
  fetchDefaultRoleOptions: jest.fn(),
}));

const ENTRA = "Entra ID (Azure AD)";
const B2C = "Azure B2C";

beforeEach(() => {
  clearDefaultRoleOptionsCache();
  fetchDefaultRoleOptions.mockReset();
});

test("provisioning: true, explicit false and unset are displayed distinctly", () => {
  render(
    <AuthConnectionTags
      tenantId="t1"
      connections={[
        { _id: "a", connectionType: ENTRA, autoProvisionUsers: true },
        { _id: "b", connectionType: B2C, autoProvisionUsers: false },
        { _id: "c", connectionType: B2C },
      ]}
    />,
  );
  expect(screen.getByText("Entra · Automatic")).toBeInTheDocument();
  expect(screen.getByText("B2C · Pre-authorised")).toBeInTheDocument();
  expect(screen.getByText("B2C · Pre-authorised (not set)")).toBeInTheDocument();
  expect(fetchDefaultRoleOptions).not.toHaveBeenCalled(); // no role configured: nothing to resolve
});

test("configured default role is resolved from that organisation's options", async () => {
  fetchDefaultRoleOptions.mockResolvedValue([{ _id: "r-reo", name: "Regional Officer", code: "REO" }]);
  render(
    <AuthConnectionTags
      tenantId="org-being-listed"
      connections={[{ _id: "a", connectionType: ENTRA, autoProvisionUsers: true, defaultRoleId: "r-reo" }]}
    />,
  );
  expect(await screen.findByText("Default role: Regional Officer (REO)")).toBeInTheDocument();
  expect(fetchDefaultRoleOptions).toHaveBeenCalledWith("org-being-listed", ENTRA);
});

test("a saved role that is no longer eligible shows Unavailable", async () => {
  fetchDefaultRoleOptions.mockResolvedValue([{ _id: "r-other", name: "Other", code: "OTH" }]);
  render(
    <AuthConnectionTags
      tenantId="t2"
      connections={[{ _id: "a", connectionType: B2C, autoProvisionUsers: true, defaultRoleId: "r-gone" }]}
    />,
  );
  expect(await screen.findByText("Default role: Unavailable")).toBeInTheDocument();
  expect(screen.queryByText(/Other \(OTH\)/)).not.toBeInTheDocument();
});

test("options that cannot be loaded (e.g. 403) are not shown as an empty or unavailable role", async () => {
  fetchDefaultRoleOptions.mockRejectedValue(Object.assign(new Error("x"), { status: 403 }));
  render(
    <AuthConnectionTags
      tenantId="t3"
      connections={[{ _id: "a", connectionType: ENTRA, autoProvisionUsers: true, defaultRoleId: "r-reo" }]}
    />,
  );
  expect(await screen.findByText("Default role: could not be loaded")).toBeInTheDocument();
});
