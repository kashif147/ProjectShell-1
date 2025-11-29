import { useEffect, useState } from "react";
import { Row, Col, Card, Checkbox, Radio } from "antd";
import MyInput from "../common/MyInput";
import MyDatePicker from "../common/MyDatePicker";
import CustomSelect from "../common/CustomSelect";
import { IoBagRemoveOutline } from "react-icons/io5";
import { CiCreditCard1 } from "react-icons/ci";
import { useSelector, useDispatch } from "react-redux";
import { getProfileDetailsById } from "../../features/profiles/ProfileDetailsSlice";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from "dayjs";



const MembershipForm = ({ isEditMode = false }) => {
  const { profileDetails, loading, error } = useSelector((state) => state.profileDetails);
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
  console.log(profileDetails, "trt")
  dayjs.extend(utc);
  dayjs.extend(timezone);

  const convertUTCToLocalDate = (utcDateString) => {
    if (!utcDateString) return null;

    // Convert UTC to local timezone and format as dd/mm/yyyy
    return dayjs.utc(utcDateString).local().format('DD/MM/YYYY');
  };

  useEffect(() => {
    // ✅ Fix: Check if profileDetails exists (it's an object, not array)
    if (profileDetails) {
      setFormData(prevState => ({
        ...prevState,
        // Personal Info
        title: profileDetails.personalInfo?.title || "",
        surname: profileDetails.personalInfo?.surname || "",
        forename: profileDetails.personalInfo?.forename || "",
        gender: profileDetails.personalInfo?.gender || "",
        dateOfBirth: convertUTCToLocalDate(profileDetails.personalInfo?.dateOfBirth),
        countryPrimaryQualification: profileDetails.personalInfo?.countryPrimaryQualification || "",

        // Contact Info
        addressLine1: profileDetails.contactInfo?.buildingOrHouse || "",
        addressLine2: profileDetails.contactInfo?.streetOrRoad || "",
        townCity: profileDetails.contactInfo?.areaOrTown || "",
        countyState: profileDetails.contactInfo?.countyCityOrPostCode || "",
        eircode: profileDetails.contactInfo?.eircode || "",
        country: profileDetails.contactInfo?.country || "",
        preferredAddress: profileDetails.contactInfo?.preferredAddress === "home" ? "Home/Personal" : "Work",
        mobileNumber: profileDetails.contactInfo?.mobileNumber || "",
        telephoneNumber: profileDetails.contactInfo?.telephoneNumber || "",
        preferredEmail: profileDetails.contactInfo?.preferredEmail === "work" ? "Work" : "Personal",
        personalEmail: profileDetails.contactInfo?.personalEmail || "",
        workEmail: profileDetails.contactInfo?.workEmail || "",

        // Professional Details
        studyLocation: profileDetails.professionalDetails?.studyLocation || "",
        startDate: convertUTCToLocalDate(profileDetails.professionalDetails?.startDate),
        graduationDate: convertUTCToLocalDate(profileDetails.professionalDetails?.graduationDate),
        workLocation: profileDetails.professionalDetails?.workLocation || "",
        otherWorkLocation: profileDetails.professionalDetails?.otherWorkLocation || "",
        branch: profileDetails.professionalDetails?.branch || "",
        region: profileDetails.professionalDetails?.region || "",
        grade: profileDetails.professionalDetails?.grade || "",
        otherGrade: profileDetails.professionalDetails?.otherGrade || "",
        retiredDate: convertUTCToLocalDate(profileDetails.professionalDetails?.retiredDate),
        pensionNumber: profileDetails.professionalDetails?.pensionNo || "",
        nmbiNumber: profileDetails.professionalDetails?.nmbiNumber || "",
        nursingProgramme: profileDetails.professionalDetails?.nursingAdaptationProgramme ? "Yes" : "No",
        nursingSpecialization: profileDetails.professionalDetails?.nurseType || "",

        // Membership Info
        membershipNumber: profileDetails.membershipNumber || "",
        joiningDate: convertUTCToLocalDate(profileDetails.firstJoinedDate),
        expiryDate: convertUTCToLocalDate(profileDetails.deactivatedAt),
        submissionDate: convertUTCToLocalDate(profileDetails.submissionDate),

        // Preferences
        consent: profileDetails.preferences?.consent ,

        // Corn Market
        joinINMOIncomeProtection: profileDetails.cornMarket?.incomeProtectionScheme ,
        joinRewards: profileDetails.cornMarket?.inmoRewards ,
        exclusiveDiscountsOffers: profileDetails.cornMarket?.exclusiveDiscountsAndOffers ,

        // Additional Information
        memberOfOtherUnion: profileDetails.additionalInformation?.otherIrishTradeUnion ,
        otherUnionName: profileDetails.additionalInformation?.otherIrishTradeUnionName || "",
        otherUnionScheme: profileDetails.additionalInformation?.otherScheme ? "Yes" : "No",

        // Recruitment Details
        recruitedBy: profileDetails.recruitmentDetails?.recuritedBy || "",
        recruitedByMembershipNo: profileDetails.recruitmentDetails?.recuritedByMembershipNo || "",
      }));
    }
  }, [profileDetails]);
  // Internal form state
  const [formData, setFormData] = useState({
    title: "",
    surname: "",
    forename: "",
    gender: "",
    dateOfBirth: null,
    countryPrimaryQualification: "",
    addressLine1: "",
    addressLine2: "",
    townCity: "",
    countyState: "",
    eircode: "",
    country: "",
    preferredAddress: "Home/Personal",
    consentCorrespondence: false,
    mobileNumber: "",
    telephoneNumber: "",
    preferredEmail: "Personal",
    personalEmail: "",
    workEmail: "",
    studyLocation: "",
    startDate: null,
    graduationDate: null,
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
    paymentType: "",
    payrollNumber: "",
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
    allowPartnerContact: false,
    agreeDataProtection: false,
    recruitedBy: "",
    recruitedByMembershipNo: "",
    primarySection: "",
    otherPrimarySection: "",
    secondarySection: "",
    otherSecondarySection: "",
    Reason: "",
    exclusiveDiscountsAndOffers: false,
  });

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
    setFormData({ ...formData, [field]: value });
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", formData);
  };

  const handleSubmit = () => {
    console.log("Submitting form:", formData);
  };

  const NursingSpecializationSelectOptn = [
    { label: "General Nurse", value: "general-nurse" },
    { label: "Public Health Nurse", value: "public-health-nurse" },
    { label: "Mental Health Nurse", value: "mental-health-nurse" },
    { label: "Midwife", value: "midwife" },
    { label: "Sick Children's Nurse", value: "sick-children-nurse" },
    {
      label: "Registered Nurse for Intellectual Disability",
      value: "intellectual-disability-nurse",
    },
  ];

  return (
    <div
      className="mt-2 pe-4 pb-4 mb-2 membership-form-container"
      style={{
        height: "calc(100vh - 120px - 4vh)",
        maxHeight: "calc(100vh - 120px - 4vh)",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        paddingRight: "12px",
        paddingBottom: isEditMode ? "250px" : "150px",
      }}
    >
      <Row gutter={[24, 24]}>
        {/* Column 1: Personal Information */}
        <Col span={8}>
          <div style={{ height: "100%" }}>
            {/* Personal Information Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                Personal Information
              </h3>
              <CustomSelect
                label="Title"
                placeholder="Select a title"
                options={lookupData.titles}
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <MyInput
                label="Forename(s)"
                placeholder="Enter your forename(s)"
                value={formData.forename}
                onChange={(e) => handleChange("forename", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <MyInput
                label="Surname"
                placeholder="Enter your surname"
                value={formData.surname}
                onChange={(e) => handleChange("surname", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <MyDatePicker
                label="Date of Birth"
                placeholder="mm/dd/yyyy"
                value={formData.dateOfBirth}
                onChange={(date) => handleChange("dateOfBirth", date)}
                disabled={!isEditMode}
                required={true}
              />
              <CustomSelect
                label="Gender"
                placeholder="Select your gender"
                options={lookupData.genders}
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <CustomSelect
                label="Country of Primary Qualification"
                placeholder="Select a country"
                options={lookupData.countries}
                value={formData.countryPrimaryQualification}
                onChange={(e) =>
                  handleChange("countryPrimaryQualification", e.target.value)
                }
                disabled={!isEditMode}
                required={true}
              />
            </Card>

            {/* Correspondence Details Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                  disabled={!isEditMode}
                >
                  <Radio value="Home/Personal">Home/Personal</Radio>
                  <Radio value="Work">Work</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="Search for your address"
                placeholder="Search address"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                disabled={!isEditMode}
              />
              <MyInput
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <MyInput
                label="Address Line 2"
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
                disabled={!isEditMode}
              />
              <MyInput
                label="Town/City"
                value={formData.townCity}
                onChange={(e) => handleChange("townCity", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <MyInput
                label="County/State"
                value={formData.countyState}
                onChange={(e) => handleChange("countyState", e.target.value)}
                disabled={!isEditMode}
              />
              <MyInput
                label="Eircode/Postcode"
                placeholder="Enter Eircode"
                value={formData.eircode}
                onChange={(e) => handleChange("eircode", e.target.value)}
                disabled={!isEditMode}
              />
              <CustomSelect
                label="Country"
                placeholder="Select country"
                options={lookupData.countries}
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
            </Card>

            {/* Contact Details Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                value={formData.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <MyInput
                label="Home / Work Tel Number"
                placeholder="Optional"
                value={formData.telephoneNumber}
                onChange={(e) =>
                  handleChange("telephoneNumber", e.target.value)
                }
                disabled={!isEditMode}
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
                  disabled={!isEditMode}
                >
                  <Radio value="Personal">Personal</Radio>
                  <Radio value="Work">Work</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="Personal Email"
                value={formData.personalEmail}
                onChange={(e) => handleChange("personalEmail", e.target.value)}
                disabled={!isEditMode}
                required={formData.preferredEmail === "Personal"}
              />
              <MyInput
                label="Work Email"
                placeholder="Optional"
                value={formData.workEmail}
                onChange={(e) => handleChange("workEmail", e.target.value)}
                disabled={!isEditMode}
                required={formData.preferredEmail === "Work"}
              />
            </Card>
          </div>
        </Col>

        {/* Column 2: Professional Details */}
        <Col span={8}>
          <div style={{ height: "100%" }}>
            {/* Employment Details Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                // options={lookupData.workLocations}
                options={workLocationOptions}
                value={formData.workLocation}
                onChange={(e) => handleChange("workLocation", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <MyInput
                label="Other Work Location"
                placeholder="Enabled if 'Other' is selected"
                disabled={!isEditMode || formData.workLocation !== "Other"}
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
                disabled={!isEditMode}
              />
              <CustomSelect
                label="Region"
                placeholder="Select Region..."
                options={regionOptions}
                value={formData.region}
                onChange={(e) => handleChange("region", e.target.value)}
                disabled={!isEditMode}
              />
              <CustomSelect
                label="Grade"
                placeholder="Select Grade..."
                options={gradeOptions}
                value={formData.grade}
                onChange={(e) => handleChange("grade", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <MyInput
                label="Other Grade"
                placeholder="Enabled if 'Other' is selected"
                disabled={!isEditMode || formData.grade !== "Other"}
                value={formData.otherGrade}
                onChange={(e) => handleChange("otherGrade", e.target.value)}
                required={formData.grade === "Other"}
              />
            </Card>

            {/* Educational Details Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                disabled={!isEditMode}
              />
              <MyDatePicker
                label="Start Date"
                placeholder="Select start date"
                value={formData.startDate}
                onChange={(date) => handleChange("startDate", date)}
                disabled={!isEditMode}
              />
              <MyDatePicker
                label="Graduation Date"
                placeholder="Select graduation date"
                value={formData.graduationDate}
                onChange={(date) => handleChange("graduationDate", date)}
                disabled={!isEditMode}
              />
              <CustomSelect
                label="Branch"
                placeholder="Select Branch..."
                options={lookupData.branches}
                value={formData.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                disabled={!isEditMode}
              />
              <CustomSelect
                label="Region"
                placeholder="Select Region..."
                options={lookupData.regions}
                value={formData.region}
                onChange={(e) => handleChange("region", e.target.value)}
                disabled={!isEditMode}
              />
            </Card>

            {/* Nursing Registration & Specialization Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                  disabled={!isEditMode}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="NMBI No. / An Bord Altranais Number"
                placeholder="Enabled if adaptation is 'Yes'"
                disabled={!isEditMode || formData.nursingProgramme !== "Yes"}
                value={formData.nmbiNumber}
                onChange={(e) => handleChange("nmbiNumber", e.target.value)}
              />
              <div style={{ marginBottom: "16px" }}>
                <label className="my-input-label">Primary Nurse Type</label>
                <Radio.Group
                  value={formData.nurseType}
                  onChange={(e) =>
                    handleChange("nurseType", e.target.value)
                  }
                  disabled={!isEditMode}
                >
                  <Radio value="generalNursing">General Nurse</Radio>
                  <Radio value="public-health-nurse">Public Health Nurse</Radio>
                  <Radio value="mental-health-nurse">Mental Health Nurse</Radio>
                </Radio.Group>
              </div>
            </Card>

            {/* Section Details Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                disabled={!isEditMode}
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
                disabled={!isEditMode}
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
                marginBottom: "20px",
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
                label="Membership category"
                placeholder="Select Category..."
                options={lookupData.membershipCategory}
                value={formData.membershipCategory}
                onChange={(e) =>
                  handleChange("membershipCategory", e.target.value)
                }
                disabled={!isEditMode}
                required={true}
              />
              <MyDatePicker
                label="Retired Date"
                value={formData.retiredDate}
                onChange={(date) => handleChange("retiredDate", date)}
                disabled={!isEditMode}
                required={formData.membershipCategory === "retired_associate"}
              />
              <MyInput
                label="Pension No."
                value={formData.pensionNumber}
                onChange={(e) => handleChange("pensionNumber", e.target.value)}
                disabled={!isEditMode}
                required={formData.membershipCategory === "retired_associate"}
              />
            </Card>

            {/* Payment Information Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                options={[
                  { value: "Salary Deduction", label: "Salary Deduction" },
                  { value: "Credit Card", label: "Credit Card" },
                  // { value: "Direct Debit", label: "Direct Debit" },
                ]}
                value={formData.paymentType}
                onChange={(e) => handleChange("paymentType", e.target.value)}
                disabled={!isEditMode}
                required={true}
              />
              <MyInput
                label="Payroll No."
                placeholder="Enter Payroll No."
                value={formData.payrollNumber}
                onChange={(e) => handleChange("payrollNumber", e.target.value)}
                disabled={!isEditMode}
              />
            </Card>

            {/* Third Party Consent Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                  onChange={(e) =>
                    handleChange("consentCorrespondence", e.target.checked)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  disabled={!isEditMode}
                >
                  I consent to receive correspondence from INMO
                </Checkbox>
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
                  checked={formData.exclusiveDiscountsAndOffers}
                  onChange={(e) =>
                    handleChange("allowPartnerContact", e.target.checked)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  disabled={!isEditMode}
                >
                  I consent to being contacted by INMO partners about exclusive
                  member offers.
                </Checkbox>
              </div>

              {/* Line Separator */}
              <div
                style={{
                  borderTop: "1px solid #e8e8e8",
                  marginTop: "24px",
                  marginBottom: "24px",
                }}
              ></div>

              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "12px",
                    color: "#1a1a1a",
                  }}
                >
                  Corn Market
                </h4>
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
                  disabled={!isEditMode || formData.joinRewards}
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
                  disabled={!isEditMode || formData.joinRewards}
                >
                  Income Protection and Consent
                </Checkbox>
              </div>
            </Card>

            {/* Additional Memberships Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                  value={formData.otherIrishTradeUnion}
                  onChange={(e) =>
                    handleChange("otherIrishTradeUnion", e.target.value)
                  }
                  disabled={!isEditMode}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
              <MyInput
                label="Which Union?"
                value={formData.otherUnionName}
                onChange={(e) => handleChange("otherUnionName", e.target.value)}
                disabled={!isEditMode}
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
                  disabled={!isEditMode}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
            </Card>

            {/* Recruitment Details Card */}
            <Card
              style={{
                marginBottom: "20px",
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
                disabled={!isEditMode}
              />
              <MyInput
                label="Membership Number"
                placeholder="Enter membership number"
                value={formData.recruitedByMembershipNo}
                onChange={(e) =>
                  handleChange("recruitedByMembershipNo", e.target.value)
                }
                disabled={!isEditMode}
              />
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MembershipForm;
