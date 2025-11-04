import { useState, useRef, useEffect } from "react";
import { Drawer, Row, Col, Checkbox, Radio, Button, Spin, Modal, Flex } from "antd";
import { MailOutlined, EnvironmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs"
import axios from "axios";
import CustomSelect from "../common/CustomSelect";
import { useTableColumns } from "../../context/TableColumnsContext ";
import MyInput from "../common/MyInput";
import { useSelector, useDispatch } from "react-redux";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import { IoBagRemoveOutline } from "react-icons/io5";
import { CatOptions, workLocations } from "../../Data";
import { CiCreditCard1 } from "react-icons/ci";
import { insertDataFtn } from "../../utils/Utilities";
// import { fetchCountries } from "../../features/CountrySlice";
import { getAllApplications } from "../../features/ApplicationSlice";
import { cleanPayload } from "../../utils/Utilities";
import MyAlert from "../common/MyAlert";
import { generatePatch } from "../../utils/Utilities";
import { FaAngleLeft } from "react-icons/fa6";
import { selectGroupedLookups, selectGroupedLookupsByType } from "../../features/LookupsSlice";
import { FaAngleRight } from "react-icons/fa";
import { fetchCountries } from "../../features/CountriesSlice";
import { getWorkLocationHierarchy } from "../../features/LookupsWorkLocationSlice";
import { getAllLookups } from "../../features/LookupsSlice";
import moment from "moment";
import MemberSearch from "../profile/MemberSearch";
import MyFooter from "../common/MyFooter";
import MyDatePicker1 from "../common/MyDatePicker1";
import Breadcrumb from "../common/Breadcrumb";
import { useFilters } from "../../context/FilterContext";
const baseURL = process.env.REACT_APP_PROFILE_SERVICE_URL;

function ApplicationMgtDrawer({
  open,
  onClose,
  title = "Registration Request",
}) {
  const { application, loading } = useSelector(
    (state) => state.applicationDetails
  );
  const navigate = useNavigate();
  const { filtersState } = useFilters();
 const getApplicationStatusFilters = () => {
  if (filtersState['Application Status']?.selectedValues?.length > 0) {
    const statusMapping = {
      'In-Progress': 'inprogress',
      'Approved': 'approved',
      'Rejected': 'rejected', 
      'Submitted': 'submitted',
      'Draft': 'draft'  // ✅ ADD DRAFT MAPPING
    };
    const statusValues = filtersState['Application Status'].selectedValues;
    return statusValues.map(status => 
      statusMapping[status] || status.toLowerCase().replace('-', '')
    );
  }
  return [];
};

  const refreshApplicationsWithStatusFilters = () => {
    const statusFilters = getApplicationStatusFilters();
    dispatch(getAllApplications(statusFilters));
  };
  const groupedlookupsForSelect = useSelector(selectGroupedLookupsByType);
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null, // 'approve' or 'reject'
  })

  const { state } = useLocation();
  console.log(groupedlookupsForSelect, "application")
  const isEdit = state?.isEdit || false;
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
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const statusPayload = {
        applicationStatus: "rejected",
        comments: rejectionData.reason, // Include rejection reason if needed
        applicationStatus: "rejected" // Include rejection note if needed
      };

      await axios.put(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/status/${application?.applicationId}`,
        statusPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      MyAlert("success", "Application rejected successfully!");
      refreshApplicationsWithStatusFilters()
      // navigate('/Applications');
      // onClose();
      setRejectionData({ reason: "", note: "" });

    } catch (error) {
      console.error("Error rejecting application:", error);
      MyAlert(
        "error",
        "Failed to reject application",
        error?.response?.data?.error?.message || error.message
      );
    }
  };
  const dispatch = useDispatch();
  const { countriesOptions, countriesData, loadingC, errorC } = useSelector(state => state.countries);

  const {
    hierarchyLookup,
    workLocationLoading,
    workLocationError
  } = useSelector((state) => state.lookupsWorkLocation);
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
        dateOfBirth: apiData?.personalDetails?.personalInfo?.dateOfBirth !== null && apiData?.personalDetails?.personalInfo?.dateOfBirth != undefined && apiData?.personalDetails?.personalInfo?.dateOfBirth !== "" ?
          dayjs(apiData?.personalDetails?.personalInfo?.dateOfBirth) : null,
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
        retiredDate: apiData?.professionalDetails?.retiredDate !== undefined && apiData?.professionalDetails?.retiredDate !== "" && apiData?.professionalDetails?.retiredDate !== null ?
          apiData?.professionalDetails?.retiredDate : null,
        pensionNo: apiData?.professionalDetails?.pensionNo
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
  console.log(hierarchyLookup, "hierarchyLookup")
  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAllLookups());
    refreshApplicationsWithStatusFilters()
    // dispatch(getWorkLocationHierarchy());
  }, [dispatch]);
  useEffect(() => {
    if (isEdit) {
      disableFtn(false);
    }
  }, []);
  useEffect(() => {
    if (application && isEdit) {
      const mappedData = mapApiToState(application);
      setInfData(mappedData);
      setOriginalData(mappedData);
    }
  }, [isEdit, application]);
  const handleApprove = async (key) => {
    if (isEdit && originalData) {
      const proposedPatch = generatePatch(originalData, InfData);
      const obj = {
        submission: originalData,
        proposedPatch: proposedPatch,
      };

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // 🟢 If no changes were proposed, update status directly
        if (!proposedPatch || proposedPatch.length === 0) {
          const newStatus =
            key?.toLowerCase() === "rejected" ? "rejected" : "approved";
          const statusPayload = { applicationStatus: newStatus };
          const statusResponse = await axios.put(
            `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/status/${application?.applicationId}`,
            statusPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          MyAlert(
            "success",
            `Application ${newStatus === "approved" ? "approved" : "rejected"} successfully!`
          );
          refreshApplicationsWithStatusFilters()
          navigate('/Applications')
          return; // ⛔ stop further flow
        }

        // 🟡 If there are proposed changes → approve as usual
        const approveResponse = await axios.post(
          `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${application?.applicationId}/approve`,
          obj,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Check for section changes
        const personalChanged = hasPersonalDetailsChanged(originalData, InfData);
        const professionalChanged = hasProfessionalDetailsChanged(originalData, InfData);

        if (personalChanged && application?.personalDetails?._id) {
          const personalPayload = cleanPayload({
            personalInfo: InfData.personalInfo,
            contactInfo: InfData.contactInfo,
          });

          await axios.put(
            `${process.env.REACT_APP_PROFILE_SERVICE_URL}/personal-details/${application?.applicationId}`,
            personalPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Personal details updated successfully");
        }

        if (professionalChanged && application?.professionalDetails?._id) {
          const professionalPayload = cleanPayload({
            professionalDetails: InfData.professionalDetails,
          });

          await axios.put(
            `${process.env.REACT_APP_PROFILE_SERVICE_URL}/professional-details/${application?.applicationId}`,
            professionalPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Professional details updated successfully");
        }

        // Show success message
        let successMessage = "Application approved successfully!";
        if (personalChanged && professionalChanged) {
          successMessage = "Application approved and all details updated successfully!";
        } else if (personalChanged) {
          successMessage = "Application approved and personal details updated successfully!";
        } else if (professionalChanged) {
          successMessage = "Application approved and professional details updated successfully!";
        }
        MyAlert("success", successMessage);
        refreshApplicationsWithStatusFilters()
      } catch (error) {
        console.error("Error approving application:", error);
        MyAlert(
          "error",
          "Failed to approve application",
          error?.response?.data?.error?.message || error.message
        );
      }
    }
  };
  const SectionHeader = ({ icon, title, backgroundColor, iconBackground, subTitle }) => (
    <Row gutter={18} className="p-3 mb-3 rounded" style={{ backgroundColor }}>
      <Col span={24}>
        <div className="d-flex align-items-center">
          <div
            style={{
              backgroundColor: iconBackground,
              padding: "6px 8px",
              borderRadius: "6px",
              marginRight: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
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
              {title}
            </h2>
            <h6 style={{
              fontSize: "14px",
              margin: 0,
              fontWeight: 400,
              color: "#666", // Light black color
              marginTop: "4px", // Add some space between title and subtitle
            }}>
              {subTitle}
            </h6>
          </div>
        </div>
      </Col>
    </Row>
  );

  const hasPersonalDetailsChanged = (original, current) => {
    const personalInfoFields = ['title', 'surname', 'forename', 'gender', 'dateOfBirth', 'countryPrimaryQualification'];
    const contactInfoFields = ['preferredAddress', 'eircode', 'buildingOrHouse', 'streetOrRoad', 'areaOrTown', 'countyCityOrPostCode', 'country', 'mobileNumber', 'telephoneNumber', 'preferredEmail', 'personalEmail', 'workEmail'];

    const personalInfoChanged = personalInfoFields.some(field =>
      original.personalInfo?.[field] !== current.personalInfo?.[field]
    );

    const contactInfoChanged = contactInfoFields.some(field =>
      original.contactInfo?.[field] !== current.contactInfo?.[field]
    );

    return personalInfoChanged || contactInfoChanged;
  };

  const hasProfessionalDetailsChanged = (original, current) => {
    const professionalFields = [
      'membershipCategory', 'workLocation', 'otherWorkLocation', 'grade',
      'otherGrade', 'nmbiNumber', 'nurseType', 'nursingAdaptationProgramme',
      'region', 'branch', 'pensionNo', 'isRetired', 'retiredDate',
      'studyLocation', 'graduationDate'
    ];

    return professionalFields.some(field => {
      const originalValue = original.professionalDetails?.[field];
      const currentValue = current.professionalDetails?.[field];

      return originalValue !== currentValue;
    });
  };

  const inputValue = {
    personalInfo: {
      title: "",
      surname: "",
      forename: "",
      gender: "",
      dateOfBirth: null,
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
      pensionNo: ""
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
  console.log("InfData", InfData)
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
      'countryPrimaryQualification',

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
      countryPrimaryQualification: ["personalInfo", "countryPrimaryQualification"],

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
      retiredDate: ["professionalDetails", "retiredDate"],
      pensionNo: ["professionalDetails", "pensionNo"],

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
    if (InfData.personalInfo?.workLocation === "Other") {
      if (!InfData.personalInfo.otherworkLocation?.trim()) {
        newErrors.otherworkLocation = "other Work Location";
      }
    }
    if (InfData.subscriptionDetails.primarySection === "other") {
      if (!InfData.subscriptionDetails.otherPrimarySection?.trim()) {
        newErrors.otherPrimarySection = "other Primary Section is required";
      }
    }
    // if (InfData?.professionalDetails?.membershipCategory === "retired_associate") {
    if (InfData?.professionalDetails?.membershipCategory === "retired_associate" && !InfData.professionalDetails?.retiredDate?.trim()) {
      newErrors.retiredDate = "required";
    }
    if (InfData?.professionalDetails?.membershipCategory === "retired_associate" && !InfData.professionalDetails?.pensionNo?.trim()) {
      newErrors.pensionNo = "required";
    }
    // }

    // InfData?.subscriptionDetails?.paymentType === ''
    if (InfData.subscriptionDetails.paymentType === "Payroll Deduction") {
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
  // Function to generate patch for newly created fields
  const generateCreatePatch = (data) => {
    const patch = [];

    // Add operations for each section and field
    if (data.personalInfo) {
      patch.push({ "op": "add", "path": "/personalInfo", "value": {} });
      Object.keys(data.personalInfo).forEach(key => {
        if (data.personalInfo[key] !== null && data.personalInfo[key] !== undefined && data.personalInfo[key] !== "") {
          patch.push({
            "op": "add",
            "path": `/personalInfo/${key}`,
            "value": data.personalInfo[key]
          });
        }
      });
    }

    if (data.contactInfo) {
      patch.push({ "op": "add", "path": "/contactInfo", "value": {} });
      Object.keys(data.contactInfo).forEach(key => {
        if (data.contactInfo[key] !== null && data.contactInfo[key] !== undefined && data.contactInfo[key] !== "") {
          patch.push({
            "op": "add",
            "path": `/contactInfo/${key}`,
            "value": data.contactInfo[key]
          });
        }
      });
    }

    if (data.professionalDetails) {
      patch.push({ "op": "add", "path": "/professionalDetails", "value": {} });
      Object.keys(data.professionalDetails).forEach(key => {
        if (data.professionalDetails[key] !== null && data.professionalDetails[key] !== undefined) {
          patch.push({
            "op": "add",
            "path": `/professionalDetails/${key}`,
            "value": data.professionalDetails[key]
          });
        }
      });
    }

    if (data.subscriptionDetails) {
      patch.push({ "op": "add", "path": "/subscriptionDetails", "value": {} });
      Object.keys(data.subscriptionDetails).forEach(key => {
        if (data.subscriptionDetails[key] !== null && data.subscriptionDetails[key] !== undefined) {
          patch.push({
            "op": "add",
            "path": `/subscriptionDetails/${key}`,
            "value": data.subscriptionDetails[key]
          });
        }
      });
    }

    return patch;
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Convert dates to ISO format before sending
      const convertDatesToISO = (data) => {
        if (!data) return data;

        const converted = { ...data };

        // Personal Info dates
        if (converted.personalInfo?.dateOfBirth) {
          converted.personalInfo.dateOfBirth = moment(converted.personalInfo.dateOfBirth).toISOString();
        }

        // Professional Details dates
        if (converted.professionalDetails?.retiredDate) {
          converted.professionalDetails.retiredDate = moment(converted.professionalDetails.retiredDate).toISOString();
        }

        // Add any other date fields that need conversion
        if (converted.professionalDetails?.graduationDate) {
          converted.professionalDetails.graduationDate = moment(converted.professionalDetails.graduationDate).toISOString();
        }

        return converted;
      };

      // Convert all dates to ISO format
      const convertedData = convertDatesToISO(InfData);

      // 1. Personal Details
      const personalPayload = cleanPayload({
        personalInfo: convertedData.personalInfo,
        contactInfo: convertedData.contactInfo,
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
        professionalDetails: convertedData.professionalDetails,
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
        subscriptionDetails: convertedData.subscriptionDetails,
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

      // 4. ✅ AUTO-APPROVE if Approve checkbox is checked
      if (selected.Approve) {
        try {
          // Prepare approval payload
          let approvalPayload;

          if (isEdit && originalData) {
            // ✅ EDIT MODE: Generate patch with changes from original
            const proposedPatch = generatePatch(originalData, convertedData);

            approvalPayload = {
              submission: convertedData, // Current data
              proposedPatch: proposedPatch,
              notes: "Auto-approved with changes on submission"
            };
          } else {
            // ✅ NEW APPLICATION: Create patch for ALL new fields being created
            const proposedPatch = generateCreatePatch(convertedData);

            approvalPayload = {
              submission: convertedData, // Current data
              proposedPatch: proposedPatch, // Patch showing all created fields
              notes: "Auto-approved on submission"
            };
          }

          await axios.post(
            `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${applicationId}/approve`,
            approvalPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          MyAlert("success", "Application submitted and approved successfully!");

        } catch (approveError) {
          // If approval fails, still show success for submission but warn about approval
          console.error("Approval failed:", approveError);
          MyAlert(
            "warning",
            "Application submitted successfully but approval failed",
            "The application was created but could not be automatically approved. Please approve it manually."
          );
        }
      } else {
        // Regular success message without approval
        MyAlert("success", "Application submitted successfully!");
      }

      // ✅ RESET LOGIC: Only reset if NOT in Bulk mode
      if (selected?.Bulk !== true) {
        // Normal mode: Clear everything and redirect
        setInfData(inputValue);
        setSelected(prev => ({
          ...prev,
          Approve: false,  // Uncheck Approve in normal mode
          Reject: false
        }));
        navigate('/Applications');
      } else {
        // ✅ BULK MODE: Clear form inputs but keep Approve checkbox checked
        setInfData(inputValue); // Clear all form inputs
        // Keep Approve checkbox checked, clear other checkboxes
        setSelected(prev => ({
          ...prev,
          Reject: false,
          // Approve stays true (checked)
        }));
        MyAlert("success", "Application submitted successfully! Form cleared and ready for next entry.");
      }

    } catch (error) {
      console.error("Submission error:", error);
      MyAlert(
        "error",
        "Failed to submit application",
        error?.response?.data?.error?.message || error.message
      );
    }
  };
  const handleSave = async () => {
    const isValid = validateForm();
    if (!isValid) return;
    if (isEdit && originalData) {
      const proposedPatch = generatePatch(originalData, InfData);
      const obj = {
        submission: originalData,
        proposedPatch: proposedPatch,
      };
      console.log(obj, "azn");
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.post(
          `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${application?.applicationId}/review-draft`,
          obj,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        // console.log('Approval successful:', response.data);
        {
          response.data &&
            MyAlert(
              "success",
              "Successfully Updated Application",
            );
        }
        // Handle success (e.g., show success message, redirect, etc.)

      } catch (error) {
        console.error('Approval successful:', error);
        MyAlert(
          "error",
          "Failed to submit details",
          error?.response?.data?.error?.message || error.message
        );
      }
    }
  };

  const handleInputChange = (section, field, value) => {
    if (field === "workLocation") {
      getWorkLocationHierarchy(application?.applicationId)
    }
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
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    if (application && isEdit) {
      const status = application.applicationStatus?.toLowerCase();
      const readOnlyStatuses = ['APPROVED', 'rejected', 'in-progress',];

      if (readOnlyStatuses.includes(status)) {
        disableFtn(true); // Disable form for read-only statuses
      } else if (isEdit === false) {
        disableFtn(false); // Enable form for editable statuses in edit mode
      }
      // For new applications (isEdit: false), let the existing isDisable logic handle it
    }
  }, [application, isEdit]);
  const handleChange = (e) => {
    const { name, checked } = e.target;

    if (name === "Bulk" && checked === false) {
      disableFtn(true);
      setErrors({});
      setSelected((prev) => ({
        ...prev,
        Bulk: checked,
      }));
    }

    if (name === "Bulk" && checked === true) {
      disableFtn(false);
      setErrors({});
      setSelected((prev) => ({
        ...prev,
        Bulk: checked,
      }));
    }

    if (name === "Approve" && checked === true) {
      if (isEdit) {
        // Edit mode: Open confirmation modal
        setActionModal({ open: true, type: 'approve' });
      } else {
        // Non-edit mode: Just update checkbox state (like radio button)
        setSelected((prev) => ({
          ...prev,
          Approve: true,
          Reject: false, // Uncheck reject
        }));
      }
    }

    if (name === "Reject" && checked === true) {
      if (isEdit) {
        // Edit mode: Open rejection modal
        setActionModal({ open: true, type: 'reject' });
      } else {
        // Non-edit mode: Just update checkbox state (like radio button)
        setSelected((prev) => ({
          ...prev,
          Reject: true,
          Approve: false, // Uncheck approve
        }));
      }
    }

    // Handle unchecking for non-edit mode (optional - if you want to allow unchecking)
    if (!isEdit && (name === "Approve" || name === "Reject") && checked === false) {
      setSelected((prev) => ({
        ...prev,
        [name]: false,
      }));
    }

    // Handle unchecking for Bulk
    if (name === "Bulk" && checked === false) {
      setSelected((prev) => ({
        ...prev,
        [name]: checked,
      }));
    }
  };
  const handleApplicationAction = async (action) => {
    if (isEdit && !originalData) return;

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare status payload
      const statusPayload = {
        applicationStatus: action, // "approved" or "rejected"
        comments: action === "rejected"
          ? rejectionData.reason
          : rejectionData.note || "Application approved"
      };

      // Validate rejection reason
      if (action === "rejected" && !rejectionData.reason) {
        MyAlert("error", "Please select a rejection reason");
        setIsProcessing(false);
        return;
      }

      // Handle approval with changes (only for edit mode)
      if (isEdit && action === "approved") {
        const proposedPatch = generatePatch(originalData, InfData);

        if (proposedPatch && proposedPatch.length > 0) {
          const obj = {
            submission: originalData,
            proposedPatch: proposedPatch,
          };

          await axios.post(
            `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${application?.applicationId}/approve`,
            obj,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update changed sections
          const personalChanged = hasPersonalDetailsChanged(originalData, InfData);
          const professionalChanged = hasProfessionalDetailsChanged(originalData, InfData);

          if (personalChanged && application?.personalDetails?._id) {
            const personalPayload = cleanPayload({
              personalInfo: InfData.personalInfo,
              contactInfo: InfData.contactInfo,
            });
            await axios.put(
              `${process.env.REACT_APP_PROFILE_SERVICE_URL}/personal-details/${application?.applicationId}`,
              personalPayload,
              { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
            );
          }

          if (professionalChanged && application?.professionalDetails?._id) {
            const professionalPayload = cleanPayload({
              professionalDetails: InfData.professionalDetails,
            });
            await axios.put(
              `${process.env.REACT_APP_PROFILE_SERVICE_URL}/professional-details/${application?.applicationId}`,
              professionalPayload,
              { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
            );
          }
        }
      }

      // Update application status
      await axios.put(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/status/${application?.applicationId}`,
        statusPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ SUCCESS: Now update the checkbox state
      setSelected(prev => ({
        ...prev,
        Approve: action === 'approved',
        Reject: action === 'rejected'
      }));

      // Success handling
      const successMessage = action === "approved"
        ? "Application approved successfully!"
        : "Application rejected successfully!";

      MyAlert("success", successMessage);
      disableFtn(true);
      refreshApplicationsWithStatusFilters()

      // Reset modal and rejection data
      setActionModal({ open: false, type: null });
      setRejectionData({ reason: "", note: "" });

      if (!isEdit) {
        navigate('/Applications');
      }

    } catch (error) {
      console.error(`Error ${action} application:`, error);
      MyAlert(
        "error",
        `Failed to ${action} application`,
        error?.response?.data?.error?.message || error.message
      );

      // ❌ On error, ensure checkboxes are unchecked
      setSelected(prev => ({
        ...prev,
        Approve: false,
        Reject: false
      }));
    } finally {
      setIsProcessing(false);
    }
  };
  function navigateApplication(direction) {
    if (index === -1 || !applications?.length) return;

    let newIndex = index;

    if (direction === "prev" && index > 0) {
      newIndex = index - 1;
    } else if (direction === "next" && index < applications.length - 1) {
      newIndex = index + 1;
    } else {
      return;
    }

    setIndex(newIndex);
    const newApplication = applications[newIndex];

    if (newApplication) {
      const newdata = mapApiToState(newApplication);
      setInfData(newdata);
      setOriginalData(newdata);

      // ✅ Check status and disable form immediately
      const status = newApplication.applicationStatus?.toLowerCase();
      const readOnlyStatuses = ['approved', 'rejected', 'in-progress'];

      if (readOnlyStatuses.includes(status)) {
        disableFtn(true);
      } else {
        disableFtn(false);
      }
    }
  }
  return (
    <div>
      <div style={{ backgroundColor: '#f6f7f8', minHeight: '100vh' }}>
        <div style={{ marginRight: "2.25rem" }} className="d-flex justify-content-between align-items-center py-3">
          <div><Breadcrumb /></div>
          <div className="d-flex align-items-center gap-3">
            {!isEdit && (
              <>
                <MemberSearch />
                <Checkbox
                  name="Bulk"
                  checked={selected.Bulk}
                  onChange={handleChange}
                >
                  Batch Entry
                </Checkbox>
              </>
            )}
            <Checkbox
              name="Approve"
              checked={selected.Approve}
              disabled={
                isEdit
                  ? (selected.Reject || selected.actionCompleted || isDisable)
                  : isDisable // Only disabled in non-edit mode when isDisable is true
              }
              onChange={handleChange}
            >
              Approve
            </Checkbox>
            <Checkbox
              name="Reject"
              disabled={
                isEdit
                  ? (selected.Approve || selected.actionCompleted || isDisable)
                  : true // Always disabled in non-edit mode
              }
              checked={selected.Reject}
              onChange={handleChange}
            >
              Reject
            </Checkbox>
            <Button
              className="butn primary-btn"
              disabled={selected?.Reject || selected?.Approve || isDisable}
              onClick={() => handleSave()}
            >
              Save
            </Button>
            {!isEdit && (
              <Button
                onClick={() => handleSubmit()}
                className="butn primary-btn"
                disabled={isDisable}
              >
                Submit
              </Button>
            )}
            {isEdit && (
              <div className="d-flex align-items-center">
                <Button
                  className="me-1 gray-btn butn"
                  onClick={() => navigateApplication("prev")}
                >
                  <FaAngleLeft className="deatil-header-icon" />
                </Button>
                <p className="mb-0 mx-2" style={{ fontWeight: "500", fontSize: "14px" }}>
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
        </div>

        {/* Main Content */}
        <div
          className="hide-scroll-webkit"
          style={{
            borderRadius: '15px',
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            margin: '1.5rem',
            maxHeight: '80.5vh',
            height: '80.5vh',
            overflowY: "auto",
            backgroundColor: 'white',
            padding: '1.5rem',
            filter: showLoader ? "blur(3px)" : "none",
            pointerEvents: showLoader ? "none" : "auto",
            transition: "0.3s ease",
          }}
        >
          {/* Personal Information Section */}
          <div className="mb-3">
            <SectionHeader
              icon={<MailOutlined style={{ color: "#2f6bff", fontSize: "18px" }} />}
              title="Personal Information"
              subTitle="Please provide your details as they appear on your official documents."
              backgroundColor="#eef4ff"
              iconBackground="#e5edff"
            />

            <Row gutter={[16, 12]} className="mt-2">
              <Col xs={24} md={8}>
                <CustomSelect
                  label="Title"
                  name="title"
                  value={InfData?.personalInfo?.title}
                  options={lookupsForSelect?.Titles}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("personalInfo", "title", e.target.value)}
                  hasError={!!errors?.title}
                />
              </Col>
              <Col xs={24} md={8}>
                <MyInput
                  label="Forename"
                  name="forename"
                  value={InfData.personalInfo?.forename}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("personalInfo", "forename", e.target.value)}
                  hasError={!!errors?.forename}
                />
              </Col>
              <Col xs={24} md={8}>
                <MyInput
                  label="Surname"
                  name="surname"
                  value={InfData.personalInfo?.surname}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("personalInfo", "surname", e.target.value)}
                  hasError={!!errors?.surname}
                />
              </Col>

              <Col xs={24} md={8}>
                <CustomSelect
                  label="Gender"
                  name="gender"
                  value={InfData.personalInfo?.gender}
                  options={lookupsForSelect?.gender}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("personalInfo", "gender", e.target.value)}
                  hasError={!!errors?.gender}
                />
              </Col>
              <Col xs={24} md={8}>
                <MyDatePicker1
                  label="Date of Birth"
                  name="dob"
                  required
                  value={InfData?.personalInfo?.dateOfBirth}
                  disabled={isDisable}
                  onChange={(date, dateString) => {
                    console.log(dateString, "dateString111")
                    debugger
                    handleInputChange("personalInfo", "dateOfBirth", date);
                  }}
                  hasError={!!errors?.dateOfBirth}
                  errorMessage={errors?.dateOfBirth || "Required"}
                />
              </Col>
              <Col xs={24} md={8}>
                <CustomSelect
                  label="Country Primary Qualification"
                  name="countryPrimaryQualification"
                  value={InfData?.personalInfo?.countryPrimaryQualification}
                  options={countriesOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("personalInfo", "countryPrimaryQualification", e.target.value)}
                  hasError={!!errors?.countryPrimaryQualification}
                />
              </Col>
            </Row>
          </div>

          {/* Correspondence Details Section */}
          <div className="mb-3">
            <SectionHeader
              icon={<EnvironmentOutlined style={{ color: "green", fontSize: "18px" }} />}
              title="Correspondence Details"
              backgroundColor="#edfdf5"
              iconBackground="#e5edff"
              subTitle="Let us know the best way to send you mail."
            />

            <Row gutter={[16, 12]} className="mt-2">
              {/* Consent and Preferred Address in one row */}
              <Col span={24}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div className="p-3 bg-light rounded h-100">
                      <Checkbox>
                        Consent to receive Correspondence from INMO
                      </Checkbox>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="p-3 bg-light rounded h-100">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className={`my-input-label ${errors?.preferredAddress ? "error-text1" : ""}`}>
                          Preferred Address <span className="text-danger">*</span>
                        </label>
                        <Radio.Group
                          onChange={(e) => handleInputChange("contactInfo", "preferredAddress", e.target.value)}
                          value={InfData?.contactInfo?.preferredAddress}
                          disabled={isDisable}
                          options={[
                            { value: "home", label: "Home" },
                            { value: "work", label: "Work" },
                          ]}
                          className={errors?.preferredAddress ? "radio-error" : ""}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>

              {/* Search by address or Eircode in one line */}
              <Col span={24}>
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
                      onChange={() => { }}
                    />
                  </StandaloneSearchBox>
                )}
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 1 (Building or House)"
                  name="buildingOrHouse"
                  value={InfData?.contactInfo?.buildingOrHouse}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("contactInfo", "buildingOrHouse", e.target.value)}
                  hasError={!!errors?.buildingOrHouse}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 2 (Street or Road)"
                  name="streetOrRoad"
                  value={InfData?.contactInfo.streetOrRoad}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("contactInfo", "streetOrRoad", e.target.value)}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 3 (Area or Town)"
                  name="adressLine3"
                  value={InfData.contactInfo?.areaOrTown}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("contactInfo", "areaOrTown", e.target.value)}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 4 (County, City or Postcode)"
                  name="countyCityOrPostCode"
                  value={InfData?.contactInfo?.countyCityOrPostCode}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("contactInfo", "countyCityOrPostCode", e.target.value)}
                  hasError={!!errors?.countyCityOrPostCode}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Eircode"
                  name="Eircode"
                  placeholder="Enter Eircode"
                  value={InfData?.contactInfo?.eircode}
                  onChange={(e) => handleInputChange("contactInfo", "eircode", e.target.value)}
                />
              </Col>

              <Col xs={24} md={12}>
                <CustomSelect
                  label="Country"
                  name="country"
                  value={InfData.contactInfo?.country}
                  options={countriesOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("contactInfo", "country", e.target.value)}
                  hasError={!!errors?.country}
                />
              </Col>
              <Col span={24}>
                <div className="mt-1 mb-3">
                  <h4 style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#1a1a1a",
                    margin: 0,
                    paddingBottom: "8px",
                  }}>
                    Contact Details
                  </h4>
                  <p style={{
                    fontSize: "14px",
                    color: "#666",
                    margin: "4px 0 0 0"
                  }}>
                    Provide your email and contact number
                  </p>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <MyInput
                  label="Mobile"
                  name="mobile"
                  type="mobile"
                  value={InfData.contactInfo?.mobileNumber}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("contactInfo", "mobileNumber", e.target.value)}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Home / Work Tel Number"
                  name="telephoneNumber"
                  type="number"
                  value={InfData.contactInfo?.telephoneNumber}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("contactInfo", "telephoneNumber", e.target.value)}
                  hasError={!!errors?.telephoneNumber}
                />
              </Col>

              <Col xs={24} md={12}>
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className={`my-input-label ${errors?.preferredEmail ? "error-text1" : ""}`}>
                      Preferred Email <span className="text-danger ms-1">*</span>
                    </label>
                    <Radio.Group
                      onChange={(e) => handleInputChange("contactInfo", "preferredEmail", e.target.value)}
                      value={InfData?.contactInfo?.preferredEmail}
                      disabled={isDisable}
                      className={errors?.preferredEmail ? "radio-error" : ""}
                    >
                      <Radio value="personal">Personal</Radio>
                      <Radio value="work">Work</Radio>
                    </Radio.Group>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}></Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Personal Email"
                  name="email"
                  type="email"
                  required={InfData.contactInfo?.preferredEmail === "personal"}
                  value={InfData.contactInfo?.personalEmail}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("contactInfo", "personalEmail", e.target.value)}
                  hasError={!!errors?.email}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Work Email"
                  name="Work Email"
                  type="email"
                  value={InfData?.contactInfo?.workEmail}
                  required={InfData.contactInfo?.preferredEmail === "work"}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("contactInfo", "workEmail", e.target.value)}
                  hasError={!!errors?.workEmail}
                />
              </Col>
            </Row>
          </div>

          {/* Professional Details Section */}
          <div className="mb-3">
            <SectionHeader
              icon={<IoBagRemoveOutline style={{ color: "#bf86f3", fontSize: "18px" }} />}
              title="Professional Details"
              backgroundColor="#f7f4ff"
              iconBackground="#ede6fa"
            />

            <Row gutter={[16, 12]} className="mt-2">
              <Col xs={24} md={12}>
                <CustomSelect
                  label="Membership Category"
                  name="membershipCategory"
                  value={InfData.professionalDetails?.membershipCategory}
                  options={CatOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("professionalDetails", "membershipCategory", e.target.value)}
                  hasError={!!errors?.membershipCategory}
                />
              </Col>

              <Col xs={24} md={12}>
                <Row gutter={[8, 8]}>
                  <Col xs={24} md={12}>
                    <MyDatePicker1
                      label="Retired Date"
                      name="retiredDate"
                      value={InfData?.professionalDetails?.retiredDate}
                      disabled={isDisable || InfData?.professionalDetails?.membershipCategory !== "retired_associate"}
                      required={InfData?.professionalDetails?.membershipCategory === "retired_associate"}
                      onChange={(date, dateString) => {
                        handleInputChange("professionalDetails", "retiredDate", dateString);

                      }}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <MyInput
                      label="Pension No"
                      name="pensionNo"
                      value={InfData.professionalDetails?.pensionNo}
                      disabled={isDisable || InfData?.professionalDetails?.membershipCategory !== "retired_associate"}
                      required={InfData?.professionalDetails?.membershipCategory === "retired_associate"}
                      onChange={(e) => handleInputChange("professionalDetails", "pensionNo", e.target.value)}
                      hasError={!!errors?.pensionNo}
                    />
                  </Col>
                </Row>
              </Col>

              {/* Work Location */}
              <Col xs={24} md={12}>
                <CustomSelect
                  label="Work Location"
                  name="workLocation"
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
                  onChange={(e) => handleInputChange("professionalDetails", "workLocation", e.target.value)}
                  hasError={!!errors?.workLocation}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Other Work Location"
                  name="Other Work Location"
                  value={InfData.professionalDetails?.otherWorkLocation}
                  required={InfData.professionalDetails?.workLocation == "Other"}
                  disabled={isDisable || InfData?.professionalDetails?.workLocation != "Other"}
                  onChange={(e) => handleInputChange("professionalDetails", "otherWorkLocation", e.target.value)}
                  hasError={!!errors?.otherWorkLocation}
                />
              </Col>

              <Col xs={24} md={12}>
                <CustomSelect
                  label="Branch"
                  name="branch"
                  value={InfData.professionalDetails.branch}
                  disabled={true}
                  onChange={(e) => handleInputChange("professionalDetails", "branch", e.target.value)}
                  options={allBranches.map((branch) => ({
                    value: branch,
                    label: branch,
                  }))}
                />
              </Col>

              <Col xs={24} md={12}>
                <CustomSelect
                  label="Region"
                  name="Region"
                  value={InfData.professionalDetails?.region}
                  disabled={true}
                  onChange={(e) => handleInputChange("professionalDetails", "region", e.target.value)}
                  options={allRegions.map((region) => ({
                    value: region,
                    label: region,
                  }))}
                />
              </Col>

              <Col xs={24} md={12}>
                <CustomSelect
                  label="Grade"
                  name="grade"
                  value={InfData?.professionalDetails?.grade}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("professionalDetails", "grade", e.target.value)}
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

              <Col xs={24} md={12}>
                <MyInput
                  label="Other Grade"
                  name="otherGrade"
                  value={InfData.professionalDetails?.otherGrade}
                  required={InfData?.professionalDetails?.grade === "other"}
                  disabled={InfData?.professionalDetails?.grade !== "other" || isDisable}
                  onChange={(e) => handleInputChange("professionalDetails", "otherGrade", e.target.value)}
                  hasError={!!errors?.otherGrade}
                />
              </Col>

              {/* Nursing Adaptation Programme */}
              <Col xs={24} md={12}>
                <div className="p-3 bg-light rounded h-100">
                  <label className="my-input-label my-input-wrapper">
                    Are you currently undertaking a nursing adaptation programme?
                  </label>
                  <Radio.Group
                    name="nursingAdaptationProgramme"
                    value={InfData.professionalDetails?.nursingAdaptationProgramme}
                    onChange={(e) => handleInputChange("professionalDetails", "nursingAdaptationProgramme", e.target.value)}
                  >
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                  </Radio.Group>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="NMBI No/An Board Altranais Number"
                  name="nmbiNumber"
                  value={InfData?.professionalDetails?.nmbiNumber}
                  disabled={InfData?.professionalDetails?.nursingAdaptationProgramme !== true}
                  required={InfData?.professionalDetails?.nursingAdaptationProgramme === true}
                  onChange={(e) => handleInputChange("professionalDetails", "nmbiNumber", e.target.value)}
                />
              </Col>

              {/* Nurse Type - Full Width */}
              <Col span={24}>
                <div className="p-3 bg-light rounded">
                  <label className="my-input-label mb-3 d-block">
                    Please tick one of the following
                  </label>
                  <Radio.Group
                    name="nursingType"
                    value={InfData.professionalDetails?.nurseType}
                    onChange={(e) => handleInputChange("professionalDetails", "nurseType", e.target.value)}
                    required={InfData?.professionalDetails?.nursingAdaptationProgramme === true}
                    disabled={InfData?.professionalDetails?.nursingAdaptationProgramme !== true}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      width: "100%"
                    }}
                  >
                    <Radio value="General Nursing" style={{ flex: '1 1 30%', minWidth: '200px' }}>General Nursing</Radio>
                    <Radio value="Public Health Nurse" style={{ flex: '1 1 30%', minWidth: '200px' }}>Public Health Nurse</Radio>
                    <Radio value="Mental Health Nurse" style={{ flex: '1 1 30%', minWidth: '200px' }}>Mental Health Nurse</Radio>
                    <Radio value="Midwife" style={{ flex: '1 1 30%', minWidth: '200px' }}>Midwife</Radio>
                    <Radio value="Sick Children's Nurse" style={{ flex: '1 1 30%', minWidth: '200px' }}>Sick Children's Nurse</Radio>
                    <Radio value="Registered Nurse for Intellectual Disability" style={{ flex: '1 1 30%', minWidth: '200px' }}>
                      Registered Nurse for Intellectual Disability
                    </Radio>
                  </Radio.Group>
                </div>
              </Col>
            </Row>
          </div>

          {/* Subscription Details Section */}
          <div className="mb-3">
            <SectionHeader
              icon={<CiCreditCard1 style={{ color: "#ec6d28", fontSize: "18px" }} />}
              title="Subscription Details"
              backgroundColor="#fff9eb"
              iconBackground="#fad1b8ff"
            />

            <Row gutter={[16, 12]} className="mt-2">
              <Col xs={24} md={12}>
                <CustomSelect
                  label="Payment Type"
                  name="paymentType"
                  required
                  options={[
                    { value: "Payroll Deduction", label: "Deduction at Source" },
                    { value: "Direct Debit", label: "Direct Debit" },
                  ]}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("subscriptionDetails", "paymentType", e.target.value)}
                  value={InfData.subscriptionDetails?.paymentType}
                  hasError={!!errors?.paymentType}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Payroll No"
                  name="payrollNo"
                  value={InfData?.subscriptionDetails?.payrollNo}
                  hasError={!!errors?.payrollNo}
                  required={InfData?.subscriptionDetails?.paymentType === "Payroll Deduction"}
                  disabled={InfData?.subscriptionDetails?.paymentType !== "Payroll Deduction"}
                  onChange={(e) => handleInputChange("subscriptionDetails", "payrollNo", e.target.value)}
                />
              </Col>

              {/* Membership Status - Full Width */}
              {/* <Col span={24}>
          <div className="p-3 bg-light rounded">
            <label className="my-input-label mb-3 d-block">
              Please select the most appropriate option below
            </label>
            <Radio.Group
              name="memberStatus"
              value={InfData?.subscriptionDetails?.membershipStatus || ""}
              onChange={(e) => handleInputChange("subscriptionDetails", "membershipStatus", e.target.value)}
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "12px",
                width: "100%"
              }}
            >
              <Radio value="new" style={{ padding: '8px 0' }}>You are a new member</Radio>
              <Radio value="graduate" style={{ padding: '8px 0' }}>You are newly graduated</Radio>
              <Radio value="rejoin" style={{ padding: '8px 0' }}>You were previously a member of the INMO, and are rejoining</Radio>
              <Radio value="careerBreak" style={{ padding: '8px 0' }}>You are returning from a career break</Radio>
              <Radio value="nursingAbroad" style={{ padding: '8px 0' }}>You are returning from nursing abroad</Radio>
            </Radio.Group>
          </div>
        </Col> */}
              <Col span={24}>
                <div className="p-3 bg-light rounded">
                  <label className="my-input-label mb-1 d-block">
                    Please select the most appropriate option below
                  </label>
                  <Radio.Group
                    name="memberStatus"
                    value={InfData?.subscriptionDetails?.membershipStatus || ""}
                    onChange={(e) => handleInputChange("subscriptionDetails", "membershipStatus", e.target.value)}
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "stretch",
                      gap: "8px"
                    }}
                  >
                    <Radio value="new" style={{
                      // flex: "1 0 auto",
                      textAlign: 'center',
                      margin: 0,
                      padding: '12px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'normal',
                      lineHeight: '1.2',
                      minHeight: '60px'
                    }}>
                      <span style={{ marginLeft: '8px' }}>You are a new member</span>
                    </Radio>
                    <Radio value="graduate" style={{
                      flex: "1 0 auto",
                      textAlign: 'center',
                      margin: 0,
                      padding: '12px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'normal',
                      lineHeight: '1.2',
                      minHeight: '60px'
                    }}>
                      <span style={{ marginLeft: '8px' }}>You are newly graduated</span>
                    </Radio>
                    <Radio value="rejoin" style={{
                      flex: "1 0 auto",
                      textAlign: 'center',
                      margin: 0,
                      padding: '12px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'normal',
                      lineHeight: '1.2',
                      minHeight: '60px'
                    }}>
                      <span style={{ marginLeft: '8px' }}>You were previously a member of the INMO, and are rejoining</span>
                    </Radio>
                    <Radio value="careerBreak" style={{
                      flex: "1 0 auto",
                      textAlign: 'center',
                      margin: 0,
                      padding: '12px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'normal',
                      lineHeight: '1.2',
                      minHeight: '60px'
                    }}>
                      <span style={{ marginLeft: '8px' }}>You are returning from a career break</span>
                    </Radio>
                    <Radio value="nursingAbroad" style={{
                      flex: "1 0 auto",
                      textAlign: 'center',
                      margin: 0,
                      padding: '12px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'normal',
                      lineHeight: '1.2',
                      minHeight: '60px'
                    }}>
                      <span style={{ marginLeft: '8px' }}>You are returning from nursing abroad</span>
                    </Radio>
                  </Radio.Group>
                </div>
              </Col>

              {/* Checkboxes in 50% width */}
              <Col xs={24} md={12}>
                <div className="p-3 bg-light rounded h-100">
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.incomeProtectionScheme}
                    onChange={(e) => handleInputChange("subscriptionDetails", "incomeProtectionScheme", e.target.checked)}
                    className="my-input-wrapper"
                    disabled={isDisable || !["new", "graduate"].includes(InfData?.subscriptionDetails?.membershipStatus)}
                  >
                    Tick here to join INMO Income Protection Scheme
                  </Checkbox>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="p-3 bg-light rounded h-100">
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.rewardsForInmoMembers}
                    onChange={(e) => handleInputChange("subscriptionDetails", "rewardsForInmoMembers", e.target.checked)}
                    className="my-input-wrapper"
                    // disabled={isDisable || !["new", "graduate"].includes(InfData?.subscriptionDetails?.membershipStatus)}
                    disabled={true}

                  >
                    Tick here to join Rewards for INMO members
                  </Checkbox>
                </div>
              </Col>

              {/* Trade Union Questions - Same Height */}
              <Col xs={24} md={12}>
                <div className="p-3 bg-light rounded" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="my-input-label mb-3">
                    If you are a member of another Trade Union. If yes, which Union?
                  </label>
                  <Radio.Group
                    name="otherIrishTradeUnion"
                    value={InfData.subscriptionDetails?.otherIrishTradeUnion}
                    onChange={(e) => handleInputChange("subscriptionDetails", "otherIrishTradeUnion", e.target?.value)}
                    disabled={isDisable}
                  >
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                  </Radio.Group>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="p-3 bg-light rounded" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="my-input-label mb-3">
                    Are you or were you a member of another Irish trade Union salary or Income Protection Scheme?
                  </label>
                  <Radio.Group
                    name="otherScheme"
                    value={InfData.subscriptionDetails?.otherScheme}
                    onChange={(e) => handleInputChange("subscriptionDetails", "otherScheme", e.target?.value)}
                    className="my-input-wrapper"
                    disabled={isDisable}
                  >
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                  </Radio.Group>
                </div>
              </Col>

              {/* Recruited By */}
              <Col xs={24} md={12}>
                <MyInput
                  label="Recruited By"
                  name="recuritedBy"
                  value={InfData.subscriptionDetails?.recuritedBy}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("subscriptionDetails", "recuritedBy", e.target.value)}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Recruited By (Membership No)"
                  name="recuritedByMembershipNo"
                  value={InfData?.subscriptionDetails?.recuritedByMembershipNo}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("subscriptionDetails", "recuritedByMembershipNo", e.target.value)}
                />
              </Col>

              {/* Sections */}
              <Col xs={24} md={12}>
                <CustomSelect
                  label="Primary Section"
                  name="primarySection"
                  value={InfData.subscriptionDetails?.primarySection}
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("subscriptionDetails", "primarySection", e.target.value)}
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

              <Col xs={24} md={12}>
                <MyInput
                  label="Other Primary Section"
                  name="otherPrimarySection"
                  value={InfData.subscriptionDetails?.otherPrimarySection}
                  onChange={(e) => handleInputChange("subscriptionDetails", "otherPrimarySection", e.target.value)}
                  required={InfData?.subscriptionDetails?.primarySection === "Other"}
                  disabled={InfData?.subscriptionDetails?.primarySection !== "Other"}
                  hasError={!!errors?.otherSecondarySection}
                />
              </Col>

              <Col xs={24} md={12}>
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
                  onChange={(e) => handleInputChange("subscriptionDetails", "secondarySection", e.target.value)}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Other Secondary Section"
                  name="otherSecondarySection"
                  value={InfData.subscriptionDetails?.otherSecondarySection}
                  disabled={isDisable || InfData?.subscriptionDetails?.secondarySection !== "Other"}
                  required={isDisable || InfData?.subscriptionDetails?.secondarySection === "Other"}
                  onChange={(e) => handleInputChange("subscriptionDetails", "otherSecondarySection", e.target.value)}
                  hasError={!!errors?.otherSecondarySection}
                />
              </Col>

              {/* Final Checkboxes - Same Height */}
              <Col xs={24} md={12}>
                <div className="p-3 bg-light rounded h-100 d-flex align-items-center">
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.valueAddedServices}
                    onChange={(e) => handleInputChange("subscriptionDetails", "valueAddedServices", e.target.checked)}
                    className="my-input-wrapper"
                  >
                    Tick here to allow our partners to contact you about Value added Services by Email and SMS
                  </Checkbox>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="p-3 bg-light rounded h-100 d-flex align-items-center">
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.termsAndConditions}
                    onChange={(e) => handleInputChange("subscriptionDetails", "termsAndConditions", e.target.checked)}
                    className="my-input-wrapper"
                  >
                    I have read and agree to the INMO Data Protection Statement, the INMO Privacy Statement and the INMO Conditions of Membership
                    {errors?.termsAndConditions && (
                      <span style={{ color: "red" }}> (Required)</span>
                    )}
                  </Checkbox>
                </div>
              </Col>
            </Row>
          </div>
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
      {/* </Drawer> */}
      <Modal
        centered
        title={actionModal.type === 'approve' ? "Confirm Approval" : "Reject Application"}
        open={actionModal.open}
        onCancel={() => {
          setActionModal({ open: false, type: null });
          // Uncheck both checkboxes when modal is cancelled
          setSelected(prev => ({
            ...prev,
            Approve: false,
            Reject: false,
            actionCompleted: false // Reset the flag
          }));
          setRejectionData({ reason: "", note: "" });
        }}
        onOk={() => handleApplicationAction(actionModal.type === 'approve' ? 'approved' : 'rejected')}
        okText={actionModal.type === 'approve' ? "Yes, Approve" : "Reject"}
        okButtonProps={{
          danger: actionModal.type === 'reject',
          className: `butn ${actionModal.type === 'approve' ? 'primary-btn' : ''}`,
          loading: isProcessing
        }}
        cancelButtonProps={{
          className: "butn butn primary-btn",
          disabled: isProcessing
        }}
        confirmLoading={isProcessing}
      >
        <div className="drawer-main-container">
          {actionModal.type === 'approve' ? (
            <>
              <div style={{ padding: '10px 0', textAlign: 'center' }}>
                <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                  Are you sure you want to approve this application?
                </p>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                  Once approved, the application will be locked and cannot be modified.
                </p>
              </div>
              <MyInput
                name="approvalComments"
                label="Comments (Optional)"
                placeholder="Enter any comments for approval"
                value={rejectionData.note}
                onChange={(e) => setRejectionData((prev) => ({ ...prev, note: e.target.value }))}
                textarea
              />
            </>
          ) : (
            <>
              <CustomSelect
                label="Reason"
                name="Reason"
                required
                placeholder="Select reason"
                value={rejectionData.reason}
                onChange={(val) =>
                  setRejectionData((prev) => ({ ...prev, reason: val.target.value }))
                }
                options={[
                  { label: "Incomplete documents", value: "incomplete_documents" },
                  { label: "Invalid information", value: "invalid_information" },
                  { label: "Duplicate application", value: "duplicate" },
                  { label: "Other", value: "other" },
                ]}
                hasError={!rejectionData.reason}
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
            </>
          )}
        </div>
      </Modal>

    </div>
  );
}

export default ApplicationMgtDrawer;
