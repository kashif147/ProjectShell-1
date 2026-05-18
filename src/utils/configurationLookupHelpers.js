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

const LOOKUP_TYPE_NAME_TO_DRAWER_KEY = {
  boards: "Boards",
  bookmarks: "Bookmarks",
  branch: "Districts",
  cities: "Cities",
  city: "Cities",
  "claim type": "ClaimType",
  committees: "Committees",
  "contact types": "ContactType",
  "contact type": "ContactType",
  "correspondence type": "CorrespondenceType",
  councils: "Councils",
  council: "Councils",
  countries: "Countries",
  counties: "counties",
  county: "counties",
  "document type": "DocumentType",
  duties: "Duties",
  gender: "Gender",
  grade: "Ranks",
  ranks: "Ranks",
  lookup: "Lookup",
  "lookup type": "LookupType",
  "marital status": "MaritalStatus",
  "post codes": "PostCode",
  "post code": "PostCode",
  "project types": "ProjectTypes",
  provinces: "Provinces",
  province: "Provinces",
  reasons: "Reasons",
  region: "Divisions",
  regions: "Divisions",
  divisions: "Divisions",
  "roster type": "RosterType",
  schemes: "Schemes",
  sections: "Sections",
  solicitors: "Solicitors",
  "spoken languages": "SpokenLanguages",
  "study location": "StudyLocation",
  titles: "Title",
  title: "Title",
  trainings: "Trainings",
  "work location": "Station",
  "work locations": "Station",
  station: "Station",
  stations: "Station",
  districts: "Districts",
  district: "Districts",
};

const LOOKUP_CARD_ICONS = [
  <Globe size={24} color="#ef4444" />,
  <Map size={24} color="#22c55e" />,
  <Building2 size={24} color="#6366f1" />,
  <MapPinned size={24} color="#eab308" />,
  <MapPin size={24} color="#f97316" />,
  <University size={24} color="#f97316" />,
  <Mail size={24} color="#0ea5e9" />,
  <Crown size={24} color="#3b82f6" />,
  <User size={24} color="#ec4899" />,
  <Heart size={24} color="#a78bfa" />,
  <Languages size={24} color="#f43f5e" />,
  <BarChart3 size={24} color="#6b7280" />,
  <FileText size={24} color="#60a5fa" />,
  <Calendar size={24} color="#06b6d4" />,
  <Layout size={24} color="#14b8a6" />,
  <Landmark size={24} color="#8b5cf6" />,
  <Users size={24} color="#ec4899" />,
  <Gavel size={24} color="#64748b" />,
  <Briefcase size={24} color="#8b5cf6" />,
  <FolderKanban size={24} color="#f59e0b" />,
  <Lightbulb size={24} color="#84cc16" />,
  <Phone size={24} color="#a855f7" />,
  <MessageSquare size={24} color="#4ade80" />,
  <File size={24} color="#818cf8" />,
  <Bookmark size={24} color="#818cf8" />,
  <Shield size={24} color="#f472b6" />,
  <Boxes size={24} color="#facc15" />,
  <CircleHelp size={24} color="#fb923c" />,
  <Search size={24} color="#34d399" />,
];

export function normalizeLookupTypeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

export function getDrawerKeyForLookupType(lookupType) {
  if (!lookupType) return "";
  const name = lookupType.lookuptype || lookupType.DisplayName || "";
  const byName = LOOKUP_TYPE_NAME_TO_DRAWER_KEY[normalizeLookupTypeName(name)];
  if (byName) return byName;
  if (lookupType.key) {
    const byKey = LOOKUP_TYPE_NAME_TO_DRAWER_KEY[normalizeLookupTypeName(lookupType.key)];
    if (byKey) return byKey;
    return lookupType.key;
  }
  return String(name).replace(/\s+/g, "");
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

/** Fixed cards for system drawers (manage lookup types / generic lookups). */
export const SYSTEM_CONFIGURATION_CARDS = [
  {
    key: "LookupType",
    lookupTypeId: "system-card-lookup-type",
    label: "Lookup Type",
    icon: <Search size={24} color="#34d399" />,
    lookupType: null,
    isSystem: true,
  },
  {
    key: "Lookup",
    lookupTypeId: "system-card-lookup",
    label: "Lookup",
    icon: <Search size={24} color="#fb7185" />,
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
          const drawerKey = getDrawerKeyForLookupType(lookupType);
          return {
            key: drawerKey || String(lookupType._id),
            lookupTypeId: lookupType._id,
            label: lookupType.lookuptype || lookupType.DisplayName || "Lookup",
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
