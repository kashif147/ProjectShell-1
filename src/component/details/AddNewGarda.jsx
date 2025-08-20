import React, { useState, useRef, useEffect } from "react";
import { Checkbox, Row, Col, Radio, Input } from "antd";
import dayjs from 'dayjs';
import moment from "moment";
import CustomSelect from "../common/CustomSelect";
import MyInput from "../common/MyInput";
import MyDatePicker from "../common/MyDatePicker";
import MyDrawer from "../common/MyDrawer";
import { useSelector, useDispatch } from "react-redux";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api'
import { fetchCountries } from "../../features/CountrySlice";
import { CatOptions, workLocations } from "../../Data";
import { getAllLookups } from "../../features/LookupsSlice";
import { calculateAgeFtn } from "../../utils/Utilities";
import '../../styles/MyInput.css'
import { insertDataFtn } from "../../utils/Utilities";
import { updateFtn } from "../../utils/Utilities";
import { v4 as uuidv4 } from "uuid";
import { notification } from 'antd'
import axios from 'axios';
import { cleanPayload } from "../../utils/Utilities";
import { convertToLocalTime } from "../../utils/Utilities";
import { getAllApplications } from "../../features/ApplicationSlice";
import '../../styles/MyDrawer.css'

const libraries = ['places', 'maps'];

function AddNewGarda({ open, onClose, isGard }) {
  const { application, loading } = useSelector((state) => state.applicationDetails);
  const { applications, applicationsLoading } = useSelector((state) => state.applications);

  const inputsInitValue = {
    age: null,
    gardaRegNo: null,
    fullname: null,
    forename: null,
    surname: null,
    countryPrimaryQualification: null,
    buildingOrHouse: null,
    streetOrRoad: null,
    areaOrTown: null,
    countyCityOrPostCode: null,
    eirCode: null,
    eircode: null,
    mobile: null,
    country: 'Ireland',
    termsAndConditions: false,
    valueAddedServices: false,
    HomeOrWorkTel: null,
    email: null,
    preferredEmail: null,
    grade: null,
    membershipCategory: null,
    workLocation: null,
    branch: null,
    region: null,
    OtherWorkLocation: null,
    retiredDate: null,
    otherGrade: null,
    WorkEmail: null,
    class: null,
    dateOfBirth: "",
    dateOfTemplemore: null,
    dateRetired: null,
    dateAged65: null,
    isDeceased: null,
    dateOfDeath: null,
    graduation: null,
    Partnership: null,
    stationPh: null,
    District: null,
    selectStation: null,
    Division: null,
    isPensioner: null,
    pensionNo: null,
    duty: null,
    rank: null,
    graduated: null,
    isGRAMember: null,
    // dateJoined: null,
    isJoined: null,
    attested: null,
    DateLeft: null,
    isLeft: null,
    isAssociateMember: null,
    notes: null,
    preferredAddress: null,
    graduationDate: null,
    nursingAdaptationProgramme: false,
    otherIrishTradeUnion: true,
    otherScheme: true,
    memberStatus: null,
    telephoneNumber: null,
    studyLocation: null,
    primarySection: null,
    ApplicationId: null,
  };
  const [InfData, setInfData] = useState(inputsInitValue);
  const mapApplicationDetailToInfData = (applicationDetail) => {
    if (!applicationDetail) return {};

    const personal = applicationDetail?.personalDetails?.personalInfo || {};
    const contact = applicationDetail?.personalDetails?.contactInfo || {};
    const approval = applicationDetail?.personalDetails?.approvalDetails || {};
    const professionalDetails = applicationDetail?.professionalDetails || {};
    const subscriptionDetails = applicationDetail?.subscriptionDetails || {};
    return {
      applicationStatus: applicationDetail?.applicationStatus,
      ApplicationId: applicationDetail?.ApplicationId == 'undefined' ? applicationDetail?.applicationId : applicationDetail?.ApplicationId,
      forename: personal.forename || "",
      surname: personal.surname || "",
      countryPrimaryQualification: personal.countryPrimaryQualification || "",
      dateOfBirth: personal.dateOfBirth ? moment(personal?.dateOfBirth) : null,
      age: personal.dateOfBirth ? calculateAgeFtn(personal?.dateOfBirth) : null,
      isDeceased: personal.deceased || false,
      title: personal?.title,
      gender: personal?.gender,

      preferredAddress: contact.preferredAddress || "",
      eircode: contact.eircode || "",
      buildingOrHouse: contact.buildingOrHouse || "",
      streetOrRoad: contact.streetOrRoad || "",
      areaOrTown: contact.areaOrTown || "",
      countyCityOrPostCode: contact.countyCityOrPostCode || "",
      country: contact.country || "Ireland",
      mobile: contact.mobileNumber || "",
      telephoneNumber: contact.telephoneNumber || "",
      email: contact.personalEmail || "",
      preferredEmail: contact.preferredEmail || "",
      PersonalEmail: contact.personalEmail || "",
      WorkEmail: contact.workEmail || "",
      ConsentSMS: contact.consentSMS || false,
      ConsentEmail: contact.consentEmail || false,
      graduationDate: professionalDetails?.graduationDate,
      workLocation: professionalDetails?.workLocation,
      nursingAdaptationProgramme: professionalDetails?.nursingAdaptationProgramme,
      nmbiNumber: professionalDetails?.nmbiNumber,
      branch: professionalDetails?.branch,
      grade: professionalDetails?.grade,
      region: professionalDetails?.region,
      otherGrade: professionalDetails?.otherGrade,
      nurseType: professionalDetails?.nurseType,
      studyLocation: professionalDetails?.studyLocation,
      retiredDate: professionalDetails?.retiredDate,
      primarySection: professionalDetails?.primarySection,
      ApprovalComments: approval.comments || "",

      membershipCategory: subscriptionDetails?.membershipCategory,
      "payrollNo": subscriptionDetails?.payrollNo,
      "membershipStatus": null,
      "otherIrishTradeUnion": subscriptionDetails?.otherIrishTradeUnion,
      "otherScheme": subscriptionDetails?.otherScheme,
      "recuritedBy": subscriptionDetails?.recuritedBy,
      "recuritedByMembershipNo": subscriptionDetails?.recuritedByMembershipNo,
      "primarySection": subscriptionDetails?.primarySection,
      "otherPrimarySection": null,
      "secondarySection": null,
      "otherSecondarySection": null,
      "incomeProtectionScheme": subscriptionDetails.incomeProtectionScheme,
      "inmoRewards": subscriptionDetails?.inmoRewards,
      "valueAddedServices": subscriptionDetails?.valueAddedServices,
      "termsAndConditions": subscriptionDetails?.termsAndConditions,
      "membershipCategory": "Short-term/ Relief (under 15 hrs/wk average)",
      // dateJoined: subscriptionDetails?.dateJoined ? moment(subscriptionDetails?.dateJoined) : null,
      "paymentType": "Payroll Deduction",
      "paymentFrequency": "Monthly",
      "submissionDate": subscriptionDetails?.submissionDate ? convertToLocalTime(subscriptionDetails?.submissionDate) : null,
    };
  };
  const { data: countryOptions, } = useSelector(
    (state) => state.countries
  );
  const inputRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCJYpj8WV5Rzof7O3jGhW9XabD0J4Yqe1o',
    libraries: libraries,
  });
  const dispatch = useDispatch();
  const {
    lookupsForSelect,
    isDisable,
    disableFtn

  } = useTableColumns();

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAllLookups())
  }, [dispatch]);
  const submitApplicationData = async () => {
    try {
      const token = localStorage.getItem('token');

      const applicationPayload = cleanPayload({
        personalInfo: {
          surname: InfData.surname,
          forename: InfData.forename,
          dateOfBirth: moment(InfData.dateOfBirth).utc().toISOString(),
          countryPrimaryQualification: InfData.countryPrimaryQualification,
          title: InfData.title || '',
          gender: InfData.gender || '',
        },
        contactInfo: {
          preferredAddress: InfData.preferredAddress,
          eircode: InfData.eirCode || InfData.eircode,
          buildingOrHouse: InfData.buildingOrHouse,
          streetOrRoad: InfData.streetOrRoad,
          areaOrTown: InfData.areaOrTown,
          countyCityOrPostCode: InfData.countyCityOrPostCode,
          country: InfData.country,
          mobileNumber: InfData.mobile,
          telephoneNumber: InfData.telephoneNumber || InfData.HomeOrWorkTel,
          preferredEmail: InfData.preferredEmail,
          personalEmail: InfData.email,
          workEmail: InfData.WorkEmail,
          consent: InfData.termsAndConditions || false,
        },
      });

      const personalRes = await axios.post(
        `${process.env.REACT_APP_PORTAL_SERVICE}/personal-details`,
        applicationPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const applicationId = personalRes?.data?.data?.ApplicationId;
      if (!applicationId) {
        throw new Error('ApplicationId not returned from personal details API');
      }

      // 2. Professional Info
      const professionalPayload = cleanPayload({
        professionalDetails: {
          membershipCategory: InfData.membershipCategory,
          workLocation: InfData.workLocation,
          otherWorkLocation: InfData.otherWorkLocation,
          grade: InfData.grade,
          otherGrade: InfData.otherGrade,
          nmbiNumber: InfData.nmbiNumber,
          nurseType: InfData.nurseType,
          nursingAdaptationProgramme: InfData.nursingAdaptationProgramme,
          region: InfData.region,
          branch: InfData.branch,
          pensionNo: InfData.pensionNo,
          isRetired: InfData.isRetired,
          retiredDate: InfData.retiredDate,
          studyLocation: InfData.studyLocation,
          graduationDate: moment(InfData.graduationDate).utc().toISOString(),
          otherGraduationDate: InfData.otherGraduationDate,
          isRetired: false,
        },
      });

      await axios.post(
        `${process.env.REACT_APP_PORTAL_SERVICE}/professional-details/${applicationId}`,
        professionalPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // 3. Subscription Info
      const subscriptionPayload = cleanPayload({
        subscriptionDetails: {
          paymentType: InfData.paymentType,
          payrollNo: InfData.payrollNo,
          otherIrishTradeUnion: InfData.otherIrishTradeUnion,
          otherScheme: InfData.otherScheme,
          recuritedBy: InfData.recuritedBy,
          recuritedByMembershipNo: InfData.recuritedByMembershipNo,
          primarySection: InfData.primarySection,
          otherPrimarySection: InfData.otherPrimarySection,
          secondarySection: InfData.secondarySection,
          otherSecondarySection: InfData.otherSecondarySection,
          incomeProtectionScheme: InfData.incomeProtectionScheme,
          inmoRewards: InfData.inmoRewards,
          valueAddedServices: InfData.valueAddedServices,
          termsAndConditions: InfData.termsAndConditions,
          membershipCategory: InfData.membershipCategory,
          paymentFrequency: InfData.paymentFrequency,
        },
      });

      await axios.post(
        `${process.env.REACT_APP_PORTAL_SERVICE}/subscription-details/${applicationId}`,
        subscriptionPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      notification.success({
        message: 'Application submitted successfully!',
      });
      setInfData(inputsInitValue)

    } catch (error) {
      console.error('Error during application submission:', error);
      notification.error({
        message: 'Submission failed!',
        description: error?.response?.data?.message || error.message,
      });
    }
  };
  // for ApplicationId

  const saveToLocalStorage = () => {
    try {
      const applicationId = uuidv4(); // generate unique ApplicationId
      const now = new Date().toISOString();
      const draftPayload = {
        ApplicationId: applicationId,
        userId: null,
        personalDetails: {
          personalInfo: {
            title: InfData.title || "",
            surname: InfData.surname,
            forename: InfData.forename,
            gender: InfData.gender || "",
            dateOfBirth: InfData.dateOfBirth ? moment(InfData.dateOfBirth).utc().toISOString() : null,
            age: InfData.dateOfBirth ? moment().diff(moment(InfData.dateOfBirth), "years") : null,
            countryPrimaryQualification: InfData.countryPrimaryQualification,
            deceased: false,
            deceasedDate: null,

          },
          contactInfo: {
            preferredAddress: InfData.preferredAddress,
            eircode: InfData.eirCode || InfData.eircode,
            buildingOrHouse: InfData.buildingOrHouse,
            streetOrRoad: InfData.streetOrRoad,
            areaOrTown: InfData.areaOrTown,
            countyCityOrPostCode: InfData.countyCityOrPostCode,
            country: InfData.country,
            fullAddress: `${InfData.buildingOrHouse || ""}, ${InfData.streetOrRoad || ""}, ${InfData.areaOrTown || ""}, ${InfData.countyCityOrPostCode || ""}, ${InfData.country || ""}`,
            mobileNumber: InfData.mobile,
            telephoneNumber: InfData.telephoneNumber || InfData.HomeOrWorkTel,
            preferredEmail: InfData.preferredEmail,
            personalEmail: InfData.email,
            workEmail: InfData.WorkEmail,
            consent: InfData.termsAndConditions || false,
          },
          // meta: {
          //   createdBy: localStorage.getItem("userId") || "system",
          //   userType: "CRM",
          //   deleted: false,
          //   isActive: true,
          // },
          // _id: 'test',
          // userId: null,
          applicationStatus: "submitted",
          // ApplicationId: applicationId,
          // createdAt: now,
          // updatedAt: now,
          // __v: 0,
        },
        professionalDetails: {
          membershipCategory: InfData.membershipCategory,
          workLocation: InfData.workLocation,
          otherWorkLocation: InfData.otherWorkLocation || null,
          grade: InfData.grade,
          otherGrade: InfData.otherGrade || null,
          nmbiNumber: InfData.nmbiNumber || null,
          nurseType: InfData.nurseType || null,
          nursingAdaptationProgramme: InfData.nursingAdaptationProgramme || false,
          region: InfData.region,
          branch: InfData.branch,
          pensionNo: InfData.pensionNo || null,
          isRetired: InfData.isRetired || false,
          retiredDate: InfData.retiredDate || null,
          studyLocation: InfData.studyLocation || null,
          graduationDate: InfData.graduationDate ? moment(InfData.graduationDate).utc().toISOString() : null,
        },
        subscriptionDetails: {
          payrollNo: InfData.payrollNo,
          membershipStatus: null,
          otherIrishTradeUnion: InfData.otherIrishTradeUnion || false,
          otherScheme: InfData.otherScheme || false,
          recuritedBy: InfData.recuritedBy || null,
          recuritedByMembershipNo: InfData.recuritedByMembershipNo || null,
          primarySection: InfData.primarySection || null,
          otherPrimarySection: InfData.otherPrimarySection || null,
          secondarySection: InfData.secondarySection || null,
          otherSecondarySection: InfData.otherSecondarySection || null,
          incomeProtectionScheme: InfData.incomeProtectionScheme || false,
          inmoRewards: InfData.inmoRewards || false,
          valueAddedServices: InfData.valueAddedServices || false,
          termsAndConditions: InfData.termsAndConditions || false,
          membershipCategory: InfData.membershipCategory,
          dateJoined: null,
          paymentType: InfData.paymentType,
          paymentFrequency: InfData.paymentFrequency,
          submissionDate: now,
        },
        applicationStatus: "Draft",
        approvalDetails: {},
        createdAt: now,
        updatedAt: now,
      };
      const existingDrafts = JSON.parse(localStorage.getItem("gardaApplicationDrafts")) || [];
      const updatedDrafts = [...existingDrafts, draftPayload];
      localStorage.setItem("gardaApplicationDrafts", JSON.stringify(updatedDrafts));
      notification.success({ message: "Draft saved successfully!" });
      setInfData(inputsInitValue);
      onClose();
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      notification.error({ message: "Failed to save draft!" });
    }
  };

  const [errors, setErrors] = useState({});


  const handleInputChange = (eventOrName, value) => {
    if (eventOrName === "dateOfBirth") {
      const formattedValue = moment(value)
      setInfData((prev) => {
        const updated = {
          ...prev,
          [eventOrName]: value,
        };
        if (eventOrName === "dateOfBirth" && value) {
          const age = calculateAgeFtn(value);
          updated.age = age;
        }
        if (eventOrName === "workLocation") {
        }
        return updated;
      });

      setErrors((prev) => ({ ...prev, [eventOrName]: "" }));
    }
    else
      if (eventOrName?.target) {

        const { name, type, value, checked } = eventOrName.target;
        const finalValue = type === "checkbox" ? checked : value;
        setInfData((prev) => {
          const updated = {
            ...prev,
            [name]: finalValue,
          };
          // Handle WorkLocation → branch & region
          if (eventOrName === "workLocation" && workLocationDetails[value]) {

            updated.branch = workLocationDetails[value].branch;
            updated.region = workLocationDetails[value].region;
          }
          return updated;
        });
        setErrors((prev) => ({ ...prev, [eventOrName.target.name]: "" }));
      }
      else {

        // const { name, type, value, checked } = eventOrName.target;
        // const finalValue = type === "checkbox" ? checked : value;
        setInfData((prev) => {
          const updated = {
            ...prev,
            [eventOrName]: value,
          };
          // Handle WorkLocation → branch & region
          if (eventOrName === "workLocation" && workLocationDetails[value]) {

            updated.branch = workLocationDetails[value].branch;
            updated.region = workLocationDetails[value].region;
          }
          return updated;
        });
        setErrors((prev) => ({ ...prev, [eventOrName]: "" }));
      }
  };

  let newdata;
  useEffect(() => {
    if (application) {
      const newdata = mapApplicationDetailToInfData(application);
      setInfData((prev) => ({ ...prev, ...newdata }));
    }
  }, [application]);

  const handleSubmit = () => {
    const requiredFields = [
      "title",
      "forename",
      "surname",
      "dateOfBirth",
      "gender",
      "buildingOrHouse",
      "countyCityOrPostCode",
      "country",
      "mobile",
      "preferredEmail",
      "membershipCategory",
      "workLocation",
      "grade",
      'PaymentType',
      'termsAndConditions',
      'preferredAddress',
      'payrollNo',
      // 'otherPrimarySection',
      // 'otherSecondarySection'
    ];
    const newErrors = {};
    requiredFields.forEach((field) => {
      const value = InfData[field];
      if (!value || value.toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });
    if (InfData.preferredEmail === "personal") {
      if (!InfData.email || InfData.email.trim() === "") {
        newErrors.email = "Personal Email is required";
      }
    }
    if (InfData.preferredEmail === "work") {
      if (!InfData.WorkEmail || InfData.WorkEmail.trim() === "") {
        newErrors.WorkEmail = "Work Email is required";
      }
    }
    if (InfData.preferredEmail === "Work") {
      if (!InfData.WorkEmail || InfData.WorkEmail.trim() === "") {
        newErrors.WorkEmail = "Work Email is required";
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      debugger
      return;
    }
    setErrors({});
    submitApplicationData()
  };

  const handlePlacesChanged = () => {
    const places = inputRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const placeId = place.place_id;
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      const request = {
        placeId: placeId,
        fields: ['address_components', 'name', 'formatted_address'],
      };
      service.getDetails(request, (details, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          details
        ) {
          const components = details.address_components;

          const getComponent = type =>
            components.find(c => c.types.includes(type))?.long_name || '';

          const streetNumber = getComponent('street_number');
          const route = getComponent('route');
          const sublocality = getComponent('sublocality') || '';
          const town = getComponent('locality') || getComponent('postal_town') || '';
          const county =
            getComponent('administrative_area_level_1') || '';
          const postalCode = getComponent('postal_code');

          const buildingOrHouse = `${streetNumber} ${route}`.trim();
          const streetOrRoad = sublocality;
          const areaOrTown = town;
          const countyCityOrPostCode = `${county}`.trim();
          const eircode = `${postalCode}`.trim();

          setInfData({
            ...InfData,
            buildingOrHouse,
            streetOrRoad,
            areaOrTown,
            countyCityOrPostCode,
            eircode,
          });
        }
      });
    }
  };
  const workLocationDetails = {
    '24 Hour Care Services': { branch: 'Meath', region: 'Dublin North East' },
    '24 Hour Care Services (Mid-West)': {
      branch: 'Clare',
      region: 'Mid-West, West and North West',
    },
    '24 Hour Care Services (North West)': {
      branch: 'Sligo',
      region: 'Mid-West, West and North West',
    },
    'BLANCHARDSTOWN INSTITUTE OF TECHNOLOGY': {
      branch: 'Dublin Northern Branch',
      region: 'Dublin Mid Leinster',
    },
    'CAREDOC (CORK)': {
      branch: 'Cork Vol/Private Branch',
      region: 'South - South East',
    },
    'DUBLIN INSTITUTE OF TECHNOLOGY': {
      branch: 'Dublin South West Branch',
      region: 'Dublin Mid Leinster',
    },
    'GLENDALE NURSING HOME (TULLOW)': {
      branch: 'Carlow',
      region: 'South - South East',
    },
    'HOME INSTEAD (WESTERN REGION)': { branch: 'Roscommon', region: 'West' },
    'LETTERKENNY INSTITUTE OF TECHNOLOGY': {
      branch: 'Letterkenny',
      region: 'Letterkenny',
    },
    'LIMERICK INSTITUTE OF TECHNOLOGY': {
      branch: 'Limerick',
      region: 'Limerick',
    },
    'SLIGO INSTITUTE OF TECHNOLOGY': { branch: 'Sligo', region: 'Sligo' },
    'ST JOSEPHS HOSPITAL- MOUNT DESERT': {
      branch: 'Cork Vol/Private Branch',
      region: 'South - South East',
    },
    'TALLAGHT INSTITUTE OF TECHNOLOGY': {
      branch: 'Dublin South West Branch',
      region: 'Dublin Mid Leinster',
    },
    'Atu (Letterkenny)': { branch: 'Letterkenny', region: 'Letterkenny' },
    'Regional Centre Of Nursing & Midwifery Education': {
      branch: 'Offaly',
      region: 'Mid Leinster',
    },
    'Newtown School': { branch: 'Waterford', region: 'South - South East' },
    'Tipperary Education & Training Board': {
      branch: 'Tipperary-North-Mwhb',
      region: 'Mid-West, West and North West',
    },
    'National University Ireland Galway': {
      branch: 'Galway',
      region: 'Mid-West, West and North West',
    },
    'South East Technological University (Setu)': {
      branch: 'Carlow',
      region: 'South - South East',
    },
    'Tud (Tallaght)': {
      branch: 'Dublin South West Branch',
      region: 'Dublin Mid Leinster',
    },
    'College Of Anaesthetists': {
      branch: 'Dublin South West Branch',
      region: 'Dublin Mid Leinster',
    },
    'Tud (Blanchardstown)': {
      branch: 'Dublin Northern Branch',
      region: 'Dublin North East',
    },
    'Gmit (Galway)': {
      branch: 'Galway',
      region: 'Mid-West, West and North West',
    },
    'Cork University College': {
      branch: 'Cork Vol/Private Branch',
      region: 'South - South East',
    },
    'Mtu (Cork)': {
      branch: 'Cork Vol/Private Branch',
      region: 'South - South East',
    },
    Student: { branch: 'Student', region: 'Student' },
    'St Columbas College (Dublin)': {
      branch: 'Dublin East Coast Branch',
      region: 'Dublin Mid Leinster',
    },
    'Setu (Waterford)': { branch: 'Waterford', region: 'South - South East' },
    'Nui Galway': {
      branch: 'Galway City',
      region: 'Mid-West, West and North West',
    },
    'Roscrea College': {
      branch: 'Tipperary-North-Mwhb',
      region: 'Mid-West, West and North West',
    },
    'Dun Laoghaire Institute Of Art & Design': {
      branch: 'Dunlaoghaire',
      region: 'Dublin Mid Leinster',
    },
    'Mtu (Kerry)': { branch: 'Kerry', region: 'South - South East' },
    'Tus (Limerick)': {
      branch: 'Limerick',
      region: 'Mid-West, West and North West',
    },
    'Dundalk Institute Of Technology (Dkit)': {
      branch: 'Dundalk',
      region: 'Dublin North East',
    },
    'Atu (Sligo)': { branch: 'Sligo', region: 'Mid-West, West and North West' },
    'Tud (Bolton Street)': {
      branch: 'Dublin South West Branch',
      region: 'Dublin Mid Leinster',
    },
    'Dublin City University': {
      branch: 'Dublin Northern Branch',
      region: 'Dublin North East',
    },
    'National University Ireland Maynooth': {
      branch: 'Kildare/Naas',
      region: 'Dublin Mid Leinster',
    },
    'University College Dublin': {
      branch: 'Dublin East Coast Branch',
      region: 'Dublin Mid Leinster',
    },
    'Limerick University': { branch: 'Limerick', region: 'Limerick' },
    'Trinity College': {
      branch: 'Dublin East Coast Branch',
      region: 'Dublin Mid Leinster',
    },
    'St Angelas College (Sligo)': { branch: 'Sligo', region: 'Sligo' },
    'Royal College Of Surgeons': {
      branch: 'Dublin East Coast Branch',
      region: 'Dublin North East',
    },
    'Tus (Technological University Of The Shannon)': {
      branch: 'Athlone',
      region: 'Dublin North East',
    },
    "Galway Mayo Institute Of Tech(C'Bar)": {
      branch: 'Castlebar',
      region: 'Mid-West, West and North West',
    },
  };

  const allBranches = Array.from(
    new Set(Object.values(workLocationDetails).map(d => d.branch)),
  );
  const allRegions = Array.from(
    new Set(Object.values(workLocationDetails).map(d => d.region)),
  );
  const applicationStatusUpdate = (status) => {
    updateFtn(
      process.env.REACT_APP_PORTAL_SERVICE,
      `/applications/status/${InfData?.ApplicationId}`,
      {
        comments: "testing",
        applicationStatus: status,
      },
      () => {
        setErrors({});
        setInfData(inputsInitValue);
        onClose();
        dispatch(getAllApplications("submitted"));
      },
      `You have successfully ${status}`
    );
  };

  function navigateApplication(direction) {
    debugger
    const index = applications.findIndex(app => app.ApplicationId === application?.applicationId);
    if (index === -1) return;
    let newIndex = index;
    debugger
    if (direction === "prev") {
      // newIndex = index === 0 ? applications.length - 1 : index - 1;
      newIndex = newIndex - 1;
    } else if (direction === "next") {
      newIndex = newIndex + 1;
    }
    debugger
    const newdata = mapApplicationDetailToInfData(applications[newIndex]);
    setInfData((prev) => ({ ...prev, ...newdata }));
    debugger
  }
  console.log(InfData, "ppppo")
  return (
    <>
      <MyDrawer
        title={`${isGard === true
          ? `Bulk Registration ${InfData?.submissionDate ? `  Submitted on: ${convertToLocalTime(InfData?.submissionDate)}` : ""}`
          : "Registration Request"}`}
        open={open}
        onClose={() => {
          setErrors({});
          setInfData(inputsInitValue);
          onClose()
          disableFtn(true)
        }}
        nextPrevData={{ total: applications?.length, }}
        nextFtn={() => navigateApplication('next')}
        PrevFtn={() => navigateApplication('prev')}
        handleChangeApprove={() => applicationStatusUpdate("approved")}
        isAppRej={true}
        rejFtn={() => applicationStatusUpdate("rejected")}
        add={handleSubmit}
        isGarda={isGard ? true : false}
        isGardaCheckbx={isGard ? false : true}
        status={InfData?.applicationStatus}
        draftFtn={saveToLocalStorage}
        isDisable={isDisable}
        width='1500px'>
        <div className="drawer-main-cntainer " >
          <div>
            <Row gutter={24}>
              <Col span={24}>
                <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Personal Information</h2>
              </Col>
              <Col span={8}>
                <CustomSelect
                  label="Title"
                  name="title"
                  value={InfData.title}
                  options={lookupsForSelect?.Titles}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  hasError={!!errors?.title}
                />
              </Col>
              <Col span={8}>
                <MyInput
                  label="Forename"
                  name="forename"
                  value={InfData.forename}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("forename", e.target.value)}
                  hasError={!!errors?.forename}
                />
              </Col>
              <Col span={8}>
                <MyInput
                  label="Surname"
                  name="surname"
                  value={InfData.surname}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("surname", e.target.value)}
                  hasError={!!errors?.surname}
                />
              </Col>
              <Col span={8}>
                <CustomSelect
                  label="Gender"
                  name="gender"
                  value={InfData.gender}
                  options={lookupsForSelect?.gender}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  hasError={!!errors?.gender}
                />
              </Col>
              <Col span={8}>
                <MyDatePicker
                  label="Date of Birth"
                  name="dob"
                  required
                  value={InfData?.dateOfBirth} // ✅ just string like "01/07/2019"
                  disabled={isDisable}
                  onChange={(date, dateString) => {
                    console.log(date, "dte")
                    handleInputChange("dateOfBirth", date)
                  }}
                  hasError={!!errors?.dateOfBirth}
                />
              </Col>
              <Col span={8}>
                <MyInput
                  label="Age (Auto-calculated)"
                  name="age"
                  value={InfData.age}
                  disabled
                />
              </Col>

              {/* country Of Primary Qualification */}
              <Col span={8}>
                <CustomSelect
                  label="countryPrimaryQualification"
                  name="countryPrimaryQualification"
                  value={InfData?.countryPrimaryQualification}
                  options={countryOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("countryPrimaryQualification", e.target.value)}
                  hasError={!!errors?.countryPrimaryQualification}
                />
              </Col>
              <Col span={12}></Col>
            </Row >
            <Row gutter={24}>
              <Col span={12}>
                <div className="d-flex">
                  <div>
                    <h2 style={{ fontSize: '22px', marginBottom: '20px', marginTop: '10px' }}>Correspondence Details</h2>
                    <Checkbox>
                      Consent to receive Correspondence from INMO
                    </Checkbox>
                  </div>
                </div>
              </Col>
              <Col span={12}>
              </Col>
              <Col span={24} className="">
                <div className="my-input-group mt-4 mb-4">
                  <Row>
                    <Col span={12}>
                      <label className={`my-input-label ${errors?.preferredAddress ? "error-text1" : ""}`}>
                        Preferred Address <span className="text-danger">*</span>
                      </label>
                      <div
                        className={`d-flex justify-content-between align-items-start ${errors?.preferredAddress ? 'has-error' : ''
                          }`}
                      >
                        <Radio.Group
                          onChange={(e) => handleInputChange("preferredAddress", e.target.value)}
                          value={InfData?.preferredAddress}
                          disabled={isDisable}
                          options={[
                            { value: 'home', label: 'Home' },
                            { value: 'work', label: 'Work' },
                          ]}
                          className={errors?.preferredAddress ? 'radio-error' : ''}
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      {isLoaded && (
                        <StandaloneSearchBox
                          onLoad={(ref) => (inputRef.current = ref)}
                          onPlacesChanged={handlePlacesChanged}
                          placeholder="Enter Eircode (e.g., D01X4X0)"
                        >
                          <MyInput
                            label="Search by address or Eircode"
                            name="Enter Eircode (e.g., D01X4X0)"
                            placeholder="Enter Eircode (e.g., D01X4X0)"
                            disabled={isDisable}
                          />
                        </StandaloneSearchBox>
                      )}
                    </Col>
                  </Row>
                </div>
              </Col>
              {/* Address Line 1 | Address Line 2 */}
              <Col span={12}>
                <MyInput
                  label="Address Line 1 (Building or House)"
                  name="buildingOrHouse"
                  value={InfData.buildingOrHouse}
                  required
                  disabled={isDisable}
                  onChange={handleInputChange}
                  hasError={!!errors?.buildingOrHouse}
                />
              </Col>

              <Col span={12}>
                <MyInput
                  label="Address Line 2 (Street or Road)"
                  name="streetOrRoad"
                  value={InfData.streetOrRoad}
                  disabled={isDisable}

                  onChange={(e) => handleInputChange("streetOrRoad", e.target.value)}
                />
              </Col>

              {/* Address Line 3 | Address Line 4 */}
              <Col span={12}>
                <MyInput
                  label="Address Line 3 (Area or Town)"
                  name="adressLine3"
                  value={InfData.areaOrTown}
                  disabled={isDisable}
                  onChange={handleInputChange}
                />
              </Col>

              <Col span={12}>
                <MyInput
                  label="Address Line 4 (County, City or Postcode)"
                  name="countyCityOrPostCode"
                  value={InfData.countyCityOrPostCode}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("countyCityOrPostCode", e.target.value)}
                  hasError={!!errors?.countyCityOrPostCode}
                />
              </Col>

              {/* country | Mobile */}
              <Col span={12}>
                <MyInput
                  label="Eircode"
                  name="Eircode"
                  placeholder="Enter Eircode"
                  disabled={isDisable}
                  value={InfData?.eircode}
                />
              </Col>
              <Col span={12}>
                <CustomSelect
                  label="country"
                  name="country"
                  value={InfData.country}
                  options={countryOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  hasError={!!errors?.country}
                />
              </Col>

              <Col span={12}>
                <MyInput
                  label="Mobile"
                  name="mobile"
                  type="number"
                  value={InfData.mobile}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  hasError={!!errors?.mobile}
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Home / Work Tel Number"
                  name="telephoneNumber"
                  type="number"
                  value={InfData.telephoneNumber}
                  disabled={isDisable}
                  // onChange={handleInputChange}
                  onChange={(e) => handleInputChange("telephoneNumber", e.target.value)}
                  hasError={!!errors?.telephoneNumber}
                />
              </Col>

              {/* Preferred Email (Full Width) */}
              <Col span={12} className="mt-2 mb-4">
                <label className={`my-input-label ${errors?.preferredEmail ? "error-text1" : ""}`}>Preferred Email<span className="text-danger ms-1">*</span></label>
                <Radio.Group
                  onChange={(e) => handleInputChange("preferredEmail", e.target.value)}
                  value={InfData?.preferredEmail}
                  disabled={isDisable}
                  className={errors?.preferredEmail ? 'radio-error' : ''}
                >
                  <Radio value="personal">Personal</Radio>
                  <Radio value="work">Work</Radio>
                </Radio.Group>
              </Col>
              <Col span={12}></Col>
              <Col span={12}>
                <MyInput
                  label="Personal Email"
                  name="email"
                  type="email"
                  required={InfData.preferredEmail === "personal"}
                  value={InfData.email}
                  disabled={isDisable}
                  // onChange={handleInputChange}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  hasError={!!errors?.email}
                />
              </Col>

              <Col span={12}>
                <MyInput
                  label="Work Email"
                  name="Work Email"
                  type="email"
                  value={InfData.WorkEmail}
                  required={InfData.preferredEmail === "work"}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("WorkEmail", e.target.value)}
                  hasError={!!errors?.WorkEmail}
                />
              </Col>
            </Row>
          </div>
          <Row gutter={24}>
            <Col span={24}>
              <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Professional Details</h2>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <CustomSelect
                label="Membership Category"
                name="membershipCategory"
                value={InfData.membershipCategory}
                options={CatOptions}
                required
                disabled={isDisable}
                onChange={(e) => handleInputChange("membershipCategory", e.target.value)}
                hasError={!!errors?.membershipCategory}
              />
            </Col>
            <Col span={12}>
              {/* <MyDatePicker
                label="Joining Date"
                name="dateJoined"
                required
                value={InfData?.dateJoined} // ✅ just string like "01/07/2019"
                disabled={isDisable}
                onChange={(date, dateString) => {
                  console.log(date, "dte")
                  handleInputChange("dateJoined", date)
                }}
                hasError={!!errors?.dateJoined}
              /> */}
            </Col>
          </Row>
          {InfData.membershipCategory === 'Undergraduate Student' && (
            <Row gutter={24}>
              <Col span={12}>
                <CustomSelect
                  label="Study Location"
                  name="studyLocation"
                  disabled={InfData.membershipCategory !== 'Undergraduate Student'}
                  value={InfData?.studyLocation || ''}
                  onChange={handleInputChange}
                  placeholder="Select study location"
                  options={[
                    { value: 'location1', label: 'Location 1' },
                    { value: 'location2', label: 'Location 2' },
                    { value: 'location3', label: 'Location 3' },
                  ]}
                  hasError={!!errors?.studyLocation}
                />
              </Col>
              <Col span={12}>
                <MyDatePicker
                  label="Graduation date"
                  name="graduationDate"
                  required
                  value={moment(InfData?.graduationDate)} // ✅ just string like "01/07/2019"
                  disabled={isDisable}
                  onChange={(date, dateString) => {
                    console.log(date, "dte")
                    handleInputChange("graduationDate", date)
                  }}
                  hasError={!!errors?.graduationDate}
                />
              </Col>
            </Row>
          )}
          <Row gutter={24}>
            <Col span={12}>
              <CustomSelect
                label="Work Location"
                name="workLocation"
                value={InfData.workLocation}
                options={[
                  ...workLocations.map(loc => ({ value: loc, label: loc })),
                  { value: 'other', label: 'other' },
                ]}
                required
                disabled={isDisable}
                onChange={(e) => handleInputChange("workLocation", e.target.value)}
                hasError={!!errors?.workLocation}
              />
            </Col>

            {/* Other Work Location | Grade */}
            <Col span={12}>

              <MyInput
                label="Other Work Location"
                name="Other Work Location"
                value={InfData.OtherWorkLocation}
                required={InfData.WorkLocation == 'other'}
                disabled={isDisable || InfData.WorkLocation != 'other'}
                onChange={(e) => handleInputChange("OtherWorkLocation", e.target.value)}
                hasError={!!errors?.OtherWorkLocation}
              />
            </Col>
            <Col span={12}>
              <CustomSelect
                label="Branch"
                name="branch"
                value={InfData.branch}
                disabled={true}
                onChange={(e) => handleInputChange("branch", e.target.value)}
                options={allBranches.map(branch => ({
                  value: branch,
                  label: branch,
                }))}
              />
            </Col>
            {/* Region | Retired Date */}
            <Col span={12}>
              <CustomSelect
                label="Region"
                name="Region"
                value={InfData.region}
                disabled={true}
                onChange={(e) => handleInputChange("region", e.target.value)}
                options={allRegions.map(region => ({ value: region, label: region }))}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <label className="my-input-label mt-4 my-input-wrapper">
                Are you currently undertaking a nursing adaptation programme?
              </label>
              <Radio.Group
                name="nursingAdaptationProgramme"
                value={InfData.nursingAdaptationProgramme}
                onChange={(e) => handleInputChange("nursingAdaptationProgramme", e.target.value)}
              >
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Col>
            <Col span={12}>
              <MyInput
                label="NMBI No/An Board Altranais Number"
                name="nmbiNumber"
                value={InfData.nmbiNumber}
                // disabled={isDisable}
                disabled={InfData?.nursingAdaptationProgramme !== true}
                required={InfData?.nursingAdaptationProgramme === true}
                onChange={(e) => handleInputChange("nmbiNumber", e.target.value)}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <label className="my-input-label mt-4">Please tick one of the following</label>
            <Col span={24}>
              <Radio.Group
                name="nursingType"
                value={InfData.nursingType}
                onChange={handleInputChange}
                required={InfData?.nursingAdaptationProgramme === true}
                disabled={InfData?.nursingAdaptationProgramme !== true}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }} // FLEX layout here
              >
                <Radio value="General Nursing">General Nursing</Radio>
                <Radio value="Public Health Nurse">Public Health Nurse</Radio>
                <Radio value="Mental Health Nurse">Mental Health Nurse</Radio>
                <Radio value="Midwife">Midwife</Radio>
                <Radio value="Sick Children's Nurse">Sick Children's Nurse</Radio>
                <Radio value="Registered Nurse for Intellectual Disability">
                  Registered Nurse for Intellectual Disability
                </Radio>
              </Radio.Group>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <label className="my-input-label mt-4 mb-4">Please select the most appropriate option below</label>
              <Radio.Group
                label="Please select the most appropriate option below"
                name="memberStatus"
                value={InfData?.memberStatus || ''}
                onChange={handleInputChange}
                options={[
                  { value: 'new', label: 'You are a new member' },
                  { value: 'graduate', label: 'You are newly graduated' },
                  {
                    value: 'rejoin',
                    label:
                      'You were previously a member of the INMO, and are rejoining',
                  },
                  {
                    value: 'careerBreak',
                    label: 'You are returning from a career break',
                  },
                  {
                    value: 'nursingAbroad',
                    label: 'You are returning from nursing abroad',
                  },
                ]}
              />
            </Col>
          </Row>
          <Row gutter={24} className="mt-3">
            <Col span={12}>
              <CustomSelect
                label="Grade"
                name="grade"
                value={InfData.grade}
                required
                disabled={isDisable}
                onChange={(e) => handleInputChange("grade", e.target.value)}
                options={[
                  { value: 'junior', label: 'Junior' },
                  { value: 'senior', label: 'Senior' },
                  { value: 'lead', label: 'Lead' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'other', label: 'Other' },
                ]}
                hasError={!!errors?.grade}
              />
            </Col>

            <Col span={12}>
              <MyInput
                label="Other Grade"
                name="otherGrade"
                value={InfData.otherGrade}
                required={InfData?.grade === 'other'}
                disabled={InfData?.grade !== 'other' || isDisable}
                // disabled={isDisable}
                onChange={(e) => handleInputChange("otherGrade", e.target.value)}
                hasError={!!errors?.otherGrade}
              />
            </Col>
            <Col span={12}>
              <MyDatePicker
                label="Retired Date"
                name="retiredDate"
                value={InfData.retiredDate ? moment(InfData.retiredDate, "DD/MM/YYYY") : null}
                disabled={isDisable || InfData?.membershipCategory != 'Retired Associate'}
                required={InfData?.membershipCategory == 'Retired Associate'}
                onChange={(date) =>
                  handleInputChange("retiredDate", date ? date.format("DD/MM/YYYY") : null)

                }
              />
            </Col>

            {/* Pension No */}
            <Col span={12}>
              <MyInput
                label="Pension No"
                name="pensionNo"
                value={InfData.pensionNo}
                disabled={isDisable || InfData?.membershipCategory != 'Retired Associate'}
                onChange={(e) => handleInputChange("pensionNo", e.target.value)}
                required={InfData?.membershipCategory == 'Retired Associate'}
                hasError={!!errors?.pensionNo}
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Subscription Details</h2>
            </Col>
            <Col span={12}>
              <CustomSelect
                label="Payment Type"
                name="PaymentType"
                required
                options={[
                  { value: 'deduction', label: 'Deduction at Source' },
                  { value: 'creditCard', label: 'Credit Card' },
                ]}
                disabled={isDisable}
                onChange={(e) => handleInputChange("PaymentType", e.target.value)}
                value={InfData.PaymentType}
                hasError={!!errors?.PaymentType}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Payroll No"
                name="payrollNo"
                value={InfData.payrollNo}
                hasError={!!errors?.payrollNo}
                required={InfData?.PaymentType === 'Deduction at Source'}
                disabled={InfData?.PaymentType !== 'Deduction at Source'}
                onChange={(e) => handleInputChange("payrollNo", e.target.value)}
              />
            </Col>
          </Row>



          <Row gutter={24} >
            <Col span={12}>
              <div style={{ minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <label className="my-input-label mt-4">
                  If you are a member of another Trade Union. If yes, which Union?
                </label>
                <Radio.Group
                  name="otherIrishTradeUnion"
                  value={InfData.otherIrishTradeUnion}
                  onChange={(e) => handleInputChange('otherIrishTradeUnion', e.target?.value)}
                  disabled={isDisable}
                >
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </div>
            </Col>

            <Col span={12}>
              {/* <div style={{ minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}> */}
              <label className="my-input-label mt-4">
                Are you or were you a member of another Irish trade Union salary or Income Protection Scheme?
              </label>
              <Radio.Group
                name="otherScheme"
                value={InfData.otherScheme}
                onChange={(e) => handleInputChange('otherIrishTradeUnion', e.target?.value)}
                className="my-input-wrapper "
                disabled={isDisable}
                
              >
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
              {/* </div> */}
            </Col>
          </Row>

          <Row gutter={24} className="mt-3">
            <Col span={12} gutter={24} >
              <MyInput
                label="Recurited By"
                name="recuritedBy"
                value={InfData.recuritedBy}
                disabled={isDisable}
                onChange={(e) => handleInputChange("recuritedBy", e.target.value)}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Recurited By (Membership No)"
                name="recuritedByMembershipNo"
                value={InfData.recuritedByMembershipNo}
                disabled={isDisable}
                onChange={(e) => handleInputChange("recuritedByMembershipNo", e.target.value)}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <CustomSelect
                label="Primary Section"
                name="primarySection"
                value={InfData.primarySection}
                disabled={isDisable}
                onChange={(e) => handleInputChange("primarySection", e.target.value)}
                options={[
                  { value: 'section1', label: 'Section 1' },
                  { value: 'section2', label: 'Section 2' },
                  { value: 'section3', label: 'Section 3' },
                  { value: 'section4', label: 'Section 4' },
                  { value: 'section5', label: 'Section 5' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Other Primary Section"
                name="otherPrimarySection"
                value={InfData.otherPrimarySection}
                // disabled={isDisable}
                onChange={(e) => handleInputChange("otherPrimarySection", e.target.value)}
                required={InfData?.primarySection === 'Other'}
                disabled={InfData?.primarySection !== 'Other'}
                hasError={!!errors?.otherPrimarySection}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <CustomSelect
                label="Secondary Section"
                name="secondarySection"
                value={InfData.secondarySection}
                options={[
                  { value: 'section1', label: 'Section 1' },
                  { value: 'section2', label: 'Section 2' },
                  { value: 'section3', label: 'Section 3' },
                  { value: 'section4', label: 'Section 4' },
                  { value: 'section5', label: 'Section 5' },
                  { value: 'other', label: 'Other' },
                ]}
                disabled={isDisable}
                onChange={(e) => handleInputChange("secondarySection", e.target.value)}

              /></Col>
            <Col span={12}>
              <MyInput
                label="Other Secondary Section"
                name="otherSecondarySection"
                value={InfData.otherSecondarySection}
                disabled={isDisable || InfData?.secondarySection !== 'Other'}
                required={isDisable || InfData?.secondarySection === 'Other'}
                onChange={(e) => handleInputChange("otherSecondarySection", e.target.value)}
                hasError={!!errors?.otherSecondarySection}
              /></Col>
          </Row>
          <Row gutter={24}>
            <Col span={12} >
              <Checkbox
                checked={InfData?.incomeProtectionScheme}
                onChange={(e) => handleInputChange('incomeProtectionScheme', e.target.checked)}
                className="my-input-wrapper"
                disabled={!['new', 'graduate'].includes(InfData?.inmoRewards) || isDisable}
              >
                Tick here to join INMO Income Protection Scheme
              </Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox className="my-input-wrapper" disabled={isDisable ||
                !['new', 'graduate'].includes(InfData?.inmoRewards)
              }>
                Tick here to join Rewards for INMO members
              </Checkbox>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Checkbox className="my-input-wrapper"
                onChange={(e) => handleInputChange('valueAddedServices', e.target.checked)}
                checked={InfData?.valueAddedServices}
              >
                Tick here to allow our partners to contact you about Value added Services by Email and SMS
              </Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox
                checked={InfData?.termsAndConditions}
                onChange={(e) => handleInputChange('termsAndConditions', e.target.checked)}
                className="my-input-wrapper"
              >
                I have read and agree to the INMO
                Data Protection Statement , the INMO Privacy Statement and the INMO
                Conditions of Membership
                {errors?.termsAndConditions && <span style={{ color: 'red' }}> (Required)</span>}
              </Checkbox>

            </Col>
          </Row>
        </div>
      </MyDrawer >
    </>
  );
}

export default AddNewGarda;