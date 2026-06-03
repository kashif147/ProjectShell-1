import React, { useState } from "react";
import { Button, Dropdown, message } from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  exportReportToCsv,
  exportReportToPdf,
  exportReportToXlsx,
  printReportDocument,
} from "../../utils/reportExportToolkit";
import { resolveReportExportPayload } from "../../utils/reportExportBridge";

const MENU_ITEMS = [
  { key: "csv", label: "Export CSV", icon: <DownloadOutlined /> },
  { key: "xlsx", label: "Export Excel", icon: <FileExcelOutlined /> },
  { key: "pdf", label: "Export PDF", icon: <FilePdfOutlined /> },
  { key: "print", label: "Print", icon: <PrinterOutlined /> },
];

export default function ReportExportMenu({ triggerClassName = "me-1 gray-btn butn" }) {
  const [busy, setBusy] = useState(false);

  const run = async (fn, successMsg) => {
    const payload = resolveReportExportPayload();
    if (!payload) {
      message.warning("Report export is not ready");
      return;
    }
    if (!payload.data?.length) {
      message.warning("No rows to export");
      return;
    }
    setBusy(true);
    try {
      await fn();
      message.success(successMsg);
    } catch (error) {
      console.error(error);
      message.error(error?.message || "Export failed");
    } finally {
      setBusy(false);
    }
  };

  const onMenuClick = ({ key }) => {
    const payload = resolveReportExportPayload();
    if (!payload) {
      message.warning("Report export is not ready");
      return;
    }
    const base = {
      reportTitle: payload.reportTitle,
      data: payload.data,
      screenCols: payload.screenCols,
      filtersState: payload.filtersState,
    };

    if (key === "csv") {
      run(() => exportReportToCsv(base), "CSV downloaded");
    } else if (key === "xlsx") {
      run(() => exportReportToXlsx(base), "Excel downloaded");
    } else if (key === "pdf") {
      run(() => exportReportToPdf(base), "PDF downloaded");
    } else if (key === "print") {
      run(() => printReportDocument(base), "Print dialog opened");
    }
  };

  const payload = resolveReportExportPayload();
  const disabled = busy || payload?.disabled;

  return (
    <Dropdown
      menu={{ items: MENU_ITEMS, onClick: onMenuClick }}
      trigger={["click"]}
      disabled={disabled && !payload}
    >
      <Button className={triggerClassName} loading={busy}>
        Export
      </Button>
    </Dropdown>
  );
}
