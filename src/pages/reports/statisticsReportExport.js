import dayjs from "dayjs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import {
  STATS_CATEGORY_COLUMNS,
  STATS_TOTAL_HIGHLIGHT_KEYS,
  toStatisticsExcelColumns,
} from "./statisticsReportColumns";
import {
  appendSheet,
  buildMetaInfoSheet,
  buildStyledTableSheet,
  createWorkbook,
  writeStyledWorkbook,
} from "../../utils/reportExcelExport";
import {
  activateMembershipReportPrint,
  bindMembershipReportPrintCleanup,
  deactivateMembershipReportPrint,
} from "../../utils/membershipReportPrint";
import { exportCellValue } from "./statisticsReportExportHelpers";
import {
  buildGroupedLocationSections,
  buildRegionGrandTotalSections,
  groupedLocationRowFlags,
  splitGroupedLocationSectionsByRegion,
  GROUPED_LOCATION_EXPORT_COLUMNS,
  STATS_REGION_GRAND_TOTAL_COLUMNS,
} from "./statisticsReportLocationGrouping";
import {
  applyPeriodToCategoryColumns,
  buildCategoryFooterTotals,
  getReportCellValue,
} from "./statisticsReportUtils";

const PDF_LAYOUT = {
  orientation: "landscape",
  unit: "mm",
  format: "a4",
};

const PDF_PAGE = { width: 297, height: 210, margin: 10 };

function stampPdfPageNumbers(doc) {
  const total = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.setTextColor(85, 85, 85);
    doc.text(
      `Page ${page} of ${total}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" },
    );
  }
}

function slugify(title) {
  return String(title || "report")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function columnHasData(rows, key) {
  return rows.some((row) => Number(getReportCellValue(row, key)) > 0);
}

function getVisibleCategoryColumns(categoryRows = [], period) {
  const alwaysShow = new Set([
    "name",
    "openingActive",
    "newJoin",
    "rejoin",
    "reinstatedFromSuspended",
    "reinstatedFromArchived",
    "joiners",
    "resigned",
    "cancelled",
    "leavers",
    "closingActive",
  ]);
  const columns = STATS_CATEGORY_COLUMNS.filter(
    (col) => alwaysShow.has(col.key) || columnHasData(categoryRows, col.key),
  );
  return applyPeriodToCategoryColumns(columns, period);
}

function buildCategoryExportRows(categoryRows = [], columns) {
  return categoryRows.map((row) => {
    const out = {};
    columns.forEach((col) => {
      out[col.key] = exportCellValue(row, col.key);
    });
    return out;
  });
}

function buildCategoryTotalsRow(categoryRows = [], columns) {
  const totals = buildCategoryFooterTotals(
    categoryRows,
    columns.filter((c) => c.key !== "name").map((c) => c.key),
  );
  const out = { name: "Total" };
  columns.forEach((col) => {
    if (col.key === "name") return;
    out[col.key] = exportCellValue(totals, col.key);
  });
  return out;
}

export function buildStatisticsExportSnapshot({
  reportMeta,
  categoryRows = [],
  locationHierarchy,
  includeBreakdown = true,
}) {
  const categoryColumns = getVisibleCategoryColumns(
    categoryRows,
    reportMeta?.period,
  );
  const categoryExportRows = buildCategoryExportRows(categoryRows, categoryColumns);
  const categoryTotals = buildCategoryTotalsRow(categoryRows, categoryColumns);
  const locationGroupedSections = includeBreakdown
    ? buildGroupedLocationSections(locationHierarchy)
    : [];
  const locationRegionGrandTotalSections = includeBreakdown
    ? buildRegionGrandTotalSections(locationHierarchy)
    : [];

  return {
    reportTitle: reportMeta?.reportTitle || "Statistics Report",
    reportMeta,
    includeBreakdown,
    categoryColumns,
    categoryRows: categoryExportRows,
    categoryTotals,
    locationGroupedSections,
    locationRegionGrandTotalSections,
  };
}

function metaLines(snapshot) {
  const meta = snapshot.reportMeta || {};
  return [
    ["Organisation", meta.organisationName || ""],
    ["Report", snapshot.reportTitle],
    ["Generated", meta.generatedAt || dayjs().format("DD MMM YYYY, HH:mm")],
    ["Operator", meta.operator || ""],
    ["Report filters", meta.filtersSummary || meta.reportBy || ""],
    ["Date from", meta.dateFrom || ""],
    ["Date to", meta.dateTo || ""],
    ["Breakdown", meta.breakdown || ""],
    ["Category rows", String(snapshot.categoryRows?.length || 0)],
    [
      "Location rows",
      String(snapshot.locationGroupedSections?.length || 0),
    ],
  ];
}

function categoryRowFlags(row = {}) {
  return { isTotal: row.name === "Total" };
}

function locationRowFlags(row = {}) {
  return groupedLocationRowFlags(row);
}

export function exportStatisticsReportToXlsx(snapshot) {
  const slug = slugify(snapshot.reportTitle);
  const wb = createWorkbook();
  const categoryColumns = toStatisticsExcelColumns(
    snapshot.categoryColumns || STATS_CATEGORY_COLUMNS,
  );

  appendSheet(wb, buildMetaInfoSheet(metaLines(snapshot)), "Info");

  const categoryData = [
    ...snapshot.categoryRows,
    snapshot.categoryTotals,
  ].filter(Boolean);
  appendSheet(
    wb,
    buildStyledTableSheet({
      columns: categoryColumns,
      rows: categoryData,
      getRowFlags: categoryRowFlags,
    }),
    "Membership category",
  );

  if (snapshot.includeBreakdown && snapshot.locationGroupedSections?.length) {
    appendSheet(
      wb,
      buildStyledTableSheet({
        columns: toStatisticsExcelColumns(GROUPED_LOCATION_EXPORT_COLUMNS),
        rows: snapshot.locationGroupedSections,
        getRowFlags: locationRowFlags,
      }),
      "Location breakdown",
    );

    if (snapshot.locationRegionGrandTotalSections?.length) {
      appendSheet(
        wb,
        buildStyledTableSheet({
        columns: toStatisticsExcelColumns(STATS_REGION_GRAND_TOTAL_COLUMNS),
        rows: snapshot.locationRegionGrandTotalSections,
        getRowFlags: locationRowFlags,
      }),
      "Grand total by region",
      );
    }
  }

  writeStyledWorkbook(wb, `${slug}_${dayjs().format("YYYY-MM-DD")}.xlsx`);
}

function rowsToAoa(columns, rows) {
  return [
    columns.map((c) => c.label),
    ...rows.map((row) =>
      columns.map((col) => {
        const v = row[col.key];
        return v == null ? "" : v;
      }),
    ),
  ];
}

export function exportStatisticsReportToCsv(snapshot) {
  const slug = slugify(snapshot.reportTitle);
  const categoryColumns = snapshot.categoryColumns || STATS_CATEGORY_COLUMNS;
  const sections = [
    ...metaLines(snapshot),
    [],
    ["Membership category"],
    ...rowsToAoa(categoryColumns, [
      ...snapshot.categoryRows,
      snapshot.categoryTotals,
    ]),
  ];

  if (snapshot.includeBreakdown && snapshot.locationGroupedSections?.length) {
    sections.push(
      [],
      ["By region, branch and work location"],
      ...rowsToAoa(GROUPED_LOCATION_EXPORT_COLUMNS, snapshot.locationGroupedSections),
    );
  }

  if (snapshot.includeBreakdown && snapshot.locationRegionGrandTotalSections?.length) {
    sections.push(
      [],
      ["Grand total by region"],
      ...rowsToAoa(
        STATS_REGION_GRAND_TOTAL_COLUMNS,
        snapshot.locationRegionGrandTotalSections,
      ),
    );
  }

  const ws = XLSX.utils.aoa_to_sheet(sections);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${slug}_${dayjs().format("YYYY-MM-DD")}.csv`, {
    bookType: "csv",
  });
}

function pdfMetaBlock(doc, snapshot, startY) {
  const meta = snapshot.reportMeta || {};
  let y = startY;

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(26, 77, 143);
  doc.text(meta.organisationName || "Organisation", PDF_PAGE.margin, y);
  y += 7;

  doc.setFontSize(13);
  doc.text(snapshot.reportTitle, PDF_PAGE.margin, y);
  y += 9;

  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  [
    ["Generated", meta.generatedAt || dayjs().format("DD MMM YYYY, HH:mm")],
    ["Operator", meta.operator || ""],
    ["Report filters", meta.filtersSummary || meta.reportBy || ""],
    ["Date from", meta.dateFrom || ""],
    ["Date to", meta.dateTo || ""],
    ["Breakdown", meta.breakdown || ""],
  ].forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, PDF_PAGE.margin, y);
    y += 4.5;
  });
  return y + 4;
}

function pdfTable(doc, columns, rows, startY, title, getRowFlags) {
  if (title) {
    doc.setFontSize(11);
    doc.setTextColor(26, 77, 143);
    doc.text(title, PDF_PAGE.margin, startY);
    startY += 5;
  }

  autoTable(doc, {
    head: [columns.map((c) => c.label)],
    body: rows.map((row) =>
      columns.map((col) => {
        const v = row[col.key];
        return v == null ? "" : String(v);
      }),
    ),
    startY,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 1.2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [26, 77, 143],
      textColor: 255,
      fontSize: 7,
      halign: "right",
    },
    columnStyles: Object.fromEntries(
      columns.map((col, index) => [
        index,
        {
          halign:
            col.key === "name" ||
            col.key === "region" ||
            col.key === "branch" ||
            col.key === "workLocation"
              ? "left"
              : "right",
        },
      ]),
    ),
    margin: {
      left: PDF_PAGE.margin,
      right: PDF_PAGE.margin,
      bottom: 14,
    },
    didParseCell(data) {
      if (data.section !== "body") return;
      const row = rows[data.row.index];
      if (!row) return;
      const flags = getRowFlags ? getRowFlags(row) : {};
      const col = columns[data.column.index];

      if (flags.isRegionHeader) {
        data.cell.styles.fillColor = [220, 230, 240];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [26, 77, 143];
        if (col?.kind === "text" || ["region", "branch", "workLocation"].includes(col?.key)) {
          data.cell.styles.halign = "left";
        }
        return;
      }

      if (flags.isBranchHeader) {
        const isTextCol =
          col?.kind === "text" ||
          ["region", "branch", "workLocation"].includes(col?.key);

        if (isTextCol) {
          data.cell.styles.fillColor = [238, 243, 248];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = [26, 77, 143];
          if (col?.key === "branch" || col?.key === "workLocation") {
            data.cell.styles.halign = "left";
          }
          return;
        }

        if (!flags.isBranchTotal) {
          return;
        }
      }

      if (flags.isGrandTotal) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [216, 232, 242];
        return;
      }

      if (
        flags.isBranchTotal &&
        (col?.totalHighlight || STATS_TOTAL_HIGHLIGHT_KEYS.has(col?.key))
      ) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [216, 232, 242];
        data.cell.styles.textColor = [26, 77, 143];
        return;
      }

      if (flags.isTotal) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [234, 240, 247];
      }
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

export function exportStatisticsReportToPdf(snapshot) {
  const doc = new jsPDF(PDF_LAYOUT);
  let y = pdfMetaBlock(doc, snapshot, 12);
  const categoryColumns = snapshot.categoryColumns || STATS_CATEGORY_COLUMNS;

  y = pdfTable(
    doc,
    categoryColumns,
    [...snapshot.categoryRows, snapshot.categoryTotals],
    y,
    "Membership category",
    categoryRowFlags,
  );

  if (snapshot.includeBreakdown && snapshot.locationGroupedSections?.length) {
    const regionChunks = splitGroupedLocationSectionsByRegion(
      snapshot.locationGroupedSections,
    );
    regionChunks.forEach((chunk, index) => {
      if (index > 0) {
        doc.addPage();
        y = 12;
      } else if (y > PDF_PAGE.height - 40) {
        doc.addPage();
        y = 12;
      }
      y = pdfTable(
        doc,
        GROUPED_LOCATION_EXPORT_COLUMNS,
        chunk,
        y,
        index === 0 ? "By region, branch and work location" : null,
        locationRowFlags,
      );
    });
  }

  if (snapshot.includeBreakdown && snapshot.locationRegionGrandTotalSections?.length) {
    if (y > PDF_PAGE.height - 40) {
      doc.addPage();
      y = 12;
    }
    pdfTable(
      doc,
      STATS_REGION_GRAND_TOTAL_COLUMNS,
      snapshot.locationRegionGrandTotalSections,
      y,
      "Grand total by region",
      locationRowFlags,
    );
  }

  stampPdfPageNumbers(doc);
  doc.save(`${slugify(snapshot.reportTitle)}_${dayjs().format("YYYY-MM-DD")}.pdf`);
}

function closePrintOverlays() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Escape",
      code: "Escape",
      bubbles: true,
    }),
  );
  if (document.activeElement && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
}

export function printStatisticsReportDom() {
  const root = document.getElementById("statistics-report-print-root");
  if (!root) {
    throw new Error("Report is not ready to print.");
  }

  closePrintOverlays();

  activateMembershipReportPrint({ statistics: true });

  bindMembershipReportPrintCleanup(() => {
    deactivateMembershipReportPrint({ statistics: true });
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });
}

export function statisticsExportHasData(snapshot) {
  return Boolean(snapshot?.categoryRows?.length);
}
