const LOOKUP_TYPE_GROUP_KEYS = {
  REGION: "Region",
  BRANCH: "Branch",
  WORKLOC: "workLocation",
};

/**
 * Known parent lookup types per child (from product hierarchy).
 * Keys are normalized child type names; values are parent type names as returned by API.
 */
const KNOWN_PARENT_LOOKUP_TYPES = {
  branch: "Region",
  worklocation: "Branch",
  county: "Provinces",
  counties: "Provinces",
  divisions: "County",
  districts: "Divisions",
  station: "Districts",
  stations: "Districts",
  cities: "County",
  city: "County",
};

/** Fallback when API type name does not match hierarchy keys (drawer vs API naming). */
const DRAWER_PARENT_TYPE_NAMES = {
  Station: "Branch",
  StudyLocation: "Branch",
  Districts: "Divisions",
  Divisions: "County",
  DivisionsForDistrict: "County",
  counties: "Provinces",
  Cities: "County",
};

const normalizeTypeKey = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

export const getLookupTypeGroupKey = (lookupType) => {
  if (!lookupType) return null;
  if (LOOKUP_TYPE_GROUP_KEYS[lookupType.code]) {
    return LOOKUP_TYPE_GROUP_KEYS[lookupType.code];
  }
  return lookupType.lookuptype || null;
};

export const findLookupTypeByCode = (lookupTypes, code) =>
  (lookupTypes || []).find(
    (item) => String(item.code || "").toUpperCase() === String(code).toUpperCase()
  );

export const findLookupTypeByName = (lookupTypes, typeName) => {
  const target = normalizeTypeKey(typeName);
  if (!target) return null;
  return (
    (lookupTypes || []).find((item) => {
      const candidates = [
        item.lookuptype,
        item.DisplayName,
        item.key,
        getLookupTypeGroupKey(item),
      ];
      return candidates.some((c) => normalizeTypeKey(c) === target);
    }) || null
  );
};

export const findLookupTypeById = (lookupTypes, lookuptypeId) => {
  if (!lookuptypeId) return null;
  const id = lookuptypeId?._id || lookuptypeId;
  return (
    (lookupTypes || []).find((item) => {
      const itemId = item._id?.toString?.() || String(item._id);
      return itemId === id?.toString?.() || itemId === String(id);
    }) || null
  );
};

export const getKnownParentTypeName = (childTypeName) => {
  const key = normalizeTypeKey(childTypeName);
  return KNOWN_PARENT_LOOKUP_TYPES[key] || null;
};

/** Whether a lookup type name (e.g. Branch) has a parent in the hierarchy. */
export const lookupTypeNameRequiresParent = (childTypeName) =>
  !!getKnownParentTypeName(childTypeName);

/** Options for ParentlookuptypeId on the Lookup Type drawer. */
export const getParentLookupTypeSelectOptions = (lookupTypes, childTypeName) => {
  const parentName = getKnownParentTypeName(childTypeName);
  if (!parentName) return [];

  const parentType = findLookupTypeByName(lookupTypes, parentName);
  if (!parentType) {
    return [
      {
        value: "",
        key: "missing-parent-type",
        label: `${parentName} (create this type first)`,
        disabled: true,
      },
    ];
  }

  return [
    {
      value: parentType._id,
      key: parentType._id,
      label: parentType.lookuptype || parentType.DisplayName || parentName,
    },
  ];
};

export const resolveParentLookupTypeIdFromRecord = (record) => {
  if (!record) return null;
  const direct = record.ParentlookuptypeId;
  if (direct != null && direct !== "") {
    if (typeof direct === "object" && direct._id) return String(direct._id);
    const normalized = String(direct);
    if (/^[a-f\d]{24}$/i.test(normalized)) return normalized;
  }
  const parentName =
    record.Parentlookuptype ||
    record.ParentlookuptypeName ||
    record.parentlookuptype;
  return null;
};

export const resolveParentLookupTypeLabelFromRecord = (record, lookupTypes = []) => {
  if (!record) return "";
  const id = resolveParentLookupTypeIdFromRecord(record);
  if (id) {
    const match = findLookupTypeById(lookupTypes, id);
    if (match) return match.lookuptype || match.DisplayName || "";
  }
  if (typeof record.Parentlookuptype === "string") return record.Parentlookuptype;
  return getKnownParentTypeName(record.lookuptype) || "";
};

export const getParentLookupType = (lookupTypes, lookuptypeId, drawerKey = "") => {
  if (!lookuptypeId && !drawerKey) return null;

  const lookupType =
    typeof lookuptypeId === "object" && lookuptypeId !== null && lookuptypeId.lookuptype
      ? lookuptypeId
      : findLookupTypeById(lookupTypes, lookuptypeId);

  if (lookupType) {
    const parentId =
      lookupType.ParentlookuptypeId?._id || lookupType.ParentlookuptypeId;
    if (parentId) {
      const fromId = findLookupTypeById(lookupTypes, parentId);
      if (fromId) return fromId;
    }

    const parentName =
      lookupType.Parentlookuptype ||
      lookupType.ParentlookuptypeName ||
      lookupType.parentlookuptype;
    if (parentName) {
      const fromName = findLookupTypeByName(lookupTypes, parentName);
      if (fromName) return fromName;
    }

    const knownParentName = getKnownParentTypeName(lookupType.lookuptype);
    if (knownParentName) {
      const fromKnown = findLookupTypeByName(lookupTypes, knownParentName);
      if (fromKnown) return fromKnown;
    }
  }

  const drawerParentName = DRAWER_PARENT_TYPE_NAMES[drawerKey];
  if (drawerParentName) {
    return findLookupTypeByName(lookupTypes, drawerParentName);
  }

  return null;
};

export const lookupTypeRequiresParent = (lookupTypes, lookuptypeId, drawerKey = "") =>
  !!getParentLookupType(lookupTypes, lookuptypeId, drawerKey);

const normalizeId = (id) => {
  if (id == null || id === "") return null;
  if (typeof id === "object" && id._id) return String(id._id);
  return String(id);
};

/** Resolve Parentlookupid from API record without treating display string as ID. */
export const resolveParentLookupIdFromRecord = (record) => {
  if (!record) return null;

  const direct = record.Parentlookupid;
  if (direct != null && direct !== "") {
    const normalized = normalizeId(direct);
    if (normalized && /^[a-f\d]{24}$/i.test(normalized)) return normalized;
    if (typeof direct === "object" && direct._id) return String(direct._id);
  }

  const nested = record.Parentlookup;
  if (nested && typeof nested === "object" && nested._id) {
    return String(nested._id);
  }

  return null;
};

/** Resolve Parentlookup display label from API record. */
export const resolveParentLookupLabelFromRecord = (record) => {
  if (!record) return "";

  if (typeof record.Parentlookup === "string") {
    return record.Parentlookup;
  }
  if (record.Parentlookup && typeof record.Parentlookup === "object") {
    return (
      record.Parentlookup.lookupname ||
      record.Parentlookup.DisplayName ||
      record.Parentlookup.code ||
      ""
    );
  }
  return "";
};

// export const getParentLookupLabel = (parentType) => {
//   if (!parentType) return "Parent Lookup";
//   const name = parentType.lookuptype || parentType.DisplayName || "Lookup";
//   return ` ${name}`;
// };

export const findLookupOptionLabel = (lookups, parentId) => {
  if (!parentId) return "";
  const id = normalizeId(parentId);
  const match = (lookups || []).find(
    (item) => normalizeId(item._id) === id,
  );
  return match?.lookupname || match?.DisplayName || match?.code || "";
};

export const lookupBelongsToType = (item, lookupType) => {
  if (!item || !lookupType) return false;
  const typeId = lookupType._id?.toString?.() || String(lookupType._id);
  const itemTypeId = item.lookuptypeId?._id || item.lookuptypeId;
  if (
    itemTypeId &&
    (itemTypeId?.toString?.() === typeId || String(itemTypeId) === typeId)
  ) {
    return true;
  }
  const itemTypeName =
    item.lookuptypeName ||
    item.lookuptypeId?.lookuptype ||
    item.lookuptype?.name ||
    "";
  const typeName = lookupType.lookuptype || lookupType.DisplayName || "";
  return normalizeTypeKey(itemTypeName) === normalizeTypeKey(typeName);
};

export const getParentLookupOptions = (
  lookups,
  lookupTypes,
  lookuptypeId,
  drawerKey = "",
) => {
  const parentType = getParentLookupType(lookupTypes, lookuptypeId, drawerKey);
  if (!parentType) return [];

  return (lookups || [])
    .filter((item) => lookupBelongsToType(item, parentType))
    .map((item) => ({
      value: item._id,
      key: item._id,
      label: item.lookupname || item.DisplayName || item.code,
    }))
    .sort((a, b) =>
      String(a.label || "")
        .toLowerCase()
        .localeCompare(String(b.label || "").toLowerCase())
    );
};

export const groupLookupsByType = (lookups) => {
  if (!lookups || !Array.isArray(lookups)) return {};

  return lookups.reduce((acc, item) => {
    const groupKey =
      getLookupTypeGroupKey(item.lookuptypeId) ||
      item.lookuptypeName ||
      item.lookuptypeId?.lookuptype ||
      item.lookuptype?.name;

    if (groupKey) {
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
    }
    return acc;
  }, {});
};
