const LOOKUP_TYPE_GROUP_KEYS = {
  REGION: "Region",
  BRANCH: "Branch",
  WORKLOC: "workLocation",
};

export const isSimpleLocationTree = (item) =>
  !!item &&
  typeof item === "object" &&
  item.id &&
  item.type &&
  !item.lookup &&
  !item.requestedLookup;

export const isSimpleRecord = (item) =>
  !!item && typeof item === "object" && item.id && !item._id;

export const getLookupId = (item) => item?.id || item?._id;

export const getLookupName = (item) =>
  item?.name || item?.lookupname || item?.DisplayName || "";

export const getLookupTypeName = (item) =>
  item?.type ||
  item?.lookuptypeName ||
  item?.lookuptypeId?.lookuptype ||
  item?.lookuptype ||
  "";

export const getLookupTypeId = (item) =>
  item?.typeId || item?.lookuptypeId?._id || item?.lookuptypeId;

export const normalizeLookup = (item) => {
  if (!item || item._id) return item;

  return {
    ...item,
    _id: item.id,
    lookupname: item.name,
    DisplayName: item.name,
    lookuptypeName: item.type,
    lookuptypeId: item.typeId
      ? { _id: item.typeId, lookuptype: item.type, code: item.code }
      : item.lookuptypeId,
    Parentlookupid:
      item.branch?.id || item.region?.id || item.Parentlookupid || null,
    Parentlookup:
      item.branch?.name || item.region?.name || item.Parentlookup || null,
  };
};

export const normalizeLookupType = (item) => {
  if (!item || item._id) return item;

  return {
    ...item,
    _id: item.id,
    code: item.code,
    lookuptype: item.name || item.lookuptype,
    displayname: item.displayname || item.name,
    ParentlookuptypeId: item.parent?.id || item.ParentlookuptypeId || null,
    Parentlookuptype: item.parent?.name || item.Parentlookuptype || null,
    isactive: item.isactive,
    isdeleted: item.isdeleted,
  };
};

export const normalizeLookups = (items) =>
  (items || []).map((item) => normalizeLookup(item));

export const normalizeLookupTypes = (items) =>
  (items || []).map((item) => normalizeLookupType(item));

export const findHierarchyByTypeCode = (hierarchy, code) =>
  (hierarchy || []).find((h) => h?.lookuptypeId?.code === code) || null;

/**
 * Read region / branch / workLocation from simple nested tree or legacy hierarchy item.
 */
export const getHierarchyConvenienceFields = (item) => {
  if (!item) {
    return { region: null, branch: null, workLocation: null };
  }

  if (isSimpleLocationTree(item)) {
    if (item.type === "workLocation") {
      return {
        workLocation: item,
        branch: item.branch || null,
        region: item.branch?.region || item.region || null,
      };
    }
    if (item.type === "branch") {
      return {
        workLocation: null,
        branch: item,
        region: item.region || null,
      };
    }
    if (item.type === "region") {
      return {
        workLocation: null,
        branch: null,
        region: item,
      };
    }
  }

  const hierarchy = item.hierarchy || [];

  return {
    region: item.region || findHierarchyByTypeCode(hierarchy, "REGION"),
    branch: item.branch || findHierarchyByTypeCode(hierarchy, "BRANCH"),
    workLocation:
      item.workLocation ||
      item.lookup ||
      findHierarchyByTypeCode(hierarchy, "WORKLOC"),
  };
};

export const getLocationDisplayName = (node) =>
  node?.name || node?.DisplayName || node?.lookupname || "";

export const findLookupTypeByCode = (lookupTypes, code) =>
  (lookupTypes || []).find(
    (item) => String(item.code || "").toUpperCase() === String(code).toUpperCase()
  );

export const getParentLookupType = (lookupTypes, lookuptypeId) => {
  if (!lookuptypeId) return null;
  const lookupType = (lookupTypes || []).find((item) => {
    const id = getLookupTypeId(item)?.toString?.() || "";
    return id === lookuptypeId?.toString?.() || id === String(lookuptypeId);
  });
  if (!lookupType) return null;

  const parentId =
    lookupType.parent?.id ||
    lookupType.ParentlookuptypeId?._id ||
    lookupType.ParentlookuptypeId;

  if (!parentId) return null;

  return (lookupTypes || []).find((item) => {
    const id = getLookupTypeId(item)?.toString?.() || "";
    return id === parentId?.toString?.() || id === String(parentId);
  });
};

export const lookupTypeRequiresParent = (lookupTypes, lookuptypeId) =>
  !!getParentLookupType(lookupTypes, lookuptypeId);

export const getParentLookupOptions = (lookups, lookupTypes, lookuptypeId) => {
  const parentType = getParentLookupType(lookupTypes, lookuptypeId);
  if (!parentType) return [];

  const parentTypeId = parentType._id?.toString?.() || String(parentType._id);

  return (lookups || [])
    .filter((item) => {
      const typeId = getLookupTypeId(item);
      return typeId?.toString?.() === parentTypeId || String(typeId) === parentTypeId;
    })
    .map((item) => ({
      value: getLookupId(item),
      key: getLookupId(item),
      label: getLookupName(item) || item.code,
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
      item.type ||
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

export const getLookupTypeGroupKey = (lookupType) => {
  if (!lookupType) return null;
  if (LOOKUP_TYPE_GROUP_KEYS[lookupType.code]) {
    return LOOKUP_TYPE_GROUP_KEYS[lookupType.code];
  }
  return lookupType.lookuptype || null;
};
