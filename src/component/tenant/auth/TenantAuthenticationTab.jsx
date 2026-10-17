import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Skeleton, Space } from "antd";
import { useAuthorization } from "../../../context/AuthorizationContext";
import { fetchTenantForAuthentication } from "../../../services/tenantAuthConnectionsApi";
import { errorMessage, primaryEntraConnection } from "../../../utils/entraConnectionStatus";
import EntraConnectionCard from "./EntraConnectionCard";
import ExternalIdCard from "./ExternalIdCard";
import B2CConnectionCard from "./B2CConnectionCard";
import "../../../styles/TenantManagement.css";

/**
 * Tenant Management > Authentication: the organisation's sign-in providers. Reads the organisation
 * fresh from user-service (allow-listed fields) and re-reads it after every change. Mutation
 * controls need tenant:admin (the permission every authentication-connection route checks);
 * otherwise the cards are read-only.
 */
const TenantAuthenticationTab = ({ tenantId, onTenantChanged }) => {
  const { hasPermission } = useAuthorization();
  const canAdmin = hasPermission("tenant:admin");
  const [tenant, setTenant] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    try {
      setTenant(await fetchTenantForAuthentication(tenantId));
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e, "load"));
    }
  }, [tenantId]);

  useEffect(() => {
    setTenant(null);
    setLoadError(null);
    load();
  }, [load]);

  const onChanged = useCallback(async () => {
    await load();
    onTenantChanged?.();
  }, [load, onTenantChanged]);

  if (loadError && !tenant) {
    return (
      <Alert
        type="error"
        showIcon
        message={loadError}
        action={
          <Button size="small" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }
  if (!tenant) return <Skeleton active paragraph={{ rows: 6 }} />;

  const connections = tenant.authenticationConnections || [];
  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }} className="tenant-authentication-tab">
      <EntraConnectionCard
        tenantId={tenantId}
        connection={primaryEntraConnection(connections)}
        canAdmin={canAdmin}
        onChanged={onChanged}
      />
      <ExternalIdCard />
      <B2CConnectionCard tenantId={tenantId} connections={connections} canAdmin={canAdmin} onChanged={onChanged} />
    </Space>
  );
};

export default TenantAuthenticationTab;
