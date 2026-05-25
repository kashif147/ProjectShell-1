import React from "react";
import { Card } from "antd";
import TenantDepartmentsPanel from "../../component/tenant/TenantDepartmentsPanel";
import { useAuthorization } from "../../context/AuthorizationContext";
import "../../styles/TenantManagement.css";

const TenantDepartmentsPage = () => {
  const { hasPermission } = useAuthorization();
  const canRead = hasPermission("tenant:read");

  if (!canRead) {
    return (
      <Card>
        <p>You do not have permission to view organisation departments.</p>
      </Card>
    );
  }

  return (
    <div className="tenant-management-container p-3">
      <Card title="Organisation Departments">
        <TenantDepartmentsPanel useCurrentTenant showInactive />
      </Card>
    </div>
  );
};

export default TenantDepartmentsPage;
