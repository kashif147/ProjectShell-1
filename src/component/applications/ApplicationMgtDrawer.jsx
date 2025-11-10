import { useState, useRef, useEffect } from "react";
import { Drawer, Row, Col, Checkbox, Radio, Button, Spin, Modal, Flex, Tooltip } from "antd";
import { MailOutlined, EnvironmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs"

import { Shield, Heart, FileText, Users, Gift, Home, Percent, Trophy } from 'lucide-react';
import axios from "axios";
import CustomSelect from "../common/CustomSelect";
import { useTableColumns } from "../../context/TableColumnsContext ";
import MyInput from "../common/MyInput";
import { fetchLookupHierarchy, selectLookupEntry } from "../../features/lookupHierarchySlice";
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
import { FaAngleRight } from "react-icons/fa";
import { fetchCountries } from "../../features/CountriesSlice";
import { getWorkLocationHierarchy } from "../../features/LookupsWorkLocationSlice";
import moment from "moment";
import MemberSearch from "../profile/MemberSearch";
import MyFooter from "../common/MyFooter";
import MyDatePicker1 from "../common/MyDatePicker1";
import { getCategoryLookup } from "../../features/CategoryLookupSlice";
import Breadcrumb from "../common/Breadcrumb";
import { useFilters } from "../../context/FilterContext";
// import IncomeProtectionTooltip from "../../component/profile/IncomeProtectionTooltip"
import { InsuranceScreen, RewardsScreen } from "../profile/IncomeProtectionTooltip";
import { getProductsByType } from "../../features/ProductsSlice";
// import { } from "../profile/IncomeProtectionTooltip";
import {
  getAllLookups,
  selectAllFormLookups
} from '../../features/LookupsSlice'
import { getHierarchicalDataByLocation } from "../../features/HierarchicalDataByLocationSlice";
// import { useLookups } from "../../hooks/useLookups";

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
  const [rejectModal, setRejectModal] = useState(false);
  const [insurenceModal, setinsurence] = useState(true);

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
        consent: apiData?.personalDetails?.contactInfo?.consent || true,
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
        nurseType: apiData?.professionalDetails?.nurseType || null,
        nursingAdaptationProgramme:
          apiData?.professionalDetails?.nursingAdaptationProgramme || false,
        region: apiData?.professionalDetails?.region || "",
        branch: apiData?.professionalDetails?.branch || "",
        isRetired: apiData?.professionalDetails?.isRetired || false,
        retiredDate: apiData?.professionalDetails?.retiredDate !== undefined && apiData?.professionalDetails?.retiredDate !== "" && apiData?.professionalDetails?.retiredDate !== null ?
          dayjs(apiData?.professionalDetails?.retiredDate) : null,
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
        // dateJoined: apiData?.subscriptionDetails?.dateJoined || "",
        dateJoined: apiData?.subscriptionDetails?.dateJoined !== undefined && apiData?.subscriptionDetails?.dateJoined !== "" && apiData?.subscriptionDetails?.dateJoined !== null ?
          dayjs(apiData?.dateJoined) : null,
        // submissionDate: apiData?.subscriptionDetails?.submissionDate !== undefined && apiData?.subscriptionDetails?.submissionDate !== "" && apiData?.subscriptionDetails?.submissionDate !== null ?
        //   dayjs(apiData?.submissionDate) : null,
        paymentFrequency: apiData?.subscriptionDetails?.paymentFrequency !== null,
      },
    };
  };
  const {
    categoryData,
    error,
    currentCategoryId
  } = useSelector((state) => state.categoryLookup);
  useEffect(() => {
    dispatch(fetchCountries());
    // dispatch(getAllLookups());
    refreshApplicationsWithStatusFilters()
    // dispatch(getWorkLocationHierarchy());
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

  const handleApprove = async (key) => {
    if (isEdit && originalData) {

      // ✅ ADD DATE CONVERSION FOR APPROVAL FLOW
      const convertDatesToISO = (data) => {
        if (!data) return data;
        const converted = { ...data };

        if (converted.personalInfo?.dateOfBirth) {
          converted.personalInfo.dateOfBirth = moment(converted.personalInfo.dateOfBirth).toISOString();
        }

        if (converted.professionalDetails?.retiredDate) {
          converted.professionalDetails.retiredDate = moment(converted.professionalDetails.retiredDate).toISOString();
        }

        if (converted.professionalDetails?.graduationDate) {
          converted.professionalDetails.graduationDate = moment(converted.professionalDetails.graduationDate).toISOString();
        }

        return converted;
      };

      // Convert dates before generating patch
      const convertedInfData = convertDatesToISO(InfData);
      const convertedOriginalData = convertDatesToISO(originalData);

      const proposedPatch = generatePatch(convertedOriginalData, convertedInfData);
      const obj = {
        submission: convertedOriginalData,
        proposedPatch: proposedPatch,
      };

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // 🟢 If no changes were proposed, update status directly
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
          refreshApplicationsWithStatusFilters();
          navigate('/Applications')
          return;
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
        const personalChanged = hasPersonalDetailsChanged(convertedOriginalData, convertedInfData);
        const professionalChanged = hasProfessionalDetailsChanged(convertedOriginalData, convertedInfData);

        if (personalChanged && application?.personalDetails?._id) {
          const personalPayload = cleanPayload({
            personalInfo: convertedInfData.personalInfo,
            contactInfo: convertedInfData.contactInfo,
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
            professionalDetails: convertedInfData.professionalDetails,
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
        refreshApplicationsWithStatusFilters();

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
        const originalDate = originalValue ? moment(originalValue).format('YYYY-MM-DD') : null;
        const currentDate = currentValue ? moment(currentValue).format('YYYY-MM-DD') : null;
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
      consent: true,
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
      nurseType: null,
      nursingAdaptationProgramme: null,
      region: "",
      branch: "",
      isRetired: false,
      pensionNo: "",
      retiredDate: null
    },
    subscriptionDetails: {
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
      membershipCategory: "",
      dateJoined: dayjs(),
      // submissionDate: dayjs(),
      paymentFrequency: "",
    },
  };
  const [InfData, setInfData] = useState(inputValue);
  const handleLocationChange = (selectedLookupId) => {
    debugger
    // Get hierarchicalLookups from localStorage
    const storedLookups = localStorage.getItem('hierarchicalLookups');
    const hierarchicalLookups = storedLookups ? JSON.parse(storedLookups) : [];

    // Find the selected object in hierarchicalLookups
    const foundObject = hierarchicalLookups.find(item =>
      item.lookup && item.lookup._id === selectedLookupId
    );

    if (foundObject) {
      // Update InfData with region and branch IDs
      setInfData(prevData => ({
        ...prevData,
        professionalDetails: {
          ...prevData.professionalDetails,
          workLocation: selectedLookupId, // Set the selected location ID
          region: foundObject.region?._id || "", // Set region ID
          branch: foundObject.branch?._id || "" // Set branch ID
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
  if (isDisable) return
  const isValid = validateForm();
  if (!isValid) return;

  // ✅ Start loading and disable form
  setIsProcessing(true);
  disableFtn(true);

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
      if (converted.subscriptionDetails?.dateJoined) {
        converted.subscriptionDetails.dateJoined = moment(converted.subscriptionDetails.dateJoined).toISOString();
      }
      // if (converted.subscriptionDetails?.submissionDate) {
      //   converted.subscriptionDetails.submissionDate = moment(converted.subscriptionDetails.submissionDate).toISOString();
      // }
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
  } finally {
    // ✅ Stop loading and re-enable form (only if not in Bulk mode)
    setIsProcessing(false);
    if (selected?.Bulk !== true) {
      disableFtn(false);
    }
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
  const {
    hierarchicalData,
    hierarchicalDataLoading,
    hierarchicalDataError
  } = useSelector((state) => state.hierarchicalDataByLocation);
  console.log(hierarchicalData, "hierarchicalData")
  const handleInputChange = (section, field, value) => {
    if (field === "workLocation") {
      setInfData((prev) => ({
        ...prev,
        professionalDetails: {
          ...prev.professionalDetails,
          region: "",
          branch: ""
        },
      }));
      // dispatch(getWorkLocationHierarchy(value))
      handleLocationChange(value)
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
      const readOnlyStatuses = ['approved', 'rejected', 'in-progress'];
      if (readOnlyStatuses.includes(status)) {
        disableFtn(true); // Disable form for read-only statuses

        // ✅ UPDATE CHECKBOXES BASED ON STATUS
        setSelected(prev => ({
          ...prev,
          Approve: status === 'approved',
          Reject: status === 'rejected'
        }));
      } else {
        // For editable applications, reset checkboxes to default
        setSelected(prev => ({
          ...prev,
          Approve: false,
          Reject: false
        }));
        disableFtn(false);
      }
    } else {
      // For new applications, use default state
      setSelected(select);
    }
  }, [application, isEdit]);


 const handleChange = (e) => {
  const { name, checked } = e.target;

  // ✅ PREVENT CHANGING APPROVE/REJECT FOR READ-ONLY STATUSES
  const status = application?.applicationStatus?.toLowerCase();
  const readOnlyStatuses = ['approved', 'rejected', 'in-progress'];

  if (readOnlyStatuses.includes(status) && (name === "Approve" || name === "Reject")) {
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

  if (name === "Approve" && checked === true) {
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
};
  const handleApplicationAction = async (action) => {
  if (isEdit && !originalData) return;

  setIsProcessing(true);

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // ✅ ADD DATE CONVERSION FOR APPROVAL/REJECTION FLOW
    const convertDatesToISO = (data) => {
      if (!data) return data;
      const converted = { ...data };

      if (converted.personalInfo?.dateOfBirth) {
        converted.personalInfo.dateOfBirth = moment(converted.personalInfo.dateOfBirth).toISOString();
      }

      if (converted.professionalDetails?.retiredDate) {
        converted.professionalDetails.retiredDate = moment(converted.professionalDetails.retiredDate).toISOString();
      }

      if (converted.professionalDetails?.graduationDate) {
        converted.professionalDetails.graduationDate = moment(converted.professionalDetails.graduationDate).toISOString();
      }

      return converted;
    };

    // Convert dates before any processing
    const convertedInfData = convertDatesToISO(InfData);
    const convertedOriginalData = convertDatesToISO(originalData);

    // Prepare status payload
    const statusPayload = {
      applicationStatus: action, // "approved" or "rejected"
      comments: action === "rejected"
        ? rejectionData.reason
        : "Application approved" // Default comment for approval
    };

    // Validate rejection reason (only for reject)
    if (action === "rejected" && !rejectionData.reason) {
      MyAlert("error", "Please select a rejection reason");
      setIsProcessing(false);
      return;
    }

    // Handle approval with changes (only for edit mode)
    if (isEdit && action === "approved") {
      const proposedPatch = generatePatch(convertedOriginalData, convertedInfData);

      if (proposedPatch && proposedPatch.length > 0) {
        const obj = {
          submission: convertedOriginalData,
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

        // Update changed sections with CONVERTED data
        const personalChanged = hasPersonalDetailsChanged(convertedOriginalData, convertedInfData);
        const professionalChanged = hasProfessionalDetailsChanged(convertedOriginalData, convertedInfData);

        if (personalChanged && application?.personalDetails?._id) {
          const personalPayload = cleanPayload({
            personalInfo: convertedInfData.personalInfo,
            contactInfo: convertedInfData.contactInfo,
          });
          await axios.put(
            `${process.env.REACT_APP_PROFILE_SERVICE_URL}/personal-details/${application?.applicationId}`,
            personalPayload,
            { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
          );
        }

        if (professionalChanged && application?.professionalDetails?._id) {
          const professionalPayload = cleanPayload({
            professionalDetails: convertedInfData.professionalDetails,
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
    refreshApplicationsWithStatusFilters();

    // Reset modal and rejection data (only for reject)
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
              // disabled={selected?.Reject || selected?.Approve || isDisable}>
              disabled={true}
              onClick={() => handleSave()}
            >
              Save
            </Button>
            {!isEdit && (
              <Button
                onClick={() => handleSubmit()}
                className="butn primary-btn"
              // disabled={isDisable}
              loading={isProcessing }
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
                  label="Date of Birth"
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
                  value={InfData.professionalDetails?.membershipCategory}
                  options={categoryData}
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
                      disabled={isDisable || InfData?.professionalDetails?.membershipCategory !== "Retired Associate"}
                      required={InfData?.professionalDetails?.membershipCategory === "Retired Associate"}
                      onChange={(date, dateString) => {
                        handleInputChange("professionalDetails", "retiredDate", date);

                      }}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <MyInput
                      label="Pension No"
                      name="pensionNo"
                      value={InfData.professionalDetails?.pensionNo}
                      disabled={isDisable || InfData?.professionalDetails?.membershipCategory !== "Retired Associate"}
                      required={InfData?.professionalDetails?.membershipCategory === "Retired Associate"}
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
                  isIDs={true}
                  name="workLocation"
                  value={InfData.professionalDetails?.workLocation}
                  required
                  options={workLocationOptions}
                  disabled={isDisable}
                  onChange={(e) => {
                    handleInputChange("professionalDetails", "workLocation", e.target.value)
                  }
                  }
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
                  isIDs={true}
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
                  isIDs={true}
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
                  disabled={InfData?.professionalDetails?.nursingAdaptationProgramme !== true}
                  required={InfData?.professionalDetails?.nursingAdaptationProgramme === true}
                  onChange={(e) => handleInputChange("professionalDetails", "nmbiNumber", e.target.value)}
                />
              </Col>

              {/* Nurse Type - Full Width */}
              <Col span={24}>
                <div className="ps-3 pe-3 pt-2 pb-3 bg-ly" style={{ backgroundColor: '#f0fdf4', borderRadius: "4px", border: '1px solid #a4e3ba', }}>
                  <label className="my-input-label mb-1" style={{ color: '#14532d' }}>
                    Please tick one of the following
                  </label>
                  <Radio.Group
                    name="nursingType"
                    value={InfData.professionalDetails?.nurseType}
                    onChange={(e) => handleInputChange("professionalDetails", "nurseType", e.target.value)}
                    required={InfData?.professionalDetails?.nursingAdaptationProgramme === true}
                    disabled={InfData?.professionalDetails?.nursingAdaptationProgramme !== true}
                    style={{
                      // display: "flex",
                      // flexWrap: "wrap",
                      // gap: "16px",
                      color: '#14532d',
                      width: "100%"
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-baseline flex-wrap" style={{ gap: '8px' }}>
                      <Radio value="General Nursing" style={{ color: '#14532d', width: '14%' }}>
                        General Nursing
                      </Radio>
                      <Radio value="Public Health Nurse" style={{ color: '#14532d', width: '14%' }}>
                        Public Health Nurse
                      </Radio>
                      <Radio value="Mental Health Nurse" style={{ color: '#14532d', width: '14%' }}>
                        Mental Health Nurse
                      </Radio>
                      <Radio value="Midwife" style={{ color: '#14532d', width: '16%' }}>
                        Midwife
                      </Radio>
                      <Radio value="Sick Children's Nurse" style={{ color: '#14532d', width: '14%' }}>
                        Sick Children's Nurse
                      </Radio>
                      <Radio
                        value="Registered Nurse for Intellectual Disability"
                        style={{
                          color: '#14532d',
                          width: '20%',
                          whiteSpace: 'normal',   // 👈 allows text to wrap
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
                    required
                    // value={InfData?.subscriptionDetails?.submissionDate}
                    disabled={isDisable || isEdit}
                    onChange={(date, dateString) => {
                      // handleInputChange("subscriptionDetails", "submissionDate", date);
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
                      { value: "Payroll Deduction", label: "Payroll Deduction" },
                      { value: "Card Payment", label: "Card Payment" },
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
                    required={InfData?.subscriptionDetails?.paymentType === "Payroll Deduction"}
                    disabled={InfData?.subscriptionDetails?.paymentType !== "Payroll Deduction"}
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
                          // checked={InfData?.subscriptionDetails?.incomeProtectionScheme}
                          style={{ color: "#78350f" }}
                          // onChange={(e) => handleInputChange("subscriptionDetails", "incomeProtectionScheme", e.target.checked)}
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
                          // checked={InfData?.subscriptionDetails?.incomeProtectionScheme}
                          style={{ color: "#78350f" }}
                          // onChange={(e) => handleInputChange("subscriptionDetails", "incomeProtectionScheme", e.target.checked)}
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
                          // checked={InfData?.subscriptionDetails?.incomeProtectionScheme}
                          style={{ color: "#78350f" }}
                          // onChange={(e) => handleInputChange("subscriptionDetails", "incomeProtectionScheme", e.target.checked)}
                          // className="my-input-wrapper"
                          disabled={isDisable || !["new", "graduate"].includes(InfData?.subscriptionDetails?.membershipStatus)}
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
                    <MyInput onChange={() => { }} />
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
