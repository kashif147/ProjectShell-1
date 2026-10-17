import React from "react";
import { Button, Modal } from "antd";

/**
 * Confirmation for "Disconnect Microsoft Entra". Nothing is sent until the destructive button is
 * pressed; Cancel closes without a request.
 */
const DisconnectEntraDialog = ({ open, busy, onCancel, onConfirm }) => (
  <Modal
    open={open}
    title="Disconnect Microsoft Entra?"
    onCancel={busy ? undefined : onCancel}
    closable={!busy}
    maskClosable={!busy}
    destroyOnHidden
    footer={[
      <Button key="cancel" onClick={onCancel} disabled={busy}>
        Cancel
      </Button>,
      <Button key="disconnect" type="primary" danger loading={busy} onClick={onConfirm}>
        Disconnect Microsoft Entra
      </Button>,
    ]}
  >
    <p>Disconnecting Microsoft Entra will stop users from signing in to this organisation through this connection.</p>
    <p>Existing ProjectShell users, roles and permissions will not be deleted.</p>
    <p>
      To use this directory again, an administrator must reconnect and verify Microsoft Entra before the
      connection can be activated.
    </p>
  </Modal>
);

export default DisconnectEntraDialog;
