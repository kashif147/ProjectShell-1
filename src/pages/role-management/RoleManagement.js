import React from "react";
import RoleManagement from "./components/RoleManagement";
import { withPermission } from "../../context/AuthorizationContext";

const RoleManagementPage = () => {
  return (
    <div className="role-management-page">
      <RoleManagement />
    </div>
  );
};

export default withPermission(RoleManagementPage, "role:read");
