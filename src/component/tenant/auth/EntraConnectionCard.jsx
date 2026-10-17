import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Input, Skeleton, Space, Switch } from "antd";
import MyAlert from "../../common/MyAlert";
import ConnectionStatusBadge from "./ConnectionStatusBadge";
import DisconnectEntraDialog from "./DisconnectEntraDialog";
import ProvisioningSettings from "./ProvisioningSettings";
import {
  addAuthConnection,
  disconnectEntraConnection,
  fetchEntraConnectionStatus,
  startEntraConnect,
  testEntraConnection,
  updateAuthConnection,
} from "../../../services/tenantAuthConnectionsApi";
import {
  ENTRA,
  SUCCESS_MESSAGES,
  entraActions,
  errorMessage,
  formatWhen,
  isDirectoryGuid,
  testResultMessage,
} from "../../../utils/entraConnectionStatus";
import { saveConnectReturn } from "../../../utils/entraConnectReturn";

const INVALID_TENANT_ID = "The configured Microsoft Tenant ID is invalid.";
const DESCRIPTIONS = {
  automatic: "Valid users from the connected Microsoft directory can be created in ProjectShell when they first sign in.",
  preauthorised: "Only users already created in ProjectShell can sign in.",
};
const NOT_VERIFIED_HINT = {
  not_connected: "Connect Microsoft Entra before activating this connection.",
  disconnected: "Reconnect Microsoft Entra before activating this connection.",
  reconnect_required: "Reconnect Microsoft Entra before activating this connection.",
};

const Field = ({ label, children }) => (
  <div className="tenant-auth-field">
    <span className="tenant-auth-field-label">{label}</span> <span className="tenant-auth-field-value">{children}</span>
  </div>
);

/**
 * Microsoft Entra ID (CRM / staff sign-in) of one organisation. The status is always the backend's
 * derived status; every action re-reads the organisation (`onChanged`) and the status afterwards.
 * Mutation controls need `canAdmin` (tenant:admin). Raw user ids, claim data and application
 * configuration are never rendered.
 */
const EntraConnectionCard = ({ tenantId, connection, canAdmin, onChanged }) => {
  const connectionId = connection?._id ? String(connection._id) : null;
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [busy, setBusy] = useState(null);
  const busyRef = useRef(null);
  const [actionError, setActionError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [directoryDraft, setDirectoryDraft] = useState(null);
  const [newDirectory, setNewDirectory] = useState("");

  const refreshStatus = useCallback(async () => {
    if (!connectionId) return;
    try {
      setStatus(await fetchEntraConnectionStatus(tenantId, connectionId));
      setStatusError(null);
    } catch (e) {
      setStatus(null);
      setStatusError(errorMessage(e, "load"));
    }
  }, [tenantId, connectionId]);

  useEffect(() => {
    setStatus(null);
    setStatusError(null);
    refreshStatus();
  }, [refreshStatus]);

  /** One action at a time (a second click while one runs is ignored); refreshes when `refresh`. */
  const run = async (op, work, { refresh = true } = {}) => {
    if (busyRef.current) return false;
    busyRef.current = op;
    setBusy(op);
    setActionError(null);
    let ok = false;
    try {
      await work();
      ok = true;
    } catch (e) {
      setActionError(errorMessage(e, op));
    } finally {
      if (refresh) {
        await onChanged?.();
        await refreshStatus();
      }
      busyRef.current = null;
      setBusy(null);
    }
    return ok;
  };

  if (!connection) {
    const addEntra = () => {
      if (!isDirectoryGuid(newDirectory)) {
        setActionError(INVALID_TENANT_ID);
        return;
      }
      run("add", async () => {
        await addAuthConnection(tenantId, {
          connectionType: ENTRA,
          directoryId: newDirectory.trim(),
          isActive: false,
          autoProvisionUsers: false,
        });
        MyAlert("success", SUCCESS_MESSAGES.save);
      });
    };
    return (
      <Card className="tenant-auth-card" title="Microsoft Entra ID" data-testid="entra-card">
        <div className="text-muted mb-2">CRM / staff authentication</div>
        <div className="mb-2">Not configured</div>
        {canAdmin ? (
          <Space.Compact style={{ width: "100%" }}>
            <Input
              aria-label="Microsoft Tenant ID"
              placeholder="Microsoft Tenant ID (Directory ID)"
              value={newDirectory}
              onChange={(e) => setNewDirectory(e.target.value)}
            />
            <Button type="primary" onClick={addEntra} loading={busy === "add"} disabled={!!busy}>
              Add Microsoft Entra
            </Button>
          </Space.Compact>
        ) : null}
        {actionError ? <Alert className="mt-2" type="error" showIcon message={actionError} /> : null}
      </Card>
    );
  }

  const actions = status
    ? entraActions({ status: status.status, isActive: status.isActive, sharedDirectoryException: status.sharedDirectoryException, canAdmin })
    : null;
  const managed = status?.sharedDirectoryException === true;
  const disabled = !!busy;

  const connect = () =>
    run(
      "connect",
      async () => {
        const out = await startEntraConnect(tenantId, connectionId);
        let url = null;
        try {
          url = new URL(out?.authorizationUrl);
        } catch {
          url = null;
        }
        if (!url || url.protocol !== "https:") throw Object.assign(new Error("connect"), { status: 500 });
        saveConnectReturn({ tenantId, connectionId });
        window.location.assign(url.toString());
      },
      { refresh: false },
    );

  const test = () =>
    run("test", async () => {
      const result = await testEntraConnection(tenantId, connectionId);
      // A failed test is a result; its code maps to the fixed test message like any error code.
      if (!result?.ok) throw Object.assign(new Error("test"), { code: result?.code || null });
      MyAlert("success", SUCCESS_MESSAGES.test);
    });

  const disconnect = async () => {
    await run("disconnect", async () => {
      await disconnectEntraConnection(tenantId, connectionId);
      MyAlert("success", SUCCESS_MESSAGES.disconnect);
    });
    setDialogOpen(false);
  };

  const setActive = (isActive) =>
    run("save", async () => {
      await updateAuthConnection(tenantId, connectionId, { isActive });
      MyAlert("success", SUCCESS_MESSAGES.save);
    });

  const saveDirectory = () => {
    if (!isDirectoryGuid(directoryDraft)) {
      setActionError(INVALID_TENANT_ID);
      return;
    }
    run("save", async () => {
      await updateAuthConnection(tenantId, connectionId, { directoryId: directoryDraft.trim() });
      setDirectoryDraft(null);
      MyAlert("success", SUCCESS_MESSAGES.save);
    });
  };

  const saveProvisioning = (fields) =>
    run("save", async () => {
      await updateAuthConnection(tenantId, connectionId, fields);
      MyAlert("success", SUCCESS_MESSAGES.save);
    });

  const lastTest = status?.lastTestedAt
    ? `${formatWhen(status.lastTestedAt)} · ${status.lastTestResult?.ok ? "Successful" : testResultMessage(status.lastTestResult?.code)}`
    : "Not tested yet";

  return (
    <Card
      className="tenant-auth-card"
      title="Microsoft Entra ID"
      extra={status ? <ConnectionStatusBadge status={status.status} /> : null}
      data-testid="entra-card"
    >
      <div className="text-muted mb-2">CRM / staff authentication</div>
      {!status && !statusError ? <Skeleton active paragraph={{ rows: 3 }} /> : null}
      {statusError ? (
        <Alert
          type="error"
          showIcon
          message={statusError}
          action={
            <Button size="small" onClick={refreshStatus}>
              Retry
            </Button>
          }
        />
      ) : null}
      {status ? (
        <>
          {managed ? <Alert className="mb-2" type="info" showIcon message="Managed by the platform" /> : null}
          <Field label="Provider:">Microsoft Entra ID</Field>
          <Field label="Microsoft Tenant ID:">
            {directoryDraft !== null ? (
              <Space.Compact>
                <Input
                  aria-label="Microsoft Tenant ID"
                  value={directoryDraft}
                  onChange={(e) => setDirectoryDraft(e.target.value)}
                />
                <Button type="primary" onClick={saveDirectory} loading={busy === "save"} disabled={disabled}>
                  Save
                </Button>
                <Button onClick={() => setDirectoryDraft(null)} disabled={disabled}>
                  Cancel
                </Button>
              </Space.Compact>
            ) : (
              <>
                <code>{status.directoryId}</code>{" "}
                {actions.editDirectory ? (
                  <Button size="small" type="link" onClick={() => setDirectoryDraft(status.directoryId || "")} disabled={disabled}>
                    Edit Tenant ID
                  </Button>
                ) : null}
              </>
            )}
          </Field>
          {status.connectedAt ? (
            <Field label="Connected on:">
              {formatWhen(status.connectedAt)}
              {status.connectedBy ? " by an administrator" : ""}
            </Field>
          ) : null}
          {status.disconnectedAt ? (
            <Field label="Disconnected on:">
              {formatWhen(status.disconnectedAt)}
              {status.disconnectedBy ? " by an administrator" : ""}
            </Field>
          ) : null}
          <Field label="Last connection test:">{lastTest}</Field>
          <Field label="Active for sign-in:">
            {actions.activeSwitch ? (
              <Switch
                aria-label="Active for sign-in"
                checked={status.isActive === true}
                onChange={setActive}
                loading={busy === "save"}
                disabled={disabled}
              />
            ) : (
              <>
                {status.isActive ? "Yes" : "No"}
                {actions.deactivateOnly ? (
                  <Button size="small" className="ms-2" onClick={() => setActive(false)} disabled={disabled}>
                    Deactivate
                  </Button>
                ) : null}
              </>
            )}
          </Field>
          {!actions.activeSwitch && NOT_VERIFIED_HINT[status.status] && !managed ? (
            <div className="text-muted small mb-2">{NOT_VERIFIED_HINT[status.status]}</div>
          ) : null}
          <ProvisioningSettings
            tenantId={tenantId}
            connection={{ ...connection, connectionType: ENTRA }}
            canEdit={actions.editProvisioning}
            disabled={disabled}
            descriptions={DESCRIPTIONS}
            onSave={saveProvisioning}
          />
          {actionError ? <Alert className="mt-2" type="error" showIcon message={actionError} /> : null}
          <Space className="mt-3" wrap>
            {actions.connect ? (
              <Button type="primary" onClick={connect} loading={busy === "connect"} disabled={disabled}>
                Connect Microsoft Entra
              </Button>
            ) : null}
            {actions.test ? (
              <Button type="primary" onClick={test} loading={busy === "test"} disabled={disabled}>
                {status.status === "test_failed" ? "Test Again" : "Test Connection"}
              </Button>
            ) : null}
            {actions.reconnect ? (
              <Button
                type={actions.test ? "default" : "primary"}
                onClick={connect}
                loading={busy === "connect"}
                disabled={disabled}
              >
                Reconnect Microsoft Entra
              </Button>
            ) : null}
            {actions.disconnect ? (
              <Button danger onClick={() => setDialogOpen(true)} disabled={disabled}>
                Disconnect
              </Button>
            ) : null}
          </Space>
        </>
      ) : null}
      <DisconnectEntraDialog
        open={dialogOpen}
        busy={busy === "disconnect"}
        onCancel={() => setDialogOpen(false)}
        onConfirm={disconnect}
      />
    </Card>
  );
};

export default EntraConnectionCard;
