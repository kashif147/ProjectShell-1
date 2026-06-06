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
import {
  exportStatisticsReportToCsv,
  exportStatisticsReportToPdf,
  exportStatisticsReportToXlsx,
  printStatisticsReportDom,
  statisticsExportHasData,
} from "../../pages/reports/statisticsReportExport";
import {
  exportWorkplaceBreakdownReportToCsv,
  exportWorkplaceBreakdownReportToPdf,
  exportWorkplaceBreakdownReportToXlsx,
  printWorkplaceBreakdownReportDom,
  workplaceBreakdownExportHasData,
} from "../../pages/reports/workplaceBreakdownReportExport";

const MENU_ITEMS = [
  { key: "csv", label: "Export CSV", icon: <DownloadOutlined /> },
  { key: "xlsx", label: "Export Excel", icon: <FileExcelOutlined /> },
  { key: "pdf", label: "Export PDF", icon: <FilePdfOutlined /> },
  { key: "print", label: "Print", icon: <PrinterOutlined /> },
];

export default function ReportExportMenu({ triggerClassName = "me-1 gray-btn butn" }) {
  const [busy, setBusy] = useState(false);

  const run = async (fn, successMsg) => {
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

    if (payload.exportKind === "statistics") {
      const snapshot = payload.statisticsSnapshot;
      if (!statisticsExportHasData(snapshot)) {
        message.warning("No data to export");
        return;
      }
      if (key === "csv") {
        run(() => exportStatisticsReportToCsv(snapshot), "CSV downloaded");
      } else if (key === "xlsx") {
        run(() => exportStatisticsReportToXlsx(snapshot), "Excel downloaded");
      } else if (key === "pdf") {
        run(() => exportStatisticsReportToPdf(snapshot), "PDF downloaded");
      } else if (key === "print") {
        run(() => Promise.resolve(printStatisticsReportDom()), "Print dialog opened");
      }
      return;
    }

    if (payload.exportKind === "workplaceBreakdown") {
      const snapshot = payload.workplaceBreakdownSnapshot;
      if (!workplaceBreakdownExportHasData(snapshot)) {
        message.warning("No data to export");
        return;
      }
      if (key === "csv") {
        run(
          () => exportWorkplaceBreakdownReportToCsv(snapshot),
          "CSV downloaded",
        );
      } else if (key === "xlsx") {
        run(
          () => exportWorkplaceBreakdownReportToXlsx(snapshot),
          "Excel downloaded",
        );
      } else if (key === "pdf") {
        run(
          () => exportWorkplaceBreakdownReportToPdf(snapshot),
          "PDF downloaded",
        );
      } else if (key === "print") {
        run(
          () => Promise.resolve(printWorkplaceBreakdownReportDom()),
          "Print dialog opened",
        );
      }
      return;
    }

    if (!payload.data?.length) {
      message.warning("No rows to export");
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
      run(() => exportReportToPdf({ ...base, layout: "landscape" }), "PDF downloaded");
    } else if (key === "print") {
      run(() => printReportDocument({ ...base, layout: "landscape" }), "Print dialog opened");
    }
  };

  const payload = resolveReportExportPayload();
  const disabled = busy || payload?.disabled;

  return (
    <span className="report-export-toolbar no-print">
      <Dropdown
        menu={{ items: MENU_ITEMS, onClick: onMenuClick }}
        trigger={["click"]}
        disabled={disabled && !payload}
      >
        <Button className={triggerClassName} loading={busy}>
          Export
        </Button>
      </Dropdown>
    </span>
  );
}
