import dayjs from "dayjs";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
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
import {
  formatDelta,
  formatDeltaPercent,
  formatReportNum,
} from "./workplaceBreakdownReportUtils";

function slugify(title) {
  return String(title || "report")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

export function workplaceBreakdownExportHasData(snapshot) {
  return Boolean(snapshot?.regions?.some((r) => r.rows?.length));
}

export function buildWorkplaceBreakdownExportSnapshot({
  reportMeta,
  regions = [],
  officialSummary = [],
  trendSeries = null,
  periodColumns = [],
  momColumnLabel = "MoM",
  yoyColumnLabel = "YoY",
}) {
  return {
    reportTitle: reportMeta?.reportTitle,
    organisationName: reportMeta?.organisationName,
    generatedAt: reportMeta?.generatedAt,
    operator: reportMeta?.operator,
    filterLines: reportMeta?.filterLines || [],
    periodLabel: `${reportMeta?.dateFrom} – ${reportMeta?.dateTo}`,
    rollingMonths: reportMeta?.rollingMonths,
    summary: reportMeta?.summary,
    officialSummary,
    trendSeries,
    regions,
    periodColumns,
    momColumnLabel,
    yoyColumnLabel,
  };
}

function buildWorkplaceBreakdownColumns(
  periodColumns = [],
  momColumnLabel = "MoM",
  yoyColumnLabel = "YoY",
) {
  return [
    { key: "workLocation", label: "Work Location", kind: "text", width: 28 },
    ...periodColumns.map((col, index) => ({
      key: `period_${index}`,
      label: col.label,
      width: 14,
    })),
    { key: "momAbs", label: `${momColumnLabel} Abs`, width: 10 },
    { key: "momPct", label: `${momColumnLabel} %`, width: 10 },
    { key: "yoyAbs", label: `${yoyColumnLabel} Abs`, width: 10 },
    { key: "yoyPct", label: `${yoyColumnLabel} %`, width: 10 },
    { key: "official", label: "Official", kind: "text", width: 10 },
  ];
}

function mapRowToExport(row, periodColumns) {
  const out = {
    workLocation: row.workLocation,
    momAbs: row.mom?.absolute ?? 0,
    momPct: row.mom?.percent ?? 0,
    yoyAbs: row.yoy?.absolute ?? 0,
    yoyPct: row.yoy?.percent ?? 0,
    official: row.official?.initials || "—",
  };
  periodColumns.forEach((col, index) => {
    out[`period_${index}`] =
      row.monthlyCounts?.find(
        (c) => c.year === col.year && c.month === col.month,
      )?.count ?? 0;
  });
  return out;
}

function buildWorkplaceBreakdownExportRows(section, periodColumns) {
  const rows = (section.rows || []).map((row) =>
    mapRowToExport(row, periodColumns),
  );

  if (section.totals) {
    rows.push({
      workLocation: "Region total",
      momAbs: section.totals.mom?.absolute ?? 0,
      momPct: section.totals.mom?.percent ?? 0,
      yoyAbs: section.totals.yoy?.absolute ?? 0,
      yoyPct: section.totals.yoy?.percent ?? 0,
      official: "",
      ...Object.fromEntries(
        periodColumns.map((col, index) => [
          `period_${index}`,
          section.totals.monthlyCounts?.find(
            (c) => c.year === col.year && c.month === col.month,
          )?.count ?? 0,
        ]),
      ),
    });
  }

  return rows;
}

function workplaceRowFlags(row = {}) {
  return { isTotal: row.workLocation === "Region total" };
}

function metaLines(snapshot) {
  const summary = snapshot.summary || {};
  return [
    ["Organisation", snapshot.organisationName || ""],
    ["Report", snapshot.reportTitle || ""],
    ["Generated", snapshot.generatedAt || ""],
    ["Operator", snapshot.operator || ""],
    ["Period", snapshot.periodLabel || ""],
    ["Rolling months", String(snapshot.rollingMonths ?? "")],
    ["Filters", (snapshot.filterLines || []).join("; ")],
    ["Workplaces", String(summary.totalWorkplaces ?? "")],
    ["Total members", String(summary.totalMembersCurrent ?? "")],
    [
      snapshot.momColumnLabel || "MoM",
      `${formatDelta(summary.mom?.absolute)} (${formatDeltaPercent(summary.mom?.percent)})`,
    ],
    [
      snapshot.yoyColumnLabel || "YoY",
      `${formatDelta(summary.yoy?.absolute)} (${formatDeltaPercent(summary.yoy?.percent)})`,
    ],
  ];
}

function buildSummarySheetRows(snapshot) {
  const summary = snapshot.summary || {};
  return [
    ["Metric", "Value"],
    ["Workplaces", summary.totalWorkplaces ?? 0],
    ["Total members", summary.totalMembersCurrent ?? 0],
    [`${snapshot.momColumnLabel} (abs)`, summary.mom?.absolute ?? 0],
    [`${snapshot.momColumnLabel} (%)`, summary.mom?.percent ?? 0],
    [`${snapshot.yoyColumnLabel} (abs)`, summary.yoy?.absolute ?? 0],
    [`${snapshot.yoyColumnLabel} (%)`, summary.yoy?.percent ?? 0],
  ];
}

function buildOfficialSheetRows(snapshot) {
  const header = [
    "Official",
    "Workplaces",
    "Members",
    `${snapshot.momColumnLabel} Abs`,
    `${snapshot.momColumnLabel} %`,
    `${snapshot.yoyColumnLabel} Abs`,
    `${snapshot.yoyColumnLabel} %`,
  ];
  const rows = [header];
  for (const entry of snapshot.officialSummary || []) {
    rows.push([
      entry.official?.displayName || entry.official?.initials || "—",
      entry.workplaceCount ?? 0,
      entry.totalMembersCurrent ?? 0,
      entry.mom?.absolute ?? 0,
      entry.mom?.percent ?? 0,
      entry.yoy?.absolute ?? 0,
      entry.yoy?.percent ?? 0,
    ]);
  }
  return rows;
}

function buildTrendSheetRows(snapshot) {
  const header = ["Month", "Organisation total"];
  const rows = [header];
  for (const point of snapshot.trendSeries?.orgMonthlyTotals || []) {
    rows.push([point.label || `${point.month}/${point.year}`, point.count ?? 0]);
  }
  return rows;
}

function buildRegionSheetRows(section, snapshot) {
  const { periodColumns, momColumnLabel, yoyColumnLabel } = snapshot;
  const header = [
    "Work Location",
    ...periodColumns.map((c) => c.label),
    `${momColumnLabel} Abs`,
    `${momColumnLabel} %`,
    `${yoyColumnLabel} Abs`,
    `${yoyColumnLabel} %`,
    "Official",
  ];
  const rows = [header];

  for (const row of section.rows || []) {
    rows.push([
      row.workLocation,
      ...periodColumns.map((col) => {
        const count =
          row.monthlyCounts?.find(
            (c) => c.year === col.year && c.month === col.month,
          )?.count ?? 0;
        return count;
      }),
      row.mom?.absolute ?? 0,
      row.mom?.percent ?? 0,
      row.yoy?.absolute ?? 0,
      row.yoy?.percent ?? 0,
      row.official?.initials || "—",
    ]);
  }

  if (section.totals) {
    rows.push([
      "Region total",
      ...periodColumns.map((col) => {
        const count =
          section.totals.monthlyCounts?.find(
            (c) => c.year === col.year && c.month === col.month,
          )?.count ?? 0;
        return count;
      }),
      section.totals.mom?.absolute ?? 0,
      section.totals.mom?.percent ?? 0,
      section.totals.yoy?.absolute ?? 0,
      section.totals.yoy?.percent ?? 0,
      "",
    ]);
  }

  return rows;
}

export function exportWorkplaceBreakdownReportToXlsx(snapshot) {
  if (!workplaceBreakdownExportHasData(snapshot)) {
    throw new Error("No data to export");
  }

  const wb = createWorkbook();
  appendSheet(wb, buildMetaInfoSheet(metaLines(snapshot)), "Report Info");
  appendSheet(
    wb,
    buildStyledTableSheet({
      columns: [
        { key: "metric", label: "Metric", kind: "text", width: 24 },
        { key: "value", label: "Value", width: 20 },
      ],
      rows: buildSummarySheetRows(snapshot).slice(1).map(([metric, value]) => ({
        metric,
        value,
      })),
    }),
    "Summary",
  );

  if (snapshot.officialSummary?.length) {
    appendSheet(
      wb,
      buildStyledTableSheet({
        columns: [
          { key: "official", label: "Official", kind: "text", width: 24 },
          { key: "workplaces", label: "Workplaces", width: 12 },
          { key: "members", label: "Members", width: 12 },
          { key: "momAbs", label: "MoM Abs", width: 10 },
          { key: "momPct", label: "MoM %", width: 10 },
          { key: "yoyAbs", label: "YoY Abs", width: 10 },
          { key: "yoyPct", label: "YoY %", width: 10 },
        ],
        rows: (snapshot.officialSummary || []).map((entry) => ({
          official:
            entry.official?.displayName || entry.official?.initials || "—",
          workplaces: entry.workplaceCount ?? 0,
          members: entry.totalMembersCurrent ?? 0,
          momAbs: entry.mom?.absolute ?? 0,
          momPct: entry.mom?.percent ?? 0,
          yoyAbs: entry.yoy?.absolute ?? 0,
          yoyPct: entry.yoy?.percent ?? 0,
        })),
      }),
      "By Official",
    );
  }

  if (snapshot.trendSeries?.orgMonthlyTotals?.length) {
    appendSheet(
      wb,
      buildStyledTableSheet({
        columns: [
          { key: "month", label: "Month", kind: "text", width: 16 },
          { key: "count", label: "Members", width: 12 },
        ],
        rows: (snapshot.trendSeries.orgMonthlyTotals || []).map((p) => ({
          month: p.label || `${p.month}/${p.year}`,
          count: p.count ?? 0,
        })),
      }),
      "Org Trend",
    );
  }

  const columns = buildWorkplaceBreakdownColumns(
    snapshot.periodColumns,
    snapshot.momColumnLabel,
    snapshot.yoyColumnLabel,
  );

  for (const section of snapshot.regions) {
    const sheetName = String(section.region || "Region")
      .slice(0, 28)
      .replace(/[\\/?*[\]]/g, "");
    appendSheet(
      wb,
      buildStyledTableSheet({
        columns,
        rows: buildWorkplaceBreakdownExportRows(section, snapshot.periodColumns),
        getRowFlags: workplaceRowFlags,
      }),
      sheetName || "Region",
    );
  }

  const filename = `${slugify(snapshot.reportTitle)}_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
  writeStyledWorkbook(wb, filename);
}

export function exportWorkplaceBreakdownReportToCsv(snapshot) {
  if (!workplaceBreakdownExportHasData(snapshot)) {
    throw new Error("No data to export");
  }

  const lines = [];
  lines.push(`"${snapshot.reportTitle}"`);
  lines.push(`Generated,${snapshot.generatedAt}`);
  lines.push(`Period,${snapshot.periodLabel}`);
  lines.push("");

  lines.push('"Summary"');
  for (const row of buildSummarySheetRows(snapshot)) {
    lines.push(row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
  }
  lines.push("");

  if (snapshot.officialSummary?.length) {
    lines.push('"By Official"');
    for (const row of buildOfficialSheetRows(snapshot)) {
      lines.push(row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    }
    lines.push("");
  }

  for (const section of snapshot.regions) {
    lines.push(`"${section.label}"`);
    const rows = buildRegionSheetRows(section, snapshot);
    for (const row of rows) {
      lines.push(row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    }
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(snapshot.reportTitle)}_${dayjs().format("YYYYMMDD_HHmm")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportWorkplaceBreakdownReportToPdf(snapshot) {
  if (!workplaceBreakdownExportHasData(snapshot)) {
    throw new Error("No data to export");
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let y = 12;

  doc.setFontSize(14);
  doc.text(snapshot.reportTitle || "Report", 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.text(`Generated: ${snapshot.generatedAt}`, 14, y);
  y += 5;
  doc.text(`Period: ${snapshot.periodLabel}`, 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: buildSummarySheetRows(snapshot).slice(1),
    theme: "grid",
    styles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
  });
  y = doc.lastAutoTable.finalY + 8;

  for (const [index, section] of snapshot.regions.entries()) {
    if (y > 170) {
      doc.addPage();
      y = 12;
    }

    doc.setFontSize(11);
    doc.text(section.label || section.region, 14, y);
    y += 4;

    const head = [
      [
        "Work Location",
        ...snapshot.periodColumns.map((c) => c.label),
        `${snapshot.momColumnLabel} Δ`,
        `${snapshot.momColumnLabel} %`,
        `${snapshot.yoyColumnLabel} Δ`,
        `${snapshot.yoyColumnLabel} %`,
        "Official",
      ],
    ];
    const body = (section.rows || []).map((row) => [
      row.workLocation,
      ...snapshot.periodColumns.map((col) =>
        formatReportNum(
          row.monthlyCounts?.find(
            (c) => c.year === col.year && c.month === col.month,
          )?.count ?? 0,
        ),
      ),
      formatDelta(row.mom?.absolute),
      formatDeltaPercent(row.mom?.percent),
      formatDelta(row.yoy?.absolute),
      formatDeltaPercent(row.yoy?.percent),
      row.official?.initials || "—",
    ]);

    if (section.totals) {
      body.push([
        "Region total",
        ...snapshot.periodColumns.map((col) =>
          formatReportNum(
            section.totals.monthlyCounts?.find(
              (c) => c.year === col.year && c.month === col.month,
            )?.count ?? 0,
          ),
        ),
        formatDelta(section.totals.mom?.absolute),
        formatDeltaPercent(section.totals.mom?.percent),
        formatDelta(section.totals.yoy?.absolute),
        formatDeltaPercent(section.totals.yoy?.percent),
        "",
      ]);
    }

    autoTable(doc, {
      startY: y,
      head,
      body,
      theme: "grid",
      styles: { fontSize: 6, cellPadding: 1.2 },
      headStyles: { fillColor: [245, 245, 245], textColor: 20 },
      margin: { left: 10, right: 10 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  doc.save(`${slugify(snapshot.reportTitle)}_${dayjs().format("YYYYMMDD_HHmm")}.pdf`);
}

export function printWorkplaceBreakdownReportDom() {
  activateMembershipReportPrint("workplace-breakdown-report-print-root");
  bindMembershipReportPrintCleanup(() => {
    deactivateMembershipReportPrint();
  });
  window.print();
}
