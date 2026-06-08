import React from "react";
import {
  Map,
  Globe,
  Building2,
  MapPin,
  University,
  MapPinned,
  Mail,
  Layout,
  Landmark,
  Languages,
  FolderKanban,
  Lightbulb,
  BarChart3,
  FileText,
  Gavel,
  Calendar,
  MessageSquare,
  File,
  Shield,
  Boxes,
  Search,
  Phone,
  Bookmark,
  CircleHelp,
  Users,
  Briefcase,
  User,
  Heart,
  Crown,
} from "lucide-react";

/** Drawer keys that have a dedicated MyDrawer UI in Configuration.js */
export const CONFIGURATION_DRAWER_KEYS = new Set([
  "counties",
  "Countries",
  "Provinces",
  "Cities",
  "PostCode",
  "Districts",
  "Divisions",
  "DivisionsForDistrict",
  "DivisionsForStation",
  "Station",
  "StudyLocation",
  "ContactType",
  "LookupType",
  "Lookup",
  "RegionType",
  "Bookmarks",
  "Solicitors",
  "Gender",
  "Title",
  "ProjectTypes",
  "Trainings",
  "Ranks",
  "Duties",
  "Boards",
  "ClaimType",
  "Schemes",
  "Reasons",
  "RosterType",
  "Sections",
  "Councils",
  "CorrespondenceType",
  "DocumentType",
  "SpokenLanguages",
  "MaritalStatus",
  "Committees",
  "StandardLookup",
]);

/** Drawers that do not use GET/PUT /lookup for records. */
export const NON_LOOKUP_DRAWER_KEYS = new Set([
  "Bookmarks",
  "Solicitors",
  "RegionType",
  "ContactType",
  "Countries",
  "LookupType",
]);

export function isLookupDrawerKey(drawerKey) {
  return (
    !!drawerKey &&
    CONFIGURATION_DRAWER_KEYS.has(drawerKey) &&
    !NON_LOOKUP_DRAWER_KEYS.has(drawerKey)
  );
}

const LOOKUP_TYPE_NAME_TO_DRAWER_KEY = {
  boards: "Boards",
  bookmarks: "Bookmarks",
  branch: "Districts",
  cities: "Cities",
  city: "Cities",
  "claim type": "ClaimType",
  claimtype: "ClaimType",
  committees: "Committees",
  committee: "Committees",
  "contact types": "ContactType",
  "contact type": "ContactType",
  contacttypes: "ContactType",
  contacttype: "ContactType",
  "correspondence type": "CorrespondenceType",
  correspondencetype: "CorrespondenceType",
  councils: "Councils",
  council: "Councils",
  countries: "Countries",
  country: "Countries",
  counties: "counties",
  county: "counties",
  "document type": "DocumentType",
  documenttype: "DocumentType",
  duties: "Duties",
  gender: "Gender",
  grade: "Ranks",
  ranks: "Ranks",
  lookup: "Lookup",
  "lookup type": "LookupType",
  lookuptype: "LookupType",
  "marital status": "MaritalStatus",
  maritalstatus: "MaritalStatus",
  "post codes": "PostCode",
  "post code": "PostCode",
  postcode: "PostCode",
  postcodes: "PostCode",
  "project types": "ProjectTypes",
  projecttypes: "ProjectTypes",
  projecttype: "ProjectTypes",
  provinces: "Provinces",
  province: "Provinces",
  reasons: "Reasons",
  region: "Divisions",
  regions: "Divisions",
  regiontype: "RegionType",
  divisions: "Divisions",
  division: "Divisions",
  "roster type": "RosterType",
  rostertype: "RosterType",
  schemes: "Schemes",
  scheme: "Schemes",
  sections: "Sections",
  section: "Sections",
  solicitors: "Solicitors",
  solicitor: "Solicitors",
  "spoken languages": "SpokenLanguages",
  spokenlanguages: "SpokenLanguages",
  "study location": "StudyLocation",
  studylocation: "StudyLocation",
  titles: "Title",
  title: "Title",
  trainings: "Trainings",
  training: "Trainings",
  "work location": "Station",
  "work locations": "Station",
  worklocation: "Station",
  worklocations: "Station",
  station: "Station",
  stations: "Station",
  districts: "Districts",
  district: "Districts",
  discipline: "StandardLookup",
  bank: "StandardLookup",
  "template type": "StandardLookup",
  templatetype: "StandardLookup",
  "payment type": "StandardLookup",
  paymenttype: "StandardLookup",
  "secondary section": "StandardLookup",
  secondarysection: "StandardLookup",
  "new graduate": "StandardLookup",
  newgraduate: "StandardLookup",
  "corn market": "StandardLookup",
  cornmarket: "StandardLookup",
  "cancellation reason": "StandardLookup",
  cancellationreason: "StandardLookup",
};

const LOOKUP_CARD_ICON_SIZE = 18;

const LOOKUP_CARD_ICONS = [
  <Globe size={LOOKUP_CARD_ICON_SIZE} color="#ef4444" />,
  <Map size={LOOKUP_CARD_ICON_SIZE} color="#22c55e" />,
  <Building2 size={LOOKUP_CARD_ICON_SIZE} color="#6366f1" />,
  <MapPinned size={LOOKUP_CARD_ICON_SIZE} color="#eab308" />,
  <MapPin size={LOOKUP_CARD_ICON_SIZE} color="#f97316" />,
  <University size={LOOKUP_CARD_ICON_SIZE} color="#f97316" />,
  <Mail size={LOOKUP_CARD_ICON_SIZE} color="#0ea5e9" />,
  <Crown size={LOOKUP_CARD_ICON_SIZE} color="#3b82f6" />,
  <User size={LOOKUP_CARD_ICON_SIZE} color="#ec4899" />,
  <Heart size={LOOKUP_CARD_ICON_SIZE} color="#a78bfa" />,
  <Languages size={LOOKUP_CARD_ICON_SIZE} color="#f43f5e" />,
  <BarChart3 size={LOOKUP_CARD_ICON_SIZE} color="#6b7280" />,
  <FileText size={LOOKUP_CARD_ICON_SIZE} color="#60a5fa" />,
  <Calendar size={LOOKUP_CARD_ICON_SIZE} color="#06b6d4" />,
  <Layout size={LOOKUP_CARD_ICON_SIZE} color="#14b8a6" />,
  <Landmark size={LOOKUP_CARD_ICON_SIZE} color="#8b5cf6" />,
  <Users size={LOOKUP_CARD_ICON_SIZE} color="#ec4899" />,
  <Gavel size={LOOKUP_CARD_ICON_SIZE} color="#64748b" />,
  <Briefcase size={LOOKUP_CARD_ICON_SIZE} color="#8b5cf6" />,
  <FolderKanban size={LOOKUP_CARD_ICON_SIZE} color="#f59e0b" />,
  <Lightbulb size={LOOKUP_CARD_ICON_SIZE} color="#84cc16" />,
  <Phone size={LOOKUP_CARD_ICON_SIZE} color="#a855f7" />,
  <MessageSquare size={LOOKUP_CARD_ICON_SIZE} color="#4ade80" />,
  <File size={LOOKUP_CARD_ICON_SIZE} color="#818cf8" />,
  <Bookmark size={LOOKUP_CARD_ICON_SIZE} color="#818cf8" />,
  <Shield size={LOOKUP_CARD_ICON_SIZE} color="#f472b6" />,
  <Boxes size={LOOKUP_CARD_ICON_SIZE} color="#facc15" />,
  <CircleHelp size={LOOKUP_CARD_ICON_SIZE} color="#fb923c" />,
  <Search size={LOOKUP_CARD_ICON_SIZE} color="#34d399" />,
];

export function normalizeLookupTypeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

function camelCaseToWords(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ");
}

function lookupDrawerKeyFromNormalized(normalized) {
  if (!normalized) return "";
  if (LOOKUP_TYPE_NAME_TO_DRAWER_KEY[normalized]) {
    return LOOKUP_TYPE_NAME_TO_DRAWER_KEY[normalized];
  }
  const compact = normalized.replace(/\s+/g, "");
  if (LOOKUP_TYPE_NAME_TO_DRAWER_KEY[compact]) {
    return LOOKUP_TYPE_NAME_TO_DRAWER_KEY[compact];
  }
  if (CONFIGURATION_DRAWER_KEYS.has(compact)) {
    return compact;
  }
  for (const drawerKey of CONFIGURATION_DRAWER_KEYS) {
    if (normalizeLookupTypeName(drawerKey) === normalized) {
      return drawerKey;
    }
    if (normalizeLookupTypeName(drawerKey).replace(/\s+/g, "") === compact) {
      return drawerKey;
    }
  }
  return "";
}

export function getDrawerKeyForLookupType(lookupType) {
  if (!lookupType) return "";

  const candidates = new Set();
  const displayName = lookupType.lookuptype || lookupType.DisplayName || "";
  if (displayName) {
    candidates.add(normalizeLookupTypeName(displayName));
    candidates.add(normalizeLookupTypeName(camelCaseToWords(displayName)));
  }
  if (lookupType.key) {
    candidates.add(normalizeLookupTypeName(lookupType.key));
    candidates.add(normalizeLookupTypeName(camelCaseToWords(lookupType.key)));
  }

  for (const normalized of candidates) {
    const drawerKey = lookupDrawerKeyFromNormalized(normalized);
    if (drawerKey) return drawerKey;
  }

  return "";
}

/** Maps API lookup type to the correct configuration drawer. */
export function resolveConfigurationDrawerKey(lookupType, fallbackKey = "") {
  const mapped = getDrawerKeyForLookupType(lookupType);
  if (mapped && CONFIGURATION_DRAWER_KEYS.has(mapped)) {
    return mapped;
  }
  if (fallbackKey && CONFIGURATION_DRAWER_KEYS.has(fallbackKey)) {
    return fallbackKey;
  }
  if (lookupType?.lookuptype || lookupType?._id) {
    return "StandardLookup";
  }
  return "Lookup";
}

export function getLookupsForLookupType(lookupType, lookups = []) {
  if (!lookupType || !Array.isArray(lookups)) return [];
  const typeId = lookupType._id;
  const typeName = lookupType.lookuptype;
  return lookups.filter(
    (item) =>
      String(item?.lookuptypeId?._id) === String(typeId) ||
      item?.lookuptypeId?.lookuptype === typeName ||
      item?.lookuptypeName === typeName,
  );
}

export function getLookupTypeFieldPropsForRecord(lookupType, selectedId) {
  if (!lookupType?._id) {
    return { value: selectedId || "", options: [] };
  }
  const value = selectedId || lookupType._id;
  return {
    value,
    options: [{ label: lookupType.lookuptype, value: lookupType._id }],
  };
}

export function getLookupTypeRecordForDrawer(drawerKey, lookupsTypes = []) {
  if (!drawerKey || !Array.isArray(lookupsTypes)) return null;
  return (
    lookupsTypes.find((lt) => getDrawerKeyForLookupType(lt) === drawerKey) || null
  );
}

export function getLookupTypeRecordById(id, lookupsTypes = []) {
  if (!id || !Array.isArray(lookupsTypes)) return null;
  return lookupsTypes.find((lt) => String(lt._id) === String(id)) || null;
}

/** True when lookup type is work location (Station drawer / WORKLOC). */
export function isWorkLocationLookupType(lookupTypeOrId, lookupsTypes = []) {
  const record =
    typeof lookupTypeOrId === "object" && lookupTypeOrId !== null
      ? lookupTypeOrId
      : getLookupTypeRecordById(lookupTypeOrId, lookupsTypes);
  if (!record) return false;
  return getDrawerKeyForLookupType(record) === "Station";
}

/** Fixed cards for system drawers (manage lookup types / generic lookups). */
export const SYSTEM_CONFIGURATION_CARDS = [
  {
    key: "LookupType",
    lookupTypeId: "system-card-lookup-type",
    label: "Lookup Type",
    icon: <Search size={LOOKUP_CARD_ICON_SIZE} color="#34d399" />,
    lookupType: null,
    isSystem: true,
  },
  {
    key: "Lookup",
    lookupTypeId: "system-card-lookup",
    label: "Lookup",
    icon: <Search size={LOOKUP_CARD_ICON_SIZE} color="#fb7185" />,
    lookupType: null,
    isSystem: true,
  },
  {
    key: "Bookmarks",
    lookupTypeId: "system-card-bookmarks",
    label: "Bookmark",
    icon: <Bookmark size={LOOKUP_CARD_ICON_SIZE} color="#818cf8" />,
    lookupType: null,
    isSystem: true,
  },
];

const SYSTEM_DRAWER_KEYS = new Set(
  SYSTEM_CONFIGURATION_CARDS.map((card) => card.key),
);

export function buildConfigurationCards(lookupsTypes = []) {
  const apiCards = Array.isArray(lookupsTypes)
    ? [...lookupsTypes]
        .sort((a, b) =>
          String(a.lookuptype || "").localeCompare(
            String(b.lookuptype || ""),
            undefined,
            { sensitivity: "base" },
          ),
        )
        .map((lookupType, index) => {
          const drawerKey = resolveConfigurationDrawerKey(lookupType);
          return {
            key: drawerKey,
            drawerKey,
            lookupTypeId: lookupType._id,
            label:
              lookupType.lookuptype ||
              lookupType.DisplayName ||
              lookupType.name ||
              "Lookup",
            icon: LOOKUP_CARD_ICONS[index % LOOKUP_CARD_ICONS.length],
            lookupType,
          };
        })
        .filter((card) => !SYSTEM_DRAWER_KEYS.has(card.key))
    : [];

  return [...apiCards, ...SYSTEM_CONFIGURATION_CARDS];
}

export function getLookupsForDrawer(drawerKey, { lookupsTypes = [], groupedLookups = {}, data = {} } = {}) {
  const lookupType = getLookupTypeRecordForDrawer(drawerKey, lookupsTypes);
  const typeName = lookupType?.lookuptype;
  if (typeName && Array.isArray(groupedLookups[typeName])) {
    return groupedLookups[typeName];
  }
  if (Array.isArray(data[drawerKey])) {
    return data[drawerKey];
  }
  return [];
}

export function withDynamicLookupTypeId(template, drawerKey, lookupsTypes = []) {
  if (!template || typeof template !== "object") return template;
  const next = { ...template };
  const lookupType = getLookupTypeRecordForDrawer(drawerKey, lookupsTypes);
  if (lookupType?._id && Object.prototype.hasOwnProperty.call(next, "lookuptypeId")) {
    next.lookuptypeId = lookupType._id;
  }
  return next;
}

export function getLookupTypeFieldProps(
  drawerKey,
  lookupsTypes = [],
  selectedId,
) {
  const lookupType = getLookupTypeRecordForDrawer(drawerKey, lookupsTypes);
  const value = selectedId || lookupType?._id || "";
  return {
    value,
    options: lookupType
      ? [{ label: lookupType.lookuptype, value: lookupType._id }]
      : [],
  };
}
