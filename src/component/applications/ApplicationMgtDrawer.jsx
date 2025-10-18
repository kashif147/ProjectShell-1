import { useState, useRef, useEffect } from "react";
import { Drawer, Row, Col, Checkbox, Radio, Button, Spin, Modal } from "antd";
import { MailOutlined, EnvironmentOutlined } from "@ant-design/icons";
import axios from "axios";
import CustomSelect from "../common/CustomSelect";
import { useTableColumns } from "../../context/TableColumnsContext ";
import MyInput from "../common/MyInput";
import MyDatePicker from "../common/MyDatePicker";
import { useSelector, useDispatch } from "react-redux";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import { IoBagRemoveOutline } from "react-icons/io5";
import { CatOptions, workLocations } from "../../Data";
import { CiCreditCard1 } from "react-icons/ci";
import { insertDataFtn } from "../../utils/Utilities";
import { getAllLookups } from "../../features/LookupsSlice";
// import { fetchCountries } from "../../features/CountrySlice";
import { getAllApplications } from "../../features/ApplicationSlice";
import { cleanPayload } from "../../utils/Utilities";
import MyAlert from "../common/MyAlert";
import { generatePatch } from "../../utils/Utilities";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa";
import { fetchCountries } from "../../features/CountriesSlice";

import moment from "moment";
import MemberSearch from "../profile/MemberSearch";
const baseURL = process.env.REACT_APP_PROFILE_SERVICE_URL;

function ApplicationMgtDrawer({
  open,
  onClose,
  title = "Registration Request",
  isEdit = false,
}) {
  const { application, loading } = useSelector(
    (state) => state.applicationDetails
  );
  const { applications, applicationsLoading } = useSelector(
    (state) => state.applications
  );
  // let index = applications.findIndex(app => app.ApplicationId === application?.applicationId) + 1;
  const [index, setIndex] = useState();
  const [rejectionData, setRejectionData] = useState({
    reason: "",
    note: "",
  });
  const [rejectModal, setRejectModal] = useState(false);
  useEffect(() => {
    if (application && applications?.length) {
      const newIndex =
        applications.findIndex(
          (app) => app.ApplicationId === application?.applicationId
        ) + 1;

      setIndex(newIndex);
    }
  }, [open, application, applications]);
  const showLoader = applicationsLoading || loading;
  const { lookupsForSelect, isDisable, disableFtn } = useTableColumns();

  const handleReject = async () => {
    if (!rejectionData.reason) {
      //   message.error("Please select a reason before rejecting.");
      return;
    }

    try {
      //   await api.patch(`/applications/${applicationId}/reject`, rejectionData);
      //   message.success("Application rejected successfully");
      onClose();
      setRejectionData({ reason: "", note: "" });
    } catch (err) {
      //   message.error("Failed to reject application");
    }
  };
  const dispatch = useDispatch();
    const { countriesOptions, countriesData, loadingC, errorC } = useSelector(state => state.countries);
  const nextPrevData = { total: applications?.length };
  const [originalData, setOriginalData] = useState(null);
  const mapApiToState = (apiData) => {
    if (!apiData) return inputValue;
    return {
      personalInfo: {
        title: apiData?.personalDetails?.personalInfo?.title || "",
        surname: apiData?.personalDetails?.personalInfo?.surname || "",
        forename: apiData?.personalDetails?.personalInfo?.forename || "",
        gender: apiData?.personalDetails?.personalInfo?.gender || "",
        dateOfBirth: apiData?.personalDetails?.personalInfo?.dateOfBirth || "",
        countryPrimaryQualification:
          apiData?.personalDetails?.personalInfo?.countryPrimaryQualification ||
          "",
      },

      contactInfo: {
        preferredAddress:
          apiData?.personalDetails?.contactInfo?.preferredAddress || "",
        eircode: apiData?.personalDetails?.contactInfo?.eircode || "",
        buildingOrHouse:
          apiData?.personalDetails?.contactInfo?.buildingOrHouse || "",
        streetOrRoad: apiData?.personalDetails?.contactInfo?.streetOrRoad || "",
        areaOrTown: apiData?.personalDetails?.contactInfo?.areaOrTown || "",
        countyCityOrPostCode:
          apiData?.personalDetails?.contactInfo?.countyCityOrPostCode || "",
        country: apiData?.personalDetails?.contactInfo?.country || "",
        mobileNumber: apiData?.personalDetails?.contactInfo?.mobileNumber || "",
        telephoneNumber:
          apiData?.personalDetails?.contactInfo?.telephoneNumber || "",
        preferredEmail:
          apiData?.personalDetails?.contactInfo?.preferredEmail || "",
        personalEmail:
          apiData?.personalDetails?.contactInfo?.personalEmail || "",
        workEmail: apiData?.personalDetails?.contactInfo?.workEmail || "",
      },
      professionalDetails: {
        membershipCategory:
          apiData?.professionalDetails?.membershipCategory || "",
        workLocation: apiData?.professionalDetails?.workLocation || "",
        otherWorkLocation:
          apiData?.professionalDetails?.otherWorkLocation || "",
        grade: apiData?.professionalDetails?.grade || "",
        otherGrade: apiData?.professionalDetails?.otherGrade || "",
        nmbiNumber: apiData?.professionalDetails?.nmbiNumber || "",
        nurseType: apiData?.professionalDetails?.nurseType || "",
        nursingAdaptationProgramme:
          apiData?.professionalDetails?.nursingAdaptationProgramme || false,
        region: apiData?.professionalDetails?.region || "",
        branch: apiData?.professionalDetails?.branch || "",
        isRetired: apiData?.professionalDetails?.isRetired || false,
      },
      subscriptionDetails: {
        paymentType: apiData?.subscriptionDetails?.paymentType || "",
        payrollNo: apiData?.subscriptionDetails?.payrollNo || "",
        membershipStatus: apiData?.subscriptionDetails?.membershipStatus || "",
        otherIrishTradeUnion:
          apiData?.subscriptionDetails?.otherIrishTradeUnion || false,
        otherScheme: apiData?.subscriptionDetails?.otherScheme || false,
        recuritedBy: apiData?.subscriptionDetails?.recuritedBy || "",
        recuritedByMembershipNo:
          apiData?.subscriptionDetails?.recuritedByMembershipNo || "",
        primarySection: apiData?.subscriptionDetails?.primarySection || "",
        otherPrimarySection:
          apiData?.subscriptionDetails?.otherPrimarySection || "",
        secondarySection: apiData?.subscriptionDetails?.secondarySection || "",
        otherSecondarySection:
          apiData?.subscriptionDetails?.otherSecondarySection || "",
        incomeProtectionScheme:
          apiData?.subscriptionDetails?.incomeProtectionScheme || false,
        inmoRewards: apiData?.subscriptionDetails?.inmoRewards || false,
        valueAddedServices:
          apiData?.subscriptionDetails?.valueAddedServices || false,
        termsAndConditions:
          apiData?.subscriptionDetails?.termsAndConditions || false,
        membershipCategory:
          apiData?.subscriptionDetails?.membershipCategory || "",
        dateJoined: apiData?.subscriptionDetails?.dateJoined || "",
        paymentFrequency: apiData?.subscriptionDetails?.paymentFrequency || "",
      },
    };
  };
  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAllLookups());
    dispatch(getAllApplications());
  }, []);
  useEffect(() => {
    if (isEdit) {
      disableFtn(false);
    }
  }, []);
  useEffect(() => {
    if (application && open) {
      const mappedData = mapApiToState(application);
      setInfData(mappedData);
      setOriginalData(mappedData);
    }
  }, [open, application]);
  const handleApprove = () => {
    if (isEdit && originalData) {
      const proposedPatch = generatePatch(originalData, InfData);

      const obj = {
        submission: originalData,
        proposedPatch: proposedPatch,
      };
      console.log(obj, "azn");
    }
  };

  const inputValue = {
    personalInfo: {
      title: "",
      surname: "",
      forename: "",
      gender: "",
      dateOfBirth: "",
      countryPrimaryQualification: "",
    },
    contactInfo: {
      preferredAddress: "",
      eircode: "",
      buildingOrHouse: "",
      streetOrRoad: "",
      areaOrTown: "",
      countyCityOrPostCode: "",
      country: "",
      mobileNumber: "",
      telephoneNumber: "",
      preferredEmail: "",
      personalEmail: "",
      workEmail: "",
      // consentSMS: false,
      // consentEmail: false
    },
    professionalDetails: {
      membershipCategory: "",
      workLocation: "",
      otherWorkLocation: "",
      grade: "",
      otherGrade: "",
      nmbiNumber: "",
      nurseType: "",
      nursingAdaptationProgramme: false,
      region: "",
      branch: "",
      isRetired: false,
    },
    subscriptionDetails: {
      paymentType: "",
      payrollNo: "",
      membershipStatus: "",
      otherIrishTradeUnion: false,
      otherScheme: false,
      recuritedBy: "",
      recuritedByMembershipNo: "",
      primarySection: "",
      otherPrimarySection: "",
      secondarySection: "",
      otherSecondarySection: "",
      incomeProtectionScheme: false,
      inmoRewards: false,
      valueAddedServices: false,
      termsAndConditions: false,
      membershipCategory: "",
      dateJoined: "",
      paymentFrequency: "",
    },
  };
  const [InfData, setInfData] = useState(inputValue);

  const validateForm = () => {
    const requiredFields = [
      "title",
      "forename",
      "surname",
      "dateOfBirth",
      "gender",
      "buildingOrHouse",
      "countyCityOrPostCode",
      "country",
      "mobileNumber",
      "preferredEmail",
      "membershipCategory",
      "workLocation",
      "grade",
      "paymentType",
      "termsAndConditions",
      "preferredAddress",
      // 'payrollNo',
      // 'otherPrimarySection',
      // 'otherSecondarySection',
      // 'personalEmail'
    ];
    const fieldMap = {
      title: ["personalInfo", "title"],
      forename: ["personalInfo", "forename"],
      surname: ["personalInfo", "surname"],
      dateOfBirth: ["personalInfo", "dateOfBirth"],
      gender: ["personalInfo", "gender"],

      buildingOrHouse: ["contactInfo", "buildingOrHouse"],
      countyCityOrPostCode: ["contactInfo", "countyCityOrPostCode"],
      country: ["contactInfo", "country"],
      mobileNumber: ["contactInfo", "mobileNumber"],
      preferredEmail: ["contactInfo", "preferredEmail"],
      preferredAddress: ["contactInfo", "preferredAddress"],
      personalEmail: ["contactInfo", "personalEmail"],

      membershipCategory: ["professionalDetails", "membershipCategory"],
      workLocation: ["professionalDetails", "workLocation"],
      grade: ["professionalDetails", "grade"],

      paymentType: ["subscriptionDetails", "paymentType"],
      termsAndConditions: ["subscriptionDetails", "termsAndConditions"],
      payrollNo: ["subscriptionDetails", "payrollNo"],
      otherPrimarySection: ["subscriptionDetails", "otherPrimarySection"],
      otherSecondarySection: ["subscriptionDetails", "otherSecondarySection"],
    };
    const newErrors = {};
    requiredFields.forEach((field) => {
      const [section, key] = fieldMap[field] || [];
      const value = section ? InfData[section]?.[key] : null;

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (typeof value === "boolean" && value === false) // for checkboxes like termsAndConditions
      ) {
        newErrors[field] = "This field is required";
      }
    });

    if (InfData.contactInfo.preferredEmail === "personal") {
      if (!InfData.contactInfo.personalEmail?.trim()) {
        newErrors.personalEmail = "Personal Email is required";
      }
    }
    if (InfData.contactInfo.preferredEmail === "work") {
      if (!InfData.contactInfo.workEmail?.trim()) {
        newErrors.workEmail = "Work Email is required";
      }
    }
    if (InfData.subscriptionDetails.secondarySection === "Other") {
      if (!InfData.subscriptionDetails.otherSecondarySection?.trim()) {
        newErrors.otherSecondarySection = "otherSecondarySection is required";
      }
    }
    if (InfData.subscriptionDetails.primarySection === "other") {
      if (!InfData.subscriptionDetails.otherPrimarySection?.trim()) {
        newErrors.otherPrimarySection = "other Primary Section is required";
      }
    }

    // InfData?.subscriptionDetails?.paymentType === ''
    if (InfData.subscriptionDetails.paymentType === "Deduction at Source") {
      if (!InfData.subscriptionDetails.payrollNo?.trim()) {
        newErrors.payrollNo = "other Primary Section is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      debugger;
      return false;
    }

    setErrors({});

    return true;
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    try {
      const token = localStorage.getItem("token");

      const personalPayload = cleanPayload({
        personalInfo: InfData.personalInfo,
        contactInfo: InfData.contactInfo,
      });
      const personalRes = await axios.post(
        `${baseURL}/personal-details`,
        personalPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const applicationId = personalRes?.data?.data?.ApplicationId;
      if (!applicationId) {
        throw new Error("ApplicationId not returned from personal details API");
      }

      // 2. Professional Details
      const professionalPayload = cleanPayload({
        professionalDetails: InfData.professionalDetails,
      });

      await axios.post(
        `${baseURL}/professional-details/${applicationId}`,
        professionalPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 3. Subscription Details
      const subscriptionPayload = cleanPayload({
        subscriptionDetails: InfData.subscriptionDetails,
      });

      await axios.post(
        `${baseURL}/subscription-details/${applicationId}`,
        subscriptionPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ Success notification (only once)
      MyAlert("success", "All details submitted successfully!");
      setInfData(inputValue);
      if (selected?.Bulk !== true) {
        onClose();
      }
    } catch (error) {
      console.error("Submission failed:", error);
      MyAlert(
        "error",
        "Failed to submit details",
        error?.response?.data?.error?.message || error.message
      );
    }
  };

  const handleInputChange = (section, field, value) => {
    setInfData((prev) => {
      let updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };

      // Example: auto update branch & region based on workLocation
      if (field === "workLocation" && workLocationDetails?.[value]) {
        updated = {
          ...updated,
          professionalDetails: {
            ...updated.professionalDetails,
            workLocation: value,
            branch: workLocationDetails[value].branch,
            region: workLocationDetails[value].region,
          },
        };
      }

      // Generate patch from observer

      return updated;
    });

    // Clear errors if any
    setErrors((prevErrors) => {
      if (prevErrors?.[field]) {
        const { [field]: removed, ...rest } = prevErrors;
        return rest;
      }
      return prevErrors;
    });
  };

  const inputRef = useRef(null);
  const libraries = ["places", "maps"];
  const handlePlacesChanged = () => {
    const places = inputRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const placeId = place.place_id;
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      const request = {
        placeId: placeId,
        fields: ["address_components", "name", "formatted_address"],
      };

      service.getDetails(request, (details, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          details
        ) {
          const components = details.address_components;

          const getComponent = (type) =>
            components.find((c) => c.types.includes(type))?.long_name || "";

          const streetNumber = getComponent("street_number");
          const route = getComponent("route");
          const sublocality = getComponent("sublocality") || "";
          const town =
            getComponent("locality") || getComponent("postal_town") || "";
          const county = getComponent("administrative_area_level_1") || "";
          const postalCode = getComponent("postal_code");

          const buildingOrHouse = `${streetNumber} ${route}`.trim();
          const streetOrRoad = sublocality;
          const areaOrTown = town;
          const countyCityOrPostCode = `${county}`.trim();
          const eircode = `${postalCode}`.trim();

          setInfData((prev) => ({
            ...prev,
            contactInfo: {
              ...prev.contactInfo,
              buildingOrHouse,
              streetOrRoad,
              areaOrTown,
              countyCityOrPostCode,
              eircode,
            },
          }));
        }
      });
    }
  };

  const [errors, setErrors] = useState({});
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCJYpj8WV5Rzof7O3jGhW9XabD0J4Yqe1o",
    libraries: libraries,
  });
  const workLocationDetails = {
    "24 Hour Care Services": { branch: "Meath", region: "Dublin North East" },
    "24 Hour Care Services (Mid-West)": {
      branch: "Clare",
      region: "Mid-West, West and North West",
    },
    "24 Hour Care Services (North West)": {
      branch: "Sligo",
      region: "Mid-West, West and North West",
    },
    "BLANCHARDSTOWN INSTITUTE OF TECHNOLOGY": {
      branch: "Dublin Northern Branch",
      region: "Dublin Mid Leinster",
    },
    "CAREDOC (CORK)": {
      branch: "Cork Vol/Private Branch",
      region: "South - South East",
    },
    "DUBLIN INSTITUTE OF TECHNOLOGY": {
      branch: "Dublin South West Branch",
      region: "Dublin Mid Leinster",
    },
    "GLENDALE NURSING HOME (TULLOW)": {
      branch: "Carlow",
      region: "South - South East",
    },
    "HOME INSTEAD (WESTERN REGION)": { branch: "Roscommon", region: "West" },
    "LETTERKENNY INSTITUTE OF TECHNOLOGY": {
      branch: "Letterkenny",
      region: "Letterkenny",
    },
    "LIMERICK INSTITUTE OF TECHNOLOGY": {
      branch: "Limerick",
      region: "Limerick",
    },
    "SLIGO INSTITUTE OF TECHNOLOGY": { branch: "Sligo", region: "Sligo" },
    "ST JOSEPHS HOSPITAL- MOUNT DESERT": {
      branch: "Cork Vol/Private Branch",
      region: "South - South East",
    },
    "TALLAGHT INSTITUTE OF TECHNOLOGY": {
      branch: "Dublin South West Branch",
      region: "Dublin Mid Leinster",
    },
    "Atu (Letterkenny)": { branch: "Letterkenny", region: "Letterkenny" },
    "Regional Centre Of Nursing & Midwifery Education": {
      branch: "Offaly",
      region: "Mid Leinster",
    },
    "Newtown School": { branch: "Waterford", region: "South - South East" },
    "Tipperary Education & Training Board": {
      branch: "Tipperary-North-Mwhb",
      region: "Mid-West, West and North West",
    },
    "National University Ireland Galway": {
      branch: "Galway",
      region: "Mid-West, West and North West",
    },
    "South East Technological University (Setu)": {
      branch: "Carlow",
      region: "South - South East",
    },
    "Tud (Tallaght)": {
      branch: "Dublin South West Branch",
      region: "Dublin Mid Leinster",
    },
    "College Of Anaesthetists": {
      branch: "Dublin South West Branch",
      region: "Dublin Mid Leinster",
    },
    "Tud (Blanchardstown)": {
      branch: "Dublin Northern Branch",
      region: "Dublin North East",
    },
    "Gmit (Galway)": {
      branch: "Galway",
      region: "Mid-West, West and North West",
    },
    "Cork University College": {
      branch: "Cork Vol/Private Branch",
      region: "South - South East",
    },
    "Mtu (Cork)": {
      branch: "Cork Vol/Private Branch",
      region: "South - South East",
    },
    Student: { branch: "Student", region: "Student" },
    "St Columbas College (Dublin)": {
      branch: "Dublin East Coast Branch",
      region: "Dublin Mid Leinster",
    },
    "Setu (Waterford)": { branch: "Waterford", region: "South - South East" },
    "Nui Galway": {
      branch: "Galway City",
      region: "Mid-West, West and North West",
    },
    "Roscrea College": {
      branch: "Tipperary-North-Mwhb",
      region: "Mid-West, West and North West",
    },
    "Dun Laoghaire Institute Of Art & Design": {
      branch: "Dunlaoghaire",
      region: "Dublin Mid Leinster",
    },
    "Mtu (Kerry)": { branch: "Kerry", region: "South - South East" },
    "Tus (Limerick)": {
      branch: "Limerick",
      region: "Mid-West, West and North West",
    },
    "Dundalk Institute Of Technology (Dkit)": {
      branch: "Dundalk",
      region: "Dublin North East",
    },
    "Atu (Sligo)": { branch: "Sligo", region: "Mid-West, West and North West" },
    "Tud (Bolton Street)": {
      branch: "Dublin South West Branch",
      region: "Dublin Mid Leinster",
    },
    "Dublin City University": {
      branch: "Dublin Northern Branch",
      region: "Dublin North East",
    },
    "National University Ireland Maynooth": {
      branch: "Kildare/Naas",
      region: "Dublin Mid Leinster",
    },
    "University College Dublin": {
      branch: "Dublin East Coast Branch",
      region: "Dublin Mid Leinster",
    },
    "Limerick University": { branch: "Limerick", region: "Limerick" },
    "Trinity College": {
      branch: "Dublin East Coast Branch",
      region: "Dublin Mid Leinster",
    },
    "St Angelas College (Sligo)": { branch: "Sligo", region: "Sligo" },
    "Royal College Of Surgeons": {
      branch: "Dublin East Coast Branch",
      region: "Dublin North East",
    },
    "Tus (Technological University Of The Shannon)": {
      branch: "Athlone",
      region: "Dublin North East",
    },
    "Galway Mayo Institute Of Tech(C'Bar)": {
      branch: "Castlebar",
      region: "Mid-West, West and North West",
    },
  };

  const allBranches = Array.from(
    new Set(Object.values(workLocationDetails).map((d) => d.branch))
  );
  const allRegions = Array.from(
    new Set(Object.values(workLocationDetails).map((d) => d.region))
  );
  const select = {
    Bulk: false,
    Approve: false,
    Reject: false,
  };
  const [selected, setSelected] = useState(select);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    // if (name !== "Approve") {
    //     setSelected((prev) => ({
    //         ...prev,
    //         [name]: checked,
    //     }));
    // }
    if (name === "Bulk" && checked === false) {
      disableFtn(true);
      setErrors({});
    }
    if (name === "Bulk" && checked === true) {
    }
    if (name === "Approve" && checked === true) {
      const isValid = validateForm();
      if (!isValid) return;
      disableFtn(false);
      setSelected((prev) => ({
        ...prev,
        Approve: checked,
      }));
      handleApprove();
    }
    if (name === "Reject" && checked === true) {
      const isValid = validateForm();
      if (!isValid) return;
      setSelected((prev) => ({
        ...prev,
        Reject: checked,
      }));
      setRejectModal(true);
    }
  };
  function navigateApplication(direction) {
    if (index === -1) return;
    let newIndex = index;

    if (direction === "prev") {
      newIndex = newIndex - 1;
      setIndex(newIndex);
    } else if (direction === "next") {
      newIndex = newIndex + 1;
      setIndex(newIndex);
    }
    const newdata = mapApiToState(applications[newIndex]);
    setInfData((prev) => ({ ...prev, ...newdata }));
  }
  return (
    <div>
      <Drawer
        width="60%"
        open={open}
        onClose={() => {
          onClose();
          setErrors({});
          setInfData(inputValue);
          setSelected(select);
        }}
        title={title}
        extra={
          <div className="d-flex space-evenly gap-3 align-items-baseline">
            {!isEdit && (
              <>
                <MemberSearch />
                <Checkbox
                  name="Bulk"
                  checked={selected.Bulk} // <-- Must bind to state
                  onChange={handleChange}
                  onClick={() => {
                    disableFtn(false);
                    handleApprove();
                  }}
                >
                  Batch Entry
                </Checkbox>
              </>
            )}
            <Checkbox
              name="Approve"
              checked={selected.Approve} // <-- Must bind to state
              onChange={handleChange}
            >
              Approve
            </Checkbox>
            <Checkbox
              name="Reject"
              checked={selected.Reject} // <-- Must bind to state
              onChange={handleChange}
            >
              Reject
            </Checkbox>
            <Button className="butn primary-btn">Save</Button>
            {!isEdit && (
              <Button
                onClick={() => handleSubmit()}
                className="butn primary-btn"
              >
                Submit
              </Button>
            )}
            {isEdit && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  className="me-1 gray-btn butn"
                  onClick={() => navigateApplication("prev")}
                >
                  <FaAngleLeft className="deatil-header-icon" />
                </Button>
                <p
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    margin: "0 8px",
                  }}
                >
                  {index} of {nextPrevData?.total}
                </p>
                <Button
                  className="me-1 gray-btn butn"
                  onClick={() => navigateApplication("next")}
                >
                  <FaAngleRight className="deatil-header-icon" />
                </Button>
              </div>
            )}
          </div>
        }
      >
        <div className="drawer-wrapper" style={{ position: "relative" }}>
          <div
            className="drawer-main-container"
            style={{
              backgroundColor: "#f6f9fc",
              filter: showLoader ? "blur(3px)" : "none",
              pointerEvents: showLoader ? "none" : "auto",
              transition: "0.3s ease",
            }}
          >
            <>
              <div className="" style={{ backgroundColor: "#f6f9fc" }}>
                <Row
                  gutter={18}
                  className="p-1 ms-1 me-1"
                  style={{
                    backgroundColor: "#eef4ff",
                    borderRadius: "4px",
                  }}
                >
                  <Col span={24}>
                    <div className="d-flex  pt-1 pb-1">
                      <div
                        style={{
                          backgroundColor: "#e5edff",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          marginRight: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MailOutlined
                          style={{ color: "#2f6bff", fontSize: "18px" }}
                        />
                      </div>
                      <h2
                        style={{
                          fontSize: "18px",
                          margin: 0,
                          fontWeight: 500,
                          color: "#1a1a1a",
                        }}
                      >
                        Personal Information
                      </h2>
                    </div>
                  </Col>
                </Row>
                <Row
                  className="bg-white p-1 ms-1 me-1 pt-2"
                  gutter={18}
                  style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}
                >
                  <Col span={8}>
                    <CustomSelect
                      label="Title"
                      name="title"
                      value={InfData?.personalInfo?.title}
                      options={lookupsForSelect?.Titles}
                      required
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "personalInfo",
                          "title",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.title}
                    />
                  </Col>
                  <Col span={8}>
                    <MyInput
                      label="Forename"
                      name="forename"
                      value={InfData.personalInfo?.forename}
                      required
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "personalInfo",
                          "forename",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.forename}
                    />
                  </Col>
                  <Col span={8}>
                    <MyInput
                      label="Surname"
                      name="surname"
                      value={InfData.personalInfo?.surname}
                      required
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "personalInfo",
                          "surname",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.surname}
                    />
                  </Col>
                  <Col span={8}>
                    <CustomSelect
                      label="Gender"
                      name="gender"
                      value={InfData.personalInfo?.gender}
                      options={lookupsForSelect?.gender}
                      required
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "personalInfo",
                          "gender",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.gender}
                    />
                  </Col>
                  <Col span={8}>
                    <MyDatePicker
                      label="Date of Birth"
                      name="dob"
                      required
                      value={InfData?.personalInfo?.dateOfBirth} // ✅ just string like "01/07/2019"
                      disabled={isDisable}
                      onChange={(date, dateString) => {
                        console.log(moment(date).utc().toISOString(), "dte");
                        handleInputChange(
                          "personalInfo",
                          "dateOfBirth",
                          moment(date).utc().toISOString()
                        );
                      }}
                      hasError={!!errors?.dateOfBirth}
                    />
                  </Col>

                  {/* country Of Primary Qualification */}
                  <Col span={8}>
                    <CustomSelect
                      label="country Primary Qualification"
                      name="countryPrimaryQualification"
                      value={InfData?.personalInfo?.countryPrimaryQualification}
                      options={countriesOptions}
                      required
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "personalInfo",
                          "countryPrimaryQualification",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.countryPrimaryQualification}
                    />
                  </Col>
                  <Col span={12}></Col>
                </Row>
                <Row
                  gutter={18}
                  className="p-1 ms-1 me-1 mt-1"
                  style={{ backgroundColor: "#edfdf5" }}
                >
                  <Col span={24}>
                    <div className="d-flex align-items-center pt-1 pb-1">
                      <div
                        style={{
                          backgroundColor: "#e5edff",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          marginRight: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <EnvironmentOutlined
                          style={{ color: "green", fontSize: "18px" }}
                        />
                      </div>
                      <div>
                        <h2
                          style={{
                            fontSize: "18px",
                            margin: 0,
                            fontWeight: 500,
                            color: "#1a1a1a",
                          }}
                        >
                          Correspondence Details
                          <Checkbox
                            className=""
                            style={{ marginLeft: "7.5rem" }}
                          >
                            Consent to receive Correspondence from INMO
                          </Checkbox>
                        </h2>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row
                  gutter={18}
                  className="bg-white p-1 ms-1 me-1"
                  style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}
                >
                  <Col span={12}></Col>
                  <Col span={24} className="">
                    <div className="my-input-group">
                      <Row className="bg-white p-1 ms-1 me-1">
                        <Col span={12}>
                          <label
                            className={`my-input-label ${
                              errors?.preferredAddress ? "error-text1" : ""
                            }`}
                          >
                            Preferred Address{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <div
                            className={`d-flex justify-content-between align-items-start ${
                              errors?.preferredAddress ? "has-error" : ""
                            }`}
                          >
                            <Radio.Group
                              onChange={(e) =>
                                handleInputChange(
                                  "contactInfo",
                                  "preferredAddress",
                                  e.target.value
                                )
                              }
                              value={InfData?.contactInfo?.preferredAddress}
                              disabled={isDisable}
                              options={[
                                { value: "home", label: "Home" },
                                { value: "work", label: "Work" },
                              ]}
                              className={
                                errors?.preferredAddress ? "radio-error" : ""
                              }
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
                      value={InfData?.contactInfo?.buildingOrHouse}
                      required
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "buildingOrHouse",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.buildingOrHouse}
                    />
                  </Col>

                  <Col span={12}>
                    <MyInput
                      label="Address Line 2 (Street or Road)"
                      name="streetOrRoad"
                      value={InfData?.contactInfo.streetOrRoad}
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "streetOrRoad",
                          e.target.value
                        )
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <MyInput
                      label="Address Line 3 (Area or Town)"
                      name="adressLine3"
                      value={InfData.contactInfo?.areaOrTown}
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "adressLine3",
                          e.target.value
                        )
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <MyInput
                      label="Address Line 4 (County, City or Postcode)"
                      name="countyCityOrPostCode"
                      value={InfData?.contactInfo?.countyCityOrPostCode}
                      required
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "countyCityOrPostCode",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.countyCityOrPostCode}
                    />
                  </Col>

                  {/* country | Mobile */}
                  <Col span={12}>
                    <MyInput
                      label="Eircode"
                      name="Eircode"
                      placeholder="Enter Eircode"
                      value={InfData?.contactInfo?.eircode}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "eircode",
                          e.target.value
                        )
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <CustomSelect
                      label="country"
                      name="country"
                      value={InfData.contactInfo?.country}
                      options={countriesOptions}
                      required
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "country",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.country}
                    />
                  </Col>

                  <Col span={12}>
                    <MyInput
                      label="Mobile"
                      name="mobile"
                      type="mobile"
                      value={InfData.contactInfo?.mobileNumber}
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "mobileNumber",
                          e.target.value
                        )
                      }
                      // hasError={!!errors?.mobile}
                    />
                  </Col>
                  <Col span={12}>
                    <MyInput
                      label="Home / Work Tel Number"
                      name="telephoneNumber"
                      type="number"
                      value={InfData.contactInfo?.telephoneNumber}
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "telephoneNumber",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.telephoneNumber}
                    />
                  </Col>

                  {/* Preferred Email (Full Width) */}
                  <Col span={12} className="mt-1 mb-3">
                    <div className="d-flex justify-content-between">
                      <label
                        className={`my-input-label ${
                          errors?.preferredEmail ? "error-text1" : ""
                        }`}
                      >
                        Preferred Email
                        <span className="text-danger ms-1">*</span>
                      </label>
                      <Radio.Group
                        onChange={(e) =>
                          handleInputChange(
                            "contactInfo",
                            "preferredEmail",
                            e.target.value
                          )
                        }
                        value={InfData?.contactInfo?.preferredEmail}
                        disabled={isDisable}
                        className={errors?.preferredEmail ? "radio-error" : ""}
                      >
                        <Radio value="personal">Personal</Radio>
                        <Radio value="work">Work</Radio>
                      </Radio.Group>
                    </div>
                  </Col>
                  <Col span={12}></Col>
                  <Col span={12}>
                    <MyInput
                      label="Personal Email"
                      name="email"
                      type="email"
                      required={
                        InfData.contactInfo?.preferredEmail === "personal"
                      }
                      value={InfData.contactInfo?.personalEmail}
                      disabled={isDisable}
                      // onChange={handleInputChange}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "personalEmail",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.email}
                    />
                  </Col>

                  <Col span={12}>
                    <MyInput
                      label="Work Email"
                      name="Work Email"
                      type="email"
                      value={InfData?.contactInfo?.workEmail}
                      required={InfData.contactInfo?.preferredEmail === "work"}
                      disabled={isDisable}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "workEmail",
                          e.target.value
                        )
                      }
                      hasError={!!errors?.workEmail}
                    />
                  </Col>
                </Row>
              </div>
              <Row
                gutter={18}
                className="p-1 ms-1 me-1 mt-1"
                style={{ backgroundColor: "#f7f4ff" }}
              >
                <Col span={24}>
                  {/* <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Professional Details</h2> */}
                  <div className="d-flex pt-1 pb-1">
                    <div
                      style={{
                        backgroundColor: "#ede6fa",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        marginRight: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IoBagRemoveOutline
                        style={{ color: "#bf86f3", fontSize: "18px" }}
                      />
                    </div>
                    <h2
                      style={{
                        fontSize: "18px",
                        margin: 0,
                        fontWeight: 500,
                        color: "#1a1a1a",
                      }}
                    >
                      Professional Details
                    </h2>
                  </div>
                </Col>
              </Row>
              <Row
                gutter={18}
                className="bg-white ms-1 me-1 pt-2 "
                style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}
              >
                <Col span={12}>
                  <CustomSelect
                    label="Membership Category"
                    name="membershipCategory"
                    value={InfData.professionalDetails?.membershipCategory}
                    options={CatOptions}
                    required
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "membershipCategory",
                        e.target.value
                      )
                    }
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
              {InfData?.membershipCategory === "Undergraduate Student" && (
                <Row gutter={18} className="bg-white p-1 ms-1 me-1">
                  <Col span={12}>
                    <CustomSelect
                      label="Study Location"
                      name="studyLocation"
                      disabled={
                        InfData.membershipCategory !== "Undergraduate Student"
                      }
                      value={InfData?.studyLocation || ""}
                      onChange={handleInputChange}
                      placeholder="Select study location"
                      options={[
                        { value: "location1", label: "Location 1" },
                        { value: "location2", label: "Location 2" },
                        { value: "location3", label: "Location 3" },
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
                        console.log(date, "dte");
                        handleInputChange(
                          "graduationDate",
                          moment(date).utc().toISOString()
                        );
                      }}
                      hasError={!!errors?.graduationDate}
                    />
                  </Col>
                </Row>
              )}
              <Row className="bg-white p-1 ms-1 me-1" gutter={18}>
                <Col span={12}>
                  <CustomSelect
                    label="Work Location"
                    name="workLocation "
                    value={InfData.professionalDetails?.workLocation}
                    options={[
                      ...workLocations.map((loc) => ({
                        value: loc,
                        label: loc,
                      })),
                      { value: "other", label: "other" },
                    ]}
                    required
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "workLocation",
                        e.target.value
                      )
                    }
                    hasError={!!errors?.workLocation}
                  />
                </Col>

                {/* Other Work Location | Grade */}
                <Col span={12}>
                  <MyInput
                    label="Other Work Location"
                    name="Other Work Location"
                    value={InfData.professionalDetails?.otherWorkLocation}
                    required={
                      InfData.professionalDetails?.workLocation == "Other"
                    }
                    disabled={
                      isDisable ||
                      InfData?.professionalDetails?.workLocation != "Other"
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "otherWorkLocation",
                        e.target.value
                      )
                    }
                    hasError={!!errors?.workLocation}
                  />
                </Col>
                <Col span={12}>
                  <CustomSelect
                    label="Branch"
                    name="branch"
                    value={InfData.professionalDetails.branch}
                    disabled={true}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "branch",
                        e.target.value
                      )
                    }
                    options={allBranches.map((branch) => ({
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
                    value={InfData.professionalDetails?.region}
                    disabled={true}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "region",
                        e.target.value
                      )
                    }
                    options={allRegions.map((region) => ({
                      value: region,
                      label: region,
                    }))}
                  />
                </Col>
              </Row>
              <Row className="bg-white p-1 ms-1 me-1" gutter={18}>
                <Col span={12}>
                  <label className="my-input-label mt-4 my-input-wrapper">
                    Are you currently undertaking a nursing adaptation
                    programme?
                  </label>
                  <Radio.Group
                    name="nursingAdaptationProgramme"
                    value={
                      InfData.professionalDetails?.nursingAdaptationProgramme
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "nursingAdaptationProgramme",
                        e.target.value
                      )
                    }
                  >
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                  </Radio.Group>
                </Col>
                <Col span={12}>
                  <MyInput
                    label="NMBI No/An Board Altranais Number"
                    name="nmbiNumber"
                    value={InfData?.professionalDetails?.nmbiNumber}
                    // disabled={isDisable}
                    disabled={
                      InfData?.professionalDetails
                        ?.nursingAdaptationProgramme !== true
                    }
                    required={
                      InfData?.professionalDetails
                        ?.nursingAdaptationProgramme === true
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "nmbiNumber",
                        e.target.value
                      )
                    }
                  />
                </Col>
              </Row>
              <Row className="bg-white p-1 ms-1 me-1" gutter={18}>
                <label className="my-input-label mt-2">
                  Please tick one of the following
                </label>
                <Col span={24}>
                  <Radio.Group
                    name="nursingType"
                    value={InfData.professionalDetails?.nurseType}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "nurseType",
                        e.target.value
                      )
                    }
                    required={
                      InfData?.professionalDetails
                        ?.nursingAdaptationProgramme === true
                    }
                    disabled={
                      InfData?.professionalDetails
                        ?.nursingAdaptationProgramme !== true
                    }
                    style={{ display: "flex", flexWrap: "wrap", gap: "16px" }} // FLEX layout here
                  >
                    <Radio value="General Nursing">General Nursing</Radio>
                    <Radio value="Public Health Nurse">
                      Public Health Nurse
                    </Radio>
                    <Radio value="Mental Health Nurse">
                      Mental Health Nurse
                    </Radio>
                    <Radio value="Midwife">Midwife</Radio>
                    <Radio value="Sick Children's Nurse">
                      Sick Children's Nurse
                    </Radio>
                    <Radio value="Registered Nurse for Intellectual Disability">
                      Registered Nurse for Intellectual Disability
                    </Radio>
                  </Radio.Group>
                </Col>
              </Row>
              <Row className="bg-white p-1 ms-1 me-1">
                <Col span={24}>
                  <label className="my-input-label mt-4 mb-2">
                    Please select the most appropriate option below
                  </label>
                  <Radio.Group
                    label="Please select the most appropriate option below"
                    name="memberStatus"
                    value={InfData?.subscriptionDetails?.membershipStatus || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "membershipStatus",
                        e.target.value
                      )
                    }
                    options={[
                      { value: "new", label: "You are a new member" },
                      { value: "graduate", label: "You are newly graduated" },
                      {
                        value: "rejoin",
                        label:
                          "You were previously a member of the INMO, and are rejoining",
                      },
                      {
                        value: "careerBreak",
                        label: "You are returning from a career break",
                      },
                      {
                        value: "nursingAbroad",
                        label: "You are returning from nursing abroad",
                      },
                    ]}
                  />
                </Col>
              </Row>
              <Row className="bg-white p-1 pt-3 ms-1 me-1" gutter={18}>
                <Col span={12}>
                  <CustomSelect
                    label="Grade"
                    name="grade"
                    value={InfData?.professionalDetails?.grade}
                    required
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "grade",
                        e.target.value
                      )
                    }
                    options={[
                      { value: "junior", label: "Junior" },
                      { value: "senior", label: "Senior" },
                      { value: "lead", label: "Lead" },
                      { value: "manager", label: "Manager" },
                      { value: "other", label: "Other" },
                    ]}
                    hasError={!!errors?.grade}
                  />
                </Col>

                <Col span={12}>
                  <MyInput
                    label="Other Grade"
                    name="otherGrade"
                    value={InfData.professionalDetails?.otherGrade}
                    required={InfData?.professionalDetails?.grade === "other"}
                    disabled={
                      InfData?.professionalDetails?.grade !== "other" ||
                      isDisable
                    }
                    // disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "otherGrade",
                        e.target.value
                      )
                    }
                    hasError={!!errors?.otherGrade}
                  />
                </Col>
                <Col span={12}>
                  <MyDatePicker
                    label="Retired Date"
                    name="retiredDate"
                    value={
                      InfData.isRetired?.retiredDate
                        ? moment(InfData.isRetired?.retiredDate, "DD/MM/YYYY")
                        : null
                    }
                    disabled={
                      isDisable ||
                      InfData?.professionalDetails?.membershipCategory !=
                        "Retired Associate"
                    }
                    required={
                      InfData?.professionalDetails?.membershipCategory ==
                      "Retired Associate"
                    }
                    onChange={(date) =>
                      handleInputChange(
                        "professionalDetails",
                        "retiredDate",
                        date ? moment(date).utc().toISOString() : null
                      )
                    }
                  />
                </Col>

                {/* Pension No */}
                <Col span={12}>
                  <MyInput
                    label="Pension No"
                    name="pensionNo"
                    value={InfData.professionalDetails?.pensionNo}
                    disabled={
                      isDisable ||
                      InfData?.professionalDetails?.membershipCategory !=
                        "Retired Associate"
                    }
                    onChange={(e) =>
                      handleInputChange("pensionNo", e.target.value)
                    }
                    required={
                      InfData?.professionalDetails?.membershipCategory ==
                      "Retired Associate"
                    }
                    hasError={!!errors?.pensionNo}
                  />
                </Col>
              </Row>
              <Row
                className="p-1 ms-1 me-1 "
                style={{ backgroundColor: "#fff9eb" }}
                gutter={18}
              >
                <Col span={24}>
                  <div className="d-flex  pt-1 pb-1">
                    <div
                      style={{
                        backgroundColor: "#fad1b8ff",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        marginRight: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CiCreditCard1
                        style={{ color: "#ec6d28", fontSize: "18px" }}
                      />
                    </div>
                    <h2
                      style={{
                        fontSize: "18px",
                        margin: 0,
                        fontWeight: 500,
                        color: "#1a1a1a",
                      }}
                    >
                      Subscription Details
                    </h2>
                  </div>
                </Col>
              </Row>
              <Row gutter={18} className="bg-white p-1 ms-1 me-1">
                <Col span={12}>
                  <CustomSelect
                    label="Payment Type"
                    name="paymentType"
                    required
                    options={[
                      { value: "Payroll Deduction", label: "Deduction at Source" },
                      // { value: 'creditCard', label: 'Credit Card' },
                      { value: "Direct Debit", label: "Direct Debit" },
                    ]}
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "paymentType",
                        e.target.value
                      )
                    }
                    value={InfData.subscriptionDetails?.paymentType}
                    hasError={!!errors?.paymentType}
                  />
                </Col>
                <Col span={12}>
                  <MyInput
                    label="Payroll No"
                    name="payrollNo"
                    value={InfData.payrollNo}
                    hasError={!!errors?.payrollNo}
                    required={
                      InfData?.subscriptionDetails?.paymentType ===
                      "Deduction at Source"
                    }
                    disabled={
                      InfData?.subscriptionDetails?.paymentType !==
                      "Deduction at Source"
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "payrollNo",
                        e.target.value
                      )
                    }
                  />
                </Col>
              </Row>
              <Row className="bg-white p-1 ms-2 me-2" gutter={18}>
                <Col span={12}>
                  <div
                    style={{
                      minHeight: "60px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    <label className="my-input-label">
                      If you are a member of another Trade Union. If yes, which
                      Union?
                    </label>
                    <Radio.Group
                      name="otherIrishTradeUnion"
                      value={InfData.subscriptionDetails?.otherIrishTradeUnion}
                      onChange={(e) =>
                        handleInputChange(
                          "subscriptionDetails",
                          "otherIrishTradeUnion",
                          e.target?.value
                        )
                      }
                      disabled={isDisable}
                    >
                      <Radio value={true}>Yes</Radio>
                      <Radio value={false}>No</Radio>
                    </Radio.Group>
                  </div>
                </Col>

                <Col span={12}>
                  {/* <div style={{ minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}> */}
                  <label className="my-input-label">
                    Are you or were you a member of another Irish trade Union
                    salary or Income Protection Scheme?
                  </label>
                  <Radio.Group
                    name="otherScheme"
                    value={InfData.subscriptionDetails?.otherScheme}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "otherScheme",
                        e.target?.value
                      )
                    }
                    className="my-input-wrapper "
                    disabled={isDisable}
                  >
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                  </Radio.Group>
                  {/* </div> */}
                </Col>
              </Row>
              <Row gutter={18} className="bg-white p-1 ms-1 me-1 ">
                <Col span={12} gutter={18}>
                  <MyInput
                    label="Recurited By"
                    name="recuritedBy"
                    value={InfData.subscriptionDetails?.recuritedBy}
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "recuritedBy",
                        e.target.value
                      )
                    }
                  />
                </Col>
                <Col span={12}>
                  <MyInput
                    label="Recurited By (Membership No)"
                    name="recuritedByMembershipNo"
                    value={
                      InfData?.subscriptionDetails?.recuritedByMembershipNo
                    }
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "recuritedByMembershipNo",
                        e.target.value
                      )
                    }
                  />
                </Col>
              </Row>
              <Row gutter={18} className="bg-white p-1 ms-1 me-1">
                <Col span={12}>
                  <CustomSelect
                    label="Primary Section"
                    name="primarySection"
                    value={InfData.subscriptionDetails?.primarySection}
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "primarySection",
                        e.target.value
                      )
                    }
                    options={[
                      { value: "section1", label: "Section 1" },
                      { value: "section2", label: "Section 2" },
                      { value: "section3", label: "Section 3" },
                      { value: "section4", label: "Section 4" },
                      { value: "section5", label: "Section 5" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <MyInput
                    label="Other Primary Section"
                    name="otherPrimarySection"
                    value={InfData.subscriptionDetails?.otherPrimarySection}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "otherPrimarySection",
                        e.target.value
                      )
                    }
                    required={
                      InfData?.subscriptionDetails?.primarySection === "Other"
                    }
                    disabled={
                      InfData?.subscriptionDetails?.primarySection !== "Other"
                    }
                    hasError={!!errors?.otherSecondarySection}
                  />
                </Col>
              </Row>
              <Row gutter={18} className="bg-white p-1 ms-1 me-1">
                <Col span={12}>
                  <CustomSelect
                    label="Secondary Section"
                    name="secondarySection"
                    value={InfData.subscriptionDetails?.secondarySection}
                    options={[
                      { value: "section1", label: "Section 1" },
                      { value: "section2", label: "Section 2" },
                      { value: "section3", label: "Section 3" },
                      { value: "section4", label: "Section 4" },
                      { value: "section5", label: "Section 5" },
                      { value: "other", label: "Other" },
                    ]}
                    disabled={isDisable}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "secondarySection",
                        e.target.value
                      )
                    }
                  />
                </Col>
                <Col span={12}>
                  <MyInput
                    label="Other Secondary Section"
                    name="otherSecondarySection"
                    value={InfData.subscriptionDetails?.otherSecondarySection}
                    disabled={
                      isDisable ||
                      InfData?.subscriptionDetails?.secondarySection !== "Other"
                    }
                    required={
                      isDisable ||
                      InfData?.subscriptionDetails?.secondarySection === "Other"
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "otherSecondarySection",
                        e.target.value
                      )
                    }
                    hasError={!!errors?.otherSecondarySection}
                  />
                </Col>
              </Row>
              <Row className="bg-white p-1 ms-1 me-1" gutter={18}>
                <Col span={12}>
                  <Checkbox
                    checked={
                      InfData?.subscriptionDetails?.incomeProtectionScheme
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "incomeProtectionScheme",
                        e.target.checked
                      )
                    }
                    className="my-input-wrapper"
                    disabled={
                      !["new", "graduate"].includes(
                        InfData?.incomeProtectionScheme?.inmoRewards
                      ) || isDisable
                    }
                  >
                    Tick here to join INMO Income Protection Scheme
                  </Checkbox>
                </Col>

                <Col span={12}>
                  <Checkbox
                    checked={
                      InfData?.subscriptionDetails?.rewardsForInmoMembers
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "rewardsForInmoMembers",
                        e.target.checked
                      )
                    }
                    className="my-input-wrapper"
                    disabled={
                      isDisable ||
                      !["new", "graduate"].includes(
                        InfData?.subscriptionDetails?.inmoRewards
                      )
                    }
                  >
                    Tick here to join Rewards for INMO members
                  </Checkbox>
                </Col>

                <Col span={12}>
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.valueAddedServices}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "valueAddedServices",
                        e.target.checked
                      )
                    }
                    className="my-input-wrapper"
                  >
                    Tick here to allow our partners to contact you about Value
                    added Services by Email and SMS
                  </Checkbox>
                </Col>

                <Col span={12}>
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.termsAndConditions}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "termsAndConditions",
                        e.target.checked
                      )
                    }
                    className="my-input-wrapper"
                  >
                    I have read and agree to the INMO Data Protection Statement,
                    the INMO Privacy Statement and the INMO Conditions of
                    Membership
                    {errors?.termsAndConditions && (
                      <span style={{ color: "red" }}> (Required)</span>
                    )}
                  </Checkbox>
                </Col>
              </Row>
            </>
          </div>
          {showLoader && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.5)",
                zIndex: 10,
              }}
            >
              <Spin size="large" />
            </div>
          )}
        </div>
      </Drawer>
      <Modal
        title="Reject Application"
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        onOk={handleReject}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <div className="drawer-main-container">
          <CustomSelect
            label="Reason"
            name="Reason"
            required
            placeholder="Select reason"
            value={rejectionData.reason}
            onChange={(val) =>
              setRejectionData((prev) => ({ ...prev, reason: val }))
            }
            options={[
              { label: "Incomplete documents", value: "incomplete_documents" },
              { label: "Invalid information", value: "invalid_information" },
              { label: "Duplicate application", value: "duplicate" },
              { label: "Other", value: "other" },
            ]}
          />
          <MyInput
            name="Note (optional)"
            label="Note (optional)"
            placeholder="Enter note"
            value={rejectionData.note}
            onChange={(e) =>
              setRejectionData((prev) => ({ ...prev, note: e.target.value }))
            }
            textarea
          />
        </div>
      </Modal>
    </div>
  );
}

export default ApplicationMgtDrawer;
