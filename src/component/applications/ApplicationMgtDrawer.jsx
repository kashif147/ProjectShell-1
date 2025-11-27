import { useState, useRef, useEffect } from "react";
import { Row, Col, Checkbox, Radio, Button, Spin, Modal, Flex, Tooltip } from "antd";
import { MailOutlined, EnvironmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs"
import axios from "axios";
import { dateUtils } from "../../utils/Utilities";
import CustomSelect from "../common/CustomSelect";
import { useTableColumns } from "../../context/TableColumnsContext ";
import MyInput from "../common/MyInput";
import { useSelector, useDispatch } from "react-redux";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import { IoBagRemoveOutline } from "react-icons/io5";
import { CiCreditCard1 } from "react-icons/ci";
import { getAllApplications } from "../../features/ApplicationSlice";
import { cleanPayload } from "../../utils/Utilities";
import MyAlert from "../common/MyAlert";
import { generatePatch } from "../../utils/Utilities";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa";
import { fetchCountries } from "../../features/CountriesSlice";
import MemberSearch from "../profile/MemberSearch";
import MyFooter from "../common/MyFooter";
import MyDatePicker1 from "../common/MyDatePicker1";
import { getCategoryLookup } from "../../features/CategoryLookupSlice";
import Breadcrumb from "../common/Breadcrumb";
import { useFilters } from "../../context/FilterContext";
import { InsuranceScreen, RewardsScreen } from "../profile/IncomeProtectionTooltip";



const baseURL = process.env.REACT_APP_PROFILE_SERVICE_URL;
function ApplicationMgtDrawer({
  open,
  onClose,
  title = "Registration Request",
}) {
  const { application, loading } = useSelector(
    (state) => state.applicationDetails
  );

  const {
    titleOptions,
    genderOptions,
    workLocationOptions,
    gradeOptions,
    sectionOptions,
    membershipCategoryOptions,
    paymentTypeOptions,
    branchOptions,
    regionOptions,
    secondarySectionOptions,
    countryOptions
  } = useSelector(state => state.lookups);
  const navigate = useNavigate();
  const {
    hierarchyData, // This replaces hierarchyLookup
    workLocationLoading,
    workLocationError
  } = useSelector((state) => state.lookupsWorkLocation);
  console.log(hierarchyData, "lk")
  const { filtersState } = useFilters();
  // const getApplicationStatusFilters = () => {
  //   if (filtersState['Application Status']?.selectedValues?.length > 0) {
  //     const statusMapping = {
  //       'In-Progress': 'in-progress', // ✅ CORRECT: with hyphen
  //       'Approved': 'approved',
  //       'Rejected': 'rejected',
  //       'Submitted': 'submitted',
  //       'Draft': 'draft'
  //     };
  //     const statusValues = filtersState['Application Status'].selectedValues;
  //     return statusValues.map(status => statusMapping[status] || status.toLowerCase());
  //   }
  //   return [];
  // };

  // const refreshApplicationsWithStatusFilters = () => {
  //   const statusFilters = getApplicationStatusFilters();
  //   dispatch(getAllApplications(statusFilters));
  // };
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null, // 'approve' or 'reject'
  })

  const { state } = useLocation();
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

  useEffect(() => {
    if (application && applications?.length) {
      const newIndex =
        applications.findIndex(
          (app) => app.applicationId === application?.applicationId
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
      // refreshApplicationsWithStatusFilters()
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


  const nextPrevData = { total: applications?.length };
  const [originalData, setOriginalData] = useState(null);
  const mapApiToState = (apiData) => {
    if (!apiData) return inputValue;
    debugger
    // Helper function to safely convert to Day.js
    const toDayJS = (dateValue) => {
      if (!dateValue) return null;
      if (dayjs.isDayjs(dateValue)) return dateValue;
      const parsed = dayjs(dateValue);
      return parsed.isValid() ? parsed : null;
    };

    return {
      personalInfo: {
        title: apiData?.personalDetails?.personalInfo?.title || "",
        surname: apiData?.personalDetails?.personalInfo?.surname || "",
        forename: apiData?.personalDetails?.personalInfo?.forename || "",
        gender: apiData?.personalDetails?.personalInfo?.gender || "",
        dateOfBirth: toDayJS(apiData?.personalDetails?.personalInfo?.dateOfBirth),
        countryPrimaryQualification: apiData?.personalDetails?.personalInfo?.countryPrimaryQualification || "",
      },
      contactInfo: {
        preferredAddress: apiData?.personalDetails?.contactInfo?.preferredAddress || "",
        eircode: apiData?.personalDetails?.contactInfo?.eircode || "",
        consent: apiData?.personalDetails?.contactInfo?.consent,
        buildingOrHouse: apiData?.personalDetails?.contactInfo?.buildingOrHouse || "",
        streetOrRoad: apiData?.personalDetails?.contactInfo?.streetOrRoad || "",
        areaOrTown: apiData?.personalDetails?.contactInfo?.areaOrTown || "",
        countyCityOrPostCode: apiData?.personalDetails?.contactInfo?.countyCityOrPostCode || "",
        country: apiData?.personalDetails?.contactInfo?.country || "",
        mobileNumber: apiData?.personalDetails?.contactInfo?.mobileNumber || "",
        telephoneNumber: apiData?.personalDetails?.contactInfo?.telephoneNumber || "",
        preferredEmail: apiData?.personalDetails?.contactInfo?.preferredEmail || "",
        personalEmail: apiData?.personalDetails?.contactInfo?.personalEmail || "",
        workEmail: apiData?.personalDetails?.contactInfo?.workEmail || "",
      },
      professionalDetails: {
        // membershipCategory: apiData?.professionalDetails?.membershipCategory || "",
        workLocation: apiData?.professionalDetails?.workLocation,
        otherWorkLocation: apiData?.professionalDetails?.otherWorkLocation || "",
        grade: apiData?.professionalDetails?.grade || "",
        otherGrade: apiData?.professionalDetails?.otherGrade || "",
        nmbiNumber: apiData?.professionalDetails?.nmbiNumber || "",
        nurseType: apiData?.professionalDetails?.nurseType || null,
        nursingAdaptationProgramme: apiData?.professionalDetails?.nursingAdaptationProgramme || false,
        region: apiData?.professionalDetails?.region || "",
        branch: apiData?.professionalDetails?.branch || "",
        isRetired: apiData?.professionalDetails?.isRetired || false,
        retiredDate: toDayJS(apiData?.professionalDetails?.retiredDate),
        pensionNo: apiData?.professionalDetails?.pensionNo || "",
        studyLocation: apiData?.professionalDetails?.studyLocation,
        graduationDate: toDayJS(apiData?.professionalDetails?.graduationDate), // ✅ ADD THIS LINE
        startDate: toDayJS(apiData?.professionalDetails?.startDate), // ✅ ADD THIS LINE    
      },
      subscriptionDetails: {
        paymentType: apiData?.subscriptionDetails?.paymentType || "",
        payrollNo: apiData?.subscriptionDetails?.payrollNo || "",
        membershipStatus: apiData?.subscriptionDetails?.membershipStatus || "",
        otherIrishTradeUnion: apiData?.subscriptionDetails?.otherIrishTradeUnion || false,
        otherIrishTradeUnionName: apiData?.subscriptionDetails?.otherIrishTradeUnionName || "",
        otherScheme: apiData?.subscriptionDetails?.otherScheme || false,
        recuritedBy: apiData?.subscriptionDetails?.recuritedBy || "",
        recuritedByMembershipNo: apiData?.subscriptionDetails?.recuritedByMembershipNo || "",
        primarySection: apiData?.subscriptionDetails?.primarySection || "",
        otherPrimarySection: apiData?.subscriptionDetails?.otherPrimarySection || "",
        secondarySection: apiData?.subscriptionDetails?.secondarySection || "",
        otherSecondarySection: apiData?.subscriptionDetails?.otherSecondarySection || "",
        incomeProtectionScheme: apiData?.subscriptionDetails?.incomeProtectionScheme || false,
        inmoRewards: apiData?.subscriptionDetails?.inmoRewards,
        valueAddedServices: apiData?.subscriptionDetails?.valueAddedServices || false,
        termsAndConditions: apiData?.subscriptionDetails?.termsAndConditions || false,
        membershipCategory: apiData?.subscriptionDetails?.membershipCategory,
        dateJoined: toDayJS(apiData?.subscriptionDetails?.dateJoined || new Date()),
        // paymentFrequency: apiData?.subscriptionDetails?.paymentFrequency !== null,
        submissionDate: toDayJS(apiData?.subscriptionDetails?.submissionDate),
        exclusiveDiscountsAndOffers: apiData?.subscriptionDetails?.exclusiveDiscountsAndOffers,
      },
    };
  };
  const {
    categoryData,
    error,
    currentCategoryId
  } = useSelector((state) => state.categoryLookup);
  console.log(categoryData, "categoryData")
  useEffect(() => {
    dispatch(fetchCountries());
    // refreshApplicationsWithStatusFilters()
  }, [dispatch]);
  useEffect(() => {
    dispatch(getCategoryLookup("68dae613c5b15073d66b891f"));
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
  console.log(application, "application92")

  useEffect(() => {
    if (application && isEdit) {
      handleLocationChange(InfData?.professionalDetails?.workLocation)
    }
  }, [isEdit, application]);

  useEffect(() => {
    if (hierarchyData && (hierarchyData.region || hierarchyData.branch) && !workLocationLoading) {
      setInfData((prev) => ({
        ...prev,
        professionalDetails: {
          ...prev.professionalDetails,
          region: hierarchyData.region || prev.professionalDetails.region,
          branch: hierarchyData.branch || prev.professionalDetails.branch
        },
      }));
    }
  }, [hierarchyData, workLocationLoading]);

  // REPLACE your current handleApprove with this:
  const handleApprove = async (key) => {
    if (isEdit && originalData) {
      // ✅ Convert both for API only - state remains unchanged
      const apiInfData = dateUtils.prepareForAPI(InfData);
      const apiOriginalData = dateUtils.prepareForAPI(originalData);

      const proposedPatch = generatePatch(apiOriginalData, apiInfData);
      const obj = {
        submission: apiOriginalData,
        proposedPatch: proposedPatch,
      };

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        if (!proposedPatch || proposedPatch.length === 0) {
          const newStatus = key?.toLowerCase() === "rejected" ? "rejected" : "approved";
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

          MyAlert("success", `Application ${newStatus === "approved" ? "approved" : "rejected"} successfully!`);
          // refreshApplicationsWithStatusFilters();
          navigate('/Applications')
          return;
        }

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

        // Check for section changes using API data (not state data)
        const personalChanged = hasPersonalDetailsChanged(apiOriginalData, apiInfData);
        const professionalChanged = hasProfessionalDetailsChanged(apiOriginalData, apiInfData);

        if (personalChanged && application?.personalDetails?._id) {
          const personalPayload = cleanPayload({
            personalInfo: apiInfData.personalInfo,
            contactInfo: apiInfData.contactInfo,
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
        }

        if (professionalChanged && application?.professionalDetails?._id) {
          const professionalPayload = cleanPayload({
            professionalDetails: apiInfData.professionalDetails,
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
        }

        let successMessage = "Application approved successfully!";
        if (personalChanged && professionalChanged) {
          successMessage = "Application approved and all details updated successfully!";
        } else if (personalChanged) {
          successMessage = "Application approved and personal details updated successfully!";
        } else if (professionalChanged) {
          successMessage = "Application approved and professional details updated successfully!";
        }

        MyAlert("success", successMessage);
        // refreshApplicationsWithStatusFilters();

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
  const { lookups, groupedLookups } = useSelector(state => state.lookups);
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
    const contactInfoFields = ['preferredAddress', 'eircode', 'buildingOrHouse', 'streetOrRoad', 'areaOrTown', 'countyCityOrPostCode', 'country', 'mobileNumber', 'telephoneNumber', 'preferredEmail', 'personalEmail', 'workEmail', 'consent'];

    const personalInfoChanged = personalInfoFields.some(field => {
      const originalValue = original.personalInfo?.[field];
      const currentValue = current.personalInfo?.[field];

      // ✅ Handle date comparison properly
      if (field === 'dateOfBirth') {
        const originalDate = originalValue ? dayjs(originalValue).format('YYYY-MM-DD') : null;
        const currentDate = currentValue ? dayjs(currentValue).format('YYYY-MM-DD') : null;
        return originalDate !== currentDate;
      }

      return originalValue !== currentValue;
    });

    const contactInfoChanged = contactInfoFields.some(field =>
      original.contactInfo?.[field] !== current.contactInfo?.[field]
    );

    return personalInfoChanged || contactInfoChanged;
  };

  const hasProfessionalDetailsChanged = (original, current) => {
    const professionalFields = [
      'workLocation', 'otherWorkLocation', 'grade',
      'otherGrade', 'nmbiNumber', 'nurseType', 'nursingAdaptationProgramme',
      'region', 'branch', 'pensionNo', 'isRetired', 'retiredDate',
      'studyLocation', 'graduationDate', 'startDate'
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
      consent: true,
      personalEmail: "",
      workEmail: "",
    },
    professionalDetails: {
      workLocation: "",
      otherWorkLocation: "",
      grade: "",
      otherGrade: "",
      nmbiNumber: "",
      nurseType: null,
      nursingAdaptationProgramme: null,
      region: "",
      branch: "",
      isRetired: false,
      pensionNo: "",
      retiredDate: null,
      graduationDate: null,
      startDate:null
    },
    subscriptionDetails: {
      membershipCategory: "",
      paymentType: "",
      payrollNo: "",
      membershipStatus: "",
      otherIrishTradeUnion: null,
      otherScheme: null,
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
      dateJoined: dayjs(),
      submissionDate: dayjs(),
      // paymentFrequency: "",
      startDate: null,
      exclusiveDiscountsAndOffers: false,
      otherIrishTradeUnionName: ""
    },
  };
  const [InfData, setInfData] = useState(inputValue);
  console.log(InfData, "InfData")
  const handleLocationChange = (selectedLookupId) => {
    debugger
    // Get hierarchicalLookups from localStorage
    const storedLookups = localStorage.getItem('hierarchicalLookups');
    const hierarchicalLookups = storedLookups ? JSON.parse(storedLookups) : [];
    debugger
    // Find the selected object in hierarchicalLookups
    const foundObject = hierarchicalLookups.find(item =>
      item.lookup && item.lookup._id === selectedLookupId
    );
    debugger
    if (foundObject) {
      // Update InfData with region and branch IDs
      setInfData(prevData => ({
        ...prevData,
        professionalDetails: {
          ...prevData.professionalDetails,
          workLocation: foundObject?.lookup?.lookupname, // Set the selected location ID
          region: foundObject.region?.lookupname || "", // Set region ID
          branch: foundObject.branch?.lookupname || "" // Set branch ID
        }
      }));
    }
    debugger
  };
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

      membershipCategory: ["subscriptionDetails", "membershipCategory"],
      workLocation: ["professionalDetails", "workLocation"],
      grade: ["professionalDetails", "grade"],
      retiredDate: ["professionalDetails", "retiredDate"],
      startDate: ["professionalDetails", "startDate"],
      pensionNo: ["professionalDetails", "pensionNo"],

      paymentType: ["subscriptionDetails", "paymentType"],
      termsAndConditions: ["subscriptionDetails", "termsAndConditions"],
      payrollNo: ["subscriptionDetails", "payrollNo"],
      otherPrimarySection: ["subscriptionDetails", "otherPrimarySection"],
      otherSecondarySection: ["subscriptionDetails", "otherSecondarySection"],
    };

    const newErrors = {};

    // Validate required fields
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

    // Email validation based on preferred email type
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

    // ✅ FIXED: Correct field path and use proper validation
    if (InfData.professionalDetails?.workLocation === "Other") {
      if (!InfData.professionalDetails.otherWorkLocation?.trim()) {
        newErrors.otherWorkLocation = "Other work location is required";
      }
    }

    // ✅ FIXED: Case sensitivity fix
    if (InfData.subscriptionDetails.primarySection === "Other") {
      if (!InfData.subscriptionDetails.otherPrimarySection?.trim()) {
        newErrors.otherPrimarySection = "Other primary section is required";
      }
    }

    // ✅ FIXED: Date validation - don't use .trim() on dates
    if (InfData?.subscriptionDetails?.membershipCategory === "68dae699c5b15073d66b892c") {
      if (!InfData.professionalDetails?.retiredDate) {
        newErrors.retiredDate = "Retired date is required";
      }
      if (!InfData.professionalDetails?.pensionNo?.trim()) {
        newErrors.pensionNo = "Pension number is required";
      }
    }

    // ✅ FIXED: Date validation - don't use .trim() on dates
    if (InfData?.professionalDetails?.membershipCategory === "68dae699c5b15073d66b892d") {
      if (!InfData.professionalDetails?.studyLocation?.trim()) {
        newErrors.studyLocation = "Study location is required";
      }
      if (!InfData.professionalDetails?.graduationDate) {
        newErrors.graduationDate = "Graduation date is required";
      }
      if (!InfData.professionalDetails?.startDate) {
        newErrors.startDate = "required";
      }
    }

    // ✅ FIXED: Error message correction
    if (InfData.subscriptionDetails.paymentType === "Payroll Deduction") {
      if (!InfData.subscriptionDetails.payrollNo?.trim()) {
        newErrors.payrollNo = "Payroll number is required";
      }
    }

    // ✅ ADDED: Secondary section validation
    if (InfData.subscriptionDetails.secondarySection === "Other") {
      if (!InfData.subscriptionDetails.otherSecondarySection?.trim()) {
        newErrors.otherSecondarySection = "Other secondary section is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };
  const generateCreatePatch = (data) => {
    const patch = [];
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


  // REPLACE your current handleSubmit with this:
  const handleSubmit = async () => {
    if (isDisable) return;
    const isValid = validateForm();
    if (!isValid) return;
    setIsProcessing(true);
    disableFtn(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // ✅ Convert ONLY for API call - don't touch state
      const apiData = dateUtils.prepareForAPI(InfData);

      // 1. Personal Details
      const personalPayload = cleanPayload({
        personalInfo: apiData.personalInfo,
        contactInfo: apiData.contactInfo,
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

      const applicationId = personalRes?.data?.data?.applicationId;
      debugger
      if (!applicationId) {
        throw new Error("ApplicationId not returned from personal details API");
      }

      // 2. Professional Details
      const professionalPayload = cleanPayload({
        professionalDetails: apiData.professionalDetails,
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
        subscriptionDetails: apiData.subscriptionDetails,
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

      // ✅ AUTO-APPROVE if Approve checkbox is checked
      if (selected.Approve) {
        try {
          let approvalPayload;

          if (isEdit && originalData) {
            const apiOriginalData = dateUtils.prepareForAPI(originalData);
            const proposedPatch = generatePatch(apiOriginalData, apiData);
            approvalPayload = {
              submission: apiData,
              proposedPatch: proposedPatch,
              notes: "Auto-approved with changes on submission"
            };
          } else {
            const proposedPatch = generateCreatePatch(apiData);
            approvalPayload = {
              submission: apiData,
              proposedPatch: proposedPatch,
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
          console.error("Approval failed:", approveError);
          MyAlert(
            "warning",
            "Application submitted successfully but approval failed",
            "The application was created but could not be automatically approved. Please approve it manually."
          );
        }
      } else {
        MyAlert("success", "Application submitted successfully!");
      }

      // ✅ RESET LOGIC
      if (selected?.Bulk !== true) {
        setInfData(inputValue);
        setSelected(prev => ({
          ...prev,
          Approve: false,
          Reject: false
        }));
        navigate('/Applications');
      } else {
        setInfData(inputValue);
        setSelected(prev => ({
          ...prev,
          Reject: false,
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
    } finally {
      setIsProcessing(false);
      disableFtn(false)
      // disableFtn(false);
      // if (selected?.Bulk !== true) {
      // }
    }
  };

  const hasSubscriptionDetailsChanged = (current, original) => {
    const currentSub = current.subscriptionDetails || {};
    const originalSub = original.subscriptionDetails || {};
    // Check ALL subscription fields, not just critical ones
    const allSubscriptionFields = [
      'paymentType',
      'payrollNo',
      'paymentFrequency',      // ← ADDED THIS!
      'membershipStatus',
      'otherIrishTradeUnion',
      'otherIrishTradeUnionName', // ← ADDED THIS!
      'otherScheme',
      'recuritedBy',
      'recuritedByMembershipNo',
      'primarySection',
      'otherPrimarySection',
      'secondarySection',
      'otherSecondarySection',
      'incomeProtectionScheme',
      'inmoRewards',
      'valueAddedServices',
      'termsAndConditions',
      'membershipCategory',
      'exclusiveDiscountsAndOffers',
      'dateJoined',
      'submissionDate'
    ];

    const hasAnyChange = allSubscriptionFields.some(field => {
      const currentVal = currentSub[field];
      const originalVal = originalSub[field];

      // Only consider it a change if both values exist and are different
      if (currentVal && originalVal) {
        return currentVal !== originalVal;
      }

      // If one exists and the other doesn't, it's a change
      return Boolean(currentVal) !== Boolean(originalVal);
    });

    console.log('🔍 Subscription Change (All Fields):', {
      hasAnyChange,
      current: currentSub,
      original: originalSub
    });

    return hasAnyChange;
  };

  const handleSave = async () => {
    if (isDisable) return;
    const isValid = validateForm();
    if (!isValid) return;
    setIsProcessing(true);
    disableFtn(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const apiData = dateUtils.prepareForAPI(InfData);
      if (!isEdit || !originalData) {
        throw new Error("Save operation requires edit mode and original data");
      }

      const applicationId = application?.applicationId;
      if (!applicationId) {
        throw new Error("ApplicationId not found");
      }

      const apiOriginalData = dateUtils.prepareForAPI(originalData);
      const savePromises = [];
      if (applicationId &&
        hasPersonalDetailsChanged(apiData, apiOriginalData)) {
        const personalPayload = cleanPayload({
          personalInfo: apiData.personalInfo,
          contactInfo: apiData.contactInfo,
        });

        console.log("💾 Saving Personal Details (changed):", personalPayload);

        savePromises.push(
          axios.put(
            `${baseURL}/personal-details/${applicationId}`,
            personalPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          )
        );
      }

      // 2. Check Professional Details changes
      if (applicationId &&
        hasProfessionalDetailsChanged(apiData, apiOriginalData)) {
        const professionalPayload = cleanPayload({
          professionalDetails: apiData.professionalDetails,
        });

        console.log("💾 Saving Professional Details (changed):", professionalPayload);
        savePromises.push(
          axios.put(
            `${baseURL}/professional-details/${applicationId}`,
            professionalPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          )
        );
      }

      if (applicationId &&
        hasSubscriptionDetailsChanged(apiData, apiOriginalData)) {
        const subscriptionPayload = cleanPayload({
          subscriptionDetails: apiData.subscriptionDetails,
        });
        debugger
        savePromises.push(
          axios.put(
            `${baseURL}/subscription-details/${applicationId}`,
            subscriptionPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          )
        );
      }

      console.log("📦 Total save promises (changed sections only):", savePromises.length);

      // Execute only changed section saves
      if (savePromises.length > 0) {
        await Promise.all(savePromises);
        MyAlert("success", "Application Updated successfully!");
        setOriginalData(InfData); // Update original data after successful save
      } else {
        MyAlert("info", "No changes detected to save.");
      }

    } catch (error) {
      console.error("Save error:", error);
      MyAlert(
        "error",
        "Failed to save changes",
        error?.response?.data?.error?.message || error.message
      );
    } finally {
      setIsProcessing(false);
      disableFtn(false);
    }
  };

  const {
    hierarchicalData,
    hierarchicalDataLoading,
    hierarchicalDataError
  } = useSelector((state) => state.hierarchicalDataByLocation);
  console.log(hierarchicalData, "hierarchicalData")
  const handleInputChange = (section, field, value) => {
    debugger
    if (section === "subscriptionDetails" && field === "membershipStatus") {
      setInfData((prev) => {
        const updated = {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };

        // ✅ CLEAR ALL STATUS-DEPENDENT FIELDS when membership status changes
        const statusDependentFields = {
          // Fields that should be cleared when status changes
          graduate: ['exclusiveDiscountsAndOffers', 'incomeProtectionScheme'],
          new: ['inmoRewards'] // Add any new-specific fields here
        };

        // Clear fields that are dependent on the previous status
        Object.values(statusDependentFields).forEach(fields => {
          fields.forEach(dependentField => {
            updated.subscriptionDetails[dependentField] = false;
          });
        });

        return updated;
      });
    }
    else if (field === "workLocation") {
      // Check if value is an object (when isObjectValue is true)
      if (typeof value === 'object' && value !== null) {
        // For object value, extract id and label
        const locationId = value.key || value.id || value.value;
        const locationLabel = value.label || value.name || '';

        setInfData((prev) => ({
          ...prev,
          professionalDetails: {
            ...prev.professionalDetails,
            workLocation: locationLabel, // Save label in state
            // branch: ""
          },
        }));

        // Pass only the ID to handleLocationChange
        handleLocationChange(locationId);
      } else {
        // For string value (existing behavior)
        setInfData((prev) => ({
          ...prev,
          professionalDetails: {
            ...prev.professionalDetails,
            workLocation: value,
            // branch: ""
          },
        }));
        handleLocationChange(value);
      }
    }
    else {
      setInfData((prev) => {
        let updated = {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };
        return updated;
      });
    }

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
          debugger
          const streetNumber = getComponent("street_number");
          const route = getComponent("route");
          const sublocality = getComponent("sublocality") || "";
          const town =
            getComponent("locality") || getComponent("postal_town") || "";
          const county = getComponent("administrative_area_level_1") || "";
          const postalCode = getComponent("postal_code");
          const country = getComponent("country");
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
              country
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

  const select = {
    Bulk: false,
    Approve: false,
    Reject: false,
  };
  const [selected, setSelected] = useState(select);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  useEffect(() => {
    if (application && isEdit) {
      const status = application.applicationStatus?.toLowerCase();
      setCurrentApplication(application);

      // Disable form only for approved and in-progress
      const shouldDisableForm = ['approved',].includes(status);
      disableFtn(shouldDisableForm);

      // ✅ Set checkboxes based on actual status
      setSelected(prev => ({
        ...prev,
        Approve: status === 'approved',
        Reject: status === 'rejected'
      }));
      debugger

    } else {
      // For new applications, use default state
      setSelected(select);
    }
  }, [application, isEdit]);


  const handleChange = (e) => {
    const { name, checked } = e.target;

    // ✅ PREVENT CHANGING APPROVE/REJECT FOR READ-ONLY STATUSES
    const status = application?.applicationStatus?.toLowerCase();
    const readOnlyStatuses = ['approved',];

    if (readOnlyStatuses.includes(status) && (name === "Approve")) {
      return; // Don't allow changes for read-only statuses
    }

    if (name === "Bulk") {
      disableFtn(!checked); // Enable form when Bulk is checked, disable when unchecked
      setErrors({});
      setSelected((prev) => ({
        ...prev,
        Bulk: checked,
      }));
    }

    if (name === "Approve" && checked === true && isEdit) {
      // ✅ REMOVED MODAL - Direct approval
      setSelected((prev) => ({
        ...prev,
        Approve: true,
        Reject: false, // Uncheck reject
      }));

      // Directly call approval function
      handleApplicationAction('approved');
    }

    if (name === "Reject" && checked === true) {
      // Keep rejection modal for safety
      setActionModal({ open: true, type: 'reject' });
    }

    // Handle unchecking for non-edit mode
    if (!isEdit && (name === "Approve" || name === "Reject") && checked === false) {
      setSelected((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
    if (!isEdit && (name === "Approve" || name === "Reject") && checked === true) {
      setSelected((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };
  const handleApplicationAction = async (action) => {
    if (isEdit && !originalData) return;
    const isValid = validateForm();
    if (!isValid) return;
    setIsProcessing(true);
    disableFtn(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiInfData = dateUtils.prepareForAPI(InfData);
      const apiOriginalData = dateUtils.prepareForAPI(originalData);

      // Debug subscription changes
      const subscriptionChanged = hasSubscriptionDetailsChanged(apiOriginalData, apiInfData);
      const personalChanged = hasPersonalDetailsChanged(apiOriginalData, apiInfData);
      const professionalChanged = hasProfessionalDetailsChanged(apiOriginalData, apiInfData);

      console.log('🔍 Changes Detected:', {
        personalChanged,
        professionalChanged,
        subscriptionChanged
      });

      // Prepare status payload
      const statusPayload = {
        applicationStatus: action,
        comments: action === "rejected" ? rejectionData.reason : "Application approved"
      };

      // Validate rejection reason
      if (action === "rejected" && !rejectionData.reason) {
        MyAlert("error", "Please select a rejection reason");
        setIsProcessing(false);
        return;
      }

      const applicationId = application?.applicationId;

      // Handle updates for both approval AND rejection
      if (isEdit && (action === "approved" || action === "rejected")) {
        const proposedPatch = generatePatch(apiOriginalData, apiInfData);

        // For approval, send the patch to the approval endpoint
        if (action === "approved" && proposedPatch && proposedPatch.length > 0) {
          const obj = {
            submission: apiOriginalData,
            proposedPatch: proposedPatch,
          };

          await axios.post(
            `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${applicationId}/approve`,
            obj,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        // ✅ UPDATE: Update Personal Details if changed (for both approval and rejection)
        if (personalChanged) {
          const personalPayload = cleanPayload({
            personalInfo: apiInfData.personalInfo,
            contactInfo: apiInfData.contactInfo,
          });
          console.log('💾 Saving Personal Details:', personalPayload);
          await axios.put(
            `${baseURL}/personal-details/${applicationId}`,
            personalPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              }
            }
          );
        }

        // ✅ UPDATE: Update Professional Details if changed (for both approval and rejection)
        if (professionalChanged) {
          const professionalPayload = cleanPayload({
            professionalDetails: apiInfData.professionalDetails,
          });
          console.log('💾 Saving Professional Details:', professionalPayload);
          await axios.put(
            `${baseURL}/professional-details/${applicationId}`,
            professionalPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              }
            }
          );
        }

        // ✅ UPDATE: Update Subscription Details if changed (for both approval and rejection)
        if (subscriptionChanged) {
          const subscriptionPayload = cleanPayload({
            subscriptionDetails: apiInfData.subscriptionDetails,
          });
          console.log('💾 Saving Subscription Details:', subscriptionPayload);
          console.log('📝 Subscription URL:', `${baseURL}/subscription-details/${applicationId}`);

          await axios.put(
            `${baseURL}/subscription-details/${applicationId}`,
            subscriptionPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              }
            }
          );
          console.log('✅ Subscription update successful');
        }
      }

      // Update application status
      await axios.put(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/status/${applicationId}`,
        statusPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update checkbox state
      setSelected(prev => ({
        ...prev,
        Approve: action === 'approved',
        Reject: action === 'rejected'
      }));

      // Success message
      const successMessage = action === "approved"
        ? "Application approved successfully!"
        : "Application rejected successfully!";

      MyAlert("success", successMessage);
      disableFtn(true);

      // Reset modal for rejection
      if (action === "rejected") {
        setActionModal({ open: false, type: null });
        setRejectionData({ reason: "", note: "" });
      }

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

      // Reset checkboxes on error
      setSelected(prev => ({
        ...prev,
        Approve: false,
        Reject: false
      }));
    } finally {
      setIsProcessing(false);
      disableFtn(true);
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
      setCurrentApplication(newApplication); // ✅ Update current application

      // ✅ Now use currentApplication for status checks
      const status = newApplication.applicationStatus?.toLowerCase();
      const readOnlyStatuses = ['approved', 'rejected', 'in-progress'];

      if (readOnlyStatuses.includes(status)) {
        disableFtn(true);
        setSelected(prev => ({
          ...prev,
          Approve: status === 'approved',
          Reject: status === 'rejected'
        }));
      } else {
        disableFtn(false);
        setSelected(prev => ({
          ...prev,
          Approve: false,
          Reject: false
        }));
      }
    }
  }
  return (
    <div>
      <div style={{ backgroundColor: '#f6f7f8', }}>
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
                  ? (selected.actionCompleted || isDisable)
                  : isDisable // Only disabled in non-edit mode when isDisable is true
              }
              onChange={handleChange}
            >
              Approve
            </Checkbox>
            <Checkbox
              name="Reject"
              disabled={
                // If form is disabled, Reject is always disabled
                isDisable ||
                // In non-edit mode, Reject is always disabled  
                (!isEdit) ||
                // In edit mode, disable if Approve is checked
                (isEdit && selected.Approve) ||
                // In edit mode, disable if action is completed
                (isEdit && selected.actionCompleted)
              }
              checked={selected.Reject}
              onChange={handleChange}
            >
              Reject
            </Checkbox>
            <Button
              className="butn primary-btn"
              // disabled={selected?.Reject || selected?.Approve || isDisable}>
              disabled={isDisable}
              onClick={() => handleSave()}
            >
              Save
            </Button>
            {!isEdit && (
              <Button
                onClick={() => handleSubmit()}
                className="butn primary-btn"
                // disabled={isDisable}
                loading={isProcessing}
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
        {/* <InsuranceScreen /> */}
        {/* <InsuranceScreen /> */}
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
                  options={titleOptions}
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
                  options={genderOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("personalInfo", "gender", e.target.value)}
                  hasError={!!errors?.gender}
                />
              </Col>
              <Col xs={24} md={8}>
                <MyDatePicker1
                  label="Date Of Birth"
                  name="dob"
                  required
                  value={InfData?.personalInfo?.dateOfBirth}
                  disabled={isDisable}
                  onChange={(date, dateString) => {

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
              subTitle="Let us know the best way to contact you"
            />

            <Row gutter={[16, 12]} className="mt-2">
              {/* Consent and Preferred Address in one row */}
              <Col span={24}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div className="p-3" style={{ borderRadius: '4px', backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                      <Checkbox
                        style={{ color: "#78350f" }}
                        value={true}
                        checked={InfData?.contactInfo?.consent}
                        onChange={(e) => handleInputChange("contactInfo", "consent", e.target.checked)}
                      >
                        Consent to receive Correspondence from INMO
                      </Checkbox>
                      <p style={{ color: '#78350f', }} className="m-0 !ms-0">Please un-tick this box if you would not like to receive correspondence from us to this address.
                      </p>
                    </div>
                  </Col>
                  <Col xs={24} md={12} className="!pb-0 pa">
                    <div className="p-3 bg-lb " style={{ borderRadius: '4px', height: '100%', backgroundColor: '#1173d41a', border: '1px solid #97c5efff' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <label style={{ color: '#215e97' }} className={`my-input-label ${errors?.preferredAddress ? "error-text1" : ""}`}>
                          Preferred Address <span className="text-danger">*</span>
                        </label>
                        <Radio.Group
                          style={{ color: '#215e97', borderColor: '#215e97' }}
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
                    disabled={isDisable}
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
                  disabled={isDisable}
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
                  require
                  hasError={!!errors?.mobileNumber}
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
                <div className="p-3 bg-lb" style={{ borderRadius: '4px', height: '100%', backgroundColor: '#1173d41a', border: '1px solid #97c5efff', borderRadius: "4px" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <label style={{ color: '#215e97' }} className={`my-input-label ${errors?.preferredEmail ? "error-text1" : ""}`}>
                      Preferred Email <span className="text-danger ms-1">*</span>
                    </label>
                    <Radio.Group
                      style={{ color: '#215e97' }}
                      onChange={(e) => handleInputChange("contactInfo", "preferredEmail", e.target.value)}
                      value={InfData?.contactInfo?.preferredEmail}
                      disabled={isDisable}
                      className={errors?.preferredEmail ? "radio-error" : ""}

                    >
                      <Radio style={{ color: '#215e97' }} value="personal">Personal</Radio>
                      <Radio style={{ color: '#215e97' }} value="work">Work</Radio>
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
                  value={InfData.subscriptionDetails?.membershipCategory}
                  isIDs={true}
                  options={categoryData}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("subscriptionDetails", "membershipCategory", e.target.value)}
                  hasError={!!errors?.membershipCategory}
                />
              </Col>
              {
                InfData.subscriptionDetails?.membershipCategory === "68dae699c5b15073d66b892c" ? (
                  <Col xs={24} md={12}>
                    <Row gutter={[8, 8]}>
                      <Col xs={24} md={12}>
                        <MyDatePicker1
                          label="Retired Date"
                          name="retiredDate"
                          value={InfData?.professionalDetails?.retiredDate}
                          disabled={isDisable || InfData?.subscriptionDetails?.membershipCategory !== "68dae699c5b15073d66b892c"}
                          required={InfData?.subscriptionDetails?.membershipCategory === "68dae699c5b15073d66b892c"}
                          onChange={(date, dateString) => {
                            handleInputChange("professionalDetails", "retiredDate", date);
                          }}
                          hasError={!!errors?.retiredDate}
                        />
                      </Col>
                      <Col xs={24} md={12}>
                        <MyInput
                          label="Pension No"
                          name="pensionNo"
                          value={InfData.professionalDetails?.pensionNo}
                          disabled={isDisable || InfData?.subscriptionDetails?.membershipCategory !== "68dae699c5b15073d66b892c"}
                          required={InfData?.subscriptionDetails?.membershipCategory === "68dae699c5b15073d66b892c"}
                          onChange={(e) => handleInputChange("professionalDetails", "pensionNo", e.target.value)}
                          hasError={!!errors?.pensionNo}
                        />
                      </Col>
                    </Row>
                  </Col>
                )
                  :
                  InfData.subscriptionDetails?.membershipCategory == "68dae699c5b15073d66b892d" ? (
                    <>
                      <Col xs={24} md={12}>
                        <Row gutter={12}>
                          <Col xs={24} md={8}>
                            <CustomSelect
                              onChange={(e) => handleInputChange("professionalDetails", "studyLocation", e.target.value)}
                              label="Study Location"
                              disabled={isDisable}
                              required
                              options={[
                                { value: "Trinity College Dublin", label: "Trinity College Dublin" },
                                { value: "University College Dublin", label: "University College Dublin" },
                                // { value: "Direct Debit", label: "Direct Debit" },
                              ]}
                              value={InfData?.professionalDetails?.studyLocation}
                              hasError={!!errors?.studyLocation}
                            />
                          </Col>

                          <Col xs={24} md={8}>
                            <MyDatePicker1 label="Start Date"
                              onChange={(date, datestring) => {
                                {
                                  handleInputChange("professionalDetails", "startDate", date)
                                }
                              }}
                              required
                              disabled={isDisable}
                              value={InfData?.professionalDetails?.startDate} />
                          </Col>
                          <Col xs={24} md={8}>
                            <MyDatePicker1 label="Graduation date"
                              required
                              disabled={isDisable}
                              onChange={(date, datestring) => {
                                {
                                  handleInputChange("professionalDetails", "graduationDate", date)
                                }
                              }}
                              value={InfData?.professionalDetails?.graduationDate}
                              hasError={!!errors?.graduationDate}
                            />

                          </Col>
                        </Row>
                      </Col>
                    </>
                  )
                    :
                    <Col span={12}></Col>
              }

              {/* Work Location */}
              <Col xs={24} md={12}>
                <CustomSelect
                  label="Work Location"
                  name="workLocation"
                  isObjectValue={true} // Enable object return
                  isIDs={false} // Use IDs for option values
                  value={InfData.professionalDetails?.workLocation} // This will show the label
                  required
                  options={workLocationOptions}
                  disabled={isDisable}
                  onChange={(e) => {
                    handleInputChange("professionalDetails", "workLocation", e.target.value)
                  }}
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
                  // isIDs={application ? false : true}
                  disabled={true}
                  placeholder={`${workLocationLoading ? "Loading..." : "Select"}`}
                  onChange={(e) => handleInputChange("professionalDetails", "branch", e.target.value)}
                  // options={allBranches.map((branch) => ({
                  //   value: branch,
                  //   label: branch,
                  // }))}
                  options={branchOptions}
                />
              </Col>

              <Col xs={24} md={12}>
                <CustomSelect
                  // isIDs={application ? false : true}
                  label="Region"
                  name="Region"
                  placeholder={`${workLocationLoading ? "Loading..." : "Select"}`}
                  value={InfData.professionalDetails?.region}
                  disabled={true}
                  onChange={(e) => handleInputChange("professionalDetails", "region", e.target.value)}
                  // options={allRegions.map((region) => ({
                  //   value: region,
                  //   label: region,
                  // }))}
                  options={regionOptions}
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
                  // options={[
                  //   { value: "junior", label: "Junior" },
                  //   { value: "senior", label: "Senior" },
                  //   { value: "lead", label: "Lead" },
                  //   { value: "manager", label: "Manager" },
                  //   { value: "other", label: "Other" },
                  // ]}
                  options={gradeOptions}
                  hasError={!!errors?.grade}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Other Grade"
                  name="otherGrade"
                  value={InfData.professionalDetails?.otherGrade}
                  required={InfData?.professionalDetails?.grade === "Other"}
                  disabled={InfData?.professionalDetails?.grade !== "Other" || isDisable}
                  onChange={(e) => handleInputChange("professionalDetails", "otherGrade", e.target.value)}
                  hasError={!!errors?.otherGrade}
                />
              </Col>

              {/* Nursing Adaptation Programme */}
              <Col xs={24} md={12} className="!pb-0 pa">
                <div
                  className="p-3 bg-lb"
                  style={{
                    borderRadius: '4px',
                    height: '100%',
                    backgroundColor: '#1173d41a',
                    border: '1px solid #97c5efff',
                  }}
                >
                  <label
                    style={{
                      color: '#215e97',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                    className={`my-input-label ${errors?.nursingAdaptationProgramme ? 'error-text1' : ''}`}
                  >
                    Are you currently undertaking a nursing adaptation programme?{' '}
                    <span className="text-danger">*</span>
                  </label>

                  <Radio.Group
                    name="nursingAdaptationProgramme"
                    value={
                      InfData.professionalDetails?.nursingAdaptationProgramme === true
                        ? true
                        : InfData.professionalDetails?.nursingAdaptationProgramme === false
                          ? false
                          : null
                    }
                    onChange={(e) =>
                      handleInputChange(
                        'professionalDetails',
                        'nursingAdaptationProgramme',
                        e.target.value
                      )
                    }
                    disabled={isDisable}
                    style={{
                      color: '#215e97',
                      borderColor: '#215e97',
                      display: 'flex',
                      gap: '20px',
                    }}
                    className={errors?.nursingAdaptationProgramme ? 'radio-error' : ''}
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
                  disabled={InfData?.professionalDetails?.nursingAdaptationProgramme !== true || isDisable}
                  required={InfData?.professionalDetails?.nursingAdaptationProgramme === true}
                  onChange={(e) => handleInputChange("professionalDetails", "nmbiNumber", e.target.value)}
                />
              </Col>

              {/* Nurse Type - Full Width */}
              <Col span={24}>
                <div
                  className="ps-3 pe-3 pt-2 pb-3 bg-ly"
                  style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: "4px",
                    border: '1px solid #a4e3ba',
                  }}
                >
                  <label
                    className="my-input-label mb-1"
                    style={{ color: '#14532d' }}
                  >
                    Please tick one of the following
                  </label>

                  <Radio.Group
                    name="nurseType"
                    value={InfData.professionalDetails?.nurseType}
                    onChange={(e) =>
                      handleInputChange("professionalDetails", "nurseType", e.target.value)
                    }
                    required={InfData?.professionalDetails?.nursingAdaptationProgramme === true}
                    disabled={InfData?.professionalDetails?.nursingAdaptationProgramme !== true}
                    style={{
                      color: '#14532d',
                      width: "100%",
                    }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-baseline flex-wrap"
                      style={{ gap: '8px' }}
                    >
                      <Radio value="generalNursing" style={{ color: '#14532d', width: '14%' }}>
                        General Nursing
                      </Radio>

                      <Radio value="publicHealthNurse" style={{ color: '#14532d', width: '14%' }}>
                        Public Health Nurse
                      </Radio>

                      <Radio value="mentalHealth" style={{ color: '#14532d', width: '14%' }}>
                        Mental Health Nurse
                      </Radio>

                      <Radio value="midwife" style={{ color: '#14532d', width: '16%' }}>
                        Midwife
                      </Radio>

                      <Radio value="sickChildrenNurse" style={{ color: '#14532d', width: '14%' }}>
                        Sick Children's Nurse
                      </Radio>

                      <Radio
                        value="intellectualDisability"
                        style={{
                          color: '#14532d',
                          width: '20%',
                          whiteSpace: 'normal',
                          lineHeight: '1.2',
                        }}
                      >
                        Registered Nurse for Intellectual Disability
                      </Radio>
                    </div>
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
                <div className="w-100" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr ', gap: '8px' }}>
                  {/* <MyDatePicker1 label="" /> */}
                  <MyDatePicker1
                    className="w-100"
                    label="Date Joined"
                    name="dateJoined"
                    required
                    value={InfData?.subscriptionDetails?.dateJoined}
                    disabled={isDisable}
                    onChange={(date, dateString) => {
                      handleInputChange("subscriptionDetails", "dateJoined", date);
                    }}
                    hasError={!!errors?.dateJoined}
                    errorMessage={errors?.dateJoined || "Required"}
                  />
                  <MyDatePicker1
                    className="w-100"
                    label="Submission Date"
                    name="SubmissionDate"
                    value={InfData?.subscriptionDetails?.submissionDate}
                    disabled={isDisable || isEdit}
                    onChange={(date, dateString) => {
                      handleInputChange("subscriptionDetails", "submissionDate", date);
                    }}
                    hasError={!!errors?.dateJoined}
                    errorMessage={errors?.dateJoined || "Required"}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="w-100" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr ', gap: '8px' }}>
                  <CustomSelect
                    label="Payment Type"
                    name="paymentType"
                    required
                    // options={paymentTypeOptions}
                    options={[
                      { value: "Salary Deduction", label: "Salary Deduction" },
                      { value: "Credit Card", label: "Credit Card" },
                      // { value: "Direct Debit", label: "Direct Debit" },
                    ]}
                    disabled={isDisable}
                    onChange={(e) => handleInputChange("subscriptionDetails", "paymentType", e.target.value)}
                    value={InfData.subscriptionDetails?.paymentType}
                    hasError={!!errors?.paymentType}
                  />
                  <MyInput
                    className="w-100"
                    label="Payroll No"
                    name="payrollNo"
                    value={InfData?.subscriptionDetails?.payrollNo}
                    hasError={!!errors?.payrollNo}
                    required={InfData?.subscriptionDetails?.paymentType === "Salary Deduction"}
                    disabled={InfData?.subscriptionDetails?.paymentType !== "Salary Deduction"||isDisable}
                    onChange={(e) => handleInputChange("subscriptionDetails", "payrollNo", e.target.value)}
                  />
                </div>
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
                <div
                  className="ps-3 pe-3 pt-2 pb-3 bg-ly"
                  style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: '4px',
                    border: '1px solid #a4e3ba',
                  }}
                >
                  <label className="my-input-label mb-1" style={{ color: '#14532d' }}>
                    Please select the most appropriate option below
                  </label>

                  <Radio.Group
                    name="memberStatus"
                    value={InfData?.subscriptionDetails?.membershipStatus || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'subscriptionDetails',
                        'membershipStatus',
                        e.target.value
                      )
                    }
                    disabled={isDisable}
                    style={{
                      color: '#14532d',
                      width: '100%',
                    }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-baseline flex-wrap"
                      style={{ gap: '8px' }}
                    >
                      <Radio value="new" style={{ color: '#14532d', width: '14%' }}>
                        You are a new member
                      </Radio>

                      <Radio value="graduate" style={{ color: '#14532d', width: '14%' }}>
                        You are newly graduated
                      </Radio>

                      <Radio value="rejoin" style={{ color: '#14532d', width: '28%', whiteSpace: 'normal', lineHeight: '1.2' }}>
                        You were previously a member of the INMO, and are rejoining
                      </Radio>

                      <Radio value="careerBreak" style={{ color: '#14532d', width: '18%', whiteSpace: 'normal', lineHeight: '1.2' }}>
                        You are returning from a career break
                      </Radio>

                      <Radio value="nursingAbroad" style={{ color: '#14532d', width: '18%', whiteSpace: 'normal', lineHeight: '1.2' }}>
                        You are returning from nursing abroad
                      </Radio>
                    </div>
                  </Radio.Group>
                </div>
              </Col>
              {
                ["graduate"].includes(InfData?.subscriptionDetails?.membershipStatus) && (
                  <>
                    <Col xs={24} md={24}>
                      <div className="pe-3 ps-3 pt-2 pb-2 h-100" style={{ borderRadius: '4px', backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                        <Checkbox
                          checked={InfData?.subscriptionDetails?.exclusiveDiscountsAndOffers}
                          style={{ color: "#78350f" }}
                          onChange={(e) => handleInputChange("subscriptionDetails", "exclusiveDiscountsAndOffers", e.target.checked)}
                          // className="my-input-wrapper"
                          disabled={isDisable || !["new", "graduate"].includes(InfData?.subscriptionDetails?.membershipStatus)}
                        >
                          Would you like to hear about exclusive discounts and offers for INMO members?
                        </Checkbox>
                      </div>
                    </Col>
                    <Col xs={24} md={24}>
                      <div className="pe-3 ps-3 pt-2 pb-2 h-100" style={{ borderRadius: '4px', backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                        <Checkbox
                          checked={InfData?.subscriptionDetails?.incomeProtectionScheme}
                          style={{ color: "#78350f" }}
                          onChange={(e) => handleInputChange("subscriptionDetails", "incomeProtectionScheme", e.target.checked)}
                          // className="my-input-wrapper"
                          disabled={isDisable || !["new", "graduate"].includes(InfData?.subscriptionDetails?.membershipStatus)}
                        >
                          I consent to <Tooltip
                            placement="top"
                            styles={{
                              body: {
                                maxWidth: '600px',
                                width: '600px',
                                maxHeight: '650px', // Increased height for better content display
                                overflow: 'hidden',
                                padding: '0'
                              }
                            }}
                            title={
                              <div style={{
                                maxHeight: '650px', // Scrollable area height
                                overflowY: 'auto',
                                marginTop: '5px',
                                marginBottom: '5px',
                                // padding: '0 5px'
                              }}>
                                <InsuranceScreen />
                              </div>
                            }
                          >
                            <a href="#" style={{ color: "#78350f", textDecoration: "underline" }}>   INMO Income Protection Scheme.


                            </a></Tooltip>
                        </Checkbox>
                        <p>
                          By selecting ‘I consent’ below, you are agreeing to the INMO, sharing your Trade Union membership details with Cornmarket. Cornmarket as Scheme Administrator will process and retain details of your Trade Union membership for the purposes of assessing eligibility and admitting eligible members (automatically) to the Income Protection Scheme (with 9 Months’ Free Cover), and for the ongoing administration of the Scheme. Where you have also opted in to receiving marketing communications, Cornmarket will provide you with information on discounts and offers they have for INMO members. This consent can be withdrawn at any time by emailing Cornmarket at dataprotection@cornmarket.ie. Please note, if you do consent below, your data will be shared with Cornmarket, and you will be assessed for eligibility for automatic Income Protection Scheme membership. If you do not consent, your data will not be shared with Cornmarket for this purpose, you will not be assessed for automatic Scheme membership (including 9 Months’ Free Cover) and you will have to contact Cornmarket separately should you wish to apply for Scheme membership. This offer will run on a pilot basis. Terms and conditions apply and are subject to change.
                          Important: If you do not give your consent, your Trade union membership data will not be shared with Cornmarket for this purpose. This means you will not be assessed for Automatic Access to the Scheme.
                        </p>
                      </div>
                    </Col>
                  </>
                )
              }
              {
                ["new"].includes(InfData?.subscriptionDetails?.membershipStatus) && (
                  <>
                    <Col xs={24} md={24}>
                      <div className="pe-3 ps-3 pt-2 pb-2 h-100" style={{ borderRadius: '4px', backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                        <Checkbox
                          checked={InfData?.subscriptionDetails?.inmoRewards}
                          style={{ color: "#78350f" }}
                          onChange={(e) => handleInputChange("subscriptionDetails", "inmoRewards", e.target.checked)}
                          // className="my-input-wrapper"
                          disabled={isDisable}
                        // disabled={isDisable || !["new", "graduate"].includes(InfData?.subscriptionDetails?.membershipStatus)}
                        >

                          Tick here to join{" "}
                          <Tooltip
                            placement="top"
                            styles={{
                              body: {
                                maxWidth: '600px',
                                width: '600px',
                                maxHeight: '650px', // Increased height for better content display
                                overflow: 'hidden',
                                padding: '0'
                              }
                            }}
                            title={
                              <div style={{
                                maxHeight: '650px', // Scrollable area height
                                overflowY: 'auto',
                                marginTop: '5px',
                                marginBottom: '5px',
                                // padding: '0 5px'
                              }}>
                                <RewardsScreen />
                              </div>
                            }
                          >
                            <a href="#" style={{ color: "#78350f", textDecoration: "underline" }}>
                              Rewards
                            </a>
                          </Tooltip>
                          {" "}
                          for INMO members
                        </Checkbox>
                        <p>
                          By ticking here, you confirm that you agree to the Terms & Conditions available on Cornmarket.ie/rewards-club-terms and the Data Protection Statement available on Cornmarket.ie/rewards-dps. Cornmarket will contact you about your Rewards Benefits. You can opt out at any time.</p>
                      </div>
                    </Col>
                  </>
                )
              }
              {/* Checkboxes in 50% width */}
              {/* <Col xs={24} md={12}>
                <div className="pe-3 ps-3 pt-2 pb-2 h-100" style={{ borderRadius: '4px', backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.incomeProtectionScheme}
                    style={{ color: "#78350f" }}
                    onChange={(e) => handleInputChange("subscriptionDetails", "incomeProtectionScheme", e.target.checked)}
                    // className="my-input-wrapper"
                    disabled={isDisable || !["new", "graduate"].includes(InfData?.subscriptionDetails?.membershipStatus)}
                  >
                    Tick here to join INMO Income Protection Scheme
                  </Checkbox>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="h-100 pe-3 ps-3 pt-2 pb-2" style={{ borderRadius: '4px', backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.inmoRewards}
                    onChange={(e) => handleInputChange("subscriptionDetails", "inmoRewards", e.target.checked)}
                    // className="my-input-wrapper"
                    // disabled={isDisable || !["new", "graduate"].includes(InfData?.subscriptionDetails?.membershipStatus)}
                    disabled={isDisable}
                    style={{ color: "#78350f" }}

                  >
                    Tick here to join Rewards for INMO members
                  </Checkbox>
                </div>
              </Col> */}

              {/* Trade Union Questions - Same Height */}
              <Col xs={24} md={12}>
                <div className="d-flex p-3  " style={{ backgroundColor: '#1173d41a', border: '1px solid #97c5efff', borderRadius: "4px" }}>
                  <div className=" bg-lb me-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
                    <label className="my-input-label mb-2 " style={{ color: '#215e97' }}>
                      If you are a member of another Trade Union. If yes, which Union?
                    </label>
                    <Radio.Group
                      style={{ color: '#215e97', borderColor: '#' }}
                      name="otherIrishTradeUnion"
                      value={InfData.subscriptionDetails?.otherIrishTradeUnion !== null ?
                        InfData.subscriptionDetails?.otherIrishTradeUnion : null}
                      onChange={(e) => handleInputChange("subscriptionDetails", "otherIrishTradeUnion", e.target?.value)}
                      disabled={isDisable}
                    >
                      <Radio style={{ color: '#215e97' }} value={true}>Yes</Radio>
                      <Radio style={{ color: '#215e97' }} value={false}>No</Radio>
                    </Radio.Group>
                    <div className="d-flex">

                    </div>
                  </div>
                  {
                    InfData.subscriptionDetails?.otherIrishTradeUnion &&
                    <MyInput  value={InfData.subscriptionDetails?.otherIrishTradeUnionName} onChange={(e) => handleInputChange("subscriptionDetails", "otherIrishTradeUnionName", e.target?.value)} />
                  }
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="p-3 bg-lb pb-0 " style={{ backgroundColor: '#1173d41a', border: '1px solid #97c5efff', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="my-input-label mb-2" style={{ color: '#215e97' }} >
                    Are you or were you a member of another Irish trade Union salary or Income Protection Scheme?
                  </label>
                  <Radio.Group
                    name="otherScheme"
                    value={InfData.subscriptionDetails?.otherScheme !== null ?
                      InfData.subscriptionDetails?.otherScheme :
                      null
                    }
                    onChange={(e) => handleInputChange("subscriptionDetails", "otherScheme", e.target?.value)}
                    className="my-input-wrapper"
                    style={{ color: '#215e97' }}
                    disabled={isDisable}
                  >
                    <Radio style={{ color: '#215e97' }} value={true}>Yes</Radio>
                    <Radio style={{ color: '#215e97' }} value={false}>No</Radio>
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
                  // options={[
                  //   { value: "section1", label: "Section 1" },
                  //   { value: "section2", label: "Section 2" },
                  //   { value: "section3", label: "Section 3" },
                  //   { value: "section4", label: "Section 4" },
                  //   { value: "section5", label: "Section 5" },
                  //   { value: "other", label: "Other" },
                  // ]}
                  options={sectionOptions}

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
                  // options={[
                  //   { value: "section1", label: "Section 1" },
                  //   { value: "section2", label: "Section 2" },
                  //   { value: "section3", label: "Section 3" },
                  //   { value: "section4", label: "Section 4" },
                  //   { value: "section5", label: "Section 5" },
                  //   { value: "other", label: "Other" },
                  // ]}
                  options={secondarySectionOptions}
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
              <Col xs={24} md={12} className="mb-3">
                <div className="pe-3 ps-3 pt-2 pb-2   d-flex align-items-center" style={{ borderRadius: '4px', height: '100%', backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.valueAddedServices}
                    style={{ color: "#78350f" }}
                    onChange={(e) => handleInputChange("subscriptionDetails", "valueAddedServices", e.target.checked)}
                    disabled={isDisable}
                  // className="my-input-wrapper"
                  >
                    Tick here to allow our partners to contact you about Value added Services by Email and SMS
                  </Checkbox>
                </div>
              </Col>

              <Col className="mb-3" xs={24} md={12}>
                <div className="pe-3 ps-3 pt-2 pb-2 d-flex align-items-center" style={{ borderRadius: '4px', backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.termsAndConditions}
                    onChange={(e) => handleInputChange("subscriptionDetails", "termsAndConditions", e.target.checked)}
                    style={{ color: "#78350f" }}
                    disabled={isDisable}
                  >
                    I have read and agree to the{" "}
                    <a href="#" style={{ color: "#78350f", textDecoration: "underline" }}>
                      INMO Data Protection Statement,
                    </a>{" "}
                    the{" "}
                    <a href="#" style={{ color: "#78350f", textDecoration: "underline" }}>
                      INMO Privacy Statement
                    </a>{" "}
                    and the{" "}
                    <a href="#" style={{ color: "#78350f", textDecoration: "underline" }}>
                      INMO Conditions of Membership
                    </a>
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
        title="Reject Application"
        open={actionModal.open && actionModal.type === 'reject'} // Only show for reject
        onCancel={() => {
          setActionModal({ open: false, type: null });
          // Uncheck reject checkbox when modal is cancelled
          setSelected(prev => ({
            ...prev,
            Reject: false,
          }));
          setRejectionData({ reason: "", note: "" });
        }}
        onOk={() => handleApplicationAction('rejected')}
        okText="Reject"
        okButtonProps={{
          danger: true,
          className: 'butn',
          loading: isProcessing
        }}
        cancelButtonProps={{
          className: "butn butn primary-btn",
          disabled: isProcessing
        }}
        confirmLoading={isProcessing}
      >
        <div className="drawer-main-container">
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
        </div>
      </Modal>

    </div>
  );
}

export default ApplicationMgtDrawer;
