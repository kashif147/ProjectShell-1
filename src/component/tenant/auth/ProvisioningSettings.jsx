import React, { useState } from "react";
import { Alert, Button, Radio, Select, Space } from "antd";
import useDefaultRoleOptions from "../../../hooks/useDefaultRoleOptions";
import {
  DEFAULT_ROLE_OPTIONS_ERROR,
  automaticConnectionError,
  defaultRoleLabel,
  provisioningLabel,
  roleIdOf,
} from "../../../utils/authConnectionDisplay";

/**
 * Provisioning mode + default role of one connection (existing backend semantics: only explicit
 * `true` is automatic; automatic needs an eligible default role from default-role-options). Edits
 * save only `autoProvisionUsers` / `defaultRoleId` through `onSave(fields)`.
 */
const ProvisioningSettings = ({ tenantId, connection, canEdit, disabled, descriptions, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  // Role options are a tenant:admin endpoint: only loaded for an administrator.
  const options = useDefaultRoleOptions(tenantId, canEdit ? [connection.connectionType] : [], { fresh: true });
  const entry = options[connection.connectionType];
  const automatic = connection.autoProvisionUsers === true;

  const startEdit = () => {
    setDraft({
      connectionType: connection.connectionType,
      _id: connection._id,
      autoProvisionUsers: automatic,
      defaultRoleId: roleIdOf(connection) || null,
    });
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    const message = automaticConnectionError(draft, entry, [connection]);
    if (message) {
      setError(message);
      return;
    }
    const fields = draft.autoProvisionUsers
      ? { autoProvisionUsers: true, defaultRoleId: draft.defaultRoleId }
      : { autoProvisionUsers: false };
    setSaving(true);
    const ok = await onSave(fields);
    setSaving(false);
    if (ok) setEditing(false);
  };

  const roleText = canEdit
    ? defaultRoleLabel(connection, entry)
    : roleIdOf(connection)
      ? "Default role: Configured"
      : null;

  if (!editing) {
    return (
      <div className="tenant-auth-provisioning" data-testid="provisioning">
        <div>
          <strong>Provisioning:</strong> {provisioningLabel(connection)}
        </div>
        <div className="text-muted small">{automatic ? descriptions.automatic : descriptions.preauthorised}</div>
        {automatic && roleText ? <div className="small">{roleText}</div> : null}
        {canEdit ? (
          <Button size="small" className="mt-2" onClick={startEdit} disabled={disabled}>
            Edit provisioning
          </Button>
        ) : null}
      </div>
    );
  }

  const roles = entry?.status === "loaded" ? entry.roles || [] : [];
  const selectOptions = roles.map((r) => ({ value: String(r._id), label: `${r.name} (${r.code})` }));
  if (draft.defaultRoleId && entry?.status === "loaded" && !roles.some((r) => String(r._id) === draft.defaultRoleId)) {
    selectOptions.unshift({ value: draft.defaultRoleId, label: "Unavailable role (inactive or not allowed)", disabled: true });
  }

  return (
    <div className="tenant-auth-provisioning" data-testid="provisioning-edit">
      <Radio.Group
        value={draft.autoProvisionUsers ? "automatic" : "preauthorised"}
        onChange={(e) => setDraft((d) => ({ ...d, autoProvisionUsers: e.target.value === "automatic" }))}
      >
        <Space direction="vertical">
          <Radio value="automatic">
            Automatic <div className="text-muted small">{descriptions.automatic}</div>
          </Radio>
          <Radio value="preauthorised">
            Pre-authorised <div className="text-muted small">{descriptions.preauthorised}</div>
          </Radio>
        </Space>
      </Radio.Group>
      {draft.autoProvisionUsers ? (
        <div className="mt-2">
          <label htmlFor={`default-role-${connection._id}`}>Default role</label>
          <Select
            id={`default-role-${connection._id}`}
            aria-label="Default role"
            style={{ width: "100%" }}
            placeholder="Select a default role"
            value={draft.defaultRoleId || undefined}
            options={selectOptions}
            loading={!entry || entry.status === "loading"}
            disabled={entry?.status !== "loaded"}
            onChange={(value) => setDraft((d) => ({ ...d, defaultRoleId: value || null }))}
          />
          {entry?.status === "error" ? <div className="text-danger small">{DEFAULT_ROLE_OPTIONS_ERROR}</div> : null}
        </div>
      ) : null}
      {error ? <Alert className="mt-2" type="error" showIcon message={error} /> : null}
      <Space className="mt-2">
        <Button type="primary" onClick={save} loading={saving} disabled={disabled}>
          Save
        </Button>
        <Button onClick={() => setEditing(false)} disabled={saving}>
          Cancel
        </Button>
      </Space>
    </div>
  );
};

export default ProvisioningSettings;
