const LOOKUP_TYPE_GROUP_KEYS = {
  REGION: "Region",
  BRANCH: "Branch",
  WORKLOC: "workLocation",
};

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

export const getParentLookupType = (lookupTypes, lookuptypeId) => {
  if (!lookuptypeId) return null;
  const lookupType = (lookupTypes || []).find((item) => {
    const id = item._id?.toString?.() || String(item._id);
    return id === lookuptypeId?.toString?.() || id === String(lookuptypeId);
  });
  if (!lookupType?.ParentlookuptypeId) return null;

  const parentId =
    lookupType.ParentlookuptypeId?._id || lookupType.ParentlookuptypeId;

  return (lookupTypes || []).find((item) => {
    const id = item._id?.toString?.() || String(item._id);
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
      const typeId = item.lookuptypeId?._id || item.lookuptypeId;
      return typeId?.toString?.() === parentTypeId || String(typeId) === parentTypeId;
    })
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
