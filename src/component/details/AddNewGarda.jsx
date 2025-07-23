import React, { useState, useRef, useEffect } from "react";
import { Checkbox, Row, Col, Radio } from "antd";
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

const libraries = ['places', 'maps'];


function AddNewGarda({ open, onClose, isGard }) {
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
  } = useTableColumns();

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAllLookups())
  }, [dispatch]);

  const inputsInitValue = {
    age: null,
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
    branch: null,
    region: null,
    OtherWorkLocation: null,
    RetiredDate: null,
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
    dateJoined: null,
    isJoined: null,
    attested: null,
    DateLeft: null,
    isLeft: null,
    isAssociateMember: null,
    notes: null,
    preferredAddress: null,
    graduationDate: null,
    isNursingAdaptation: 'No',
    otherUnion: 'Yes',
    wasUnionMember: 'Yes'
  };
  const [InfData, setInfData] = useState(inputsInitValue);
  const [errors, setErrors] = useState({});

  const handleInputChange = (eventOrName, value) => {
    debugger
    // Case 1: Standard input event
    if (eventOrName === "dateOfBirth") {

      // const { name, value: val } = value.target;
      const formattedValue = moment(value)
      debugger

      setInfData((prev) => {
        const updated = {
          ...prev,
          [eventOrName]: value,
        };
        // Handle date of birth → age
        if (eventOrName === "dateOfBirth" && value) {
          const age = calculateAgeFtn(value); // value is a moment object
           updated.age = age;
        }
        // Handle WorkLocation → branch & region
        if (eventOrName === "WorkLocation" && workLocationDetails[formattedValue]) {
          updated.branch = workLocationDetails[formattedValue].branch;
          updated.region = workLocationDetails[formattedValue].region;
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
          if (name === "WorkLocation" && workLocationDetails[finalValue]) {
            updated.branch = workLocationDetails[finalValue].branch;
            updated.region = workLocationDetails[finalValue].region;
          }
          return updated;
        });
        setErrors((prev) => ({ ...prev, [eventOrName.target.name]: "" }));
      }
      else {
        debugger
        // const { name, type, value, checked } = eventOrName.target;
        // const finalValue = type === "checkbox" ? checked : value;
        setInfData((prev) => {
          const updated = {
            ...prev,
            [eventOrName]: value,
          };
          // Handle WorkLocation → branch & region
          if (eventOrName === "WorkLocation" && workLocationDetails[value]) {
            updated.branch = workLocationDetails[value].branch;
            updated.region = workLocationDetails[value].region;
          }
          return updated;
        });
        setErrors((prev) => ({ ...prev, [eventOrName]: "" }));
      }
  };

  console.log(InfData, 'infoData')
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
      'preferredAddress',
      'PayrollNo'
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
    if (places && places.length > 0) {
      const place = places[0];
      const address = place.formatted_address;

      const addressParts = address.split(', ').map(part => part.trim());
      const addressLine1 = addressParts[0] || '';
      const addressLine2 = addressParts[1] || '';
      const addressLine3 = addressParts[2] || '';
      const addressLine4 = addressParts[3] || '';

      setInfData({
        ...InfData,
        AdressLine1: addressLine1,
        AdressLine2: addressLine2,
        AdressLine3: addressLine3,
        AdressLine4: addressLine4,
      });
    }
  };
  // Mapping of work locations to their branches and regions
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

  return (
    <>
      <MyDrawer
        title={`${isGard === true ? "Bulk Registration [ 93824B ]" : "Registration Request"}`}
        open={open}
        onClose={() => {
          setErrors({});
          setInfData(inputsInitValue);
          onClose()
        }}
        isAppRej={true}
        add={handleSubmit}
        isGarda={isGard ? true : false}
        isGardaCheckbx={isGard ? false : true}
        width='1500px'>
        <div className="drawer-main-cntainer " >
          <div>
            <Row gutter={24}>
              {/* Section Heading */}
              <Col span={24}>
                <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Personal Information</h2>
              </Col>

              {/* Title (Empty Data Allowed) */}
              <Col span={8}>
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
              <Col span={8}>
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

              <Col span={8}>
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

              {/* Country Of Primary Qualification */}
              <Col span={12}>
                <CustomSelect
                  label="Country Of Primary Qualification"
                  name="Country Of Primary Qualification"
                  value={InfData?.Country}
                  options={countryOptions}
                  required
                  disabled={isDisable}
                  onChange={(e) => handleInputChange("Country", e.target.value)}
                  hasError={!!errors?.Country}
                />
              </Col>
              <Col span={12}></Col>
            </Row >


            {/* <h2 style={{ fontSize: '17px',  color: 'black' }}>Correspondence Details</h2> */}

            <Row gutter={24}>
              {/* Section Heading */}
              <Col span={24}>
                <h2 style={{ fontSize: '22px', marginBottom: '20px', marginTop: '10px' }}>Correspondence Details</h2>
              </Col>
              <Col span={24} className="">
                {/* <Checkbox>Consent to receive Correspondence from INMO </Checkbox> */}

                {/*
  </Col>
  <Col span={24}>
  <label className="my-input-label mt-4">Prefered adress</label>
    <Checkbox>Work </Checkbox> */}
                <div className="my-input-group mt-4 mb-4">
                  <Row>
                    <Col span={12}>
                      {/* <label className="my-input-label mb-2 "> */}
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
                            { value: 'Home', label: 'Home' },
                            { value: 'Work', label: 'Work' },
                          ]}
                          className={errors?.preferredAddress ? 'radio-error' : ''}
                        />
                        <Checkbox style={{ marginLeft: 10 }}>
                          Consent to receive Correspondence from INMO
                        </Checkbox>
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
                <MyInput
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
                <MyInput
                  label="Eircode"
                  name="Eircode"
                  placeholder="Enter Eircode"
                  disabled={isDisable}
                />
              </Col>
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
              <Col span={12}>
                <MyInput
                  label="Home / Work Tel Number"
                  name="mobile"
                  type="number"
                  value={InfData.workHomeTel}
                  disabled={isDisable}
                  onChange={handleInputChange}
                  hasError={!!errors?.workHomeTel}
                />
              </Col>

              {/* Preferred Email (Full Width) */}
              <Col span={12} className="mt-2 mb-4">
                <label className={`my-input-label ${errors?.preferredEmailOptions ? "error-text1" : ""}`}>Preferred Email<span className="text-danger ms-1">*</span></label>
                <Radio.Group
                  onChange={(e) => handleInputChange("preferredEmailOptions", e.target.value)}
                  value={InfData?.preferredEmailOptions}
                  disabled={isDisable}
                  className={errors?.preferredEmailOptions ? 'radio-error' : ''}
                >
                  <Radio value="Personal">Personal</Radio>
                  <Radio value="Work">Work</Radio>
                </Radio.Group>
              </Col>
              <Col span={12}></Col>
              <Col span={12}>
                <MyInput
                  label="Personal Email"
                  name="email"
                  type="email"
                  required={InfData.preferredEmailOptions === "Personal"}
                  value={InfData.email}
                  disabled={isDisable}
                  onChange={handleInputChange}
                  hasError={!!errors?.email}
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
                name="MembershipCategory"
                value={InfData.MembershipCategory}
                options={CatOptions}
                required
                disabled={isDisable}
                onChange={(e) => handleInputChange("MembershipCategory", e.target.value)}
                hasError={!!errors?.MembershipCategory}
              />
            </Col>
          </Row>
          {InfData.MembershipCategory === 'Undergraduate Student' && (
            <Row gutter={24}>
              <Col span={12}>
                <CustomSelect
                  label="Study Location"
                  name="studyLocation"
                  disabled={InfData.MembershipCategory !== 'Undergraduate Student'}
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
                  label="Graduation Date"
                  name="graduationDate"
                  disabled={InfData?.MembershipCategory !== 'Undergraduate Student'}
                  value={InfData?.graduationDate || ''}
                  onChange={(date) =>
                    handleInputChange('graduationDate', date ? date.format("DD/MM/YYYY") : null)
                  }
                  hasError={!!errors?.graduationDate}
                  disableAgeValidation
                />
              </Col>
            </Row>
          )}
          <Row gutter={24}>
            <Col span={12}>
              <CustomSelect
                label="Work Location"
                name="WorkLocation"
                value={InfData.WorkLocation}
                options={[
                  ...workLocations.map(loc => ({ value: loc, label: loc })),
                  { value: 'other', label: 'other' },
                ]}
                required
                disabled={isDisable}
                onChange={(e) => handleInputChange("WorkLocation", e.target.value)}
                hasError={!!errors?.WorkLocation}
              />
            </Col>

            {/* Other Work Location | Grade */}
            <Col span={12}>

              <MyInput
                label="Other Work Location"
                name="Other Work Location"
                value={InfData.OtherWorkLocation}
                required={InfData.OtherWorkLocation != 'other'}
                disabled={isDisable || InfData.OtherWorkLocation != 'other'}
                onChange={(e) => handleInputChange("OtherWorkLocation", e.target.value)}
                hasError={!!errors?.OtherWorkLocation}
              />
            </Col>
            <Col span={12}>
              <CustomSelect
                label="Branch"
                name="Branch"
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
                onChange={(e) => handleInputChange("Region", e.target.value)}
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
                name="isNursingAdaptation"
                value={InfData.isNursingAdaptation}
                onChange={handleInputChange}
              >
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </Radio.Group>



            </Col>
            <Col span={12}>
              <MyInput
                label="NMBI No/An Board Altranais Number"
                name="NMBINo"
                value={InfData.NMBINo}
                // disabled={isDisable}
                disabled={InfData?.isNursingAdaptation !== 'yes'}
                required={InfData?.isNursingAdaptation === 'yes'}
                onChange={(e) => handleInputChange("NMBINo", e.target.value)}
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
                required={InfData?.nursingAdaptationProgramme === 'yes'}
                disabled={InfData?.nursingAdaptationProgramme !== 'yes'}
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
          <Row gutter={24}>
            <Col span={12}>
              <CustomSelect
                label="Grade"
                name="Grade"
                value={InfData.Grade}
                required
                disabled={isDisable}
                onChange={(e) => handleInputChange("Grade", e.target.value)}
                options={[
                  { value: 'junior', label: 'Junior' },
                  { value: 'senior', label: 'Senior' },
                  { value: 'lead', label: 'Lead' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'other', label: 'Other' },
                ]}
                hasError={!!errors?.Grade}
              />
            </Col>

            {/* Other Grade | Branch */}
            <Col span={12}>
              <MyInput
                label="Other Grade"
                name="otherGrade"
                value={InfData.otherGrade}
                required={InfData?.Grade === 'other'}
                disabled={InfData?.Grade !== 'other' || isDisable}
                // disabled={isDisable}
                onChange={(e) => handleInputChange("otherGrade", e.target.value)}
                hasError={!!errors?.Grade}
              />
            </Col>
            <Col span={12}>
              <MyDatePicker
                label="Retired Date"
                name="RetiredDate"
                value={InfData.RetiredDate ? moment(InfData.RetiredDate, "DD/MM/YYYY") : null}
                disabled={isDisable || InfData?.MembershipCategory != 'Retired Associate'}
                required={InfData?.MembershipCategory == 'Retired Associate'}
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
                disabled={isDisable || InfData?.MembershipCategory != 'Retired Associate'}
                onChange={(e) => handleInputChange("pensionNo", e.target.value)}
                required={InfData?.MembershipCategory == 'Retired Associate'}
                hasError={!!errors?.Grade}
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
                name="PayrollNo"
                value={InfData.PayrollNo}
                hasError={!!errors?.PayrollNo}
                required={InfData?.PaymentType === 'Deduction at Source'}
                disabled={InfData?.PaymentType !== 'Deduction at Source'}
                onChange={(e) => handleInputChange("PayrollNo", e.target.value)}
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
                  name="otherUnion"
                  value={InfData.otherUnion}
                  onChange={handleInputChange}
                  disabled={isDisable}
                >
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </div>
            </Col>

            <Col span={12}>
              {/* <div style={{ minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}> */}
              <label className="my-input-label mt-4">
                Are you or were you a member of another Irish trade Union salary or Income Protection Scheme?
              </label>
              <Radio.Group
                name="wasUnionMember"
                value={InfData.wasUnionMember}
                onChange={handleInputChange}
                className="my-input-wrapper"
                disabled={isDisable}
              >
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </Radio.Group>
              {/* </div> */}
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <label className="my-input-label mt-4 mb-4">Please tick one of the following</label>
              <Radio.Group
                name="nursingType"
                value={InfData.nursingType}
                disabled={isDisable}
                onChange={handleInputChange}
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
          <Row gutter={24} className="mt-3">
            <Col span={12} gutter={24} >
              <MyInput
                label="Recurited By"
                name="RecuritedBy"
                value={InfData.RecuritedBy}
                disabled={isDisable}
                onChange={(e) => handleInputChange("RecuritedBy", e.target.value)}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Recurited By (Membership No)"
                name="RecuritedByMemNo"
                value={InfData.RecuritedByMemNo}
                disabled={isDisable}
                onChange={(e) => handleInputChange("RecuritedByMemNo", e.target.value)}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <CustomSelect
                label="Primary Section"
                name="PrimarySection"
                value={InfData.PrimarySection}
                disabled={isDisable}
                onChange={(e) => handleInputChange("PrimarySection", e.target.value)}
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
              <CustomSelect
                label="Other Primary Section"
                name="OtherPrimarySection"
                value={InfData.OtherPrimarySection}
                // disabled={isDisable}
                onChange={(e) => handleInputChange("OtherPrimarySection", e.target.value)}
                required={InfData?.PrimarySection === 'Other'}
                disabled={InfData?.PrimarySection !== 'Other'}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <CustomSelect
                label="Secondary Section"
                name="SecondarySection"
                value={InfData.SecondarySection}
                disabled={isDisable}
                onChange={(e) => handleInputChange("SecondarySection", e.target.value)}
              /></Col>
            <Col span={12}>
              <CustomSelect
                label="Other Secondary Section"
                name="OtherSecondarySection"
                value={InfData.OtherSecondarySection}
                disabled={isDisable}
                onChange={(e) => handleInputChange("OtherSecondarySection", e.target.value)}
              /></Col>
          </Row>
          <Row gutter={24}>
            <Col span={12} >
              <Checkbox
                checked={InfData?.incPro}
                onChange={(e) => handleInputChange('incPro', e.target.checked)}
                className="my-input-wrapper"
              >
                Tick here to join INMO Income Protection Scheme
              </Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox className="my-input-wrapper">
                Tick here to join Rewards for INMO members
              </Checkbox>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Checkbox className="my-input-wrapper">
                Tick here to allow our partners to contact you about Value added Services by Email and SMS
              </Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox
                checked={InfData?.isTermCon}
                onChange={(e) => handleInputChange('isTermCon', e.target.checked)}
                className="my-input-wrapper"
              >
                I have read and agree to the INMO
                Data Protection Statement , the INMO Privacy Statement and the INMO
                Conditions of Membership
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