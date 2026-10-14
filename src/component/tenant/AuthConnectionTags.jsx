import React from "react";
import { Tag } from "antd";
import useDefaultRoleOptions from "../../hooks/useDefaultRoleOptions";
import {
  defaultRoleLabel,
  provisioningLabel,
  roleIdOf,
} from "../../utils/authConnectionDisplay";

const ENTRA = "Entra ID (Azure AD)";

/**
 * Authentication connections of one organisation in the Tenant Management list: provider,
 * provisioning (Automatic / Pre-authorised / Pre-authorised (not set)) and, when configured, the
 * default role resolved from that organisation's own default-role options.
 */
const AuthConnectionTags = ({ tenantId, connections = [] }) => {
  const typesWithRole = (connections || [])
    .filter((c) => roleIdOf(c))
    .map((c) => c.connectionType);
  const optionsByType = useDefaultRoleOptions(tenantId, typesWithRole);

  return (
    <div>
      {(connections || []).map((conn, index) => {
        const roleLabel = defaultRoleLabel(conn, optionsByType[conn.connectionType]);
        return (
          <div key={conn._id || index} className="mb-1">
            <Tag color={conn.connectionType === ENTRA ? "green" : "orange"}>
              {conn.connectionType === ENTRA ? "Entra" : "B2C"}
              {" · "}
              {provisioningLabel(conn)}
            </Tag>
            {roleLabel ? <div className="text-muted small">{roleLabel}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

export default AuthConnectionTags;
