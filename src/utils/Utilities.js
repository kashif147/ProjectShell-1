import axios from "axios";
import MyAlert from "../component/common/MyAlert";
import { notificationsMsg } from "../Data";
import dayjs from "dayjs";
import moment from "moment";
import PolicyClient from "./node-policy-client";
let token;
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
  debugger

  try {
    const response = await axios.post(`${apiURL}${url}`, data, {
      headers: {
        "Content-Type": "application/json",
        maxBodyLength: Infinity,
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    // ✅ Accept any 2xx status as success
    if (response.status === 200||response.status===201 ) {
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
    console.error("Error deleting record:", error?.response?.data?.error?.message || error.message);
    MyAlert("error", "Please Try Again", error?.response?.data?.error?.message || "");
  }
};



export const updateFtn = async (
  apiURL = baseURL,
  endPoint,
  data1,
  callback,
  msg = notificationsMsg?.updating?.sucess    
) => {
  debugger
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
      MyAlert("error", notificationsMsg?.updating?.falier, response?.error?.message || "Unknown error");

    }
  } catch (error) {
    console.error("Error deleting region:", error);
    return MyAlert("error", "Please Try Again", error?.response?.data?.error?.message || "");
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
      .filter((v) => v !== null && v !== undefined && v !== ""); // ✅ remove "" inside arrays too
  } else if (typeof obj === "object" && obj !== null) {
    return Object.entries(obj)
      .filter(([_, v]) => v !== null && v !== undefined && v !== "") // ✅ remove ""
      .reduce((acc, [k, v]) => {
        const cleaned = cleanPayload(v);
        // also drop empty objects/arrays
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
  }
  return obj;
};

export function convertToLocalTime(utcDateString) {
  console.log(utcDateString, "ity");
  return moment.utc(utcDateString).local().format("DD/MM/YYYY HH:mm");
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
  process.env.REACT_APP_POLICY_SERVICE_URL || "http://localhost:3000",
  {
    onTokenExpired: () => {
      // Redirect to login when token expires
      window.location.href = "/login";
    },
  }
);

export default policy;
