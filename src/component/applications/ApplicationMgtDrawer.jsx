import { useState, useRef, useEffect } from "react";
import {
  Row,
  Col,
  Checkbox,
  Radio,
  Button,
  Spin,
  Modal,
  Flex,
  Tooltip,
  Select,
  Input,
  message
} from "antd";
import { MailOutlined, EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";

import MemberSearch from "../profile/MemberSearch";
import dayjs from "dayjs";
import axios from "axios";
import { dateUtils } from "../../utils/Utilities";
import CustomSelect from "../common/CustomSelect";
import { useTableColumns } from "../../context/TableColumnsContext ";
import MyInput from "../common/MyInput";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
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
import MyFooter from "../common/MyFooter";
import MyDatePicker1 from "../common/MyDatePicker1";
import { getCategoryLookup } from "../../features/CategoryLookupSlice";
import Breadcrumb from "../common/Breadcrumb";
import { useFilters } from "../../context/FilterContext";
import { searchProfiles, clearResults } from '../../features/profiles/SearchProfile';
import {
  InsuranceScreen,
  RewardsScreen
} from "../profile/IncomeProtectionTooltip";
import debounce from "lodash.debounce";

const baseURL = process.env.REACT_APP_PROFILE_SERVICE_URL;
const { Search: AntdSearch } = Input;
const { Option } = Select;
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
    countryOptions,
  } = useSelector((state) => state.lookups);
  const navigate = useNavigate();
  const {
    hierarchyData, // This replaces hierarchyLookup
    workLocationLoading,
    workLocationError,
  } = useSelector((state) => state.lookupsWorkLocation);
  console.log(hierarchyData, "lk");
  const { filtersState } = useFilters();

  // };
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null, // 'approve' or 'reject'
  });
  const [query, setQuery] = useState('');
  const { profileSearchData } = useSelector(
    (state) => state.searchProfile
  );
  console.log("profileSearchData", profileSearchData);
    useEffect(() => {
    // Setup code runs on mount
    
    return () => {
      // Cleanup code runs on unmount
      dispatch(clearResults());
    };
  }, []);
  const handleSearch = (value) => {
    const trimmedQuery = value.trim();

    if (!trimmedQuery) {
      dispatch(clearResults());
      return;
    }

    setQuery(trimmedQuery);
    dispatch(searchProfiles(trimmedQuery));
  };

  // Handle clear
  const handleClear = () => {
    console.log("Clearing search and form");
    
    // Clear search state
    setQuery('');
    dispatch(clearResults());
    
    // Clear selected member
    setSelectedMember(null);
    
    // Clear form only if not in edit mode
    if (!isEdit) {
      setInfData(inputValue);
      message.info("Search cleared and form reset");
    } else {
      message.info("Search cleared");
    }
  };
     const [selectedMember, setSelectedMember] = useState(null);
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
  
  // Add this function near the top of your component, after the other mapping functions
  const mapSearchResultToFormData = (searchResult) => {
    if (!searchResult) return null;

    // Helper function to safely convert to Day.js
    const toDayJS = (dateValue) => {
      if (!dateValue) return null;
      if (dayjs.isDayjs(dateValue)) return dateValue;
      const parsed = dayjs(dateValue);
      return parsed.isValid() ? parsed : null;
    };

    return {
      personalInfo: {
        title: searchResult?.personalInfo?.title || "",
        surname: searchResult?.personalInfo?.surname || "",
        forename: searchResult?.personalInfo?.forename || "",
        gender: searchResult?.personalInfo?.gender || "",
        dateOfBirth: toDayJS(searchResult?.personalInfo?.dateOfBirth),
        countryPrimaryQualification: searchResult?.personalInfo?.countryPrimaryQualification || "",
      },
      contactInfo: {
        preferredAddress: searchResult?.contactInfo?.preferredAddress || "",
        eircode: searchResult?.contactInfo?.eircode || "",
        consent: searchResult?.preferences?.consent || true,
        buildingOrHouse: searchResult?.contactInfo?.buildingOrHouse || "",
        streetOrRoad: searchResult?.contactInfo?.streetOrRoad || "",
        areaOrTown: searchResult?.contactInfo?.areaOrTown || "",
        countyCityOrPostCode: searchResult?.contactInfo?.countyCityOrPostCode || "",
        country: searchResult?.contactInfo?.country || "",
        mobileNumber: searchResult?.contactInfo?.mobileNumber || "",
        telephoneNumber: searchResult?.contactInfo?.telephoneNumber || "",
        preferredEmail: searchResult?.contactInfo?.preferredEmail || "",
        personalEmail: searchResult?.contactInfo?.personalEmail || "",
        workEmail: searchResult?.contactInfo?.workEmail || "",
      },
      professionalDetails: {
        workLocation: searchResult?.professionalDetails?.workLocation || "",
        otherWorkLocation: searchResult?.professionalDetails?.otherWorkLocation || "",
        grade: searchResult?.professionalDetails?.grade || "",
        otherGrade: searchResult?.professionalDetails?.otherGrade || "",
        nmbiNumber: searchResult?.professionalDetails?.nmbiNumber || "",
        nurseType: searchResult?.professionalDetails?.nurseType || null,
        nursingAdaptationProgramme: searchResult?.professionalDetails?.nursingAdaptationProgramme || false,
        region: searchResult?.professionalDetails?.region || "",
        branch: searchResult?.professionalDetails?.branch || "",
        isRetired: searchResult?.professionalDetails?.retiredDate ? true : false,
        retiredDate: toDayJS(searchResult?.professionalDetails?.retiredDate),
        pensionNo: searchResult?.professionalDetails?.pensionNo || "",
        studyLocation: searchResult?.professionalDetails?.studyLocation || "",
        graduationDate: toDayJS(searchResult?.professionalDetails?.graduationDate),
        startDate: toDayJS(searchResult?.professionalDetails?.startDate),
      },
      subscriptionDetails: {
        paymentType: searchResult?.professionalDetails?.paymentType || "",
        payrollNo: searchResult?.professionalDetails?.payrollNo || "",
        membershipStatus: searchResult?.additionalInformation?.membershipStatus || "",
        otherIrishTradeUnion: searchResult?.additionalInformation?.otherIrishTradeUnion || false,
        otherIrishTradeUnionName: searchResult?.additionalInformation?.otherIrishTradeUnionName || "",
        otherScheme: searchResult?.additionalInformation?.otherScheme || false,
        recuritedBy: searchResult?.recruitmentDetails?.recuritedBy || "",
        recuritedByMembershipNo: searchResult?.recruitmentDetails?.recuritedByMembershipNo || "",
        primarySection: searchResult?.professionalDetails?.primarySection || "",
        otherPrimarySection: searchResult?.professionalDetails?.otherPrimarySection || "",
        secondarySection: searchResult?.professionalDetails?.secondarySection || "",
        otherSecondarySection: searchResult?.professionalDetails?.otherSecondarySection || "",
        incomeProtectionScheme: searchResult?.cornMarket?.incomeProtectionScheme || false,
        inmoRewards: searchResult?.cornMarket?.inmoRewards || false,
        valueAddedServices: searchResult?.preferences?.valueAddedServices || false,
        termsAndConditions: searchResult?.preferences?.termsAndConditions || false,
        membershipCategory: "", // This might need to be determined differently
        confirmedRecruiterProfileId: searchResult?.recruitmentDetails?.confirmedRecruiterProfileId || null,
        dateJoined: toDayJS(searchResult?.firstJoinedDate || new Date()),
        submissionDate: toDayJS(searchResult?.submissionDate),
        exclusiveDiscountsAndOffers: searchResult?.cornMarket?.exclusiveDiscountsAndOffers || false,
      },
    };
  };

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Auto-populate form when search results come back
    if (selectedMember && profileSearchData?.results && profileSearchData.results.length > 0) {
      console.log("Auto-populating form with search result:", profileSearchData.results[0]);
      
      // Take the first result from search
      const firstResult = profileSearchData.results[0];
      
      // Map the API response to form data
      const formData = mapSearchResultToFormData(firstResult);
      
      if (formData) {
        // Update the form data
        setInfData(formData);
        
        // Set the selected member
        setSelectedMember(firstResult);
        
        // Also update originalData if needed
        if (isEdit) {
          setOriginalData(formData);
        }
        
        // Clear any existing errors
        setErrors({});
        
        // Handle location change if workLocation exists
        if (formData.professionalDetails?.workLocation) {
          handleLocationChange(formData.professionalDetails.workLocation);
        }
        
        // Show success message
        // message.success(`Form auto-populated with member: ${firstResult.membershipNumber}`);
      }
    }
  }, [profileSearchData, selectedMember, isEdit]);
  
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

  const dispatch = useDispatch();
  const { countriesOptions, countriesData, loadingC, errorC } = useSelector(
    (state) => state.countries
  );
console.log(countriesOptions, "countriesOptions");
  const nextPrevData = { total: applications?.length };
  const [originalData, setOriginalData] = useState(null);
  const mapApiToState = (apiData) => {
    if (!apiData) return inputValue;

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
        dateOfBirth: toDayJS(
          apiData?.personalDetails?.personalInfo?.dateOfBirth
        ),
        countryPrimaryQualification:
          apiData?.personalDetails?.personalInfo?.countryPrimaryQualification ||
          "",
      },
      contactInfo: {
        preferredAddress:
          apiData?.personalDetails?.contactInfo?.preferredAddress || "",
        eircode: apiData?.personalDetails?.contactInfo?.eircode || "",
        consent: apiData?.personalDetails?.contactInfo?.consent,
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
        workLocation: apiData?.professionalDetails?.workLocation,
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
        retiredDate: toDayJS(apiData?.professionalDetails?.retiredDate),
        pensionNo: apiData?.professionalDetails?.pensionNo || "",
        studyLocation: apiData?.professionalDetails?.studyLocation,
        graduationDate: toDayJS(apiData?.professionalDetails?.graduationDate),
        startDate: toDayJS(apiData?.professionalDetails?.startDate),
      },
      subscriptionDetails: {
        paymentType: apiData?.subscriptionDetails?.paymentType || "",
        payrollNo: apiData?.subscriptionDetails?.payrollNo || "",
        membershipStatus: apiData?.subscriptionDetails?.membershipStatus || "",
        otherIrishTradeUnion:
          apiData?.subscriptionDetails?.otherIrishTradeUnion || false,
        otherIrishTradeUnionName:
          apiData?.subscriptionDetails?.otherIrishTradeUnionName || "",
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
        inmoRewards: apiData?.subscriptionDetails?.inmoRewards,
        valueAddedServices:
          apiData?.subscriptionDetails?.valueAddedServices || false,
        termsAndConditions:
          apiData?.subscriptionDetails?.termsAndConditions || false,
        membershipCategory: apiData?.subscriptionDetails?.membershipCategory,
        confirmedRecruiterProfileId:
          apiData?.subscriptionDetails?.confirmedRecruiterProfileId || null,
        dateJoined: toDayJS(
          apiData?.subscriptionDetails?.dateJoined || new Date()
        ),
        submissionDate: toDayJS(apiData?.subscriptionDetails?.submissionDate),
        exclusiveDiscountsAndOffers:
          apiData?.subscriptionDetails?.exclusiveDiscountsAndOffers,
      },
    };
  };
  
  const { categoryData, error, currentCategoryId } = useSelector(
    (state) => state.categoryLookup
  );
  console.log(categoryData, "categoryData");
  
  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);
  
  useEffect(() => {
    dispatch(getCategoryLookup("68dae613c5b15073d66b891f"));
  }, [dispatch]);
  
  useEffect(() => {
    if (isEdit) {
      disableFtn(false);
    }else{
      disableFtn(true);
    }
  }, []);
  
  useEffect(() => {
    if (application && isEdit) {
      const mappedData = mapApiToState(application);
      setInfData(mappedData);
      setOriginalData(mappedData);
    }
  }, [isEdit, application]);
  console.log(application, "application92");

  useEffect(() => {
    if (application && isEdit) {
      handleLocationChange(InfData?.professionalDetails?.workLocation);
    }
  }, [isEdit, application]);

  useEffect(() => {
    if (
      hierarchyData &&
      (hierarchyData.region || hierarchyData.branch) &&
      !workLocationLoading
    ) {
      setInfData((prev) => ({
        ...prev,
        professionalDetails: {
          ...prev.professionalDetails,
          region: hierarchyData.region || prev.professionalDetails.region,
          branch: hierarchyData.branch || prev.professionalDetails.branch,
        },
      }));
    }
  }, [hierarchyData, workLocationLoading]);

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
            <h6
              style={{
                fontSize: "14px",
                margin: 0,
                fontWeight: 400,
                color: "#666",
                marginTop: "4px",
              }}
            >
              {subTitle}
            </h6>
          </div>
        </div>
      </Col>
    </Row>
  );

  const hasPersonalDetailsChanged = (original, current) => {
    const personalInfoFields = [
      "title",
      "surname",
      "forename",
      "gender",
      "dateOfBirth",
      "countryPrimaryQualification",
    ];
    const contactInfoFields = [
      "preferredAddress",
      "eircode",
      "buildingOrHouse",
      "streetOrRoad",
      "areaOrTown",
      "countyCityOrPostCode",
      "country",
      "mobileNumber",
      "telephoneNumber",
      "preferredEmail",
      "personalEmail",
      "workEmail",
      "consent",
    ];

    const personalInfoChanged = personalInfoFields.some((field) => {
      const originalValue = original.personalInfo?.[field];
      const currentValue = current.personalInfo?.[field];

      if (field === "dateOfBirth") {
        const originalDate = originalValue
          ? dayjs(originalValue).format("YYYY-MM-DD")
          : null;
        const currentDate = currentValue
          ? dayjs(currentValue).format("YYYY-MM-DD")
          : null;
        return originalDate !== currentDate;
      }

      return originalValue !== currentValue;
    });

    const contactInfoChanged = contactInfoFields.some(
      (field) => original.contactInfo?.[field] !== current.contactInfo?.[field]
    );

    return personalInfoChanged || contactInfoChanged;
  };

  const hasProfessionalDetailsChanged = (original, current) => {
    const professionalFields = [
      "workLocation",
      "otherWorkLocation",
      "grade",
      "otherGrade",
      "nmbiNumber",
      "nurseType",
      "nursingAdaptationProgramme",
      "region",
      "branch",
      "pensionNo",
      "isRetired",
      "retiredDate",
      "studyLocation",
      "graduationDate",
      "startDate",
    ];

    return professionalFields.some((field) => {
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
      countryPrimaryQualification: "Ireland",
    },
    contactInfo: {
      preferredAddress: "",
      eircode: "",
      buildingOrHouse: "",
      streetOrRoad: "",
      areaOrTown: "",
      countyCityOrPostCode: "",
      country: "Ireland",
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
      startDate: null
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
      startDate: null,
      exclusiveDiscountsAndOffers: false,
      otherIrishTradeUnionName: "",
    },
  };
  
  const [InfData, setInfData] = useState(inputValue);
 

  const handleLocationChange = (selectedLookupId) => {
    const storedLookups = localStorage.getItem("hierarchicalLookups");
    const hierarchicalLookups = storedLookups ? JSON.parse(storedLookups) : [];

    const foundObject = hierarchicalLookups.find(
      (item) => item.lookup && item.lookup._id === selectedLookupId
    );

    if (foundObject) {
      setInfData((prevData) => ({
        ...prevData,
        professionalDetails: {
          ...prevData.professionalDetails,
          workLocation: foundObject?.lookup?.lookupname,
          region: foundObject.region?.lookupname || "",
          branch: foundObject.branch?.lookupname || "",
        },
      }));
    }
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
      "countryPrimaryQualification",
    ];

    const fieldMap = {
      title: ["personalInfo", "title"],
      forename: ["personalInfo", "forename"],
      surname: ["personalInfo", "surname"],
      dateOfBirth: ["personalInfo", "dateOfBirth"],
      gender: ["personalInfo", "gender"],
      countryPrimaryQualification: [
        "personalInfo",
        "countryPrimaryQualification",
      ],

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

    requiredFields.forEach((field) => {
      const [section, key] = fieldMap[field] || [];
      const value = section ? InfData[section]?.[key] : null;

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (typeof value === "boolean" && value === false)
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

    if (InfData.professionalDetails?.workLocation === "Other") {
      if (!InfData.professionalDetails.otherWorkLocation?.trim()) {
        newErrors.otherWorkLocation = "Other work location is required";
      }
    }

    if (InfData.subscriptionDetails.primarySection === "Other") {
      if (!InfData.subscriptionDetails.otherPrimarySection?.trim()) {
        newErrors.otherPrimarySection = "Other primary section is required";
      }
    }

    if (
      InfData?.subscriptionDetails?.membershipCategory ===
      "68dae699c5b15073d66b892c"
    ) {
      if (!InfData.professionalDetails?.retiredDate) {
        newErrors.retiredDate = "Retired date is required";
      }
      if (!InfData.professionalDetails?.pensionNo?.trim()) {
        newErrors.pensionNo = "Pension number is required";
      }
    }

    if (
      InfData?.subscriptionDetails?.membershipCategory ===
      "68dae699c5b15073d66b892d"
    ) {
      if (!InfData.professionalDetails?.studyLocation?.trim()) {
        newErrors.studyLocation = "Study location is required";
      }
      if (!InfData.professionalDetails?.graduationDate) {
        newErrors.graduationDate = "Graduation date is required";
      }
      if (!InfData.professionalDetails?.startDate) {
        newErrors.startDate = "Start date is required";
      }
    }

    if (InfData.subscriptionDetails.paymentType === "Salary Deduction") {
      if (!InfData.subscriptionDetails.payrollNo?.trim()) {
        newErrors.payrollNo = "Payroll number is required";
      }
    }

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
      patch.push({ op: "add", path: "/personalInfo", value: {} });
      Object.keys(data.personalInfo).forEach((key) => {
        if (
          data.personalInfo[key] !== null &&
          data.personalInfo[key] !== undefined &&
          data.personalInfo[key] !== ""
        ) {
          patch.push({
            op: "add",
            path: `/personalInfo/${key}`,
            value: data.personalInfo[key],
          });
        }
      });
    }

    if (data.contactInfo) {
      patch.push({ op: "add", path: "/contactInfo", value: {} });
      Object.keys(data.contactInfo).forEach((key) => {
        if (
          data.contactInfo[key] !== null &&
          data.contactInfo[key] !== undefined &&
          data.contactInfo[key] !== ""
        ) {
          patch.push({
            op: "add",
            path: `/contactInfo/${key}`,
            value: data.contactInfo[key],
          });
        }
      });
    }

    if (data.professionalDetails) {
      patch.push({ op: "add", path: "/professionalDetails", value: {} });
      Object.keys(data.professionalDetails).forEach((key) => {
        if (
          data.professionalDetails[key] !== null &&
          data.professionalDetails[key] !== undefined
        ) {
          patch.push({
            op: "add",
            path: `/professionalDetails/${key}`,
            value: data.professionalDetails[key],
          });
        }
      });
    }

    if (data.subscriptionDetails) {
      patch.push({ op: "add", path: "/subscriptionDetails", value: {} });
      Object.keys(data.subscriptionDetails).forEach((key) => {
        if (
          data.subscriptionDetails[key] !== null &&
          data.subscriptionDetails[key] !== undefined
        ) {
          patch.push({
            op: "add",
            path: `/subscriptionDetails/${key}`,
            value: data.subscriptionDetails[key],
          });
        }
      });
    }

    return patch;
  };

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

      const apiData = dateUtils.prepareForAPI(InfData);

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

      if (!applicationId) {
        throw new Error("ApplicationId not returned from personal details API");
      }

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

      if (selected.Approve) {
        try {
          let approvalPayload;

          if (isEdit && originalData) {
            const apiOriginalData = dateUtils.prepareForAPI(originalData);
            const proposedPatch = generatePatch(apiOriginalData, apiData);
            approvalPayload = {
              submission: apiData,
              proposedPatch: proposedPatch,
              notes: "Auto-approved with changes on submission",
            };
          } else {
            const proposedPatch = generateCreatePatch(apiData);
            approvalPayload = {
              submission: apiData,
              proposedPatch: proposedPatch,
              notes: "Auto-approved on submission",
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

          MyAlert(
            "success",
            "Application submitted and approved successfully!"
          );
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

      if (selected?.Bulk !== true) {
        setInfData(inputValue);
        setSelected((prev) => ({
          ...prev,
          Approve: false,
          Reject: false,
        }));
        setSelectedMember(null);
        navigate("/Applications");
      } else {
        setInfData(inputValue);
        setSelectedMember(null);
        setSelected((prev) => ({
          ...prev,
          Reject: false,
        }));
        MyAlert(
          "success",
          "Application submitted successfully! Form cleared and ready for next entry."
        );
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
      disableFtn(false);
    }
  };

  const hasSubscriptionDetailsChanged = (current, original) => {
    const currentSub = current.subscriptionDetails || {};
    const originalSub = original.subscriptionDetails || {};
    
    const allSubscriptionFields = [
      "paymentType",
      "payrollNo",
      "membershipStatus",
      "otherIrishTradeUnion",
      "otherIrishTradeUnionName",
      "otherScheme",
      "recuritedBy",
      "recuritedByMembershipNo",
      "primarySection",
      "otherPrimarySection",
      "secondarySection",
      "otherSecondarySection",
      "incomeProtectionScheme",
      "inmoRewards",
      "valueAddedServices",
      "termsAndConditions",
      "membershipCategory",
      "exclusiveDiscountsAndOffers",
      "dateJoined",
      "submissionDate",
    ];

    const hasAnyChange = allSubscriptionFields.some((field) => {
      const currentVal = currentSub[field];
      const originalVal = originalSub[field];

      if (currentVal && originalVal) {
        return currentVal !== originalVal;
      }

      return Boolean(currentVal) !== Boolean(originalVal);
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
      
      if (applicationId && hasPersonalDetailsChanged(apiData, apiOriginalData)) {
        const personalPayload = cleanPayload({
          personalInfo: apiData.personalInfo,
          contactInfo: apiData.contactInfo,
        });

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

      if (applicationId && hasProfessionalDetailsChanged(apiData, apiOriginalData)) {
        const professionalPayload = cleanPayload({
          professionalDetails: apiData.professionalDetails,
        });

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

      if (applicationId && hasSubscriptionDetailsChanged(apiData, apiOriginalData)) {
        const subscriptionPayload = cleanPayload({
          subscriptionDetails: apiData.subscriptionDetails,
        });

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

      if (savePromises.length > 0) {
        await Promise.all(savePromises);
        MyAlert("success", "Application Updated successfully!");
        setOriginalData(InfData);
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

  const { hierarchicalData, hierarchicalDataLoading, hierarchicalDataError } =
    useSelector((state) => state.hierarchicalDataByLocation);
  console.log(hierarchicalData, "hierarchicalData");
  
  const handleInputChange = (section, field, value) => {
    if (section === "subscriptionDetails" && field === "membershipStatus") {
      setInfData((prev) => {
        const updated = {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };

        const statusDependentFields = {
          graduate: ["exclusiveDiscountsAndOffers", "incomeProtectionScheme"],
          new: ["inmoRewards"],
        };

        Object.values(statusDependentFields).forEach((fields) => {
          fields.forEach((dependentField) => {
            updated.subscriptionDetails[dependentField] = false;
          });
        });

        return updated;
      });
    } else if (field === "workLocation") {
      if (typeof value === "object" && value !== null) {
        const locationId = value.key || value.id || value.value;
        const locationLabel = value.label || value.name || "";

        setInfData((prev) => ({
          ...prev,
          professionalDetails: {
            ...prev.professionalDetails,
            workLocation: locationLabel,
          },
        }));

        handleLocationChange(locationId);
      } else {
        setInfData((prev) => ({
          ...prev,
          professionalDetails: {
            ...prev.professionalDetails,
            workLocation: value,
          },
        }));
        handleLocationChange(value);
      }
    } else {
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
              country,
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

      const shouldDisableForm = ["approved"].includes(status);
      disableFtn(shouldDisableForm);

      setSelected((prev) => ({
        ...prev,
        Approve: status === "approved",
        Reject: status === "rejected",
      }));
    } else {
      setSelected(select);
    }
  }, [application, isEdit]);

  const handleChange = (e) => {
    const { name, checked } = e.target;

    const status = application?.applicationStatus?.toLowerCase();
    const readOnlyStatuses = ["approved"];

    if (readOnlyStatuses.includes(status) && name === "Approve") {
      return;
    }

    if (name === "Bulk") {
      disableFtn(!checked);
      setErrors({});
      setSelected((prev) => ({
        ...prev,
        Bulk: checked,
      }));
    }

    if (name === "Approve" && checked === true && isEdit) {
      setSelected((prev) => ({
        ...prev,
        Approve: true,
        Reject: false,
      }));

      handleApplicationAction("approved");
    }

    if (name === "Reject" && checked === true) {
      setActionModal({ open: true, type: "reject" });
    }

    if (
      !isEdit &&
      (name === "Approve" || name === "Reject") &&
      checked === false
    ) {
      setSelected((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
    if (
      !isEdit &&
      (name === "Approve" || name === "Reject") &&
      checked === true
    ) {
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiInfData = dateUtils.prepareForAPI(InfData);
      const apiOriginalData = dateUtils.prepareForAPI(originalData);

      const subscriptionChanged = hasSubscriptionDetailsChanged(apiOriginalData, apiInfData);
      const personalChanged = hasPersonalDetailsChanged(apiOriginalData, apiInfData);
      const professionalChanged = hasProfessionalDetailsChanged(apiOriginalData, apiInfData);
      const applicationId = application?.applicationId;

      const proposedPatch = generatePatch(apiOriginalData, apiInfData);
      const singleStepPatch = generateCreatePatch(apiInfData);

      const hasChanges = proposedPatch && proposedPatch.length > 0;

      if (action === "approved") {
        const approvalPayload = {
          submission: apiOriginalData || {}
        };

        if (hasChanges) {
          approvalPayload.proposedPatch = proposedPatch;
        }

        const approvalResponse = await axios.post(
          `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${applicationId}/approve`,
          approvalPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isEdit && hasChanges) {
          if (personalChanged) {
            const personalPayload = cleanPayload({
              personalInfo: apiInfData.personalInfo,
              contactInfo: apiInfData.contactInfo,
            });
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

          if (professionalChanged) {
            const professionalPayload = cleanPayload({
              professionalDetails: apiInfData.professionalDetails,
            });
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

          if (subscriptionChanged) {
            const subscriptionPayload = cleanPayload({
              subscriptionDetails: apiInfData.subscriptionDetails,
            });
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
          }
        }
      } else if (action === "rejected") {
        if (!rejectionData.reason) {
          MyAlert("error", "Please select a rejection reason");
          setIsProcessing(false);
          return;
        }

        const rejectionPayload = {
          submission: apiOriginalData || {},
          proposedPatch: hasChanges ? proposedPatch : [],
          reason: rejectionData.reason
        };

        await axios.post(
          `${process.env.REACT_APP_PROFILE_SERVICE_URL}/applications/${applicationId}/reject`,
          rejectionPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setSelected((prev) => ({
        ...prev,
        Approve: action === "approved",
        Reject: action === "rejected",
      }));

      const successMessage =
        action === "approved"
          ? "Application approved successfully!"
          : "Application rejected successfully!";

      MyAlert("success", successMessage);
      disableFtn(true);

      if (action === "rejected") {
        setActionModal({ open: false, type: null });
        setRejectionData({ reason: "", note: "" });
      }

      if (!isEdit) {
        navigate("/Applications");
      }
    } catch (error) {
      console.error(`❌ Error ${action} application:`, error);
      console.error('Error details:', error.response?.data || error.message);

      MyAlert(
        "error",
        `Failed to ${action} application`,
        error?.response?.data?.error?.message || error.message
      );

      setSelected((prev) => ({
        ...prev,
        Approve: false,
        Reject: false,
      }));
    } finally {
      setIsProcessing(false);
      disableFtn(true);
    }
  };

  function navigateApplication(direction) {
    if (index === -1 || !applications?.length) return;
    
    let newIndex = index;

    if (direction === "prev" && index > 1) {
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
      setCurrentApplication(newApplication);
      setSelectedMember(null);

      const status = newApplication.applicationStatus?.toLowerCase();
      const readOnlyStatuses = ['approved', 'in-progress'];

      if (readOnlyStatuses.includes(status)) {
        disableFtn(true);
        setSelected((prev) => ({
          ...prev,
          Approve: status === "approved",
          Reject: status === "rejected",
        }));
      } else {
        disableFtn(false);
        setSelected((prev) => ({
          ...prev,
          Approve: false,
          Reject: false,
        }));
      }
    }
  }
  
  const handleMemberSelect = (memberData) => {
    console.log("Selected member:", memberData);
    setSelectedMember(memberData);

    const formData = mapSearchResultToFormData(memberData);

    if (formData) {
      setInfData(formData);
      setErrors({});
      disableFtn(false)
      if (formData.professionalDetails?.workLocation) {
        handleLocationChange(formData.professionalDetails.workLocation);
      }

      // message.success(`Form populated with member: ${memberData.membershipNumber}`);
    }
  };
  
  const [searchResults, setSearchResults] = useState([]);
  
  const handleSearchResult = (results) => {
    console.log("Search results:", results);
    setSearchResults(results);
  };
  
  const handleAddMember = (searchTerm) => {
    disableFtn(false);
    setInfData(inputValue);
    setSelectedMember(null);
    
    const nameParts = searchTerm.split(' ');
    if (nameParts.length >= 2) {
      setInfData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          forename: nameParts[0],
          surname: nameParts.slice(1).join(' ')
        }
      }));
    }
    
    message.success("Ready to add new member");
  };

  return (
    <div>
      <div style={{ backgroundColor: "#f6f7f8" }}>
        <div
          style={{ marginRight: "2.25rem" }}
          className="d-flex justify-content-between align-items-center py-3"
        >
          <div>
            <Breadcrumb />
          </div>
          <div className="d-flex align-items-center gap-3">
            {!isEdit && (
              <>
                <MemberSearch
                  fullWidth={true}
                  onSelectBehavior="callback"
                  onSelectCallback={handleMemberSelect}
                  onAddMember={handleAddMember}
                  addMemberLabel="Add New Member"
                  style={{ width: "300px" }}
                />
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
                isEdit ? selected.actionCompleted || isDisable : isDisable
              }
              onChange={handleChange}
            >
              Approve
            </Checkbox>
            <Checkbox
              name="Reject"
              disabled={
                isDisable ||
                !isEdit ||
                (isEdit && selected.Approve) ||
                (isEdit && selected.actionCompleted)
              }
              checked={selected.Reject}
              onChange={handleChange}
            >
              Reject
            </Checkbox>
            <Button
              className="butn primary-btn"
              disabled={isDisable}
              onClick={() => handleSave()}
            >
              Save
            </Button>
            {!isEdit && (
              <>
                <Button
                  onClick={() => handleSubmit()}
                  className="butn primary-btn"
                  loading={isProcessing}
                >
                  Submit
                </Button>
                {selectedMember && (
                  <Button
                    onClick={() => {
                      setSelectedMember(null);
                      setInfData(inputValue);
                      setInfData(inputValue)
                      dispatch(clearResults());
                      disableFtn(true)
                      message.info("Form cleared");
                    }}
                    className="butn gray-btn"
                  >
                    Clear Form
                  </Button>
                )}
              </>
            )}
            {isEdit && (
              <div className="d-flex align-items-center">
                <Button
                  className="me-1 gray-btn butn"
                  onClick={() => navigateApplication("prev")}
                >
                  <FaAngleLeft className="deatil-header-icon" />
                </Button>
                <p
                  className="mb-0 mx-2"
                  style={{ fontWeight: "500", fontSize: "14px" }}
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
        </div>
        
        <div
          className="hide-scroll-webkit"
          style={{
            borderRadius: "15px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            margin: "1.5rem",
            maxHeight: "80.5vh",
            height: "80.5vh",
            overflowY: "auto",
            backgroundColor: "white",
            padding: "1.5rem",
            filter: showLoader ? "blur(3px)" : "none",
            pointerEvents: showLoader ? "none" : "auto",
            transition: "0.3s ease",
          }}
        >
          {/* Personal Information Section */}
          <div className="mb-3">
            <SectionHeader
              icon={
                <MailOutlined style={{ color: "#2f6bff", fontSize: "18px" }} />
              }
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
                  onChange={(e) =>
                    handleInputChange("personalInfo", "title", e.target.value)
                  }
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
              <Col xs={24} md={8}>
                <MyInput
                  label="Surname"
                  name="surname"
                  value={InfData.personalInfo?.surname}
                  required
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange("personalInfo", "surname", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("personalInfo", "gender", e.target.value)
                  }
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
            </Row>
          </div>

          {/* Correspondence Details Section */}
          <div className="mb-3">
            <SectionHeader
              icon={
                <EnvironmentOutlined
                  style={{ color: "green", fontSize: "18px" }}
                />
              }
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
                    <div
                      className="p-3"
                      style={{
                        borderRadius: "4px",
                        backgroundColor: "#fffbeb",
                        border: "1px solid #fde68a",
                      }}
                    >
                      <Checkbox
                        style={{ color: "#78350f" }}
                        value={true}
                        checked={InfData?.contactInfo?.consent}
                        onChange={(e) =>
                          handleInputChange(
                            "contactInfo",
                            "consent",
                            e.target.checked
                          )
                        }
                      >
                        Consent to receive Correspondence from INMO
                      </Checkbox>
                      <p style={{ color: "#78350f" }} className="m-0 !ms-0">
                        Please un-tick this box if you would not like to receive
                        correspondence from us to this address.
                      </p>
                    </div>
                  </Col>
                  <Col xs={24} md={12} className="!pb-0 pa">
                    <div
                      className="p-3 bg-lb "
                      style={{
                        borderRadius: "4px",
                        height: "100%",
                        backgroundColor: "#1173d41a",
                        border: "1px solid #97c5efff",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <label
                          style={{ color: "#215e97" }}
                          className={`my-input-label ${errors?.preferredAddress ? "error-text1" : ""
                            }`}
                        >
                          Preferred Address{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <Radio.Group
                          style={{ color: "#215e97", borderColor: "#215e97" }}
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

              <Col xs={24} md={12}>
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

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 3 (Area or Town)"
                  name="adressLine3"
                  value={InfData.contactInfo?.areaOrTown}
                  disabled={isDisable}
                  onChange={(e) =>
                    handleInputChange(
                      "contactInfo",
                      "areaOrTown",
                      e.target.value
                    )
                  }
                />
              </Col>

              <Col xs={24} md={12}>
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

              <Col xs={24} md={12}>
                <MyInput
                  label="Eircode"
                  name="Eircode"
                  placeholder="Enter Eircode"
                  value={InfData?.contactInfo?.eircode}
                  onChange={(e) =>
                    handleInputChange("contactInfo", "eircode", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("contactInfo", "country", e.target.value)
                  }
                  hasError={!!errors?.country}
                />
              </Col>
              <Col span={24}>
                <div className="mt-1 mb-3">
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1a1a1a",
                      margin: 0,
                      paddingBottom: "8px",
                    }}
                  >
                    Contact Details
                  </h4>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      margin: "4px 0 0 0",
                    }}
                  >
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
                  onChange={(e) =>
                    handleInputChange(
                      "contactInfo",
                      "mobileNumber",
                      e.target.value
                    )
                  }
                />
              </Col>

              <Col xs={24} md={12}>
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

              <Col xs={24} md={12}>
                <div
                  className="p-3 bg-lb"
                  style={{
                    borderRadius: "4px",
                    height: "100%",
                    backgroundColor: "#1173d41a",
                    border: "1px solid #97c5efff",
                    borderRadius: "4px",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <label
                      style={{ color: "#215e97" }}
                      className={`my-input-label ${errors?.preferredEmail ? "error-text1" : ""
                        }`}
                    >
                      Preferred Email{" "}
                      <span className="text-danger ms-1">*</span>
                    </label>
                    <Radio.Group
                      style={{ color: "#215e97" }}
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
                      <Radio style={{ color: "#215e97" }} value="personal">
                        Personal
                      </Radio>
                      <Radio style={{ color: "#215e97" }} value="work">
                        Work
                      </Radio>
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

              <Col xs={24} md={12}>
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

          {/* Professional Details Section */}
          <div className="mb-3">
            <SectionHeader
              icon={
                <IoBagRemoveOutline
                  style={{ color: "#bf86f3", fontSize: "18px" }}
                />
              }
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
                  onChange={(e) =>
                    handleInputChange(
                      "subscriptionDetails",
                      "membershipCategory",
                      e.target.value
                    )
                  }
                  hasError={!!errors?.membershipCategory}
                />
              </Col>
              {InfData.subscriptionDetails?.membershipCategory ===
                "68dae699c5b15073d66b892c" ? (
                <Col xs={24} md={12}>
                  <Row gutter={[8, 8]}>
                    <Col xs={24} md={12}>
                      <MyDatePicker1
                        label="Retired Date"
                        name="retiredDate"
                        value={InfData?.professionalDetails?.retiredDate}
                        disabled={
                          isDisable ||
                          InfData?.subscriptionDetails?.membershipCategory !==
                          "68dae699c5b15073d66b892c"
                        }
                        required={
                          InfData?.subscriptionDetails?.membershipCategory ===
                          "68dae699c5b15073d66b892c"
                        }
                        onChange={(date, dateString) => {
                          handleInputChange(
                            "professionalDetails",
                            "retiredDate",
                            date
                          );
                        }}
                        hasError={!!errors?.retiredDate}
                      />
                    </Col>
                    <Col xs={24} md={12}>
                      <MyInput
                        label="Pension No"
                        name="pensionNo"
                        value={InfData.professionalDetails?.pensionNo}
                        disabled={
                          isDisable ||
                          InfData?.subscriptionDetails?.membershipCategory !==
                          "68dae699c5b15073d66b892c"
                        }
                        required={
                          InfData?.subscriptionDetails?.membershipCategory ===
                          "68dae699c5b15073d66b892c"
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "professionalDetails",
                            "pensionNo",
                            e.target.value
                          )
                        }
                        hasError={!!errors?.pensionNo}
                      />
                    </Col>
                  </Row>
                </Col>
              ) : InfData.subscriptionDetails?.membershipCategory ==
                "68dae699c5b15073d66b892d" ? (
                <>
                  <Col xs={24} md={12}>
                    <Row gutter={12}>
                      <Col xs={24} md={8}>
                        <CustomSelect
                          onChange={(e) =>
                            handleInputChange(
                              "professionalDetails",
                              "studyLocation",
                              e.target.value
                            )
                          }
                          label="Study Location"
                          disabled={isDisable}
                          required
                          options={[
                            {
                              value: "Trinity College Dublin",
                              label: "Trinity College Dublin",
                            },
                            {
                              value: "University College Dublin",
                              label: "University College Dublin",
                            },
                          ]}
                          value={InfData?.professionalDetails?.studyLocation}
                          hasError={!!errors?.studyLocation}
                        />
                      </Col>

                      <Col xs={24} md={8}>
                        <MyDatePicker1
                          label="Start Date"
                          onChange={(date, datestring) => {
                            handleInputChange(
                              "professionalDetails",
                              "startDate",
                              date
                            );
                          }}
                          required
                          disabled={isDisable}
                          value={InfData?.professionalDetails?.startDate}
                        />
                      </Col>
                      <Col xs={24} md={8}>
                        <MyDatePicker1
                          label="Graduation date"
                          required
                          disabled={isDisable}
                          onChange={(date, datestring) => {
                            handleInputChange(
                              "professionalDetails",
                              "graduationDate",
                              date
                            );
                          }}
                          value={InfData?.professionalDetails?.graduationDate}
                          hasError={!!errors?.graduationDate}
                        />
                      </Col>
                    </Row>
                  </Col>
                </>
              ) : (
                <Col span={12}></Col>
              )}

              {/* Work Location */}
              <Col xs={24} md={12}>
                <CustomSelect
                  label="Work Location"
                  name="workLocation"
                  isObjectValue={true}
                  isIDs={false}
                  value={InfData.professionalDetails?.workLocation}
                  required
                  options={workLocationOptions}
                  disabled={isDisable}
                  onChange={(e) => {
                    handleInputChange(
                      "professionalDetails",
                      "workLocation",
                      e.target.value
                    );
                  }}
                  hasError={!!errors?.workLocation}
                />
              </Col>

              <Col xs={24} md={12}>
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
                  hasError={!!errors?.otherWorkLocation}
                />
              </Col>

              <Col xs={24} md={12}>
                <CustomSelect
                  label="Branch"
                  name="branch"
                  value={InfData.professionalDetails.branch}
                  disabled={true}
                  placeholder={`${workLocationLoading ? "Loading..." : "Select"
                    }`}
                  onChange={(e) =>
                    handleInputChange(
                      "professionalDetails",
                      "branch",
                      e.target.value
                    )
                  }
                  options={branchOptions}
                />
              </Col>

              <Col xs={24} md={12}>
                <CustomSelect
                  label="Region"
                  name="Region"
                  placeholder={`${workLocationLoading ? "Loading..." : "Select"
                    }`}
                  value={InfData.professionalDetails?.region}
                  disabled={true}
                  onChange={(e) =>
                    handleInputChange(
                      "professionalDetails",
                      "region",
                      e.target.value
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      "professionalDetails",
                      "grade",
                      e.target.value
                    )
                  }
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
                  disabled={
                    InfData?.professionalDetails?.grade !== "Other" || isDisable
                  }
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

              {/* Nursing Adaptation Programme */}
              <Col xs={24} md={12} className="!pb-0 pa">
                <div
                  className="p-3 bg-lb"
                  style={{
                    borderRadius: "4px",
                    height: "100%",
                    backgroundColor: "#1173d41a",
                    border: "1px solid #97c5efff",
                  }}
                >
                  <label
                    style={{
                      color: "#215e97",
                      display: "block",
                      marginBottom: "8px",
                    }}
                    className={`my-input-label ${errors?.nursingAdaptationProgramme ? "error-text1" : ""
                      }`}
                  >
                    Are you currently undertaking a nursing adaptation
                    programme? <span className="text-danger">*</span>
                  </label>

                  <Radio.Group
                    name="nursingAdaptationProgramme"
                    value={
                      InfData.professionalDetails
                        ?.nursingAdaptationProgramme === true
                        ? true
                        : InfData.professionalDetails
                          ?.nursingAdaptationProgramme === false
                          ? false
                          : null
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "professionalDetails",
                        "nursingAdaptationProgramme",
                        e.target.value
                      )
                    }
                    disabled={isDisable}
                    style={{
                      color: "#215e97",
                      borderColor: "#215e97",
                      display: "flex",
                      gap: "20px",
                    }}
                    className={
                      errors?.nursingAdaptationProgramme ? "radio-error" : ""
                    }
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
                  disabled={
                    InfData?.professionalDetails?.nursingAdaptationProgramme !==
                    true || isDisable
                  }
                  required={
                    InfData?.professionalDetails?.nursingAdaptationProgramme ===
                    true
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

              {/* Nurse Type - Full Width */}
              <Col span={24}>
                <div
                  className="ps-3 pe-3 pt-2 pb-3 bg-ly"
                  style={{
                    backgroundColor: "#f0fdf4",
                    borderRadius: "4px",
                    border: "1px solid #a4e3ba",
                  }}
                >
                  <label
                    className="my-input-label mb-1"
                    style={{ color: "#14532d" }}
                  >
                    Please tick one of the following
                  </label>

                  <Radio.Group
                    name="nurseType"
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
                    style={{
                      color: "#14532d",
                      width: "100%",
                    }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-baseline flex-wrap"
                      style={{ gap: "8px" }}
                    >
                      <Radio
                        value="generalNursing"
                        style={{ color: "#14532d", width: "14%" }}
                      >
                        General Nursing
                      </Radio>

                      <Radio
                        value="publicHealthNurse"
                        style={{ color: "#14532d", width: "14%" }}
                      >
                        Public Health Nurse
                      </Radio>

                      <Radio
                        value="mentalHealth"
                        style={{ color: "#14532d", width: "14%" }}
                      >
                        Mental Health Nurse
                      </Radio>

                      <Radio
                        value="midwife"
                        style={{ color: "#14532d", width: "16%" }}
                      >
                        Midwife
                      </Radio>

                      <Radio
                        value="sickChildrenNurse"
                        style={{ color: "#14532d", width: "14%" }}
                      >
                        Sick Children's Nurse
                      </Radio>

                      <Radio
                        value="intellectualDisability"
                        style={{
                          color: "#14532d",
                          width: "20%",
                          whiteSpace: "normal",
                          lineHeight: "1.2",
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
              icon={
                <CiCreditCard1 style={{ color: "#ec6d28", fontSize: "18px" }} />
              }
              title="Subscription Details"
              backgroundColor="#fff9eb"
              iconBackground="#fad1b8ff"
            />

            <Row gutter={[16, 12]} className="mt-2">
              <Col xs={24} md={12}>
                <div
                  className="w-100"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr ",
                    gap: "8px",
                  }}
                >
                  <MyDatePicker1
                    className="w-100"
                    label="Date Joined"
                    name="dateJoined"
                    required
                    value={InfData?.subscriptionDetails?.dateJoined}
                    disabled={isDisable}
                    onChange={(date, dateString) => {
                      handleInputChange(
                        "subscriptionDetails",
                        "dateJoined",
                        date
                      );
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
                      handleInputChange(
                        "subscriptionDetails",
                        "submissionDate",
                        date
                      );
                    }}
                    hasError={!!errors?.dateJoined}
                    errorMessage={errors?.dateJoined || "Required"}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div
                  className="w-100"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr ",
                    gap: "8px",
                  }}
                >
                  <CustomSelect
                    label="Payment Type"
                    name="paymentType"
                    required
                    options={[
                      { value: "Salary Deduction", label: "Salary Deduction" },
                      { value: "Credit Card", label: "Credit Card" },
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
                  <MyInput
                    className="w-100"
                    label="Payroll No"
                    name="payrollNo"
                    value={InfData?.subscriptionDetails?.payrollNo}
                    hasError={!!errors?.payrollNo}
                    required={InfData?.subscriptionDetails?.paymentType === "Salary Deduction"}
                    disabled={InfData?.subscriptionDetails?.paymentType !== "Salary Deduction" || isDisable}
                    onChange={(e) => handleInputChange("subscriptionDetails", "payrollNo", e.target.value)}
                  />
                </div>
              </Col>

              {/* Membership Status - Full Width */}
              <Col span={24}>
                <div
                  className="ps-3 pe-3 pt-2 pb-3 bg-ly"
                  style={{
                    backgroundColor: "#f0fdf4",
                    borderRadius: "4px",
                    border: "1px solid #a4e3ba",
                  }}
                >
                  <label
                    className="my-input-label mb-1"
                    style={{ color: "#14532d" }}
                  >
                    Please select the most appropriate option below
                  </label>

                  <Radio.Group
                    name="memberStatus"
                    value={InfData?.subscriptionDetails?.membershipStatus || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "membershipStatus",
                        e.target.value
                      )
                    }
                    disabled={isDisable}
                    style={{
                      color: "#14532d",
                      width: "100%",
                    }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-baseline flex-wrap"
                      style={{ gap: "8px" }}
                    >
                      <Radio
                        value="new"
                        style={{ color: "#14532d", width: "14%" }}
                      >
                        You are a new member
                      </Radio>

                      <Radio
                        value="graduate"
                        style={{ color: "#14532d", width: "14%" }}
                      >
                        You are newly graduated
                      </Radio>

                      <Radio
                        value="rejoin"
                        style={{
                          color: "#14532d",
                          width: "28%",
                          whiteSpace: "normal",
                          lineHeight: "1.2",
                        }}
                      >
                        You were previously a member of the INMO, and are
                        rejoining
                      </Radio>

                      <Radio
                        value="careerBreak"
                        style={{
                          color: "#14532d",
                          width: "18%",
                          whiteSpace: "normal",
                          lineHeight: "1.2",
                        }}
                      >
                        You are returning from a career break
                      </Radio>

                      <Radio
                        value="nursingAbroad"
                        style={{
                          color: "#14532d",
                          width: "18%",
                          whiteSpace: "normal",
                          lineHeight: "1.2",
                        }}
                      >
                        You are returning from nursing abroad
                      </Radio>
                    </div>
                  </Radio.Group>
                </div>
              </Col>
              {["graduate"].includes(
                InfData?.subscriptionDetails?.membershipStatus
              ) && (
                  <>
                    <Col xs={24} md={24}>
                      <div
                        className="pe-3 ps-3 pt-2 pb-2 h-100"
                        style={{
                          borderRadius: "4px",
                          backgroundColor: "#fffbeb",
                          border: "1px solid #fde68a",
                        }}
                      >
                        <Checkbox
                          checked={
                            InfData?.subscriptionDetails
                              ?.exclusiveDiscountsAndOffers
                          }
                          style={{ color: "#78350f" }}
                          onChange={(e) =>
                            handleInputChange(
                              "subscriptionDetails",
                              "exclusiveDiscountsAndOffers",
                              e.target.checked
                            )
                          }
                          disabled={
                            isDisable ||
                            !["new", "graduate"].includes(
                              InfData?.subscriptionDetails?.membershipStatus
                            )
                          }
                        >
                          Would you like to hear about exclusive discounts and
                          offers for INMO members?
                        </Checkbox>
                      </div>
                    </Col>
                    <Col xs={24} md={24}>
                      <div
                        className="pe-3 ps-3 pt-2 pb-2 h-100"
                        style={{
                          borderRadius: "4px",
                          backgroundColor: "#fffbeb",
                          border: "1px solid #fde68a",
                        }}
                      >
                        <Checkbox
                          checked={
                            InfData?.subscriptionDetails?.incomeProtectionScheme
                          }
                          style={{ color: "#78350f" }}
                          onChange={(e) =>
                            handleInputChange(
                              "subscriptionDetails",
                              "incomeProtectionScheme",
                              e.target.checked
                            )
                          }
                          disabled={
                            isDisable ||
                            !["new", "graduate"].includes(
                              InfData?.subscriptionDetails?.membershipStatus
                            )
                          }
                        >
                          I consent to{" "}
                          <Tooltip
                            placement="top"
                            styles={{
                              body: {
                                maxWidth: "600px",
                                width: "600px",
                                maxHeight: "650px",
                                overflow: "hidden",
                                padding: "0",
                              },
                            }}
                            title={
                              <div
                                style={{
                                  maxHeight: "650px",
                                  overflowY: "auto",
                                  marginTop: "5px",
                                  marginBottom: "5px",
                                }}
                              >
                                <InsuranceScreen />
                              </div>
                            }
                          >
                            <a
                              href="#"
                              style={{
                                color: "#78350f",
                                textDecoration: "underline",
                              }}
                            >
                              {" "}
                              INMO Income Protection Scheme.
                            </a>
                          </Tooltip>
                        </Checkbox>
                        <p>
                          By selecting ‘I consent’ below, you are agreeing to the
                          INMO, sharing your Trade Union membership details with
                          Cornmarket. Cornmarket as Scheme Administrator will
                          process and retain details of your Trade Union
                          membership for the purposes of assessing eligibility and
                          admitting eligible members (automatically) to the Income
                          Protection Scheme (with 9 Months’ Free Cover), and for
                          the ongoing administration of the Scheme. Where you have
                          also opted in to receiving marketing communications,
                          Cornmarket will provide you with information on
                          discounts and offers they have for INMO members. This
                          consent can be withdrawn at any time by emailing
                          Cornmarket at dataprotection@cornmarket.ie. Please note,
                          if you do consent below, your data will be shared with
                          Cornmarket, and you will be assessed for eligibility for
                          automatic Income Protection Scheme membership. If you do
                          not consent, your data will not be shared with
                          Cornmarket for this purpose, you will not be assessed
                          for automatic Scheme membership (including 9 Months’
                          Free Cover) and you will have to contact Cornmarket
                          separately should you wish to apply for Scheme
                          membership. This offer will run on a pilot basis. Terms
                          and conditions apply and are subject to change.
                          Important: If you do not give your consent, your Trade
                          union membership data will not be shared with Cornmarket
                          for this purpose. This means you will not be assessed
                          for Automatic Access to the Scheme.
                        </p>
                      </div>
                    </Col>
                  </>
                )}
              {["new"].includes(
                InfData?.subscriptionDetails?.membershipStatus
              ) && (
                  <>
                    <Col xs={24} md={24}>
                      <div
                        className="pe-3 ps-3 pt-2 pb-2 h-100"
                        style={{
                          borderRadius: "4px",
                          backgroundColor: "#fffbeb",
                          border: "1px solid #fde68a",
                        }}
                      >
                        <Checkbox
                          checked={InfData?.subscriptionDetails?.inmoRewards}
                          style={{ color: "#78350f" }}
                          onChange={(e) =>
                            handleInputChange(
                              "subscriptionDetails",
                              "inmoRewards",
                              e.target.checked
                            )
                          }
                          disabled={isDisable}
                        >
                          Tick here to join{" "}
                          <Tooltip
                            placement="top"
                            styles={{
                              body: {
                                maxWidth: "600px",
                                width: "600px",
                                maxHeight: "650px",
                                overflow: "hidden",
                                padding: "0",
                              },
                            }}
                            title={
                              <div
                                style={{
                                  maxHeight: "650px",
                                  overflowY: "auto",
                                  marginTop: "5px",
                                  marginBottom: "5px",
                                }}
                              >
                                <RewardsScreen />
                              </div>
                            }
                          >
                            <a
                              href="#"
                              style={{
                                color: "#78350f",
                                textDecoration: "underline",
                              }}
                            >
                              Rewards
                            </a>
                          </Tooltip>{" "}
                          for INMO members
                        </Checkbox>
                        <p>
                          By ticking here, you confirm that you agree to the Terms
                          & Conditions available on
                          Cornmarket.ie/rewards-club-terms and the Data Protection
                          Statement available on Cornmarket.ie/rewards-dps.
                          Cornmarket will contact you about your Rewards Benefits.
                          You can opt out at any time.
                        </p>
                      </div>
                    </Col>
                  </>
                )}

              {/* Trade Union Questions - Same Height */}
              <Col xs={24} md={12}>
                <div
                  className="d-flex p-3  "
                  style={{
                    backgroundColor: "#1173d41a",
                    border: "1px solid #97c5efff",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    className=" bg-lb me-2"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <label
                      className="my-input-label mb-2 "
                      style={{ color: "#215e97" }}
                    >
                      If you are a member of another Trade Union. If yes, which
                      Union?
                    </label>
                    <Radio.Group
                      style={{ color: "#215e97", borderColor: "#" }}
                      name="otherIrishTradeUnion"
                      value={
                        InfData.subscriptionDetails?.otherIrishTradeUnion !==
                          null
                          ? InfData.subscriptionDetails?.otherIrishTradeUnion
                          : null
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "subscriptionDetails",
                          "otherIrishTradeUnion",
                          e.target?.value
                        )
                      }
                      disabled={isDisable}
                    >
                      <Radio style={{ color: "#215e97" }} value={true}>
                        Yes
                      </Radio>
                      <Radio style={{ color: "#215e97" }} value={false}>
                        No
                      </Radio>
                    </Radio.Group>
                    <div className="d-flex">

                    </div>
                  </div>
                  {
                    InfData.subscriptionDetails?.otherIrishTradeUnion &&
                    <MyInput value={InfData.subscriptionDetails?.otherIrishTradeUnionName} onChange={(e) => handleInputChange("subscriptionDetails", "otherIrishTradeUnionName", e.target?.value)} />
                  }
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div
                  className="p-3 bg-lb pb-0 "
                  style={{
                    backgroundColor: "#1173d41a",
                    border: "1px solid #97c5efff",
                    borderRadius: "4px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <label
                    className="my-input-label mb-2"
                    style={{ color: "#215e97" }}
                  >
                    Are you or were you a member of another Irish trade Union
                    salary or Income Protection Scheme?
                  </label>
                  <Radio.Group
                    name="otherScheme"
                    value={
                      InfData.subscriptionDetails?.otherScheme !== null
                        ? InfData.subscriptionDetails?.otherScheme
                        : null
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "otherScheme",
                        e.target?.value
                      )
                    }
                    className="my-input-wrapper"
                    style={{ color: "#215e97" }}
                    disabled={isDisable}
                  >
                    <Radio style={{ color: "#215e97" }} value={true}>
                      Yes
                    </Radio>
                    <Radio style={{ color: "#215e97" }} value={false}>
                      No
                    </Radio>
                  </Radio.Group>
                </div>
              </Col>

              {/* Recruited By */}
              <Col xs={24} md={6}>
                <MyInput
                  label="Recruited By"
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

              <Col xs={24} md={6}>
                <MyInput
                  label="Recruited By (Membership No)"
                  name="recuritedByMembershipNo"
                  value={InfData?.subscriptionDetails?.recuritedByMembershipNo}
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
  <Col span={12}>
                <label className="my-input-label">
                  Validate Recruited By Information
                </label>
                <div style={{
                  display: 'flex',
                  marginBottom: '20px',
                  height: '40px'
                }}>
                  <Input
                  disabled={isDisable}
                    placeholder="Search by name or membership number"
                    allowClear
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onPressEnter={() => handleSearch(query)}
                    style={{
                      flex: 1,
                      border: '1px solid #d9d9d9',
                      borderRight: 'none',
                      borderRadius: '6px 0 0 6px',
                      height: '40px',
                      paddingLeft:4,
                      paddingRight:4,
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => handleSearch(query)}
                    loading={loading}
                    style={{
                      backgroundColor: '#215e97',
                      borderColor: '#215e97',
                      borderRadius: '0 4px 4px 0',
                      height: '40px',
                      width: '90px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderLeft: 'none'
                    }}
                  >
                    Search
                  </Button>
                </div>
              </Col>
              {/* Sections */}
              <Col xs={24} md={12}>
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
                  options={sectionOptions}
                />
              </Col>

              <Col xs={24} md={12}>
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

              <Col xs={24} md={12}>
                <CustomSelect
                  label="Secondary Section"
                  name="secondarySection"
                  value={InfData.subscriptionDetails?.secondarySection}
                  options={secondarySectionOptions}
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

              <Col xs={24} md={12}>
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

              {/* Final Checkboxes - Same Height */}
              <Col xs={24} md={12} className="mb-3">
                <div
                  className="pe-3 ps-3 pt-2 pb-2   d-flex align-items-center"
                  style={{
                    borderRadius: "4px",
                    height: "100%",
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fde68a",
                  }}
                >
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.valueAddedServices}
                    style={{ color: "#78350f" }}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "valueAddedServices",
                        e.target.checked
                      )
                    }
                    disabled={isDisable}
                  >
                    Tick here to allow our partners to contact you about Value
                    added Services by Email and SMS
                  </Checkbox>
                </div>
              </Col>

              <Col className="mb-3" xs={24} md={12}>
                <div
                  className="pe-3 ps-3 pt-2 pb-2 d-flex align-items-center"
                  style={{
                    borderRadius: "4px",
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fde68a",
                  }}
                >
                  <Checkbox
                    checked={InfData?.subscriptionDetails?.termsAndConditions}
                    onChange={(e) =>
                      handleInputChange(
                        "subscriptionDetails",
                        "termsAndConditions",
                        e.target.checked
                      )
                    }
                    style={{ color: "#78350f" }}
                    disabled={isDisable}
                  >
                    I have read and agree to the{" "}
                    <a
                      href="#"
                      style={{ color: "#78350f", textDecoration: "underline" }}
                    >
                      INMO Data Protection Statement,
                    </a>{" "}
                    the{" "}
                    <a
                      href="#"
                      style={{ color: "#78350f", textDecoration: "underline" }}
                    >
                      INMO Privacy Statement
                    </a>{" "}
                    and the{" "}
                    <a
                      href="#"
                      style={{ color: "#78350f", textDecoration: "underline" }}
                    >
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
      
      <Modal
        centered
        title="Reject Application"
        open={actionModal.open && actionModal.type === "reject"}
        onCancel={() => {
          setActionModal({ open: false, type: null });
          setSelected((prev) => ({
            ...prev,
            Reject: false,
          }));
          setRejectionData({ reason: "", note: "" });
        }}
        onOk={() => handleApplicationAction("rejected")}
        okText="Reject"
        okButtonProps={{
          danger: true,
          className: "butn",
          loading: isProcessing,
        }}
        cancelButtonProps={{
          className: "butn butn primary-btn",
          disabled: isProcessing,
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
              setRejectionData((prev) => ({
                ...prev,
                reason: val.target.value,
              }))
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