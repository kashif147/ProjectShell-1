import * as XLSX from "xlsx-js-style";

const BORDER_COLOR = "C5C5C5";
const HEADER_FILL = "F0F4F8";
const HEADER_TEXT = "1A4D8F";
const CALC_FILL = "E4ECF4";
const TOTAL_FILL = "EAF0F6";
const TOTAL_HIGHLIGHT_FILL = "E2EBF4";
const GRAND_TOTAL_HIGHLIGHT_FILL = "D8E4EF";
const REGION_HEADER_FILL = "DCE6F0";
const BRANCH_HEADER_FILL = "EEF3F8";

function thinBorder() {
  const side = { style: "thin", color: { rgb: BORDER_COLOR } };
  return { top: side, bottom: side, left: side, right: side };
}

function baseStyle(overrides = {}) {
  return {
    font: { name: "Calibri", sz: 10, color: { rgb: "333333" } },
    alignment: { vertical: "center", wrapText: true },
    border: thinBorder(),
    ...overrides,
  };
}

function headerStyle(align = "right") {
  return baseStyle({
    font: { name: "Calibri", sz: 10, bold: true, color: { rgb: HEADER_TEXT } },
    fill: { fgColor: { rgb: HEADER_FILL }, patternType: "solid" },
    alignment: { horizontal: align, vertical: "center", wrapText: true },
  });
}

function bodyStyle({ align = "right", fill, bold = false, color = "333333" } = {}) {
  return baseStyle({
    font: { name: "Calibri", sz: 10, bold, color: { rgb: color } },
    fill: fill ? { fgColor: { rgb: fill }, patternType: "solid" } : undefined,
    alignment: { horizontal: align, vertical: "center", wrapText: false },
    numFmt: align === "right" ? "#,##0" : undefined,
  });
}

function cellType(value) {
  if (typeof value === "number" && Number.isFinite(value)) return "n";
  if (value === "" || value == null) return "s";
  const parsed = Number(value);
  if (Number.isFinite(parsed) && String(value).trim() !== "") return "n";
  return "s";
}

function cellValue(value) {
  if (value == null || value === "") return "";
  const type = cellType(value);
  if (type === "n") return Number(value);
  return String(value);
}

function setCell(sheet, row, col, value, style) {
  const address = XLSX.utils.encode_cell({ r: row, c: col });
  const type = cellType(value);
  sheet[address] = {
    v: cellValue(value),
    t: type,
    s: style,
  };
}

export function stripSheetMerges(sheet) {
  if (sheet?.["!merges"]) {
    delete sheet["!merges"];
  }
}

export function applyLandscapePageSetup(sheet) {
  sheet["!pageSetup"] = {
    orientation: "landscape",
    paperSize: 9,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  sheet["!margins"] = {
    left: 0.4,
    right: 0.4,
    top: 0.5,
    bottom: 0.5,
    header: 0.2,
    footer: 0.2,
  };
}

function finalizeSheet(sheet, rowCount, colCount, columnWidths = []) {
  sheet["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: Math.max(rowCount - 1, 0), c: Math.max(colCount - 1, 0) },
  });
  if (columnWidths.length) {
    sheet["!cols"] = columnWidths.map((width) => ({ wch: width || 12 }));
  }
  applyLandscapePageSetup(sheet);
  stripSheetMerges(sheet);
  return sheet;
}

export function buildMetaInfoSheet(rows, columnWidths = [22, 48]) {
  const sheet = {};
  rows.forEach((row, rowIndex) => {
    setCell(
      sheet,
      rowIndex,
      0,
      row[0] ?? "",
      baseStyle({
        font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "333333" } },
        alignment: { horizontal: "left", vertical: "center" },
      }),
    );
    setCell(
      sheet,
      rowIndex,
      1,
      row[1] ?? "",
      baseStyle({
        alignment: { horizontal: "left", vertical: "center", wrapText: true },
      }),
    );
  });
  return finalizeSheet(sheet, rows.length, 2, columnWidths);
}

function resolveBodyStyle(column, rowFlags = {}) {
  const isText = column.kind === "text";
  const align = isText ? "left" : "right";
  let fill;
  let bold = false;
  let color = "333333";

  if (rowFlags.isRegionHeader) {
    return bodyStyle({
      align: "left",
      fill: REGION_HEADER_FILL,
      bold: true,
      color: HEADER_TEXT,
    });
  }
  if (rowFlags.isBranchHeader && isText) {
    return bodyStyle({
      align: "left",
      fill: BRANCH_HEADER_FILL,
      bold: true,
      color: HEADER_TEXT,
    });
  }

  if (
    (rowFlags.isGrandTotal || rowFlags.isBranchTotal) &&
    column.totalHighlight
  ) {
    fill = GRAND_TOTAL_HIGHLIGHT_FILL;
    bold = true;
    color = HEADER_TEXT;
  } else if (rowFlags.isTotal && column.totalHighlight) {
    fill = TOTAL_HIGHLIGHT_FILL;
    bold = true;
    color = HEADER_TEXT;
  } else if (rowFlags.isTotal && column.calc) {
    fill = TOTAL_FILL;
    bold = true;
  } else if (rowFlags.isTotal) {
    bold = true;
  } else if (column.calc) {
    fill = CALC_FILL;
    bold = true;
  }

  return bodyStyle({ align, fill, bold, color });
}

/**
 * Build a styled worksheet from flat columns — one header row, no merged cells.
 */
export function buildStyledTableSheet({
  columns = [],
  rows = [],
  getRowFlags = () => ({}),
}) {
  const sheet = {};
  let rowIndex = 0;

  columns.forEach((column, colIndex) => {
    const align = column.kind === "text" ? "left" : "right";
    setCell(sheet, rowIndex, colIndex, column.label, headerStyle(align));
  });
  rowIndex += 1;

  rows.forEach((row) => {
    const rowFlags = getRowFlags(row) || {};
    columns.forEach((column, colIndex) => {
      setCell(
        sheet,
        rowIndex,
        colIndex,
        row[column.key],
        resolveBodyStyle(column, rowFlags),
      );
    });
    rowIndex += 1;
  });

  return finalizeSheet(
    sheet,
    rowIndex,
    columns.length,
    columns.map((column) => column.width || 12),
  );
}

export function writeStyledWorkbook(workbook, filename) {
  workbook.SheetNames.forEach((name) => stripSheetMerges(workbook.Sheets[name]));
  XLSX.writeFile(workbook, filename);
}

export function createWorkbook() {
  return XLSX.utils.book_new();
}

export function appendSheet(workbook, sheet, name) {
  XLSX.utils.book_append_sheet(workbook, sheet, name);
}

/** Grid report columns: visible titles, flat header row. */
export function buildGridReportDataSheet(exportColumns = [], sheetRows = []) {
  const columns = exportColumns.map((col) => ({
    key: col.title,
    label: col.title,
    width: Math.min(Math.max(String(col.title || "").length + 2, 12), 36),
    kind: "text",
  }));

  const rows = sheetRows.map((row) => {
    const out = {};
    exportColumns.forEach((col) => {
      out[col.title] = row[col.title] ?? "";
    });
    return out;
  });

  return buildStyledTableSheet({ columns, rows });
}
