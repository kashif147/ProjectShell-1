import React from "react";
import {
  UserAddOutlined,
  PlusCircleOutlined,
  UserDeleteOutlined,
  RiseOutlined,
  WalletOutlined,
  StarOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { GraduationCap } from "lucide-react";

/** Lucide icons render at 16px to match Ant Design outlined set in KPI tiles */
function LucideIcon({ icon: Icon, size = 16, strokeWidth = 2 }) {
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden />;
}

export const EXEC_KPI_ICONS = {
  active: {
    icon: UserAddOutlined,
    accent: "#2563eb",
    iconBg: "rgba(37, 99, 235, 0.12)",
  },
  joiners: {
    icon: PlusCircleOutlined,
    accent: "#16a34a",
    iconBg: "rgba(22, 163, 74, 0.12)",
  },
  leavers: {
    icon: UserDeleteOutlined,
    accent: "#dc2626",
    iconBg: "rgba(220, 38, 38, 0.12)",
  },
  net: {
    icon: RiseOutlined,
    accent: "#7c3aed",
    iconBg: "rgba(124, 58, 237, 0.12)",
  },
  paid: {
    icon: WalletOutlined,
    accent: "#ea580c",
    iconBg: "rgba(234, 88, 12, 0.12)",
  },
  student: {
    icon: (props) => <LucideIcon icon={GraduationCap} {...props} />,
    accent: "#0d9488",
    iconBg: "rgba(13, 148, 136, 0.12)",
  },
  honorary: {
    icon: StarOutlined,
    accent: "#9333ea",
    iconBg: "rgba(147, 51, 234, 0.12)",
  },
};

export const EXEC_MINI_KPI_ICONS = {
  active: EXEC_KPI_ICONS.active,
  joiners: EXEC_KPI_ICONS.joiners,
  cancelled: {
    icon: CloseCircleOutlined,
    accent: "#dc2626",
    iconBg: "rgba(220, 38, 38, 0.12)",
  },
  resigned: {
    icon: LogoutOutlined,
    accent: "#ea580c",
    iconBg: "rgba(234, 88, 12, 0.12)",
  },
};

export function ExecDashboardIcon({ spec, className = "" }) {
  const Icon = spec.icon;
  return (
    <span
      className={`exec-dashboard-icon ${className}`.trim()}
      style={{ color: spec.accent, background: spec.iconBg }}
      aria-hidden
    >
      <Icon />
    </span>
  );
}
