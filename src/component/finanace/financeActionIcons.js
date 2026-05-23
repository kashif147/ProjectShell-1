import React from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  InboxOutlined,
  LinkOutlined,
  MoreOutlined,
  PrinterOutlined,
  RollbackOutlined,
  SendOutlined,
  StopOutlined,
  SwapOutlined,
  UndoOutlined,
} from "@ant-design/icons";

const FINANCE_ACTION_ICONS = {
  "approve-cn": { Icon: CheckCircleOutlined, color: "#52c41a" },
  approve: { Icon: CheckCircleOutlined, color: "#52c41a" },
  creditnote: { Icon: FileTextOutlined, color: "#1890ff" },
  "create-credit-note": { Icon: FileTextOutlined, color: "#1890ff" },
  "apply-credit": { Icon: SwapOutlined, color: "#13c2c2" },
  "apply-member-credit": { Icon: SwapOutlined, color: "#13c2c2" },
  refund: { Icon: RollbackOutlined, color: "#ff4d4f" },
  "refund-credit": { Icon: RollbackOutlined, color: "#ff4d4f" },
  writeoff: { Icon: StopOutlined, color: "#fa8c16" },
  "write-off-balance": { Icon: StopOutlined, color: "#fa8c16" },
  reallocation: { Icon: SwapOutlined, color: "#722ed1" },
  "reassign-payment": { Icon: SwapOutlined, color: "#722ed1" },
  cancel: { Icon: CloseCircleOutlined, color: "#ff4d4f" },
  "reverse-receipt": { Icon: UndoOutlined, color: "#fa541c" },
  reverse: { Icon: UndoOutlined, color: "#fa8c16" },
  "reverse-writeoff": { Icon: UndoOutlined, color: "#fa8c16" },
  print: { Icon: PrinterOutlined, color: "#597ef7" },
  send: { Icon: SendOutlined, color: "#2f54eb" },
  "view-source-batch": { Icon: LinkOutlined, color: "#1890ff" },
  "retain-credit": { Icon: InboxOutlined, color: "#13c2c2" },
  loading: { Icon: MoreOutlined, color: "#8c8c8c" },
};

const DEFAULT_ACTION_ICON = { Icon: MoreOutlined, color: "#8c8c8c" };

export function financeLedgerActionIcon(actionId) {
  const key = String(actionId || "").trim();
  const { Icon, color } = FINANCE_ACTION_ICONS[key] || DEFAULT_ACTION_ICON;
  return <Icon style={{ color, fontSize: 14 }} aria-hidden />;
}

/** Apply colorful icons to Ant Design dropdown `items` (skips dividers). */
export function withFinanceActionIcons(items) {
  return items.map((item) => {
    if (item?.type === "divider") return item;
    return { ...item, icon: financeLedgerActionIcon(item.key) };
  });
}
