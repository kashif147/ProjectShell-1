import React from "react";
import { Tag } from "antd";
import {
  CheckCircleOutlined,
  MinusCircleOutlined,
  DisconnectOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { statusLabel } from "../../../utils/entraConnectionStatus";

const STYLE = {
  connected: { color: "success", icon: <CheckCircleOutlined /> },
  not_connected: { color: "default", icon: <MinusCircleOutlined /> },
  disconnected: { color: "default", icon: <DisconnectOutlined /> },
  test_failed: { color: "warning", icon: <WarningOutlined /> },
  reconnect_required: { color: "error", icon: <ExclamationCircleOutlined /> },
};

/** Backend-derived connection status as a badge (label from entraConnectionStatus). */
const ConnectionStatusBadge = ({ status }) => {
  const style = STYLE[status] || STYLE.not_connected;
  return (
    <Tag color={style.color} icon={style.icon} data-testid="connection-status">
      {statusLabel(status)}
    </Tag>
  );
};

export default ConnectionStatusBadge;
