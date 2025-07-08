import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';
import { Checkbox, Table, Row, Col, Radio } from "antd";
// import { Radio } from "antd";
import moment from "moment";
import CustomSelect from "../common/CustomSelect";
import MyInput from "../common/MyInput";
import MyDatePicker from "../common/MyDatePicker";
import MyDrawer from "../common/MyDrawer";
import { useSelector, useDispatch } from "react-redux";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api'
import { fetchCountries } from "../../features/CountrySlice";
import { CatOptions } from "../../Data";
import { getAllLookups } from "../../features/LookupsSlice";

const libraries = ['places', 'maps'];


function AddNewGarda({ open, onClose, isGard }) {
  const { data: countryOptions, loading, error } = useSelector(
    (state) => state.countries
  );
  const inputRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCJYpj8WV5Rzof7O3jGhW9XabD0J4Yqe1o',
    libraries: libraries,
  });

  console.log('isLoaded=========>', isLoaded);
  const dispatch = useDispatch();
  const {
    selectLokups,
    lookupsForSelect,
    contactTypes,
    disableFtn,
    isDisable,
  } = useTableColumns();

  const state = useSelector((state) => state.lookups);
  const { lookups } = state;
  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAllLookups())
  }, [dispatch]);
  const ApplicationStatus = [
    { value: "Pending", label: "Pending" },
    { value: "Approve", label: "Approve" },
    { value: "Reject", label: "Reject" },
  ];

  const preferredOptions = [
    { value: "Home", label: "Home" },
    { value: "Office", label: "Office" },
  ];
  const preferredEmailOptions = [
    { value: "Personal", label: "Personal" },
    { value: "Work", label: "Work" },
  ];
  const inputsInitValue = {
    gardaRegNo: null,
    fullname: null,
    forename: null,
    surname: null,
    CountryOfPrimaryQualification: null,
    AdressLine1: null,
    AdressLine2: null,
    AdressLine3: null,
    areaOrTown: null,
    eirCode: null,
    mobile: null,
    AdressLine4: null,
    Country: 'Irland',
    isTermCon: false,
    HomeOrWorkTel: null,
    email: null,
    preferredEmail: null,
    preferredEmailOptions: null,
    Grade: null,
    MembershipCategory: null,
    WorkLocation: null,
    Branch: null,
    RetiredDate: null,
    OtherWorkLocation: null,
    RetiredDate: null,
    otherGrade: null,
    WorkEmail: null,
    class: null,
    dateOfBirth: null,
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
    dateJoined: null,
    isJoined: null,
    attested: null,
    DateLeft: null,
    isLeft: null,
    isAssociateMember: null,
    notes: null,
  };

  const [InfData, setInfData] = useState(inputsInitValue);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [ageOnNextBirthday, setAgeOnNextBirthday] = useState(null);

  const handleInputChange = (eventOrName, value) => {
    if (eventOrName && eventOrName.target) {
      const { name, type, checked } = eventOrName.target;
      setInfData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : eventOrName.target.value,
      }));
    } else {
      setInfData((prev) => ({
        ...prev,
        [eventOrName]: moment.isMoment(value)
          ? value.format("DD/MM/YYYY")
          : value,
      }));
      setErrors((prev) => ({ ...prev, [eventOrName]: "" }));
    }
  };

  const handleSubmit = () => {
    const requiredFields = [
      "status",
      "title",
      "forename",
      "surname",
      "dateOfBirth",
      "gender",
      "AdressLine1",
      "AdressLine4",
      "Country",
      "mobile",
      "preferredEmailOptions",
      "MembershipCategory",
      "WorkLocation",
      "Grade",
      'PaymentType',
      'isTermCon',
    ];

    const newErrors = {};

    // Validate required fields
    requiredFields.forEach((field) => {
      const value = InfData[field];
      if (!value || value.toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    // Conditional validation for email fields
    if (InfData.preferredEmailOptions === "Personal") {
      if (!InfData.email || InfData.email.trim() === "") {
        newErrors.email = "Personal Email is required";
      }
    }

    if (InfData.preferredEmailOptions === "Work") {
      if (!InfData.WorkEmail || InfData.WorkEmail.trim() === "") {
        newErrors.WorkEmail = "Work Email is required";
      }
    }

    // If there are any errors, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear previous errors
    setErrors({});

    // Submit the form (replace with your actual logic)
    console.log("Form submitted successfully:", InfData);
    // You can call an API or trigger next step here
  };

  const handlePlacesChanged = () => {
    const places = inputRef.current.getPlaces();
    console.log('places=========>', places);
    if (places && places.length > 0) {
      const place = places[0];
      const address = place.formatted_address;
      debugger
      const addressParts = address.split(', ').map(part => part.trim());
      const addressLine1 = addressParts[0] || '';
      const addressLine2 = addressParts[1] || '';
      const addressLine3 = addressParts[2] || '';
      const addressLine4 = addressParts[3] || '';
      debugger
      setInfData({
        ...InfData,
        AdressLine1: addressLine1,
        AdressLine2: addressLine2,
        AdressLine3: addressLine3,
        AdressLine4: addressLine4,
      });
    }
  };

  console.log(InfData, "InfData")
  return (
    <>
      <MyDrawer
        title={`${isGard === true ? "Bulk Registration [ 93824B ]" : "Regist Registration"}`}
        open={open}
        onClose={() => {
          setErrors({});
          setInfData(inputsInitValue);
          onClose()
        }}
        add={handleSubmit}
        isGarda={isGard ? true : false}
        isGardaCheckbx={isGard ? false : true}
        width='1500px'>
        <div className="drawer-main-cntainer d-flex flex-column	 " >
          <div>
          <Row gutter={24}>
  {/* Section Heading */}
  <Col span={24}>
    <h2 style={{ fontSize: '17px', marginBottom: '20px' }}>Personal Information</h2>
  </Col>

  {/* Title (Empty Data Allowed) */}
  <Col span={12}>
    <CustomSelect
      label="Title"
      name="title"
      value={InfData.title}
      options={lookupsForSelect?.Titles} // can be empty
      required
      disabled={isDisable}
      onChange={(e) => handleInputChange("title", e.target.value)}
      hasError={!!errors?.title}
    />
  </Col>
  {/* Forename | Surname */}
  <Col span={12}>
    <MyInput
      label="Forename"
      name="forename"
      value={InfData.forename}
      required
      disabled={isDisable}
      onChange={handleInputChange}
      hasError={!!errors?.forename}
    />
  </Col>

  <Col span={12}>
    <MyInput
      label="Surname"
      name="surname"
      value={InfData.surname}
      required
      disabled={isDisable}
      onChange={handleInputChange}
      hasError={!!errors?.surname}
    />
  </Col>

  {/* Gender | Date of Birth */}
  <Col span={12}>
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

  <Col span={12}>
    <MyDatePicker
      label="Date of Birth"
      name="dob"
      value={InfData.dateOfBirth ? moment(InfData.dateOfBirth, "DD/MM/YYYY") : null}
      required
      disabled={isDisable}
      onChange={(date) =>
        handleInputChange("dateOfBirth", date ? date.format("DD/MM/YYYY") : null)
      }
      hasError={!!errors?.dateOfBirth}
    />
    {ageOnNextBirthday != null && (
      <p className="ag-65-title">{ageOnNextBirthday} Yrs</p>
    )}
  </Col>

  {/* Country Of Primary Qualification */}
  <Col span={12}>
    <MyInput
      label="Country Of Primary Qualification"
      name="Country Of Primary Qualification"
      value={InfData.CountryOfPrimaryQualification}
      disabled={isDisable}
      onChange={handleInputChange}
    />
  </Col>
  <Col span={12}></Col>
</Row >


          {/* <h2 style={{ fontSize: '17px',  color: 'black' }}>Correspondence Details</h2> */}

<Row gutter={24}>
  {/* Section Heading */}
  <Col span={24}>
    <h2 style={{ fontSize: '17px', marginBottom: '20px' }}>Correspondence Details</h2>
  </Col>

  {/* Eircode | Preferred Address */}
  <Col span={12}>
    {isLoaded && (
      <StandaloneSearchBox
        onLoad={(ref) => (inputRef.current = ref)}
        onPlacesChanged={handlePlacesChanged}
        placeholder="Enter Eircode (e.g., D01X4X0)"
      >
        <MyInput
          label="Eircode"
          name="Enter Eircode (e.g., D01X4X0)"
        />
      </StandaloneSearchBox>
    )}
  </Col>

  <Col span={12}>
    <CustomSelect
      label="Preferred Address"
      name="Preferred Address"
      value={InfData.PreferredAddress}
      options={preferredOptions}
      required
      disabled={isDisable}
      onChange={(e) => handleInputChange("PreferredAddress", e.target.value)}
      hasError={!!errors?.PreferredAddress}
    />
  </Col>

  {/* Address Line 1 | Address Line 2 */}
  <Col span={12}>
    <MyInput
      label="Address Line 1 (Building or House)"
      name="AdressLine1"
      value={InfData.AdressLine1}
      required
      disabled={isDisable}
      onChange={handleInputChange}
      hasError={!!errors?.AdressLine1}
    />
  </Col>

  <Col span={12}>
    <MyInput
      label="Address Line 2 (Street or Road)"
      name="AdressLine2"
      value={InfData.AdressLine2}
      disabled={isDisable}
      onChange={handleInputChange}
    />
  </Col>

  {/* Address Line 3 | Address Line 4 */}
  <Col span={12}>
    <MyInput
      label="Address Line 3 (Area or Town)"
      name="AdressLine3"
      value={InfData.AdressLine3}
      disabled={isDisable}
      onChange={handleInputChange}
    />
  </Col>

  <Col span={12}>
    <CustomSelect
      label="Address Line 4 (County, City or Postcode)"
      name="AdressLine4"
      value={InfData.AdressLine4}
      required
      disabled={isDisable}
      onChange={(e) => handleInputChange("AdressLine4", e.target.value)}
      hasError={!!errors?.AdressLine4}
    />
  </Col>

  {/* Country | Mobile */}
  <Col span={12}>
    <CustomSelect
      label="Country"
      name="Country"
      value={InfData.Country}
      options={countryOptions}
      required
      disabled={isDisable}
      onChange={(e) => handleInputChange("Country", e.target.value)}
      hasError={!!errors?.Country}
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
      onChange={handleInputChange}
      hasError={!!errors?.mobile}
    />
  </Col>

  {/* Preferred Email (Full Width) */}
  <Col span={12}>
    <CustomSelect
      label="Preferred Email"
      name="Preferred Email"
      value={InfData.preferredEmailOptions}
      options={preferredEmailOptions}
      required
      disabled={isDisable}
      onChange={(e) => handleInputChange("preferredEmailOptions", e.target.value)}
      hasError={!!errors?.preferredEmailOptions}
    />
  </Col>
  {/* Personal Email | Work Email */}
  <Col span={12}>
    <MyInput
      label="Personal Email"
      name="email"
      type="email"
      required={InfData.preferredEmailOptions === "Personal"}
      value={InfData.email}
      disabled={isDisable}
      onChange={handleInputChange}
    />
  </Col>

  <Col span={12}>
    <MyInput
      label="Work Email"
      name="Work Email"
      type="email"
      value={InfData.WorkEmail}
      required={InfData.preferredEmailOptions === "Work"}
      disabled={isDisable}
      onChange={handleInputChange}
      hasError={!!errors?.email}
    />
  </Col>
</Row>
          </div>
          <Row gutter={24}>
  <Col span={24}>
    <h2 style={{ fontSize: '17px', marginBottom: '20px' }}>Professional Details</h2>
  </Col>

  {/* Membership Category | Work Location */}
  <Col span={12}>
    <CustomSelect
      label="Membership Category"
      name="MembershipCategory"
      value={InfData.MembershipCategory}
      options={CatOptions}
      required
      disabled={isDisable}
      onChange={(e) => handleInputChange("MembershipCategory", e.target.value)}
      hasError={!!errors?.MembershipCategory}
    />
  </Col>

  <Col span={12}>
    <CustomSelect
      label="Work Location"
      name="WorkLocation"
      value={InfData.WorkLocation}
      options={[
        { label: 'Work Location', value: 'Work Location' },
        { label: 'Other Work Location', value: 'Other Work Location' }
      ]}
      required
      disabled={isDisable}
      onChange={(e) => handleInputChange("WorkLocation", e.target.value)}
      hasError={!!errors?.WorkLocation}
    />
  </Col>

  {/* Other Work Location | Grade */}
  <Col span={12}>
    <CustomSelect
      label="Other Work Location"
      name="OtherWorkLocation"
      value={InfData.OtherWorkLocation}
      disabled={isDisable}
      onChange={(e) => handleInputChange("OtherWorkLocation", e.target.value)}
    />
  </Col>

  <Col span={12}>
    <MyInput
      label="Grade"
      name="Grade"
      value={InfData.Grade}
      required
      disabled={isDisable}
      onChange={(e) => handleInputChange("Grade", e.target.value)}
      hasError={!!errors?.Grade}
    />
  </Col>

  {/* Other Grade | Branch */}
  <Col span={12}>
    <MyInput
      label="Other Grade"
      name="otherGrade"
      value={InfData.otherGrade}
      required
      disabled={isDisable}
      onChange={(e) => handleInputChange("otherGrade", e.target.value)}
      hasError={!!errors?.Grade}
    />
  </Col>

  <Col span={12}>
    <CustomSelect
      label="Branch"
      name="Branch"
      value={InfData.Branch}
      disabled={isDisable}
      onChange={(e) => handleInputChange("Branch", e.target.value)}
    />
  </Col>

  {/* Region | Retired Date */}
  <Col span={12}>
    <CustomSelect
      label="Region"
      name="Region"
      value={InfData.Region}
      disabled={isDisable}
      onChange={(e) => handleInputChange("Region", e.target.value)}
    />
  </Col>

  <Col span={12}>
    <MyDatePicker
      label="Retired Date"
      name="RetiredDate"
      value={InfData.RetiredDate ? moment(InfData.RetiredDate, "DD/MM/YYYY") : null}
      disabled={isDisable}
      onChange={(date) =>
        handleInputChange("RetiredDate", date ? date.format("DD/MM/YYYY") : null)
      }
    />
  </Col>

  {/* Pension No */}
  <Col span={12}>
    <MyInput
      label="Pension No"
      name="pensionNo"
      value={InfData.pensionNo}
      disabled={isDisable}
      onChange={(e) => handleInputChange("pensionNo", e.target.value)}
      hasError={!!errors?.Grade}
    />
  </Col>
</Row>

       <Row gutter={24}>
  <Col span={24}>
    <h2 style={{ fontSize: '17px', marginBottom: '20px' }}>Subscription Details</h2>
  </Col>

  {/* Column 1 */}
  <Col span={12}>
    <CustomSelect
      label="Payment Type"
      name="PaymentType"
      required
      options={[
        { label: "Direct Debit", value: 'Direct Debit' },
        { label: "Credit Card", value: 'Credit Card' }
      ]}
      disabled={isDisable}
      onChange={(e) => handleInputChange("PaymentType", e.target.value)}
      value={InfData.PaymentType}
      hasError={!!errors?.PaymentType}
    />

    <MyInput
      label="Payroll No"
      name="PayrollNo"
      value={InfData.PayrollNo}
      disabled={isDisable}
      onChange={(e) => handleInputChange("PayrollNo", e.target.value)}
    />

    <label className="my-input-label mt-4 my-input-wrapper">
      Are you currently undertaking a nursing adaptation programme?
    </label>
    <Radio.Group
      name="isNursingAdaptation"
      value={InfData.isNursingAdaptation}
      onChange={handleInputChange}
    >
      <Radio value="Yes">Yes</Radio>
      <Radio value="No">No</Radio>
    </Radio.Group>

    <MyInput
      label="NMBI No/An Board Altranais Number"
      name="NMBINo"
      value={InfData.NMBINo}
      disabled={isDisable}
      onChange={(e) => handleInputChange("NMBINo", e.target.value)}
    />

    <label className="my-input-label mt-4">Please tick one of the following</label>
    <Radio.Group
      name="nursingType"
      value={InfData.nursingType}
      onChange={handleInputChange}
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

  {/* Column 2 */}
  <Col span={12}>
    <label className="my-input-label mt-4">Please select the most appropriate option below</label>
    <Radio.Group
      name="memberType"
      value={InfData.memberType}
      onChange={handleInputChange}
    >
      <Radio value="New Member">You are a new member</Radio>
      <Radio value="Newly Graduated">You are newly graduated</Radio>
      <Radio value="Rejoining">You were previously a member of the INMO, and are rejoining</Radio>
      <Radio value="Returning from Break">You are returning from a career break</Radio>
      <Radio value="Returning from Abroad">You are returning from nursing abroad</Radio>
    </Radio.Group>

    <label className="my-input-label mt-4">If you are a member of another Trade Union. If yes, which Union?</label>
    <Radio.Group
      name="otherUnion"
      value={InfData.otherUnion}
      onChange={handleInputChange}
    >
      <Radio value="Yes">Yes</Radio>
      <Radio value="No">No</Radio>
    </Radio.Group>

    <label className="my-input-label mt-4">Are you or were you a member of another Irish trade Union salary or Income Protection Scheme?</label>
    <Radio.Group
      name="wasUnionMember"
      value={InfData.wasUnionMember}
      onChange={handleInputChange}
      className="my-input-wrapper"
    >
      <Radio value="Yes">Yes</Radio>
      <Radio value="No">No</Radio>
    </Radio.Group>

    <MyInput
      label="Recurited By"
      name="RecuritedBy"
      value={InfData.RecuritedBy}
      disabled={isDisable}
      onChange={(e) => handleInputChange("RecuritedBy", e.target.value)}
    />

    <MyInput
      label="Recurited By (Membership No)"
      name="RecuritedByMemNo"
      value={InfData.RecuritedByMemNo}
      disabled={isDisable}
      onChange={(e) => handleInputChange("RecuritedByMemNo", e.target.value)}
    />
  </Col>

  {/* Full Width Additional Subscription Section */}
  <Col span={24}>
    <h2 style={{ fontSize: '17px', marginBottom: '20px' }}>Additional Subscription Info</h2>
  </Col>

  <Col span={12}>
    <CustomSelect
      label="Primary Section"
      name="PrimarySection"
      value={InfData.PrimarySection}
      disabled={isDisable}
      onChange={(e) => handleInputChange("PrimarySection", e.target.value)}
    />

    <CustomSelect
      label="Other Primary Section"
      name="OtherPrimarySection"
      value={InfData.OtherPrimarySection}
      disabled={isDisable}
      onChange={(e) => handleInputChange("OtherPrimarySection", e.target.value)}
    />
  </Col>

  <Col span={12}>
    <CustomSelect
      label="Secondary Section"
      name="SecondarySection"
      value={InfData.SecondarySection}
      disabled={isDisable}
      onChange={(e) => handleInputChange("SecondarySection", e.target.value)}
    />

    <CustomSelect
      label="Other Secondary Section"
      name="OtherSecondarySection"
      value={InfData.OtherSecondarySection}
      disabled={isDisable}
      onChange={(e) => handleInputChange("OtherSecondarySection", e.target.value)}
    />
  </Col>

  <Col span={12} className="mt-4">
    <Checkbox
      checked={InfData?.incPro}
      onChange={(e) => handleInputChange('incPro', e.target.checked)}
      className="my-input-wrapper"
    >
      Tick here to join INMO Income Protection Scheme
    </Checkbox>

    <Checkbox className="my-input-wrapper">
      Tick here to join Rewards for INMO members
    </Checkbox>

    </Col>
    <Col span={12}>
    <Checkbox className="my-input-wrapper">
      Tick here to allow our partners to contact you about Value added Services by Email and SMS
    </Checkbox>
    </Col>
    <Col span={24}>
    
    <Checkbox
      checked={InfData?.isTermCon}
      onChange={(e) => handleInputChange('isTermCon', e.target.checked)}
      className="my-input-wrapper"
    >
      I have read and agree to the INMO
      <a href=""> Data Protection Statement </a>, the INMO Privacy Statement and the INMO
      <a href=""> Conditions of Membership </a>
      {errors?.isTermCon && <span style={{ color: 'red' }}> (Required)</span>}
    </Checkbox>
  </Col>
</Row>

        </div>
      </MyDrawer>
    </>
  );
}

export default AddNewGarda;