/** @format */

import axios from "axios";
import { getSubscriptionServiceBaseUrl } from "../config/serviceUrls";
import {
  pickPrimarySubscription,
  profileDetailActiveSubscriptionArgs,
} from "../features/subscription/profileSubscriptionSlice";

export const SAMPLE_PREVIEW_DATA = {
  surname: "Azim",
  forename: "Fazal",
  title: "Mr",
  gender: "Male",
  dateOfBirth: "1999-11-11",
  countryPrimaryQualification: "Ireland",
  buildingOrHouse: "house",
  streetOrRoad: "Ballycullen",
  areaOrTown: "Dublin",
  eircode: "D16 CC01",
  countyCityOrPostCode: "County Dublin",
  country: "Ireland",
  mobileNumber: "+3533450987765",
  personalEmail: "fazalazim238@gmail.com",
  normalizedEmail: "fazalazim238@gmail.com",
  studyLocation: "Not specified",
  startDate: "Not specified",
  graduationDate: "Not specified",
  workLocation: "An Castan Disability Services",
  branch: "Meath",
  region: "Dublin North East",
  grade: "Advanced Nurse Practitioner",
  primarySection: "General Nursing",
  secondarySection: "Not specified",
  nmbiNumber: "Not specified",
  membershipNumber: "A00004",
  membershipCategory: "Active",
  firstJoinedDate: "2025-12-03",
  payrollNumber: "Not specified",
  paymentType: "Not specified",
  paymentFrequency: "Not specified",
  subscriptionStatus: "Active",
  dateResigned: "N/A",
  dateCancelled: "N/A",
  remindersReminderDate: "Not set",
  remindersType: "Not set",
};

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseBookmarkPath(path) {
  const raw = String(path || "").trim();
  const colonIdx = raw.indexOf(":");
  if (colonIdx === -1) {
    return { dataPath: raw, format: null };
  }
  return {
    dataPath: raw.slice(0, colonIdx).trim(),
    format: raw.slice(colonIdx + 1).trim() || null,
  };
}

function formatDateWithPattern(date, pattern) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return String(date ?? "");

  const tokens = {
    yyyy: String(d.getUTCFullYear()),
    yy: String(d.getUTCFullYear()).slice(-2),
    MMM: MONTH_SHORT[d.getUTCMonth()],
    MM: String(d.getUTCMonth() + 1).padStart(2, "0"),
    M: String(d.getUTCMonth() + 1),
    dd: String(d.getUTCDate()).padStart(2, "0"),
    d: String(d.getUTCDate()),
    HH: String(d.getUTCHours()).padStart(2, "0"),
    H: String(d.getUTCHours()),
    mm: String(d.getUTCMinutes()).padStart(2, "0"),
    m: String(d.getUTCMinutes()),
    ss: String(d.getUTCSeconds()).padStart(2, "0"),
    s: String(d.getUTCSeconds()),
  };

  let result = pattern;
  for (const token of [
    "yyyy",
    "yy",
    "MMM",
    "MM",
    "dd",
    "HH",
    "mm",
    "ss",
    "M",
    "d",
    "H",
    "m",
    "s",
  ]) {
    result = result.split(token).join(tokens[token]);
  }
  return result;
}

function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = String(path).split(".").filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

/** MODEL_ATTRIBUTES doc uses *.model.*; merge context exposes the runtime shape. */
function normalizeBookmarkDataPath(dataPath) {
  const raw = String(dataPath || "").trim();
  if (raw.startsWith("tenant.model.")) {
    return `tenant.${raw.slice("tenant.model.".length)}`;
  }
  if (raw.startsWith("profile.model.")) {
    return `profile.${raw.slice("profile.model.".length)}`;
  }
  if (raw.startsWith("personal.details.model.")) {
    return `profile.${raw.slice("personal.details.model.".length)}`;
  }
  if (raw.startsWith("subscription.model.")) {
    return `subscription.${raw.slice("subscription.model.".length)}`;
  }
  return raw;
}

function getSystemBookmarkContext(date = new Date()) {
  return {
    currentUtcDate: date,
  };
}

function resolveBookmarkRawValue(field, context) {
  const { dataPath } = parseBookmarkPath(field.path);
  const normalizedPath = normalizeBookmarkDataPath(dataPath);
  const fromPath = getByPath(context, normalizedPath);
  if (fromPath !== undefined) return fromPath;

  const key = String(field.key || "").toLowerCase();
  const path = String(dataPath || "").toLowerCase();
  const system = context.system || {};

  if (key === "currentutcdate" || path === "system.currentutcdate") {
    return system.currentUtcDate ?? new Date();
  }

  return undefined;
}

function formatCommaSeparatedLines(value) {
  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");
}

const LINES_FORMATS = new Set(["lines", "commalines"]);
const ADDRESS_LINE_KEYS = new Set(["fulladdress", "fullmemberaddress"]);

function wantsLineFormat(field, format) {
  const normalizedFormat = String(format || "").trim().toLowerCase();
  if (LINES_FORMATS.has(normalizedFormat)) return true;
  return ADDRESS_LINE_KEYS.has(String(field?.key || "").toLowerCase());
}

function buildAddressLinesFromContext(context) {
  const ci = context?.profile?.contactInfo || {};
  const addr =
    ci.address && typeof ci.address === "object"
      ? { ...ci, ...ci.address }
      : ci;

  return [
    addr.buildingOrHouse,
    addr.streetOrRoad,
    addr.areaOrTown,
    addr.countyCityOrPostCode,
    addr.eircode,
    addr.country,
  ]
    .map((part) => (part != null ? String(part).trim() : ""))
    .filter(Boolean)
    .join("\n");
}

function formatBookmarkValue(
  value,
  dataType,
  formatPattern = null,
  { lineFormat = false, context = null } = {},
) {
  if (lineFormat) {
    const fromParts = context ? buildAddressLinesFromContext(context) : "";
    if (fromParts) return fromParts;
    if (value == null || value === "") return "";
    return formatCommaSeparatedLines(value);
  }
  if (value == null || value === "") return "";
  if (formatPattern) {
    return formatDateWithPattern(value, formatPattern);
  }
  if (dataType === "date") {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toISOString().slice(0, 10);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function prepareProfileForBookmarkContext(profile) {
  const profileDoc =
    profile && typeof profile === "object" ? { ...profile } : {};
  if (profileDoc.professionalDetails) {
    profileDoc.professionalInfo = {
      ...profileDoc.professionalDetails,
      ...(profileDoc.professionalInfo || {}),
    };
  }
  if (profileDoc.contactInfo?.address) {
    profileDoc.contactInfo = {
      ...profileDoc.contactInfo,
      ...profileDoc.contactInfo.address,
    };
  }
  return profileDoc;
}

function buildSampleProfileFromData(sampleData = SAMPLE_PREVIEW_DATA) {
  const personalInfo = {
    title: sampleData.title,
    forename: sampleData.forename,
    surname: sampleData.surname,
    fullName:
      sampleData.fullName ||
      [sampleData.forename, sampleData.surname].filter(Boolean).join(" ").trim(),
    gender: sampleData.gender,
    dateOfBirth: sampleData.dateOfBirth,
    countryPrimaryQualification: sampleData.countryPrimaryQualification,
  };

  return prepareProfileForBookmarkContext({
    membershipNumber: sampleData.membershipNumber,
    normalizedEmail: sampleData.normalizedEmail,
    personalInfo,
    contactInfo: {
      mobileNumber: sampleData.mobileNumber,
      personalEmail: sampleData.personalEmail,
      buildingOrHouse: sampleData.buildingOrHouse,
      streetOrRoad: sampleData.streetOrRoad,
      areaOrTown: sampleData.areaOrTown,
      countyCityOrPostCode: sampleData.countyCityOrPostCode,
      eircode: sampleData.eircode,
      country: sampleData.country,
      address: {
        buildingOrHouse: sampleData.buildingOrHouse,
        streetOrRoad: sampleData.streetOrRoad,
        areaOrTown: sampleData.areaOrTown,
        countyCityOrPostCode: sampleData.countyCityOrPostCode,
        eircode: sampleData.eircode,
        country: sampleData.country,
      },
    },
    professionalDetails: {
      studyLocation: sampleData.studyLocation,
      graduationDate: sampleData.graduationDate,
      workLocation: sampleData.workLocation,
      branch: sampleData.branch,
      region: sampleData.region,
      grade: sampleData.grade,
      primarySection: sampleData.primarySection,
      secondarySection: sampleData.secondarySection,
      nmbiNumber: sampleData.nmbiNumber,
    },
  });
}

function buildSampleSubscriptionFromData(sampleData = SAMPLE_PREVIEW_DATA) {
  return {
    membershipCategory: sampleData.membershipCategory,
    subscriptionStatus: sampleData.subscriptionStatus,
    startDate: sampleData.startDate,
    paymentType: sampleData.paymentType,
    paymentFrequency: sampleData.paymentFrequency,
    payrollNo: sampleData.payrollNumber,
    cancellation: { dateCancelled: sampleData.dateCancelled },
    resignation: { dateResigned: sampleData.dateResigned },
    reminderHistory: {
      reminderDate: sampleData.remindersReminderDate,
      type: sampleData.remindersType,
    },
    subscriptionDetails: {
      primarySection: sampleData.primarySection,
      secondarySection: sampleData.secondarySection,
    },
  };
}

function buildBookmarkContext({
  profile,
  subscription = {},
  tenant = {},
  sampleData = null,
} = {}) {
  const profileDoc = sampleData
    ? buildSampleProfileFromData(sampleData)
    : prepareProfileForBookmarkContext(profile);
  const subscriptionDoc = sampleData
    ? buildSampleSubscriptionFromData(sampleData)
    : subscription && typeof subscription === "object"
      ? subscription
      : {};

  return {
    profile: profileDoc,
    subscription: subscriptionDoc,
    tenant: tenant && typeof tenant === "object" ? { ...tenant } : {},
    system: getSystemBookmarkContext(),
  };
}

function applyFullNameFallback(map, profileDoc) {
  const pi = profileDoc?.personalInfo || {};
  if (!map.fullName) {
    map.fullName =
      pi.fullName ||
      [pi.forename, pi.surname].filter(Boolean).join(" ").trim();
  }
}

function applyBookmarkFieldsToMap(map, bookmarks, context, { sampleData = null } = {}) {
  for (const field of bookmarks) {
    const key = field?.key;
    if (!key) continue;

    const { format } = parseBookmarkPath(field.path);
    let raw = sampleData
      ? resolveSampleBookmarkValue(field, sampleData)
      : undefined;
    if (raw === undefined) {
      raw = resolveBookmarkRawValue(field, context);
    }

    const lineFormat = wantsLineFormat(field, format);
    if (raw !== undefined) {
      map[key] = formatBookmarkValue(raw, field.dataType, lineFormat ? null : format, {
        lineFormat,
        context,
      });
    } else if (lineFormat) {
      map[key] = formatBookmarkValue(map[key], field.dataType, null, {
        lineFormat: true,
        context,
      });
    } else if (!sampleData) {
      map[key] = formatBookmarkValue(raw, field.dataType, lineFormat ? null : format, {
        lineFormat,
        context,
      });
    }
  }
}

export function buildBookmarkPreviewMap({
  profile,
  subscription = {},
  tenant = {},
  bookmarks = [],
}) {
  const context = buildBookmarkContext({ profile, subscription, tenant });
  const map = {};
  applyBookmarkFieldsToMap(map, bookmarks, context);
  applyFullNameFallback(map, context.profile);
  return map;
}

function resolveSampleBookmarkValue(bookmark, sampleData) {
  const key = bookmark?.key;
  if (!key) return undefined;

  const { dataPath, format } = parseBookmarkPath(bookmark.path);
  const path = String(dataPath || "").toLowerCase();
  if (path === "system.currentutcdate" || key === "currentUtcDate") {
    const raw = new Date();
    return format
      ? formatDateWithPattern(raw, format)
      : raw.toISOString().slice(0, 10);
  }

  if (sampleData[key] !== undefined) {
    return sampleData[key];
  }

  return undefined;
}

function buildSampleAddressLines(sampleData = SAMPLE_PREVIEW_DATA) {
  return [
    sampleData.buildingOrHouse,
    sampleData.streetOrRoad,
    sampleData.areaOrTown,
    sampleData.countyCityOrPostCode,
    sampleData.eircode,
    sampleData.country,
  ]
    .map((part) => (part != null ? String(part).trim() : ""))
    .filter(Boolean)
    .join("\n");
}

export function buildSampleBookmarkPreviewMap(bookmarks = [], tenant = {}) {
  const map = { ...SAMPLE_PREVIEW_DATA };
  map.currentUtcDate = formatDateWithPattern(new Date(), "dd MMM yyyy");
  map.fullAddress = buildSampleAddressLines(map);
  map.fullMemberAddress = map.fullAddress;

  const context = buildBookmarkContext({
    tenant,
    sampleData: SAMPLE_PREVIEW_DATA,
  });

  applyBookmarkFieldsToMap(map, bookmarks, context, {
    sampleData: SAMPLE_PREVIEW_DATA,
  });
  applyFullNameFallback(map, context.profile);

  return map;
}

/** HTML: continuation lines align with the first line start (not the paragraph margin). */
export function formatMultilineValueForHtml(value) {
  const normalized = String(value ?? "");
  if (!normalized.includes("\n")) return normalized;

  const lines = normalized.split("\n");
  const first = lines[0] ?? "";
  const rest = lines
    .slice(1)
    .map((line) => `<br>${line}`)
    .join("");

  return `<span class="bookmark-multiline" style="display:inline-block;vertical-align:top;">${first}${rest}</span>`;
}

function formatBookmarkValueForHtmlReplacement(value) {
  const raw = String(value ?? "");
  return raw.includes("\n") ? formatMultilineValueForHtml(raw) : raw;
}

export function replacePlaceholdersWithData(htmlContent, previewMap = {}) {
  if (!htmlContent) return "<p>No content available</p>";

  let replacedContent = htmlContent;

  Object.keys(previewMap).forEach((key) => {
    const placeholder = `{{${key}}}`;
    const value = formatBookmarkValueForHtmlReplacement(previewMap[key]);
    replacedContent = replacedContent.replace(
      new RegExp(placeholder, "g"),
      value,
    );
  });

  Object.keys(previewMap).forEach((key) => {
    const placeholder = `{${key}}`;
    const value = formatBookmarkValueForHtmlReplacement(previewMap[key]);
    replacedContent = replacedContent.replace(
      new RegExp(placeholder, "g"),
      value,
    );
  });

  return replacedContent
    .replace(
      /<p>/g,
      '<p style="margin: 0 0 4px 0; padding: 0; line-height: 1.0;">',
    )
    .replace(
      /<p([^>]*)>/g,
      '<p$1 style="margin: 0 0 4px 0; padding: 0; line-height: 1.0;">',
    )
    .replace(
      /<br\s*\/?>/g,
      '<br style="line-height: 1.0; margin: 0; padding: 0;" />',
    );
}

function buildProfileSubscriptionsUrl(
  baseUrl,
  profileId,
  { isCurrent, subscriptionStatus },
) {
  const qs = new URLSearchParams({ profileId });
  if (
    isCurrent !== undefined &&
    isCurrent !== null &&
    String(isCurrent).trim() !== ""
  ) {
    qs.set("isCurrent", String(isCurrent));
  }
  if (
    subscriptionStatus !== undefined &&
    subscriptionStatus !== null &&
    String(subscriptionStatus).trim() !== ""
  ) {
    qs.set("subscriptionStatus", String(subscriptionStatus).trim());
  }
  return `${baseUrl}/subscriptions?${qs.toString()}`;
}

function normalizeSubscriptionRows(payload) {
  let node = payload?.data ?? payload;
  if (Array.isArray(node)) return node;
  if (Array.isArray(node?.data)) return node.data;
  if (node?.data && typeof node.data === "object") {
    if (Array.isArray(node.data.data)) return node.data.data;
    if (node.data._id || node.data.subscriptionStatus !== undefined) {
      return [node.data];
    }
  }
  if (node?._id || node?.subscriptionStatus !== undefined) return [node];
  return [];
}

export async function fetchPrimarySubscriptionForProfile(profileId) {
  const safeProfileId = String(profileId ?? "").trim();
  if (!safeProfileId) {
    throw new Error("Profile ID is required");
  }

  const baseUrl = getSubscriptionServiceBaseUrl();
  if (!baseUrl) {
    throw new Error("Subscription service URL is not configured");
  }

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { isCurrent, subscriptionStatus } = profileDetailActiveSubscriptionArgs;

  let res = await axios.get(
    buildProfileSubscriptionsUrl(baseUrl, safeProfileId, {
      isCurrent,
      subscriptionStatus,
    }),
    { headers },
  );
  let rows = normalizeSubscriptionRows(res);

  if (rows.length === 0) {
    res = await axios.get(
      buildProfileSubscriptionsUrl(baseUrl, safeProfileId, {
        isCurrent: undefined,
        subscriptionStatus: undefined,
      }),
      { headers },
    );
    rows = normalizeSubscriptionRows(res);
  }

  return pickPrimarySubscription(rows) || {};
}

export function formatPreviewMemberLabel(profile) {
  if (!profile) return "";
  const name = `${profile.personalInfo?.forename || ""} ${profile.personalInfo?.surname || ""}`.trim();
  const membershipNumber = profile.membershipNumber || "";
  return membershipNumber ? `${name} (${membershipNumber})`.trim() : name;
}
