import { formatReportNum, getReportCellValue } from "./statisticsReportUtils";

export function exportCellValue(row, key) {
  const value = getReportCellValue(row, key);
  const textKeys = new Set(["name", "region", "branch", "workLocation"]);
  if (textKeys.has(key)) return value == null ? "" : String(value);
  return formatReportNum(value);
}
