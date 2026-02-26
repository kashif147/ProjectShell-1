import axios from "axios";
import MyAlert from "../component/common/MyAlert";
import { notificationsMsg } from "../Data";
import dayjs from "dayjs";
import moment from "moment";
import PolicyClient from "./node-policy-client";
export const baseURL = `${process.env.REACT_APP_POLICY_SERVICE_URL}`;

export const insertDataFtn = async (
  apiURL = baseURL,
  url,
  data,
  successNotification,
  failureNotification,
  callback
) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(`${apiURL}${url}`, data, {
      headers: {
        "Content-Type": "application/json",
        // maxBodyLength: Infinity,
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    // ✅ Accept any 2xx status as success
    if (response.status === 200 || response.status === 201) {
      MyAlert("success", successNotification);
      if (callback && typeof callback === "function") callback();
      return response.data;
    } else {
      MyAlert(
        "error",
        failureNotification,
        response?.response?.data?.error?.message || "Unknown error"
      );
      return null;
    }
  } catch (error) {
    // console.error("Axios Error:", error?.response?.data?.error?.message );
    MyAlert(
      "error",
      failureNotification,
      error?.response?.data?.error?.message
    );
    return null;
  }
};

export const deleteFtn = async (url, callback) => {
  const token = localStorage.getItem("token");

  const config = {
    method: "delete",
    url,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.request(config);

    // ✅ Handle all success codes (200–299)
    if (response.status >= 200 && response.status < 300) {
      MyAlert("success", "You Have Successfully Deleted.");
      // ✅ Always call callback after success
      // if (callback && typeof callback === "function") {
      if (callback && typeof callback === "function") {
        await callback();
      }
    }

    return response.data;
  } catch (error) {
    console.error(
      "Error deleting record:",
      error?.response?.data?.error?.message || error.message
    );
    MyAlert(
      "error",
      "Please Try Again",
      error?.response?.data?.error?.message || ""
    );
  }
};

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "€0.00";

  const formatted = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Replace any double euro signs with single euro sign
  return formatted.replace(/€€+/g, "€");
}
export const updateFtn = async (
  apiURL = baseURL,
  endPoint,
  data1,
  callback,
  msg = notificationsMsg?.updating?.sucess
) => {
  try {
    const token = localStorage.getItem("token");
    let finalEndPoint = endPoint;
    if (data1?.id && !endPoint.includes(data1.id)) {
      finalEndPoint = `${endPoint}/${data1.id}`;
    }

    const { id, ...finalData } = data1;

    const response = await axios.put(`${apiURL}${finalEndPoint}`, finalData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Update Response:", response);
    if (response?.status === 200) {
      MyAlert("success", msg);
      if (typeof callback === "function") {
        await callback(); // wait in case it's async
      }
      return response.data;
    } else {
      MyAlert(
        "error",
        notificationsMsg?.updating?.falier,
        response?.error?.message || "Unknown error"
      );
    }
  } catch (error) {
    console.error("Error deleting region:", error);
    return MyAlert(
      "error",
      "Please Try Again",
      error?.response?.data?.error?.message || ""
    );
  }
};

export const calculateAgeFtn = (input) => {
  const dob = dayjs(input); // Create Day.js object
  if (!dob.isValid()) return "";
  const today = dayjs();
  console.log("DOB:", dob.format("YYYY-MM-DD"));
  console.log("Today:", today.format("YYYY-MM-DD"));
  console.log("Age:", today.diff(dob, "year")); // diff in years
  return today.diff(dob, "year");
};

export const mapApplicationDetailToInfData = (applicationDetail) => {
  if (!applicationDetail) return {};

  const personal = applicationDetail?.personalDetails?.personalInfo || {};
  const contact = applicationDetail?.personalDetails?.contactInfo || {};
  const approval = applicationDetail?.personalDetails?.approvalDetails || {};

  return {
    forename: personal.forename || "",
    surname: personal.surname || "",
    CountryOfPrimaryQualification: personal.countryPrimaryQualification || "",
    dateOfBirth: personal.dateOfBirth ? moment(personal.dateOfBirth) : null,
    isDeceased: personal.deceased || false,

    preferredAddress: contact.preferredAddress || "",
    eircode: contact.eircode || "",
    Building: contact.buildingOrHouse || "",
    Street: contact.streetOrRoad || "",
    AreaTown: contact.areaOrTown || "",
    CountyCityOrPostCode: contact.countyCityOrPostCode || "",
    Country: contact.country || "Ireland",
    mobile: contact.mobileNumber || "",
    HomeOrWorkTel: contact.telephoneNumber || "",
    email: contact.personalEmail || "",
    preferredEmail: contact.preferredEmail || "",
    PersonalEmail: contact.personalEmail || "",
    WorkEmail: contact.workEmail || "",
    ConsentSMS: contact.consentSMS || false,
    ConsentEmail: contact.consentEmail || false,

    ApprovalComments: approval.comments || "",
  };
};
export const cleanPayload = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .map(cleanPayload)
      .filter((v) => v !== null && v !== undefined && v !== "");
  } else if (typeof obj === "object" && obj !== null) {
    const cleanedObj = Object.entries(obj)
      .filter(([_, v]) => v !== null && v !== undefined && v !== "")
      .reduce((acc, [k, v]) => {
        const cleaned = cleanPayload(v);
        if (
          !(
            typeof cleaned === "object" &&
            cleaned !== null &&
            Object.keys(cleaned).length === 0
          ) &&
          !(Array.isArray(cleaned) && cleaned.length === 0)
        ) {
          acc[k] = cleaned;
        }
        return acc;
      }, {});

    if (
      cleanedObj.subscriptionDetails &&
      cleanedObj.subscriptionDetails.submissionDate
    ) {
      delete cleanedObj.subscriptionDetails.submissionDate;
    }
    if (
      cleanedObj.professionalDetails &&
      cleanedObj.professionalDetails.startDate
    ) {
      delete cleanedObj.professionalDetails.startDate;
    }

    return cleanedObj;
  }
  return obj;
};

export function convertToLocalTime(utcDateString) {
  return moment.utc(utcDateString).local().format("DD/MM/YYYY HH:mm");
}

// Format date to DD/MM/YYYY (for Date of Birth and other date fields)
export function formatDateOnly(dateString) {
  if (!dateString) return "";
  // Handle moment objects
  if (moment.isMoment && moment.isMoment(dateString)) {
    return dateString.isValid() ? dateString.format("DD/MM/YYYY") : "";
  }
  // Handle dayjs objects
  if (typeof dayjs !== "undefined" && dayjs.isDayjs && dayjs.isDayjs(dateString)) {
    return dateString.isValid() ? dateString.format("DD/MM/YYYY") : "";
  }
  // Handle date strings (ISO, timestamp, etc.) - most common case
  const date = moment(dateString);
  return date.isValid() ? date.format("DD/MM/YYYY") : "";
}

export function formatMobileNumber(value) {
  if (!value) return "-";

  // Clean the string - keep only digits and +
  let cleaned = value.toString().replace(/[^\d+]/g, "");

  // Normalize international format
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.substring(2);
  }

  // If it's a local Irish number starting with 0 followed by 2 digits then more
  // (e.g., 0871234567 or 0761234567)
  if (cleaned.startsWith("0") && !cleaned.startsWith("00")) {
    cleaned = "+353" + cleaned.substring(1);
  }

  // If it starts with 353 but no +, add one
  if (cleaned.startsWith("353")) {
    cleaned = "+" + cleaned;
  }

  // Handle +3530... cases (strip the extra 0)
  if (cleaned.startsWith("+3530")) {
    cleaned = "+353" + cleaned.substring(5);
  }

  // Check if it matches the expected Irish format: +353 followed by 9 digits
  const irishMatch = cleaned.match(/^\+353(\d{2})(\d{3})(\d{4})$/);
  if (irishMatch) {
    return `+353 ${irishMatch[1]} ${irishMatch[2]} ${irishMatch[3]}`;
  }

  // If no match, return cleaned or original if it's already mostly okay
  return cleaned.startsWith("+") ? cleaned : value;
}

function base64URLEncode(buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export const getpermission = () => {
  return localStorage.getItem("userData");
};
export async function generatePKCE() {
  // Generate random code verifier
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = base64URLEncode(array);

  // Create code challenge
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = base64URLEncode(digest);

  return { codeVerifier, codeChallenge };
}
export function convertEuroToSand(euroAmount) {
  const euros = Number(euroAmount);

  if (isNaN(euros)) throw new Error("Invalid Euro amount");
  return euros * 100; // Convert to sand
}
export function convertSandToEuro(sandAmount) {
  if (sandAmount === undefined || sandAmount === null || sandAmount === "") {
    return sandAmount; // just return as is
  }

  const sand = Number(sandAmount);
  if (isNaN(sand)) {
    return sandAmount; // or return null if you prefer
  }

  return sand / 100; // Convert back to euros
}

export const centsToEuro = (cents) => {
  if (typeof cents !== "number" || isNaN(cents)) {
    return 0;
  }
  return cents / 100;
};

export function generatePatch(original = {}, updated = {}, path = "") {
  let patches = [];

  const allKeys = new Set([...Object.keys(original), ...Object.keys(updated)]);

  allKeys.forEach((key) => {
    const oldValue = original[key];
    const newValue = updated[key];
    const currentPath = `${path}/${key}`;

    // Case 1: Add
    if (
      (oldValue === undefined || oldValue === "") &&
      newValue !== "" &&
      newValue !== undefined
    ) {
      patches.push({ op: "add", path: currentPath, value: newValue });
    }
    // Case 2: Remove
    else if (
      oldValue !== undefined &&
      oldValue !== "" &&
      (newValue === "" || newValue === undefined)
    ) {
      patches.push({ op: "remove", path: currentPath });
    }
    // Case 3: Recurse into nested objects
    else if (
      typeof oldValue === "object" &&
      oldValue !== null &&
      typeof newValue === "object" &&
      newValue !== null
    ) {
      patches = patches.concat(generatePatch(oldValue, newValue, currentPath));
    }
    // Case 4: Replace
    else if (
      oldValue !== newValue &&
      newValue !== undefined &&
      !(oldValue === "" && newValue === "")
    ) {
      patches.push({ op: "replace", path: currentPath, value: newValue });
    }
  });

  return patches;
}
const policy = new PolicyClient(
  process.env.REACT_APP_POLICY_SERVICE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://project-shell-crm.vercel.app"),
  {
    onTokenExpired: () => {
      // Redirect to login when token expires
      window.location.href = "/login";
    },
  }
);

export default policy;

export const dateUtils = {
  prepareForAPI: (data) => {
    if (!data) return data;

    const apiData = JSON.parse(JSON.stringify(data)); // Deep clone

    const convertDateField = (obj, field) => {
      if (obj && obj[field] && dayjs.isDayjs(obj[field])) {
        obj[field] = obj[field].isValid() ? obj[field].toISOString() : null;
      }
    };

    if (apiData.personalInfo) {
      convertDateField(apiData.personalInfo, "dateOfBirth");
    }

    if (apiData.professionalDetails) {
      convertDateField(apiData.professionalDetails, "retiredDate");
      convertDateField(apiData.professionalDetails, "graduationDate");
      convertDateField(apiData.professionalDetails, "startDate");
    }

    if (apiData.subscriptionDetails) {
      convertDateField(apiData.subscriptionDetails, "dateJoined");
    }

    return apiData;
  },
};
