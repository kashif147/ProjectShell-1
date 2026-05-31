import gridColumnDefaultsJson from "./grid-column-defaults.json";

/** Screen-keyed column metadata — keep in sync with TableColumnsContext render overrides. */
export const GRID_COLUMN_DEFAULTS = Object.fromEntries(
  Object.values(gridColumnDefaultsJson.pages || {}).map((page) => [
    page.screenKey,
    page.columns || [],
  ]),
);

export const GRID_SYSTEM_DEFAULT_PAGES = gridColumnDefaultsJson.pages || {};

export function columnKeyFromDef(col) {
  if (!col?.dataIndex) return "";
  return Array.isArray(col.dataIndex)
    ? col.dataIndex.join(".")
    : String(col.dataIndex);
}

export function buildColumnLabelsMap(cols = []) {
  return cols.reduce((acc, col) => {
    const key = columnKeyFromDef(col);
    if (key) acc[key] = String(col.title || key);
    return acc;
  }, {});
}

export function buildVisibleColumnKeys(cols = []) {
  return cols
    .filter((col) => col.isGride === true)
    .map((col) => columnKeyFromDef(col))
    .filter(Boolean);
}

/** Merge JSON column defaults with TableColumnsContext render/enhancement overrides. */
export function mergeGridColumnDefaults(baseCols = [], overridesByKey = {}) {
  return baseCols.map((col) => {
    const key = columnKeyFromDef(col);
    const override = overridesByKey[key] || {};
    return { ...col, ...override };
  });
}

/** Build canonical system-default template payload for Mongo seed scripts. */
export function buildSystemDefaultTemplatePayload(pageKey, { tenantId = null } = {}) {
  const page = GRID_SYSTEM_DEFAULT_PAGES[pageKey];
  if (!page) {
    throw new Error(`Unknown grid system default page key: ${pageKey}`);
  }

  const columns = buildVisibleColumnKeys(page.columns);
  const columnLabels = buildColumnLabelsMap(page.columns);

  return {
    name: "System default",
    templateType: page.templateType,
    tenantId: tenantId || undefined,
    userId: undefined,
    filters: page.filters || {},
    columns,
    columnLabels,
    isDefault: false,
    pinned: false,
    systemDefault: true,
    meta: { deleted: false, deletedAt: null },
  };
}
