const LOOKUP_TYPE_GROUP_KEYS = {
  REGION: "Region",
  BRANCH: "Branch",
  WORKLOC: "workLocation",
};

/**
 * Known parent lookup types per child (from product hierarchy).
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

// --- Simple / nested API shape helpers (incoming branch) ---

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
  item?.typeId || item?.lookuptypeId?._id || item?.lookuptypeId || item?._id || item?.id;

export const normalizeLookup = (item) => {
  if (!item) return item;

  if (isSimpleRecord(item)) {
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
  }

  const id = item._id || item.id;
  const lookuptypeRef = item.lookuptypeId;

  return {
    ...item,
    _id: id,
    id,
    lookupname: item.lookupname ?? item.name ?? "",
    DisplayName:
      item.DisplayName ?? item.displayname ?? item.displayName ?? "",
    lookuptypeName:
      item.lookuptypeName ??
      (typeof lookuptypeRef === "object" ? lookuptypeRef?.lookuptype : "") ??
      item.type ??
      "",
    lookuptypeId: lookuptypeRef,
    Parentlookupid:
      item.Parentlookupid ?? item.branch?.id ?? item.region?.id ?? null,
    Parentlookup:
      typeof item.Parentlookup === "string"
        ? item.Parentlookup
        : item.Parentlookup?.lookupname ??
          item.branch?.name ??
          item.region?.name ??
          null,
    ParentlookuptypeId:
      item.ParentlookuptypeId ?? lookuptypeRef?.ParentlookuptypeId ?? null,
    Parentlookuptype:
      item.Parentlookuptype ?? lookuptypeRef?.Parentlookuptype ?? null,
  };
};

/** Extract assigned officer user id from lookup record or form state. */
export const resolveOfficerIdFromRecord = (record) => {
  const officer = record?.officer;
  if (officer == null || officer === "") return null;
  if (typeof officer === "string") return officer;
  return officer._id || officer.id || null;
};

/** Display label for populated officer object from lookup API. */
export const resolveOfficerLabelFromRecord = (record) => {
  const officer = record?.officer;
  if (!officer || typeof officer !== "object") {
    return record?.officerLabel || "";
  }
  return (
    officer.userFullName ||
    [officer.userFirstName, officer.userLastName].filter(Boolean).join(" ") ||
    officer.userEmail ||
    ""
  );
};

const EMPTY_WORKLOCATION_ADDRESS = {
  eircode: "",
  buildingOrHouse: "",
  streetOrRoad: "",
  areaOrTown: "",
  countyCityOrPostCode: "",
  country: "",
  fullAddress: "",
};

const WORKLOCATION_ADDRESS_REQUIRED = [
  "buildingOrHouse",
  "countyCityOrPostCode",
  "country",
];

export const getWorklocationAddressFormValues = (address) => {
  if (!address || typeof address !== "object") {
    return { ...EMPTY_WORKLOCATION_ADDRESS };
  }
  return { ...EMPTY_WORKLOCATION_ADDRESS, ...address };
};

/** Send null unless all required work-location address fields are populated. */
export const normalizeWorklocationAddressForApi = (address) => {
  if (!address || typeof address !== "object") return null;

  const hasRequiredFields = WORKLOCATION_ADDRESS_REQUIRED.every(
    (key) => address[key] != null && String(address[key]).trim() !== "",
  );
  if (!hasRequiredFields) return null;

  return {
    eircode: address.eircode || "",
    buildingOrHouse: address.buildingOrHouse || "",
    streetOrRoad: address.streetOrRoad || "",
    areaOrTown: address.areaOrTown || "",
    countyCityOrPostCode: address.countyCityOrPostCode || "",
    country: address.country || "",
    fullAddress: address.fullAddress || "",
  };
};

/** Build PUT/POST payload for /lookup including normalized officer id. */
export const buildLookupApiPayload = (formValues = {}) => {
  const recordId = formValues._id || formValues.id;

  const payload = {
    ...formValues,
    lookuptypeId: resolveLookuptypeIdFromRecord(formValues),
    Parentlookupid: formValues.Parentlookupid ?? null,
    Parentlookup: formValues.Parentlookup ?? null,
    ParentlookuptypeId: formValues.ParentlookuptypeId ?? null,
    Parentlookuptype: formValues.Parentlookuptype ?? null,
    officer: resolveOfficerIdFromRecord(formValues),
    isactive: formValues.isactive !== false,
    isDeleted: formValues.isDeleted ?? formValues.isdeleted ?? false,
  };

  if (recordId) {
    payload.id = String(recordId);
  }

  if (Object.prototype.hasOwnProperty.call(formValues, "worklocationAddress")) {
    payload.worklocationAddress = normalizeWorklocationAddressForApi(
      formValues.worklocationAddress,
    );
  }

  delete payload.officerLabel;
  delete payload.lookuptypeName;
  delete payload._id;

  return payload;
};

export const resolveLookuptypeIdFromRecord = (record) => {
  const val = record?.lookuptypeId;
  if (val == null || val === "") return "";
  if (typeof val === "object" && val._id) return String(val._id);
  return String(val);
};

/** Map GET /lookup/:id (or list row) into Lookup drawer form state. */
export const mapLookupToFormValues = (record, lookupsTypes = []) => {
  const normalized = normalizeLookup(record);
  const nestedType = normalized.lookuptypeId;

  const parentTypeId =
    resolveParentLookupTypeIdFromRecord(normalized) ||
    resolveParentLookupTypeIdFromRecord(nestedType);
  const parentTypeLabel =
    resolveParentLookupTypeLabelFromRecord(normalized, lookupsTypes) ||
    resolveParentLookupTypeLabelFromRecord(nestedType, lookupsTypes) ||
    normalized.Parentlookuptype ||
    nestedType?.Parentlookuptype ||
    "";

  const mapped = {
    _id: normalized._id || normalized.id || null,
    id: normalized._id || normalized.id || null,
    lookuptypeId: resolveLookuptypeIdFromRecord(normalized),
    code: normalized.code || "",
    lookupname: normalized.lookupname || "",
    DisplayName: normalized.DisplayName || "",
    Parentlookupid: resolveParentLookupIdFromRecord(normalized),
    Parentlookup: resolveParentLookupLabelFromRecord(normalized),
    ParentlookuptypeId: parentTypeId,
    Parentlookuptype: parentTypeLabel,
    userid: normalized.userid,
    isactive: normalized.isactive !== false,
    isDeleted: normalized.isdeleted ?? normalized.isDeleted ?? false,
    officer: resolveOfficerIdFromRecord(normalized),
    officerLabel: resolveOfficerLabelFromRecord(normalized),
  };

  if (Object.prototype.hasOwnProperty.call(normalized, "worklocationAddress")) {
    mapped.worklocationAddress = getWorklocationAddressFormValues(
      normalized.worklocationAddress,
    );
  }

  if (normalized.cityId != null) {
    mapped.cityId = normalized.cityId;
  }

  return mapped;
};

export const normalizeLookupType = (item) => {
  if (!item) return item;

  const id = item._id || item.id;
  return {
    ...item,
    _id: id,
    id,
    code: item.code ?? "",
    lookuptype: item.lookuptype || item.name || "",
    DisplayName:
      item.DisplayName ||
      item.displayname ||
      item.displayName ||
      item.name ||
      "",
    ParentlookuptypeId:
      item.ParentlookuptypeId?._id ||
      item.ParentlookuptypeId ||
      item.parent?.id ||
      null,
    Parentlookuptype:
      item.Parentlookuptype ||
      item.parent?.name ||
      item.parentlookuptype ||
      null,
    isactive:
      typeof item.isactive === "boolean"
        ? item.isactive
        : item.isActive !== false,
    isDeleted: item.isdeleted ?? item.isDeleted ?? false,
  };
};

/** Map GET /lookuptype/:id (or list row) into Lookup Type drawer form state. */
export const mapLookupTypeToFormValues = (record, lookupsTypes = []) => {
  const normalized = normalizeLookupType(record);
  const parentTypeId = resolveParentLookupTypeIdFromRecord(normalized);
  const parentTypeLabel = resolveParentLookupTypeLabelFromRecord(
    normalized,
    lookupsTypes,
  );

  return {
    _id: normalized._id || normalized.id || null,
    id: normalized._id || normalized.id || null,
    lookuptype: normalized.lookuptype || "",
    code: normalized.code || "",
    DisplayName: normalized.DisplayName || "",
    ParentlookuptypeId: parentTypeId,
    Parentlookuptype: parentTypeLabel || normalized.Parentlookuptype || null,
    userid: normalized.userid,
    isactive: normalized.isactive !== false,
    isDeleted: normalized.isDeleted ?? false,
  };
};

export const normalizeLookups = (items) =>
  (items || []).map((item) => normalizeLookup(item));

/** Unwrap lookup type list from API (array or wrapped payload). */
export const extractLookupTypesArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.lookuptypes)) return payload.lookuptypes;
  if (Array.isArray(payload?.lookupTypes)) return payload.lookupTypes;
  return [];
};

export const normalizeLookupTypes = (items) =>
  extractLookupTypesArray(items).map((item) => normalizeLookupType(item));

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

export const getLookupTypeGroupKey = (lookupType) => {
  if (!lookupType) return null;
  if (LOOKUP_TYPE_GROUP_KEYS[lookupType.code]) {
    return LOOKUP_TYPE_GROUP_KEYS[lookupType.code];
  }
  return lookupType.lookuptype || lookupType.name || null;
};

export const findLookupTypeByCode = (lookupTypes, code) =>
  (lookupTypes || []).find(
    (item) => String(item.code || "").toUpperCase() === String(code).toUpperCase(),
  );

export const findLookupTypeByName = (lookupTypes, typeName) => {
  const target = normalizeTypeKey(typeName);
  if (!target) return null;
  return (
    (lookupTypes || []).find((item) => {
      const candidates = [
        item.lookuptype,
        item.name,
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
      const itemId = getLookupTypeId(item)?.toString?.() || "";
      return itemId === id?.toString?.() || itemId === String(id);
    }) || null
  );
};

export const getKnownParentTypeName = (childTypeName) => {
  const key = normalizeTypeKey(childTypeName);
  return KNOWN_PARENT_LOOKUP_TYPES[key] || null;
};

export const lookupTypeNameRequiresParent = (childTypeName) =>
  !!getKnownParentTypeName(childTypeName);

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

  const parentId = getLookupTypeId(parentType);
  return [
    {
      value: parentId,
      key: parentId,
      label: parentType.lookuptype || parentType.DisplayName || parentName,
    },
  ];
};

export const resolveParentLookupTypeIdFromRecord = (record) => {
  if (!record) return null;
  const direct =
    record.ParentlookuptypeId ?? record.parent?.id;
  if (direct != null && direct !== "") {
    if (typeof direct === "object" && direct._id) return String(direct._id);
    const normalized = String(direct);
    if (/^[a-f\d]{24}$/i.test(normalized)) return normalized;
  }
  return null;
};

export const resolveParentLookupTypeLabelFromRecord = (record, lookupTypes = []) => {
  if (!record) return "";
  const id = resolveParentLookupTypeIdFromRecord(record);
  if (id) {
    const match = findLookupTypeById(lookupTypes, id);
    if (match) return match.lookuptype || match.DisplayName || match.name || "";
  }
  if (typeof record.Parentlookuptype === "string") return record.Parentlookuptype;
  if (record.parent?.name) return record.parent.name;
  return getKnownParentTypeName(record.lookuptype) || "";
};

export const getParentLookupType = (lookupTypes, lookuptypeId, drawerKey = "") => {
  if (!lookuptypeId && !drawerKey) return null;

  const lookupType =
    typeof lookuptypeId === "object" && lookuptypeId !== null && (lookuptypeId.lookuptype || lookuptypeId.name)
      ? lookuptypeId
      : findLookupTypeById(lookupTypes, lookuptypeId);

  if (lookupType) {
    const parentId =
      lookupType.parent?.id ||
      lookupType.ParentlookuptypeId?._id ||
      lookupType.ParentlookuptypeId;
    if (parentId) {
      const fromId = findLookupTypeById(lookupTypes, parentId);
      if (fromId) return fromId;
    }

    const parentName =
      lookupType.Parentlookuptype ||
      lookupType.ParentlookuptypeName ||
      lookupType.parentlookuptype ||
      lookupType.parent?.name;
    if (parentName) {
      const fromName = findLookupTypeByName(lookupTypes, parentName);
      if (fromName) return fromName;
    }

    const knownParentName = getKnownParentTypeName(
      lookupType.lookuptype || lookupType.name,
    );
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

export const resolveParentLookupIdFromRecord = (record) => {
  if (!record) return null;

  const direct = record.Parentlookupid;
  if (direct != null && direct !== "") {
    const normalized = normalizeId(direct);
    if (normalized && /^[a-f\d]{24}$/i.test(normalized)) return normalized;
    if (typeof direct === "object" && direct._id) return String(direct._id);
  }

  const nested = record.Parentlookup;
  if (nested && typeof nested === "object" && (nested._id || nested.id)) {
    return String(nested._id || nested.id);
  }

  if (record.branch?.id) return String(record.branch.id);
  if (record.region?.id) return String(record.region.id);

  return null;
};

export const resolveParentLookupLabelFromRecord = (record) => {
  if (!record) return "";

  if (typeof record.Parentlookup === "string") {
    return record.Parentlookup;
  }
  if (record.Parentlookup && typeof record.Parentlookup === "object") {
    return getLookupName(record.Parentlookup) || record.Parentlookup.code || "";
  }
  if (record.branch?.name) return record.branch.name;
  if (record.region?.name) return record.region.name;

  return "";
};

export const getParentLookupLabel = (parentType) => {
  if (!parentType) return "Parent Lookup";
  const name =
    parentType.lookuptype || parentType.DisplayName || parentType.name || "Lookup";
  return `Parent ${name}`;
};

export const findLookupOptionLabel = (lookups, parentId) => {
  if (!parentId) return "";
  const id = normalizeId(parentId);
  const match = (lookups || []).find(
    (item) => normalizeId(getLookupId(item)) === id,
  );
  return getLookupName(match) || match?.code || "";
};

export const lookupBelongsToType = (item, lookupType) => {
  if (!item || !lookupType) return false;

  const typeId = normalizeId(getLookupTypeId(lookupType));
  const itemTypeId = normalizeId(getLookupTypeId(item) || item.lookuptypeId);

  if (typeId && itemTypeId && itemTypeId === typeId) {
    return true;
  }

  const itemTypeName = getLookupTypeName(item);
  const typeName =
    lookupType.lookuptype || lookupType.DisplayName || lookupType.name || "";
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
      value: getLookupId(item),
      key: getLookupId(item),
      label: getLookupName(item) || item.code,
    }))
    .sort((a, b) =>
      String(a.label || "")
        .toLowerCase()
        .localeCompare(String(b.label || "").toLowerCase()),
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
