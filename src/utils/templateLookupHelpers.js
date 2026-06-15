import {
  findLookupTypeByName,
  getLookupId,
  getLookupName,
  getLookupTypeName,
  resolveParentLookupIdFromRecord,
} from "./lookupHierarchy";
import { getLookupsForLookupType } from "./configurationLookupHelpers";

export const TEMPLATE_TYPE_LOOKUP_NAME = "Template Type";
export const TEMPLATE_CATEGORY_LOOKUP_NAME = "Template Category";

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

function getLookupsOfType(lookups, lookupTypes, typeName) {
  const lookupType = findLookupTypeByName(lookupTypes, typeName);
  if (lookupType) {
    return getLookupsForLookupType(lookupType, lookups);
  }

  const target = normalizeKey(typeName);
  return (lookups || []).filter(
    (item) => normalizeKey(getLookupTypeName(item)) === target,
  );
}

function isActiveLookup(item) {
  return item?.isactive !== false && item?.isdeleted !== true;
}

function toSelectOption(item) {
  const label = getLookupName(item) || item.code || "";
  return { key: label, value: label, label };
}

export function buildTemplateTypeOptions(lookups = [], lookupTypes = []) {
  return getLookupsOfType(lookups, lookupTypes, TEMPLATE_TYPE_LOOKUP_NAME)
    .filter(isActiveLookup)
    .map(toSelectOption)
    .sort((a, b) =>
      String(a.label || "").localeCompare(String(b.label || ""), undefined, {
        sensitivity: "base",
      }),
    );
}

export function findTemplateTypeLookup(
  lookups = [],
  lookupTypes = [],
  selectedTemplateType,
) {
  if (!selectedTemplateType) return null;

  const options = getLookupsOfType(
    lookups,
    lookupTypes,
    TEMPLATE_TYPE_LOOKUP_NAME,
  );
  const key = normalizeKey(selectedTemplateType);

  return (
    options.find(
      (item) =>
        normalizeKey(getLookupName(item)) === key ||
        normalizeKey(item.code) === key ||
        String(getLookupId(item)) === String(selectedTemplateType),
    ) || null
  );
}

export function buildTemplateCategoryOptions(
  lookups = [],
  lookupTypes = [],
  selectedTemplateType,
) {
  if (!selectedTemplateType) return [];

  const parentLookup = findTemplateTypeLookup(
    lookups,
    lookupTypes,
    selectedTemplateType,
  );
  const parentId = parentLookup ? getLookupId(parentLookup) : null;

  const categories = getLookupsOfType(
    lookups,
    lookupTypes,
    TEMPLATE_CATEGORY_LOOKUP_NAME,
  ).filter(isActiveLookup);

  const filtered = parentId
    ? categories.filter(
        (item) =>
          String(resolveParentLookupIdFromRecord(item) || "") ===
          String(parentId),
      )
    : categories;

  return filtered
    .map(toSelectOption)
    .sort((a, b) =>
      String(a.label || "").localeCompare(String(b.label || ""), undefined, {
        sensitivity: "base",
      }),
    );
}

export function ensureSelectOption(options = [], storedValue) {
  if (!storedValue) return options;

  const key = normalizeKey(storedValue);
  const hasMatch = options.some(
    (opt) =>
      normalizeKey(opt.key) === key ||
      normalizeKey(opt.value) === key ||
      normalizeKey(opt.label) === key,
  );

  if (hasMatch) return options;

  return [
    {
      key: storedValue,
      value: storedValue,
      label: storedValue,
    },
    ...options,
  ];
}

export function buildAllTemplateCategoryFilterOptions(
  lookups = [],
  lookupTypes = [],
) {
  return getLookupsOfType(
    lookups,
    lookupTypes,
    TEMPLATE_CATEGORY_LOOKUP_NAME,
  )
    .filter(isActiveLookup)
    .map(toSelectOption)
    .sort((a, b) =>
      String(a.label || "").localeCompare(String(b.label || ""), undefined, {
        sensitivity: "base",
      }),
    );
}
