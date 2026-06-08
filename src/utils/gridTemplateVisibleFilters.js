const STORAGE_PREFIX = "ps:gridVisibleFilters:";

export function visibleFiltersStorageKey(templateType, templateId) {
  const type = String(templateType || "").trim().toLowerCase();
  const id = String(templateId || "").trim();
  if (!type || !id) return "";
  return `${STORAGE_PREFIX}${type}:${id}`;
}

export function persistVisibleFiltersToStorage(
  templateType,
  templateId,
  visibleFilters,
) {
  const key = visibleFiltersStorageKey(templateType, templateId);
  if (!key || !Array.isArray(visibleFilters)) return;
  try {
    localStorage.setItem(key, JSON.stringify(visibleFilters));
  } catch (_) {
    // ignore quota / private mode
  }
}

export function loadVisibleFiltersFromStorage(templateType, templateId) {
  const key = visibleFiltersStorageKey(templateType, templateId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (_) {
    return null;
  }
}

/** Read toolbar chip layout from template payload or local fallback. */
export function resolveTemplateVisibleFilters(template, templateType) {
  if (!template) return null;

  const fromMeta = template?.meta?.visibleToolbarFilters;
  if (Array.isArray(fromMeta) && fromMeta.length > 0) {
    return fromMeta;
  }

  const fromTop = template?.visibleFilters;
  if (Array.isArray(fromTop) && fromTop.length > 0) {
    return fromTop;
  }

  return loadVisibleFiltersFromStorage(templateType, template?._id);
}

export function buildTemplateMetaWithVisibleFilters(
  existingMeta,
  visibleFilters = [],
) {
  return {
    ...(existingMeta && typeof existingMeta === "object" ? existingMeta : {}),
    visibleToolbarFilters: Array.isArray(visibleFilters) ? visibleFilters : [],
  };
}
