import dayjs from "dayjs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import { columnKeyToString } from "./filterUtils";
import {
  appendSheet,
  buildGridReportDataSheet,
  buildMetaInfoSheet,
  createWorkbook,
  writeStyledWorkbook,
} from "./reportExcelExport";

export function formatReportGeneratedAt() {
  return dayjs().format("DD/MM/YYYY HH:mm:ss");
}

/** Human-readable summary of toolbar filter chips for export/print headers. */
export function formatAppliedFiltersSummary(filtersState = {}) {
  const lines = [];
  Object.entries(filtersState || {}).forEach(([label, filter]) => {
    const values = filter?.selectedValues;
    if (!Array.isArray(values) || values.length === 0) return;
    const op = filter?.operator || "==";
    const rendered = values
      .map((v) => (v == null ? "" : String(v).trim()))
      .filter(Boolean)
      .join(", ");
    if (!rendered) return;
    lines.push(`${label}: ${rendered} (${op})`);
  });
  return lines;
}

export function getVisibleExportColumns(screenCols = []) {
  return (screenCols || [])
    .filter((col) => col.isGride === true)
    .map((col) => ({
      key: columnKeyToString(col),
      title: String(col.title || columnKeyToString(col)),
      render: col.render,
    }))
    .filter((col) => col.key);
}

export function resolveExportCellValue(row, col) {
  const key = col.key;
  if (!key) return "";
  if (key.includes(".")) {
    return (
      key.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), row) ??
      ""
    );
  }
  const raw = row[key];
  if (raw == null || raw === "") return "";
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  return raw;
}

export function buildExportRows(data, exportColumns) {
  return (data || []).map((row) => {
    const out = {};
    exportColumns.forEach((col) => {
      let value = resolveExportCellValue(row, col);
      if (col.render && typeof col.render === "function") {
        try {
          const rendered = col.render(value, row);
          if (
            typeof rendered === "string" ||
            typeof rendered === "number"
          ) {
            value = rendered;
          }
        } catch {
          /* keep raw */
        }
      }
      if (value instanceof Date) {
        value = dayjs(value).format("DD/MM/YYYY");
      }
      out[col.title] = value == null ? "" : String(value);
    });
    return out;
  });
}

function buildMetaSheetRows({ reportTitle, filtersState, recordCount }) {
  const generatedAt = formatReportGeneratedAt();
  const filterLines = formatAppliedFiltersSummary(filtersState);
  const rows = [
    ["Report", reportTitle],
    ["Generated", generatedAt],
    ["Record count", String(recordCount ?? 0)],
    [""],
    ["Applied filters", filterLines.length ? "" : "None"],
  ];
  filterLines.forEach((line) => rows.push(["", line]));
  return { generatedAt, filterLines, metaRows: rows };
}

export function exportReportToCsv({
  reportTitle,
  data,
  screenCols,
  filtersState,
}) {
  const exportColumns = getVisibleExportColumns(screenCols);
  const sheetRows = buildExportRows(data, exportColumns);
  const { metaRows } = buildMetaSheetRows({
    reportTitle,
    filtersState,
    recordCount: sheetRows.length,
  });

  const aoa = [
    ...metaRows,
    [""],
    exportColumns.map((c) => c.title),
    ...sheetRows.map((row) => exportColumns.map((c) => row[c.title] ?? "")),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const slug = reportTitle.replace(/\s+/g, "_").toLowerCase();
  XLSX.writeFile(wb, `${slug}_${dayjs().format("YYYY-MM-DD")}.csv`, {
    bookType: "csv",
  });
}

export function exportReportToXlsx({
  reportTitle,
  data,
  screenCols,
  filtersState,
}) {
  const exportColumns = getVisibleExportColumns(screenCols);
  const sheetRows = buildExportRows(data, exportColumns);
  const metaRows = buildMetaSheetRows({
    reportTitle,
    filtersState,
    recordCount: sheetRows.length,
  }).metaRows;

  const wb = createWorkbook();
  appendSheet(wb, buildMetaInfoSheet(metaRows), "Info");
  appendSheet(
    wb,
    buildGridReportDataSheet(exportColumns, sheetRows),
    "Data",
  );
  const slug = reportTitle.replace(/\s+/g, "_").toLowerCase();
  writeStyledWorkbook(wb, `${slug}_${dayjs().format("YYYY-MM-DD")}.xlsx`);
}

export function exportReportToPdf({
  reportTitle,
  data,
  screenCols,
  filtersState,
}) {
  const exportColumns = getVisibleExportColumns(screenCols);
  const sheetRows = buildExportRows(data, exportColumns);
  const { generatedAt, filterLines } = buildMetaSheetRows({
    reportTitle,
    filtersState,
    recordCount: sheetRows.length,
  });

  const doc = new jsPDF({ orientation: "landscape" });
  let y = 14;
  doc.setFontSize(14);
  doc.text(reportTitle, 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.text(`Generated: ${generatedAt}`, 14, y);
  y += 5;
  doc.text(`Records: ${sheetRows.length}`, 14, y);
  y += 6;
  if (filterLines.length) {
    doc.text("Applied filters:", 14, y);
    y += 5;
    filterLines.forEach((line) => {
      if (y > 270) return;
      doc.text(line, 16, y);
      y += 4;
    });
    y += 4;
  } else {
    doc.text("Applied filters: None", 14, y);
    y += 8;
  }

  autoTable(doc, {
    head: [exportColumns.map((c) => c.title)],
    body: sheetRows.map((row) =>
      exportColumns.map((c) => row[c.title] ?? ""),
    ),
    startY: y,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [69, 102, 157] },
    margin: { left: 10, right: 10 },
  });

  const slug = reportTitle.replace(/\s+/g, "_").toLowerCase();
  doc.save(`${slug}_${dayjs().format("YYYY-MM-DD")}.pdf`);
}

export function printReportDocument({
  reportTitle,
  data,
  screenCols,
  filtersState,
  layout = "landscape",
}) {
  const exportColumns = getVisibleExportColumns(screenCols);
  const sheetRows = buildExportRows(data, exportColumns);
  const { generatedAt, filterLines } = buildMetaSheetRows({
    reportTitle,
    filtersState,
    recordCount: sheetRows.length,
  });

  const filterHtml = filterLines.length
    ? `<ul>${filterLines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`
    : "<p>None</p>";

  const headHtml = exportColumns.map((c) => `<th>${escapeHtml(c.title)}</th>`).join("");
  const bodyHtml = sheetRows
    .map(
      (row) =>
        `<tr>${exportColumns
          .map((c) => `<td>${escapeHtml(row[c.title] ?? "")}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(reportTitle)}</title>
  <style>
    @page { size: ${layout}; margin: 12mm; }
    body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10px; color: #1a1a1a; }
    h1 { font-size: 16px; margin: 0 0 4px; color: #45669d; }
    .meta { margin-bottom: 12px; font-size: 9px; line-height: 1.4; }
    .meta ul { margin: 4px 0 0 16px; padding: 0; }
    table { width: 100%; border-collapse: collapse; table-layout: auto; }
    th, td { border: 1px solid #d9d9d9; padding: 4px 6px; text-align: left; vertical-align: top; word-break: break-word; }
    th { background: #45669d; color: #fff; font-weight: 600; }
    tr:nth-child(even) td { background: #fafafa; }
    .footer { margin-top: 12px; font-size: 8px; color: #666; }
  </style>
</head>
<body>
  <h1>${escapeHtml(reportTitle)}</h1>
  <div class="meta">
    <div><strong>Generated:</strong> ${escapeHtml(generatedAt)}</div>
    <div><strong>Records:</strong> ${sheetRows.length}</div>
    <div><strong>Applied filters</strong>${filterHtml}</div>
  </div>
  <table>
    <thead><tr>${headHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>
  <div class="footer">Membership reporting — column layout follows visible grid columns.</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    throw new Error("Pop-up blocked. Allow pop-ups to print this report.");
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
