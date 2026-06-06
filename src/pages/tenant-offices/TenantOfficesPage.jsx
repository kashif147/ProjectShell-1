import React from "react";
import { Card } from "antd";
import TenantOfficesPanel from "../../component/tenant/TenantOfficesPanel";
import { useAuthorization } from "../../context/AuthorizationContext";
import "../../styles/TenantManagement.css";

const TenantOfficesPage = () => {
  const { hasPermission } = useAuthorization();
  const canRead = hasPermission("tenant:read");

  if (!canRead) {
    return (
      <Card>
        <p>You do not have permission to view organisation offices.</p>
      </Card>
    );
  }

  return (
    <div className="tenant-management-container p-3">
      <Card title="Organisation Offices">
        <TenantOfficesPanel useCurrentTenant showInactive />
      </Card>
    </div>
  );
};

export default TenantOfficesPage;
