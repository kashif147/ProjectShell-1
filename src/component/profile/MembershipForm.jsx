import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Card, Checkbox, Radio, Dropdown } from "antd";
import MyInput from "../common/MyInput";
import MyDatePicker from "../common/MyDatePicker";
import CustomSelect from "../common/CustomSelect";
import { IoBagRemoveOutline } from "react-icons/io5";
import { CiCreditCard1 } from "react-icons/ci";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import { getCategoryLookup } from "../../features/CategoryLookupSlice";

import {
  getProfileDetailsById,
  clearProfileDetails,
} from "../../features/profiles/ProfileDetailsSlice";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";

const MembershipForm = ({
  isEditMode = false,
  isDeceased: propIsDeceased = false,
  setIsDeceased,
}) => {
  const { profileDetails, loading, error } = useSelector(
    (state) => state.profileDetails
  );
  const { countriesOptions, countriesData, loadingC, errorC } = useSelector(
    (state) => state.countries
  );

  const { categoryData, currentCategoryId } = useSelector(
    (state) => state.categoryLookup
  );
  const {
    profileSearchData,
    loading: searchLoading,
    error: searchError
  } = useSelector((state) => state.searchProfile);

  // Subscription API data
  const {
    ProfileSubData,
    ProfileSubLoading,
    ProfileSubError,
  } = useSelector((state) => state.profileSubscription);
  console.log(ProfileSubData, "ProfileSubData")
  const dispatch = useDispatch();
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

  dayjs.extend(utc);
  dayjs.extend(timezone);

  // useEffect(() => {
  //   return () => {
  //     dispatch(clearProfileDetails());
  //   };
  // }, []);

  const convertUTCToLocalDate = (utcDateString) => {
    if (!utcDateString) return null;
    return dayjs.utc(utcDateString).local();
  };

  useEffect(() => {
    dispatch(getCategoryLookup("68dae613c5b15073d66b891f"));
  }, []);

  // Helper function to format dates safely
  const formatDateSafe = (dateString, format = "DD/MM/YYYY") => {
    if (!dateString) return "";
    const date = dayjs(dateString);
    return date.isValid() ? date.format(format) : "";
  };

  // Memoize subscription data to prevent unnecessary recalculations
  const subscriptionData = useMemo(() => {
    if (ProfileSubData?.data?.length > 0) {
      const subscription = ProfileSubData.data[0];
      debugger
      return {
        subscriptionStatus: subscription.subscriptionStatus || "",
        paymentType: subscription.paymentType || "",
        payrollNo: subscription.payrollNo || "",
        paymentFrequency: subscription.paymentFrequency || "",
        subscriptionYear: subscription.subscriptionYear || "",
        isCurrent: subscription.isCurrent || false,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        renewalDate: subscription.rolloverDate,
        membershipMovement: subscription.membershipMovement || "",
        reinstated: subscription.cancellation?.reinstated || false,
        yearendProcessed: subscription.yearend?.processed || false,
        membershipCategory: subscription.membershipCategory || "",
        primarySection: subscription.professionalDetails?.primarySection || "",
        secondarySection: subscription.professionalDetails?.secondarySection || "",
      };
    }
    return null;
  }, [ProfileSubData]);

  useEffect(() => {
    // FIXED: Safely access profileSearchData results
    const searchAoiRes = profileSearchData?.results?.[0] || null;
    // Choose source dynamically
    const source = profileDetails || searchAoiRes;
    debugger
    if (!source) return;

    // Initialize form data from profile API
    const initialFormData = {
      // Personal Info
      title: source.personalInfo?.title || "",
      surname: source.personalInfo?.surname || "",
      forename: source.personalInfo?.forename || "",
      gender: source.personalInfo?.gender || "",
      dateOfBirth: convertUTCToLocalDate(source.personalInfo?.dateOfBirth),
      countryPrimaryQualification:
        source.personalInfo?.countryPrimaryQualification || "",

      // Contact Info
      addressLine1: source.contactInfo?.buildingOrHouse || "",
      addressLine2: source.contactInfo?.streetOrRoad || "",
      townCity: source.contactInfo?.areaOrTown || "",
      countyState: source.contactInfo?.countyCityOrPostCode || "",
      eircode: source.contactInfo?.eircode || "",
      country: source.contactInfo?.country || "",
      preferredAddress:
        source.contactInfo?.preferredAddress === "home"
          ? "Home/Personal"
          : "Work",
      mobileNumber: source.contactInfo?.mobileNumber || "",
      telephoneNumber: source.contactInfo?.telephoneNumber || "",
      preferredEmail:
        source.contactInfo?.preferredEmail === "work" ? "Work" : "Personal",
      personalEmail: source.contactInfo?.personalEmail || "",
      workEmail: source.contactInfo?.workEmail || "",

      // Professional Details
      studyLocation: source.professionalDetails?.studyLocation || "",
      startDate: convertUTCToLocalDate(source.professionalDetails?.startDate),
      graduationDate: convertUTCToLocalDate(
        source.professionalDetails?.graduationDate
      ),
      workLocation: source.professionalDetails?.workLocation || "",
      otherWorkLocation: source.professionalDetails?.otherWorkLocation || "",
      branch: source.professionalDetails?.branch || "",
      region: source.professionalDetails?.region || "",
      grade: source.professionalDetails?.grade || "",
      otherGrade: source.professionalDetails?.otherGrade || "",
      retiredDate: convertUTCToLocalDate(
        source.professionalDetails?.retiredDate
      ),
      pensionNumber: source.professionalDetails?.pensionNo || "",
      nmbiNumber: source.professionalDetails?.nmbiNumber || "",
      nursingProgramme: source.professionalDetails?.nursingAdaptationProgramme
        ? "Yes"
        : "No",
      nursingSpecialization: source.professionalDetails?.nurseType || "",
      primarySection: source.professionalDetails?.primarySection || source.professionalDetails?.nurseType || "",
      secondarySection: source.professionalDetails?.secondarySection || "",

      // Membership Info
      membershipNumber: source.membershipNumber || "",
      joiningDate: convertUTCToLocalDate(source.firstJoinedDate),
      expiryDate: convertUTCToLocalDate(source.deactivatedAt),
      submissionDate: convertUTCToLocalDate(source.submissionDate),

      // Preferences
      consent: source.preferences?.consent,
      valueAddedServices: source.preferences?.valueAddedServices,

      // Corn Market
      joinINMOIncomeProtection: source.cornMarket?.incomeProtectionScheme,
      joinRewards: source.cornMarket?.inmoRewards,
      exclusiveDiscountsOffers: source.cornMarket?.exclusiveDiscountsAndOffers,

      // Additional Information
      memberOfOtherUnion: source.additionalInformation?.otherIrishTradeUnion === true ? "Yes" : "No",
      otherUnionName:
        source.additionalInformation?.otherIrishTradeUnionName || "",
      otherUnionScheme: source.additionalInformation?.otherScheme
        ? "Yes"
        : "No",

      // Recruitment Details
      recruitedBy: source.recruitmentDetails?.recuritedBy || "",
      recruitedByMembershipNo:
        source.recruitmentDetails?.recuritedByMembershipNo || "",
    };

    // Override with subscription data if available
    if (subscriptionData) {

      setFormData(prev => ({
        ...prev,
        ...initialFormData,

        // Subscription Details
        subscriptionStatus: subscriptionData.subscriptionStatus || "",
        membershipCategory: subscriptionData.membershipCategory || prev.membershipCategory || "",
        paymentType: subscriptionData.paymentType,
        payrollNumber: subscriptionData.payrollNo || prev.payrollNumber || "",

        // Subscription Dates
        startDate: convertUTCToLocalDate(subscriptionData.startDate) || prev.startDate,
        endDate: convertUTCToLocalDate(subscriptionData.endDate),
        renewalDate: convertUTCToLocalDate(subscriptionData.renewalDate) || prev.renewalDate,

        // Payment Information
        paymentFrequency: subscriptionData.paymentFrequency || "",

        // Membership Movement
        membershipMovement: subscriptionData.membershipMovement || "",

        // Subscription Status Flags
        isCurrent: subscriptionData.isCurrent || false,
        reinstated: subscriptionData.reinstated || false,
        yearendProcessed: subscriptionData.yearendProcessed || false,
        subscriptionYear: subscriptionData.subscriptionYear || null,
        primarySection: subscriptionData.primarySection || prev.primarySection || "",
        secondarySection: subscriptionData.secondarySection || prev.secondarySection || "",
      }));
    } else {
      // If no subscription data, just set profile data
      setFormData(prev => ({
        ...prev,
        ...initialFormData
      }));
    }
  }, [profileDetails, profileSearchData, subscriptionData]); // FIXED: Removed ProfileSubData from dependencies

  // Internal form state
  const [formData, setFormData] = useState({
    title: "",
    surname: "",
    forename: "",
    gender: "",
    dateOfBirth: null,
    countryPrimaryQualification: "",
    searchAddress: "",
    addressLine1: "",
    addressLine2: "",
    nata: false,
    townCity: "",
    countyState: "",
    eircode: "",
    country: "",
    preferredAddress: "Home/Personal",
    consentCorrespondence: false,
    consentSMS: false,
    consentEmail: false,
    consentPost: false,
    consentApp: false,
    mobileNumber: "",
    telephoneNumber: "",
    preferredEmail: "Personal",
    personalEmail: "",
    workEmail: "",
    studyLocation: "",
    startDate: null,
    graduationDate: null,
    discipline: "",
    workLocation: "",
    otherWorkLocation: "",
    branch: "",
    region: "",
    grade: "",
    otherGrade: "",
    retiredDate: null,
    pensionNumber: "",
    membershipNumber: "",
    membershipStatus: "",
    membershipCategory: "",
    joiningDate: null,
    expiryDate: null,
    renewalDate: null,
    firstReminderDate: null,
    secondReminderDate: null,
    thirdReminderDate: null,
    paymentType: "",
    payrollNumber: "",
    isDeceased: propIsDeceased || false,
    dateDeceased: null,
    dateCancelled: null,
    cancellationReason: "",
    consent: false,
    nursingProgramme: "No",
    nmbiNumber: "",
    nursingSpecialization: "",
    memberStatus: "",
    memberOfOtherUnion: "No",
    otherUnionName: "",
    otherUnionScheme: "No",
    joinINMOIncomeProtection: false,
    joinRewards: false,
    exclusiveDiscountsOffers: false,
    valueAddedServices: false,
    agreeDataProtection: false,
    recruitedBy: "",
    recruitedByMembershipNo: "",
    primarySection: "",
    otherPrimarySection: "",
    secondarySection: "",
    otherSecondarySection: "",
    Reason: "",
    exclusiveDiscountsAndOffers: false,

    // Subscription specific fields
    subscriptionStatus: "",
    paymentFrequency: "",
    membershipMovement: "",
    isCurrent: false,
    reinstated: false,
    yearendProcessed: false,
    endDate: null,
    subscriptionYear: null,
  });
  console.log("formData", formData);
  const lookupData = {
    titles: [
      { key: "mr", label: "Mr" },
      { key: "mrs", label: "Mrs" },
      { key: "miss", label: "Miss" },
      { key: "dr", label: "Dr" },
    ],
    genders: [
      { key: "male", label: "Male" },
      { key: "female", label: "Female" },
      { key: "other", label: "Other" },
    ],
    countries: [
      { key: "pakistan", label: "Pakistan" },
      { key: "usa", label: "USA" },
      { key: "uk", label: "UK" },
      { key: "other", label: "Other" },
    ],
    studyLocations: [
      { key: "local", label: "Local" },
      { key: "abroad", label: "Abroad" },
    ],
    disciplines: [
      { key: "nursing", label: "Nursing" },
      { key: "medicine", label: "Medicine" },
      { key: "pharmacy", label: "Pharmacy" },
      { key: "physiotherapy", label: "Physiotherapy" },
      { key: "occupational-therapy", label: "Occupational Therapy" },
      { key: "radiography", label: "Radiography" },
      { key: "other", label: "Other" },
    ],
    workLocations: [
      { key: "hq", label: "HQ" },
      { key: "branch1", label: "Branch1" },
      { key: "branch2", label: "Branch2" },
      { key: "other", label: "Other" },
    ],
    branches: [
      { key: "branch-a", label: "Branch A" },
      { key: "branch-b", label: "Branch B" },
      { key: "branch-c", label: "Branch C" },
    ],
    regions: [
      { key: "north", label: "North" },
      { key: "south", label: "South" },
      { key: "east", label: "East" },
      { key: "west", label: "West" },
    ],
    grades: [
      { key: "grade-1", label: "Grade 1" },
      { key: "grade-2", label: "Grade 2" },
      { key: "grade-3", label: "Grade 3" },
      { key: "other", label: "Other" },
    ],
    membershipStatus: [
      { key: "active", label: "Active" },
      { key: "inactive", label: "Inactive" },
      { key: "suspended", label: "Suspended" },
    ],
    membershipCategory: [
      { key: "regular", label: "Regular" },
      { key: "premium", label: "Premium" },
      { key: "vip", label: "VIP" },
    ],
    paymentTypes: [
      { key: "cash", label: "Cash" },
      { key: "cheque", label: "Cheque" },
      { key: "bank-transfer", label: "Bank Transfer" },
    ],
  };

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    // Uncheck NATA if addressLine1 is changed
    if (field === "addressLine1" && formData.nata) {
      updatedData.nata = false;
    }
    // Auto-check SMS, Email, Post, and App when consentCorrespondence is checked
    if (field === "consentCorrespondence" && value === true) {
      updatedData.consentSMS = true;
      updatedData.consentEmail = true;
      updatedData.consentPost = true;
      updatedData.consentApp = true;
    }
    // Auto-uncheck SMS, Email, Post, and App when consentCorrespondence is unchecked
    if (field === "consentCorrespondence" && value === false) {
      updatedData.consentSMS = false;
      updatedData.consentEmail = false;
      updatedData.consentPost = false;
      updatedData.consentApp = false;
    }
    // Update consentCorrespondence based on individual checkboxes
    if (
      ["consentSMS", "consentEmail", "consentPost", "consentApp"].includes(
        field
      )
    ) {
      const allChecked =
        (field === "consentSMS" ? value : updatedData.consentSMS) &&
        (field === "consentEmail" ? value : updatedData.consentEmail) &&
        (field === "consentPost" ? value : updatedData.consentPost) &&
        (field === "consentApp" ? value : updatedData.consentApp);
      const anyChecked =
        (field === "consentSMS" ? value : updatedData.consentSMS) ||
        (field === "consentEmail" ? value : updatedData.consentEmail) ||
        (field === "consentPost" ? value : updatedData.consentPost) ||
        (field === "consentApp" ? value : updatedData.consentApp);

      if (allChecked) {
        updatedData.consentCorrespondence = true;
      } else if (!anyChecked) {
        updatedData.consentCorrespondence = false;
      }
    }
    // Handle marking member as deceased
    if (field === "isDeceased" && value === true) {
      updatedData.membershipStatus = "inactive";
      updatedData.dateCancelled = new Date();
      updatedData.cancellationReason = "Deceased";
      // Update parent component
      if (setIsDeceased) setIsDeceased(true);
    }
    // If unmarking as deceased, allow editing again and reset status
    if (field === "isDeceased" && value === false) {
      updatedData.membershipStatus = "";
      updatedData.dateCancelled = null;
      updatedData.cancellationReason = "";
      // Update parent component
      if (setIsDeceased) setIsDeceased(false);
    }
    setFormData(updatedData);
  };

  // Sync isDeceased prop with formData and apply deceased logic
  useEffect(() => {
    if (
      propIsDeceased !== undefined &&
      propIsDeceased !== formData.isDeceased
    ) {
      const updatedData = { ...formData, isDeceased: propIsDeceased };
      // Apply deceased logic when marking as deceased
      if (propIsDeceased === true) {
        updatedData.membershipStatus = "inactive";
        updatedData.dateCancelled = new Date();
        updatedData.cancellationReason = "Deceased";
      } else {
        // Reset when unmarking
        updatedData.membershipStatus = "";
        updatedData.dateCancelled = null;
        updatedData.cancellationReason = "";
      }
      setFormData(updatedData);
    }
  }, [propIsDeceased]);

  // Check if form should be read-only (either not in edit mode or member is deceased)
  const isFormReadOnly = !isEditMode || formData.isDeceased;

  // Calculate indeterminate state for main checkbox
  const isIndeterminate = () => {
    const checkedCount = [
      formData.consentSMS,
      formData.consentEmail,
      formData.consentPost,
      formData.consentApp,
    ].filter(Boolean).length;
    return checkedCount > 0 && checkedCount < 4;
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", formData);
  };

  const handleSubmit = () => {
    console.log("Submitting form:", formData);
  };

  const NursingSpecializationSelectOptn = [
    { label: "General Nursing", value: "generalNursing" },
    { label: "Public Health Nurse", value: "publicHealthNurse" },
    { label: "Mental Health Nurse", value: "mentalHealth" },
    { label: "Midwife", value: "midwife" },
    { label: "Sick Children's Nurse", value: "sickChildrenNurse" },
    {
      label: "Registered Nurse for Intellectual Disability",
      value: "intellectualDisability",
    },
  ];

  return (
    <div
      className="mt-2 pe-4 pb-4 mb-2 membership-form-container"
      style={{
        height: "calc(92vh - 120px - 4vh)",
        maxHeight: "calc(100vh - 120px - 4vh)",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        paddingRight: "12px",
        paddingBottom: isEditMode ? "300px" : "200px",
      }}
    >
      {formData.isDeceased && (
        <div
          style={{
            backgroundColor: "#fff7e6",
            border: "1px solid #ffd591",
            borderRadius: "4px",
            padding: "12px 16px",
            marginBottom: "16px",
            color: "#ad6800",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          ⚠️ Member is marked as deceased. Profile is read-only and subscription
          has been cancelled.
        </div>
      )}
      <Row gutter={[24, 24]}>
        {/* Column 1: Personal Information */}
        <Col span={8}>
          <div style={{ height: "100%" }}>
            {/* Personal Information Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    margin: 0,
                    color: "#1a1a1a",
                  }}
                >
                  Personal Information
                </h3>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "markDeceased",
                        label: propIsDeceased
                          ? "Unmark as Deceased"
                          : "Mark as Deceased",
                        onClick: () => {
                          if (setIsDeceased) {
                            setIsDeceased(!propIsDeceased);
                          }
                        },
                      },
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <BsThreeDotsVertical
                    style={{
                      cursor: "pointer",
                      fontSize: "20px",
                      color: "#1a1a1a",
                      padding: "4px",
                    }}
                  />
                </Dropdown>
              </div>
              <CustomSelect
                label="Title"
                placeholder="Select a title"
                options={lookupData.titles}
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Forename(s)"
                placeholder="Enter your forename(s)"
                value={formData.forename}
                onChange={(e) => handleChange("forename", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Surname"
                placeholder="Enter your surname"
                value={formData.surname}
                onChange={(e) => handleChange("surname", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyDatePicker
                label="Date of Birth"
                placeholder="mm/dd/yyyy"
                value={formData.dateOfBirth}
                onChange={(date) => handleChange("dateOfBirth", date)}
                disabled={isFormReadOnly}
                required={true}
              />
              <CustomSelect
                label="Gender"
                placeholder="Select your gender"
                options={lookupData.genders}
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <CustomSelect
                label="Country of Primary Qualification"
                placeholder="Select a country"
                options={countriesOptions}
                value={formData.countryPrimaryQualification}
                onChange={(e) =>
                  handleChange("countryPrimaryQualification", e.target.value)
                }
                disabled={isFormReadOnly}
                required={true}
              />
            </Card>

            {/* Correspondence Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Correspondence Details
              </h3>
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label">
                  Preferred Address <span className="required-star">*</span>
                </label>
                <Radio.Group
                  value={formData.preferredAddress}
                  onChange={(e) =>
                    handleChange("preferredAddress", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Home/Personal">Home/Personal</Radio>
                  <Radio value="Work">Work</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="Search for your address"
                placeholder="Search address"
                value={formData.searchAddress}
                onChange={(e) => handleChange("searchAddress", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MyInput
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
                extra={
                  <Checkbox
                    checked={formData.nata}
                    onChange={(e) => handleChange("nata", e.target.checked)}
                    disabled={isFormReadOnly}
                  >
                    NATA
                  </Checkbox>
                }
              />
              <MyInput
                label="Address Line 2"
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MyInput
                label="Town/City"
                value={formData.townCity}
                onChange={(e) => handleChange("townCity", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="County/State"
                value={formData.countyState}
                onChange={(e) => handleChange("countyState", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MyInput
                label="Eircode/Postcode"
                placeholder="Enter Eircode"
                value={formData.eircode}
                onChange={(e) => handleChange("eircode", e.target.value)}
                disabled={isFormReadOnly}
              />
              <CustomSelect
                label="Country"
                placeholder="Select country"
                options={countriesOptions}
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
            </Card>

            {/* Contact Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Contact Details
              </h3>
              <MyInput
                label="Mobile Number"
                type="mobile"
                value={formData.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Home / Work Tel Number"
                placeholder="Optional"
                value={formData.telephoneNumber}
                onChange={(e) =>
                  handleChange("telephoneNumber", e.target.value)
                }
                disabled={isFormReadOnly}
              />
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label">
                  Preferred Email <span className="required-star">*</span>
                </label>
                <Radio.Group
                  value={formData.preferredEmail}
                  onChange={(e) =>
                    handleChange("preferredEmail", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Personal">Personal</Radio>
                  <Radio value="Work">Work</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="Personal Email"
                value={formData.personalEmail}
                onChange={(e) => handleChange("personalEmail", e.target.value)}
                disabled={isFormReadOnly}
                required={formData.preferredEmail === "Personal"}
              />
              <MyInput
                label="Work Email"
                placeholder="Optional"
                value={formData.workEmail}
                onChange={(e) => handleChange("workEmail", e.target.value)}
                disabled={isFormReadOnly}
                required={formData.preferredEmail === "Work"}
              />
            </Card>

            {/* Third Party Consent Card */}
            <Card
              style={{
                marginBottom: "80px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Consent Management
              </h3>

              {/* INMO Consent Section */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "12px",
                    color: "#1a1a1a",
                  }}
                >
                  INMO Consent
                </h4>
                <Checkbox
                  checked={formData.consent}
                  indeterminate={isIndeterminate()}
                  onChange={(e) =>
                    handleChange("consentCorrespondence", e.target.checked)
                  }
                  className={
                    isIndeterminate() ? "consent-checkbox-indeterminate" : ""
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                  disabled={isFormReadOnly}
                >
                  I consent to receive correspondence from INMO
                </Checkbox>
                <div
                  style={{
                    marginLeft: "24px",
                    display: "flex",
                    flexDirection: "row",
                    gap: "16px",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    checked={formData.consentSMS}
                    onChange={(e) =>
                      handleChange("consentSMS", e.target.checked)
                    }
                    disabled={isFormReadOnly}
                  >
                    SMS
                  </Checkbox>
                  <Checkbox
                    checked={formData.consentEmail}
                    onChange={(e) =>
                      handleChange("consentEmail", e.target.checked)
                    }
                    disabled={isFormReadOnly}
                  >
                    Email
                  </Checkbox>
                  <Checkbox
                    checked={formData.consentPost}
                    onChange={(e) =>
                      handleChange("consentPost", e.target.checked)
                    }
                    disabled={isFormReadOnly}
                  >
                    Post
                  </Checkbox>
                  <Checkbox
                    checked={formData.consentApp}
                    onChange={(e) =>
                      handleChange("consentApp", e.target.checked)
                    }
                    disabled={isFormReadOnly}
                  >
                    App
                  </Checkbox>
                </div>
              </div>

              {/* Line Separator */}
              <div
                style={{
                  borderTop: "1px solid #e8e8e8",
                  marginTop: "24px",
                  marginBottom: "24px",
                }}
              ></div>

              {/* Additional Service and Terms Section */}
              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "12px",
                    color: "#1a1a1a",
                  }}
                >
                  Additional Service and Terms
                </h4>
                <Checkbox
                  checked={formData.valueAddedServices}
                  onChange={(e) =>
                    handleChange("valueAddedServices", e.target.checked)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  disabled={isFormReadOnly}
                >
                  I consent to being contacted by INMO partners about exclusive
                  member offers.
                </Checkbox>
              </div>
            </Card>
          </div>
        </Col>

        {/* Column 2: Professional Details */}
        <Col span={8}>
          <div style={{ height: "100%" }}>
            {/* Employment Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Employment Details
              </h3>
              <CustomSelect
                label="Work Location"
                placeholder="Select Location..."
                isObjectValue={true}
                options={workLocationOptions}
                value={formData.workLocation}
                onChange={(e) => handleChange("workLocation", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Other Work Location"
                placeholder="Enabled if 'Other' is selected"
                disabled={isFormReadOnly || formData.workLocation !== "Other"}
                value={formData.otherWorkLocation}
                onChange={(e) =>
                  handleChange("otherWorkLocation", e.target.value)
                }
                required={formData.workLocation === "Other"}
              />
              <CustomSelect
                label="Branch"
                placeholder="Select Branch..."
                options={branchOptions}
                value={formData.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                disabled={isFormReadOnly}
              />
              <CustomSelect
                label="Region"
                placeholder="Select Region..."
                options={regionOptions}
                value={formData.region}
                onChange={(e) => handleChange("region", e.target.value)}
                disabled={isFormReadOnly}
              />
              <CustomSelect
                label="Grade"
                placeholder="Select Grade..."
                options={gradeOptions}
                value={formData.grade}
                onChange={(e) => handleChange("grade", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
              />
              <MyInput
                label="Other Grade"
                placeholder="Enabled if 'Other' is selected"
                disabled={isFormReadOnly || formData.grade !== "Other"}
                value={formData.otherGrade}
                onChange={(e) => handleChange("otherGrade", e.target.value)}
                required={formData.grade === "Other"}
              />
            </Card>

            {/* Educational Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Educational Details
              </h3>
              <CustomSelect
                label="Study Location"
                placeholder="Select Study Location..."
                options={lookupData.studyLocations}
                value={formData.studyLocation}
                onChange={(e) => handleChange("studyLocation", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MyDatePicker
                label="Start Date"
                placeholder="Select start date (Optional)"
                value={formData.startDate}
                onChange={(date) => handleChange("startDate", date)}
                disabled={isFormReadOnly}
              />
              <MyDatePicker
                label="Graduation Date"
                placeholder="Select graduation date"
                value={formData.graduationDate}
                onChange={(date) => handleChange("graduationDate", date)}
                disabled={isFormReadOnly}
              />
              <CustomSelect
                label="Discipline"
                placeholder="Select Discipline..."
                options={lookupData.disciplines}
                value={formData.discipline}
                onChange={(e) => handleChange("discipline", e.target.value)}
                disabled={isFormReadOnly}
              />
            </Card>

            {/* Nursing Registration & Specialization Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Nursing Registration & Specialization
              </h3>
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label">
                  Are you currently on a nursing adaptation program?
                </label>
                <Radio.Group
                  value={formData.nursingProgramme}
                  onChange={(e) =>
                    handleChange("nursingProgramme", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="NMBI No. / An Bord Altranais Number"
                placeholder="Enabled if adaptation is 'Yes'"
                disabled={isFormReadOnly || formData.nursingProgramme !== "Yes"}
                value={formData.nmbiNumber}
                onChange={(e) => handleChange("nmbiNumber", e.target.value)}
              />
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label mb-1">
                  Primary Nurse Type <span className="text-danger">*</span>
                </label>

                <Radio.Group
                  name="nursingSpecialization"
                  value={formData.nursingSpecialization}
                  onChange={(e) =>
                    handleChange("nursingSpecialization", e.target.value)
                  }
                  disabled={isFormReadOnly}
                  className="w-100"
                >
                  <Row gutter={[16, 8]}>
                    {NursingSpecializationSelectOptn.map((option) => (
                      <Col key={option.value} xs={24} sm={12}>
                        <Radio
                          value={option.value}
                          style={{
                            whiteSpace: "normal",
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            color: "#212529"
                          }}
                        >
                          {option.label}
                        </Radio>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </div>
            </Card>

            {/* Section Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Section Details
              </h3>
              <CustomSelect
                label="Primary Section"
                placeholder="Select Primary Section"
                value={formData.primarySection}
                onChange={(e) => handleChange("primarySection", e.target.value)}
                options={sectionOptions}
                disabled={!isEditMode}
                required={true}
              />
              <MyInput
                label="Other"
                value={formData.otherPrimarySection}
                onChange={(e) =>
                  handleChange("otherPrimarySection", e.target.value)
                }
                disabled={isFormReadOnly}
                required={formData.primarySection === "Other"}
              />
              <CustomSelect
                label="Secondary Section (Optional)"
                placeholder="Select Secondary Section (Optional)"
                value={formData.secondarySection}
                onChange={(e) =>
                  handleChange("secondarySection", e.target.value)
                }
                options={secondarySectionOptions}
                disabled={!isEditMode}
              />
              <MyInput
                label="Other"
                value={formData.otherSecondarySection}
                onChange={(e) =>
                  handleChange("otherSecondarySection", e.target.value)
                }
                disabled={isFormReadOnly}
              />
            </Card>

            {/* Recruitment Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Recruitment Details
              </h3>
              <MyInput
                label="Recruited By"
                placeholder="Enter full name"
                value={formData.recruitedBy}
                onChange={(e) => handleChange("recruitedBy", e.target.value)}
                disabled={isFormReadOnly}
              />
              <MyInput
                label="Membership Number"
                placeholder="Enter membership number"
                value={formData.recruitedByMembershipNo}
                onChange={(e) =>
                  handleChange("recruitedByMembershipNo", e.target.value)
                }
                disabled={isFormReadOnly}
              />
            </Card>
          </div>
        </Col>

        {/* Column 3: Finalize Profile */}
        <Col span={8}>
          <div style={{ height: "100%" }}>
            {/* Subscription Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Subscription Details
              </h3>

              <CustomSelect
                label="Membership Category"
                placeholder="Select Category..."
                options={categoryData}
                // isIDs={true}
                value={formData.membershipCategory}
                onChange={(e) =>
                  handleChange("membershipCategory", e.target.value)
                }
                disabled={isFormReadOnly}
                required={true}
              />
              <MyDatePicker
                label="Subscription Start Date"
                placeholder="Select start date"
                value={formData.startDate}
                onChange={(date) => handleChange("startDate", date)}
                disabled={true}
              />
              {/* <MyDatePicker
                label="Subscription End Date"
                placeholder="Select end date"
                value={formData.endDate}
                onChange={(date) => handleChange("endDate", date)}
                disabled={true}
              /> */}
              <MyDatePicker
                label="Renewal Date"
                placeholder="Select renewal date"
                value={formData.renewalDate}
                onChange={(date) => handleChange("renewalDate", date)}
                disabled={true}
              />
              {/* <CustomSelect
                label="Subscription Status"
                placeholder="Select Status..."
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                  { value: "Cancelled", label: "Cancelled" },
                  { value: "Pending", label: "Pending" },
                  { value: "Expired", label: "Expired" },
                ]}
                value={formData.subscriptionStatus}
                onChange={(e) =>
                  handleChange("subscriptionStatus", e.target.value)
                }
                disabled={true}
              /> */}
              {/* <MyInput
                label="Subscription Year"
                value={formData.subscriptionYear}
                onChange={(e) => handleChange("subscriptionYear", e.target.value)}
                disabled={true}
              /> */}
              {/* <CustomSelect
                label="Membership Movement"
                placeholder="Select Movement..."
                options={[
                  { value: "NewJoin", label: "NewJoin" },
                  { value: "Renewal", label: "Renewal" },
                  { value: "Reinstatement", label: "Reinstatement" },
                  { value: "Transfer", label: "Transfer" },
                  { value: "Conversion", label: "Conversion" },
                ]}
                value={formData.membershipMovement}
                onChange={(e) =>
                  handleChange("membershipMovement", e.target.value)
                }
                disabled={true}
              /> */}
              {/* <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                <Checkbox
                  checked={formData.isCurrent}
                  disabled={true}
                >
                  Current Subscription
                </Checkbox>
              </div> */}
              <MyDatePicker
                label="Cancellation / Resignation Date"
                placeholder="Select cancellation date"
                value={formData.dateCancelled}
                onChange={(date) => handleChange("dateCancelled", date)}
                disabled={true}
              />
              <MyInput
                label="Cancellation / Resignation Reason"
                placeholder="Enter cancellation reason"
                value={formData.cancellationReason}
                onChange={(e) =>
                  handleChange("cancellationReason", e.target.value)
                }
                disabled={true}
              />
            </Card>

            {/* Payment Information Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Payment Information
              </h3>
              <CustomSelect
                label="Payment Type"
                placeholder="Select Payment Type"
                // options={[
                //   { value: "Salary Deduction", label: "Salary Deduction" },
                //   { value: "Credit Card", label: "Credit Card" },
                // ]}
                value={formData.paymentType}
                onChange={(e) => handleChange("paymentType", e.target.value)}
                disabled={isFormReadOnly}
                required={true}
                isIDs={false}
                options={paymentTypeOptions}
              />
              <MyInput
                label="Payroll No."
                placeholder="Enter Payroll No."
                value={formData.payrollNumber}
                onChange={(e) => handleChange("payrollNumber", e.target.value)}
                disabled={isFormReadOnly}
              />
              {/* <CustomSelect
                label="Payment Frequency"
                placeholder="Select Frequency"
                options={[
                  { value: "Monthly", label: "Monthly" },
                  { value: "Annually", label: "Annually" },
                  { value: "Quarterly", label: "Quarterly" },
                  { value: "Semi-Annually", label: "Semi-Annually" },
                ]}
                value={formData.paymentFrequency}
                onChange={(e) => handleChange("paymentFrequency", e.target.value)}
                disabled={isFormReadOnly}
              /> */}
            </Card>

            {/* Reminders Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Reminders
              </h3>
              <MyDatePicker
                label="First Reminder"
                placeholder="Select first reminder date"
                value={formData.firstReminderDate}
                onChange={(date) => handleChange("firstReminderDate", date)}
                disabled={true}
              />
              <MyDatePicker
                label="Second Reminder"
                placeholder="Select second reminder date"
                value={formData.secondReminderDate}
                onChange={(date) => handleChange("secondReminderDate", date)}
                disabled={true}
              />
              <MyDatePicker
                label="Third Reminder"
                placeholder="Select third reminder date"
                value={formData.thirdReminderDate}
                onChange={(date) => handleChange("thirdReminderDate", date)}
                disabled={true}
              />
            </Card>

            {/* Retirement Details Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Retirement Details
              </h3>
              <MyDatePicker
                label="Retirement Date"
                value={formData.retiredDate}
                onChange={(date) => handleChange("retiredDate", date)}
                disabled={isFormReadOnly}
                required={formData.membershipCategory === "retired_associate"}
              />
              <MyInput
                label="Pension No."
                value={formData.pensionNumber}
                onChange={(e) => handleChange("pensionNumber", e.target.value)}
                disabled={isFormReadOnly}
                required={formData.membershipCategory === "retired_associate"}
              />
            </Card>

            {/* Additional Memberships Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                Additional Memberships
              </h3>
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label">
                  Are you a member of another Trade Union?
                </label>
                <Radio.Group
                  value={formData.memberOfOtherUnion}
                  onChange={(e) =>
                    handleChange("memberOfOtherUnion", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="Which Union?"
                value={formData.otherUnionName}
                onChange={(e) => handleChange("otherUnionName", e.target.value)}
                disabled={isFormReadOnly}
              />
              <div style={{ marginTop: "16px" }}>
                <label className="my-input-label">
                  Have you previously been a member of an Irish trade union
                  income protection scheme?
                </label>
                <Radio.Group
                  value={formData.otherUnionScheme}
                  onChange={(e) =>
                    handleChange("otherUnionScheme", e.target.value)
                  }
                  disabled={isFormReadOnly}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
            </Card>

            {/* Corn Market Card */}
            <Card
              style={{
                marginBottom: "16px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e8e8e8",
                  color: "#1a1a1a",
                }}
              >
                CornMarket
              </h3>
              <Checkbox
                checked={formData.joinRewards}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    // If Rewards is checked, uncheck the other two
                    handleChange("exclusiveDiscountsOffers", false);
                    handleChange("joinINMOIncomeProtection", false);
                  }
                  handleChange("joinRewards", isChecked);
                }}
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={
                  !isEditMode ||
                  formData.exclusiveDiscountsOffers ||
                  formData.joinINMOIncomeProtection
                }
              >
                Rewards for INMO members
              </Checkbox>
              <Checkbox
                checked={formData.exclusiveDiscountsOffers}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    // If this is checked, uncheck Rewards
                    handleChange("joinRewards", false);
                  }
                  handleChange("exclusiveDiscountsOffers", isChecked);
                }}
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={isFormReadOnly || formData.joinRewards}
              >
                Exclusive Discounts and Offers
              </Checkbox>
              <Checkbox
                checked={formData.joinINMOIncomeProtection}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    // If this is checked, uncheck Rewards
                    handleChange("joinRewards", false);
                  }
                  handleChange("joinINMOIncomeProtection", isChecked);
                }}
                style={{ display: "flex", alignItems: "center" }}
                disabled={isFormReadOnly || formData.joinRewards}
              >
                Income Protection and Consent
              </Checkbox>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MembershipForm;