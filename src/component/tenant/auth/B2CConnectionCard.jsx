import React, { useRef, useState } from "react";
import { Alert, Card, Tag } from "antd";
import MyAlert from "../../common/MyAlert";
import ProvisioningSettings from "./ProvisioningSettings";
import { updateAuthConnection } from "../../../services/tenantAuthConnectionsApi";
import { B2C, SUCCESS_MESSAGES, errorMessage } from "../../../utils/entraConnectionStatus";

const DESCRIPTIONS = {
  automatic: "New members can be created in ProjectShell when they first sign in.",
  preauthorised: "Only members already created in ProjectShell can sign in.",
};

/**
 * Azure AD B2C (legacy member sign-in): visibility plus the provisioning mode / default role the
 * backend already supports editing. Creating, removing or configuring the B2C connection itself
 * (directory, audience, issuer, sign-up connector) is platform-managed and not offered here.
 */
const B2CConnectionCard = ({ tenantId, connections = [], canAdmin, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState(null);
  const b2c = (connections || []).filter((c) => c?.connectionType === B2C);

  const save = async (connectionId, fields) => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    let ok = false;
    try {
      await updateAuthConnection(tenantId, connectionId, fields);
      MyAlert("success", SUCCESS_MESSAGES.save);
      ok = true;
    } catch (e) {
      setError(errorMessage(e, "save"));
    } finally {
      await onChanged?.();
      busyRef.current = false;
      setBusy(false);
    }
    return ok;
  };

  return (
    <Card className="tenant-auth-card" title="Azure AD B2C" data-testid="b2c-card">
      <div className="text-muted mb-2">Legacy member authentication</div>
      {b2c.length === 0 ? <div>Not configured</div> : null}
      {b2c.map((connection) => (
        <div key={String(connection._id)} className="tenant-auth-b2c-connection mb-2">
          <div className="mb-1">
            Status: {connection.isActive ? <Tag color="success">Active</Tag> : <Tag>Inactive</Tag>}
          </div>
          <ProvisioningSettings
            tenantId={tenantId}
            connection={connection}
            canEdit={canAdmin}
            disabled={busy}
            descriptions={DESCRIPTIONS}
            onSave={(fields) => save(String(connection._id), fields)}
          />
        </div>
      ))}
      {error ? <Alert className="mt-2" type="error" showIcon message={error} /> : null}
    </Card>
  );
};

export default B2CConnectionCard;
