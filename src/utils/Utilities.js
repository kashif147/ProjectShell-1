import axios from "axios";
import MyAlert from "../component/common/MyAlert";
import { notificationsMsg } from "../Data";
import dayjs from 'dayjs';
import moment from "moment";
let token;
export const  baseURL = process.env.REACT_APP_BASE_URL_DEV
// export const  baseURL = "http://localhost:3500"


export const insertDataFtn = async (apiURL=baseURL,url, data, successNotification, failureNotification,callback) => {
// const  apiURL = process.env.REACT_APP_BASE_URL_DEV
debugger  
const token = localStorage.getItem('token'); // Explicit declaration with const
  try {
    const response = await axios.post(`${apiURL}${url}`, data, {
      headers: {
        'Content-Type': 'application/json',
        maxBodyLength: Infinity,
        Authorization: `Bearer ${token}`, 
    },
    });  
    if (response.status === 201) { // Strict equality check
      MyAlert('success', successNotification);
      callback()
      return
      
    }
    // if (response.status === 201 || response.status ) { // Strict equality check
      
    //   MyAlert('success', successNotification);
    //   callback()
    //   return
      
    // }
    
    else {
      return MyAlert('error', `${failureNotification}`,response?.data?.error);
    }
  } catch (error) {
    console.error(error?.response,'222');
    MyAlert('error', failureNotification,error?.response?.data?.error); 

  }
};

export const deleteFtn = async (url,id, callback)=>{
  token = localStorage.getItem('token')
  const data = JSON.stringify({ id });
  const config = {
    method: 'delete',
    // maxBodyLength: Infinity,
    url: url,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Use Bearer token for authorization
    },
    data: data,
};
try {
  const response = await axios.request(config);
 MyAlert('success','You Have Successfully Deleted.')
 if (callback && typeof callback === 'function' && response?.data) {
  callback(); 
}
  return response.data; 
} catch (error) {
  console.error('Error deleting region:', error);
 return  MyAlert('error','Please Try Again'); 
}

}

export const updateFtn = async (apiURL=baseURL,endPoint, data1, callback,msg=notificationsMsg?.updating?.sucess) => {
  try {
    token=   localStorage.getItem('token');
    const response = await axios.put(`${apiURL}${endPoint}`, data1, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    MyAlert('success', notificationsMsg?.updating?.sucess)
    callback()
    return response.data;
  } catch (error) {
    MyAlert('error', notificationsMsg?.updating?.falier)
  
  }
};

export const calculateAgeFtn = (input) => {
  const dob = dayjs(input);  // Create Day.js object
  if (!dob.isValid()) return '';
  const today = dayjs();
  console.log("DOB:", dob.format('YYYY-MM-DD'));
  console.log("Today:", today.format('YYYY-MM-DD'));
  console.log("Age:", today.diff(dob, 'year'));  // diff in years
  return today.diff(dob, 'year');
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
          !(typeof cleaned === "object" && cleaned !== null && Object.keys(cleaned).length === 0) &&
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
  console.log(utcDateString,'ity')
  return moment.utc(utcDateString).local().format('DD/MM/YYYY HH:mm');
}

function base64URLEncode(buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}


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
