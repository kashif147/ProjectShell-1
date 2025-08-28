import React, { useState } from "react";
import { Row, Col, Divider, Card, Checkbox, Radio } from "antd";
import MyInput from "../common/MyInput";
import MyDatePicker from "../common/MyDatePicker";
import CustomSelect from "../common/CustomSelect";
import { IoBagRemoveOutline } from "react-icons/io5";
import { CiCreditCard1 } from "react-icons/ci";
import { useSelector, useDispatch } from "react-redux";

const MembershipForm = () => {
  const { data: countryOptions, } = useSelector(
    (state) => state.countries
  );
  // Internal form state
  const [formData, setFormData] = useState({
    title: "",
    surname: "",
    forename: "",
    gender: "",
    dateOfBirth: null,
    countryPrimaryQualification: "",
    addressLine1: "",
    townCity: "",
    studyLocation: "",
    graduationDate: null,
    workLocation: "",
    branch: "",
    region: "",
    grade: "",
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
    mobileNumber: "",
    personalEmail: "",
    nursingProgramme: "Yes",
    nmbiNumber: "",
    nursingSpecialization: [],
    memberOfOtherUnion: "No",
    otherUnionName: "",
    otherUnionScheme: "Yes",
    joinINMOIncomeProtection: false,
    joinRewards: false,
    allowPartnerContact: false,
    agreeDataProtection: false,
    Reason: "",
    telephoneNumber: '',
  });
  const lookupData = {
    titles: ["Mr", "Mrs", "Miss", "Dr"],
    genders: ["Male", "Female", "Other"],
    countries: ["Pakistan", "USA", "UK", "Other"],
    studyLocations: ["Local", "Abroad"],
    workLocations: ["HQ", "Branch1", "Branch2"],
    branches: ["Branch A", "Branch B", "Branch C"],
    regions: ["North", "South", "East", "West"],
    grades: ["Grade 1", "Grade 2", "Grade 3"],
    membershipStatus: ["Active", "Inactive", "Suspended"],
    membershipCategory: ["Regular", "Premium", "VIP"],
    paymentTypes: ["Cash", "Cheque", "Bank Transfer"],
  };
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  const NursingSpecializationSelectOptn = [
    { label: "General Nurse", value: "general-nurse" },
    { label: "Public Health Nurse", value: "public-health-nurse" },
    { label: "Mental Health Nurse", value: "mental-health-nurse" },
    { label: "Midwife", value: "midwife" },
    { label: "Sick Children's Nurse", value: "sick-children-nurse" },
    { label: "Registered Nurse for Intellectual Disability", value: "intellectual-disability-nurse" },
  ];

  return (

    <div
      className="mt-2 pe-4 pb-4 mb-2"
      style={{
        height: "80vh",        // fixed height
        maxHeight: "80vh",     // don’t allow to expand more
        overflowY: "auto",      // vertical scroll
        overflowX: "hidden",    // no horizontal scroll
        display: "block",       // force block context
        backgroundColor: "#fff" // just for clarity
      }}
    >
      <Row gutter={32}>
        {/* Personal Information */}
        <Col span={8}>
          <div style={{ border: "2px solid #f8f3f3ff", height: '92rem' }}>
            <div
              className="d-flex align-items-center p-2 mb-1 ps-2"
              style={{ backgroundColor: "#eef4ff" }}
            >
              <div
                style={{
                  backgroundColor: "#ede6fa",
                  // padding: "6px 8px",
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
                  fontSize: "16px",
                  margin: 0,
                  fontWeight: 500,
                  color: "#1a1a1a",
                }}
              >
                Personal Information
              </h2>
            </div>
            <div className="pe-2 ps-2">
              <CustomSelect
                label="Title"
                placeholder="Select title"
                options={lookupData.titles}
                value={formData.title}
                onChange={(val) => handleChange("title", val)}
              />
              <MyInput
                label="Surname"
                value={formData.surname}
                onChange={(e) => handleChange("surname", e.target.value)}
              />
              <MyInput
                label="Forename"
                value={formData.forename}
                onChange={(e) => handleChange("forename", e.target.value)}
              />
              <CustomSelect
                label="Gender"
                options={lookupData.genders}
                value={formData.gender}
                onChange={(val) => handleChange("gender", val)}
              />
              <MyDatePicker
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(date) => handleChange("dateOfBirth", date)}
              />
              <CustomSelect
                label="Country of Primary Qualification"
                options={lookupData.countries}
                value={formData.countryPrimaryQualification}
                onChange={(val) =>
                  handleChange("countryPrimaryQualification", val)
                }
              />
              <MyInput
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
              />
              <MyInput
                label="Address Line 2"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
              />
              <MyInput
                label="Address Line "
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
              />
              <MyInput
                label="Address Line "
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
              />
              <MyInput
                label="Eircode"
                name="Eircode"
                placeholder="Enter Eircode"
                value={formData?.eircode}
              />
              <CustomSelect
                label="country"
                name="country"
                value={formData.country}
                options={countryOptions}
                required
              // disabled={isDisable}
              // onChange={(e) => handleInputChange("country", e.target.value)}
              // hasError={!!errors?.country}
              />
              <MyInput
                label="Town/City"
                value={formData.townCity}
                onChange={(e) => handleChange("townCity", e.target.value)}
              />
              <Checkbox
                checked={formData.consent}
                onChange={(e) => handleChange("consent", e.target.checked)}
              >
                Consent to receive communication from INMO
              </Checkbox>
              <MyInput
                label="Mobile Number"
                value={formData.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
              />
              <MyInput
                label="Personal Email"
                value={formData.personalEmail}
                onChange={(e) => handleChange("personalEmail", e.target.value)}
              />
              <MyInput
                label="Work Email"
                value={formData.workEmail}
                onChange={(e) => handleChange("workEmail", e.target.value)}
              />
              <MyInput
                label="Home / Work Tel Number"
                name="telephoneNumber"
                type="number"
                value={formData.telephoneNumber}
                onChange={(e) => handleChange("telephoneNumber", e.target.value)}
              />
            </div>
          </div>
        </Col>

        {/* Professional Details */}
        <Col span={8}>
          <div style={{ border: "2px solid #f8f3f3ff", height: '92rem' }}>
            <div
              className="d-flex align-items-center p-2 ps-2 mb-1"
              style={{ backgroundColor: "#f7f4ff" }}
            >
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
                  fontSize: "16px",
                  margin: 0,
                  fontWeight: 500,
                  color: "#1a1a1a",
                }}
              >
                Professional Details
              </h2>
            </div>
            <div className="ps-2 pe-2">
              <CustomSelect
                label="Study Location"
                options={lookupData.studyLocations}
                value={formData.studyLocation}
                onChange={(val) => handleChange("studyLocation", val)}
              />
              <MyDatePicker
                label="Graduation Date"
                value={formData.graduationDate}
                onChange={(date) => handleChange("graduationDate", date)}
              />
              <CustomSelect
                label="Work Location"
                options={lookupData.workLocations}
                value={formData.workLocation}
                onChange={(val) => handleChange("workLocation", val)}
                extra={"IRO Name"}
              />
              <CustomSelect
                label="Branch"
                options={lookupData.branches}
                value={formData.branch}
                onChange={(val) => handleChange("branch", val)}
              />
              <CustomSelect
                label="Region"
                options={lookupData.regions}
                value={formData.region}
                onChange={(val) => handleChange("region", val)}
              />
              <CustomSelect
                label="Grade"
                options={lookupData.grades}
                value={formData.grade}
                onChange={(val) => handleChange("grade", val)}
              />
              <MyInput
                label="Other Grade"
                name="otherGrade"
              />
              <MyDatePicker
                label="Retired Date"
                value={formData.retiredDate}
                onChange={(date) => handleChange("retiredDate", date)}
                extra={
                  <span className="text-xs text-gray-500">
                    <Checkbox>Retired</Checkbox>
                  </span>
                }
              />
              <MyInput
                label="Pension Number"
                value={formData.pensionNumber}
                onChange={(e) => handleChange("pensionNumber", e.target.value)}
              />
              <label className="my-input-label">
                Nursing Adaptation Programme
              </label>
              <Radio.Group
                className="mb-2"
                value={formData.nursingProgramme}
                onChange={(e) => handleChange("nursingProgramme", e.target.value)}
              >
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </Radio.Group>
              <MyInput
                label="NMBI No / An Bord Altranais Number"
                value={formData.nmbiNumber}
                onChange={(e) => handleChange("nmbiNumber", e.target.value)}
              />
              <CustomSelect
                label="Nursing Specialization"
                placeholder="Select specialization"
                options={NursingSpecializationSelectOptn}
                value={formData?.nursingSpecialization}
              // onChange={onChange}
              />
              <CustomSelect
                name="memberStatus"
                label="Please select the most appropriate option below"
                value={formData?.memberStatus || ''}
                // onChange={(e) => handleInputChange(e)}
                placeholder="Select option..."
                options={[
                  { key: 'new', label: 'You are a new member' },
                  { key: 'graduate', label: 'You are newly graduated' },
                  {
                    key: 'rejoin',
                    label: 'You were previously a member of the INMO, and are rejoining',
                  },
                  {
                    key: 'careerBreak',
                    label: 'You are returning from a career break',
                  },
                  {
                    key: 'nursingAbroad',
                    label: 'You are returning from nursing abroad',
                  },
                ]}
              />
            </div>
          </div>
        </Col>

        {/* Subscription Details */}
        <Col span={8}>
          <div style={{ border: "2px solid #f8f3f3ff", height: '92rem' }}>
            <div
              className="d-flex align-items-center p-2 ps-2 mb-1"
              style={{ backgroundColor: "#fad1b8ff" }}
            >
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
                <CiCreditCard1
                  style={{ color: "#ec6d28", fontSize: "18px" }}
                />
              </div>
              <h2
                style={{
                  fontSize: "16px",
                  margin: 0,
                  fontWeight: 500,
                  color: "#1a1a1a",
                }}
              >
                Subscription Details
              </h2>
            </div>
            <div className="pe-2 ps-2">
              <MyInput
                label="Membership Number"
                value={formData.membershipNumber}
                onChange={(e) =>
                  handleChange("membershipNumber", e.target.value)
                }
              />
              <CustomSelect
                label="Membership Status"
                options={lookupData.membershipStatus}
                value={formData.membershipStatus}
                onChange={(val) => handleChange("membershipStatus", val)}
              />
              <CustomSelect
                label="Membership Category"
                options={lookupData.membershipCategory}
                value={formData.membershipCategory}
                onChange={(val) => handleChange("membershipCategory", val)}
              />
              <MyDatePicker
                label="Joining Date"
                value={formData.joiningDate}
                onChange={(date) => handleChange("joiningDate", date)}
              />
              <MyDatePicker
                label="Expiry Date"
                value={formData.expiryDate}
                onChange={(date) => handleChange("expiryDate", date)}
              />
              <MyInput
                label="Reason"
                value={formData.Reason}
                onChange={(e) => handleChange("Reason", e.target.value)}
                extra
              />
              <CustomSelect
                label="Payment Type"
                options={lookupData.paymentTypes}
                value={formData.paymentType}
                onChange={(val) => handleChange("paymentType", val)}
              />
              <MyInput
                label="Payroll Number"
                value={formData.payrollNumber}
                onChange={(e) => handleChange("payrollNumber", e.target.value)}
              />
              <p className="my-input-label">
                Are you a member of another Trade Union?
              </p>
              <Radio.Group
                className="mb-2"
                value={formData.memberOfOtherUnion}
                onChange={(e) =>
                  handleChange("memberOfOtherUnion", e.target.value)
                }
              >
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </Radio.Group>
              <MyInput
                label="If yes, which Union? *"
                value={formData.otherUnionName}
                onChange={(e) => handleChange("otherUnionName", e.target.value)}
              />
              <p className="my-input-label ">
                Are you or were you a member of another Irish trade Union salary
                or Income Protection Scheme?
              </p>
              <Radio.Group
                className="mb-4"
                value={formData.otherUnionScheme}
                onChange={(e) =>
                  handleChange("otherUnionScheme", e.target.value)
                }
              >
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </Radio.Group>
              <MyInput
                label="Recurited By"
                name="recuritedBy" />
              <MyInput
                label="Recurited By (Membership No)"
                name="recuritedByMembershipNo" />
              <CustomSelect
                label="Primary Section"
                name="primarySection"
                options={[
                  { value: 'section1', label: 'Section 1' },
                  { value: 'section2', label: 'Section 2' },
                  { value: 'section3', label: 'Section 3' },
                  { value: 'section4', label: 'Section 4' },
                  { value: 'section5', label: 'Section 5' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <MyInput
                label="Other Primary Section"
                name="otherPrimarySection"
              />
              <CustomSelect
                label="Secondary Section"
                name="secondarySection"
                // value={InfData.secondarySection}
                options={[
                  { value: 'section1', label: 'Section 1' },
                  { value: 'section2', label: 'Section 2' },
                  { value: 'section3', label: 'Section 3' },
                  { value: 'section4', label: 'Section 4' },
                  { value: 'section5', label: 'Section 5' },
                  { value: 'other', label: 'Other' },
                ]} />
              <MyInput
                label="Other Secondary Section"
                name="otherSecondarySection" />
            </div>
          </div>
        </Col>
      </Row>
      <Row>

      </Row>
      <Row className=" mt-3 ms-1 me-1 p-2" gutter={[8, 8]} style={{border: "2px solid #f8f3f3ff", marginBottom:'20px'}}>
        <Col xs={24} sm={12}>
          <Checkbox
            checked={formData.joinINMOIncomeProtection}
            onChange={(e) =>
              handleChange("joinINMOIncomeProtection", e.target.checked)
            }
          >
            Tick here to join INMO Income Protection Scheme
          </Checkbox>
        </Col>

        <Col xs={24} sm={12}>
          <Checkbox
            checked={formData.joinRewards}
            onChange={(e) => handleChange("joinRewards", e.target.checked)}
          >
            Tick here to join Rewards for INMO members
          </Checkbox>
        </Col>

        <Col xs={24} sm={12}>
          <Checkbox
            checked={formData.allowPartnerContact}
            onChange={(e) =>
              handleChange("allowPartnerContact", e.target.checked)
            }
          >
            Tick here to allow our partners to contact you about Value added
            Services by Email and SMS
          </Checkbox>
        </Col>

        <Col xs={24} sm={12}>
          <Checkbox
            checked={formData.agreeDataProtection}
            onChange={(e) =>
              handleChange("agreeDataProtection", e.target.checked)
            }
          >
            I have read and agree to the INMO Data Protection Statement, the INMO
            Privacy Statement and the INMO Conditions of Membership
          </Checkbox>
        </Col>
      </Row>
    </div>
  );
};

export default MembershipForm;
