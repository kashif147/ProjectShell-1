import React, { useEffect, useState } from "react";
import MyDrawer from "../common/MyDrawer";
import MySelect from "../common/MySelect";
// import { getAllLookups } from "../../features/LookupsSlice";
import { useSelector, useDispatch } from "react-redux";
import {
  Input,
  Button,
  DatePicker,
  Col,
  Row,
  Upload,
  Checkbox,
  Divider,
  Radio,
} from "antd";
import MyDatePicker from "../common/MyDatePicker";
import {
  LoadingOutlined,
  UploadOutlined,
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { IoSettingsOutline } from "react-icons/io5";
import { getAllLookups } from "../../features/LookupsSlice";
import moment from "moment";
import { useTableColumns } from "../../context/TableColumnsContext ";

function AddNewGarda({ open, onClose }) {
  const dispath = useDispatch();
  const {lookupsData,lookupsForSelect} = useTableColumns()
  console.log(lookupsData,'123')
  useEffect(()=>{
dispath(getAllLookups())
  },[dispath])
  const state = useSelector((state) => state.lookups);
  const { lookups, lookupsloading, error } = state;
  const { TextArea } = Input;

  const options = [
    { value: "NY", label: "New York" },
    { value: "LA", label: "Los Angeles" },
    { value: "CHI", label: "Chicago" },
  ];

  console.log(state, "this is the lookupstate");
  const inputsInitValue = {
    gardaRegNo: null,
    fullname: null,
    forename: null,
    surname: null,
    buildingOrHouse: null,
    streetOrRoad: null,
    areaOrTown: null,
    eirCode: null,
    mobile: null,
    postcode: "null",
    otherContact: null,
    email: null,
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
    Division: null,
    isPensioner: null,
    pensionNo: null,
    duty: null,
    rank: "",
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
  const [updateInput, setUpdateInput] = useState({});
  const [ageOnNextBirthday, setAgeOnNextBirthday] = useState(null);

  const handleInputChange = (eventOrName, value) => {
    console.log("myNewValue", value);
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
    }
  };
  //   const handleInputChangeWhole = (field, value) => {
  //     setInfData((prev) => ({
  //       ...prev,
  //       [field]: value,
  //     }));
  //   };
  const props = {
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
    onChange({ file, fileList }) {
      if (file.status !== "uploading") {
        console.log(file, fileList);
      }
    },
    defaultFileList: [
      {
        uid: "1",
        name: "khan.png",
        status: "done",
        url: "http://www.bise.com/khan.png",
        percent: 33,
      },
      {
        uid: "2",
        name: "Error",
        status: "done",
        url: "http://www.bise.com/yyy.png",
      },
      {
        uid: "3",
        name: "zzz.png",
        status: "uploading",
        // custom error message to show
        url: "http://www.bise.com/zzz.png",
      },
    ],
  };
  const [modalOpenData, setmodalOpenData] = useState({
    Partnership: false,
    Children: false,
    TransferScreen: false,
  });
  const openCloseModalsFtn = (key) => {
    setmodalOpenData((prevState) => ({
      ...prevState,
      [key]: !modalOpenData[key],
    }));
  };
  const optionsWithDisabled = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other", disabled: true },
  ];
  const [value4, setValue4] = useState("Male");
  const onChange4 = ({ target: { value } }) => {
    console.log("radio4 checked", value);
    setValue4(value);
  };

  return (
    <>
      <MyDrawer
        title='New Garda Details'
        open={open}
        onClose={onClose}
        width='991px'>
        <div className='details-con-header1'>
          <Row>
            <Col span={12}>
              <div
                className='detail-sub-con detail-sub-con-ist'
                style={{
                  backgroundColor: "white",
                  border: "none",
                  height: "auto",
                }}>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Reg No :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "baseline",
                      }}>
                      <div className='input-container-with-sup d-flex flex-column '>
                        <Input
                          placeholder='Enter text'
                          name='gardaRegNo'
                          value={InfData.gardaRegNo}
                          onChange={handleInputChange}
                          style={{
                            padding: "0px",
                            width: "100%",
                            borderRight: "1px solid #d9d9d9",
                            borderRadius: "4px 0 0 4px",
                            padding: "0px",
                            paddingLeft: "5px",
                            margin: "0px",
                            height: "33px",
                          }} // Adjust border style
                          suffix={
                            <div className='suffix-container'>
                              <IoSettingsOutline />
                            </div>
                          }
                        />
                        {InfData?.gardaRegNo === "" && (
                          <h1 className='error-text'>RegNo Required</h1>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Title :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <div className='input-sub-con'>
                      <MySelect
                        isSimple={true}
                        placeholder='Mr.'
                        onChange={(value) => handleInputChange("title", value)}
                      />
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Forename :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <Input
                        className='input'
                        name='forename'
                        onChange={handleInputChange}
                        value={InfData?.forename}
                      />
                      {InfData?.forename === "" && (
                        <h1 className='error-text'>ForeName Required</h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Surname :</p>
                  </div>
                  <div className='input-cont '>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <Input
                        className='input'
                        value={InfData?.surname}
                        name='surname'
                        onChange={handleInputChange}
                      />
                      {InfData?.surname === "" && (
                        <h1 className='error-text'>Surname Required</h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Date of Birth :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <DatePicker
                        style={{ width: "100%", borderRadius: "3px" }}
                        value={
                          InfData?.dateOfBirth
                            ? moment(InfData.dateOfBirth, "DD/MM/YYYY")
                            : null
                        } // Convert string to moment
                        onChange={(date, dateString) => {
                          handleInputChange(
                            "dateOfBirth",
                            date ? date.format("DD/MM/YYYY") : null
                          ); // Pass the string value
                        }}
                        format='DD/MM/YYYY'
                      />
                      {InfData.dateOfBirth === "" && (
                        <h1 className='error-text'>Date Of Birth Required</h1>
                      )}
                      {/* <div className="ag-65"> */}
                      {ageOnNextBirthday != null && (
                        <p className='ag-65-title'>{`${ageOnNextBirthday} Yrs`}</p>
                      )}
                    </div>
                    {/* </div> */}
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Gender :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <Radio.Group
                        options={optionsWithDisabled}
                        optionType='button'
                        buttonStyle='solid'
                        name='gender'
                        value={InfData.gender}
                        onChange={handleInputChange}
                      />
                    </div>
                    {InfData.gender === "" && (
                      <h1 className='error-text'>Gender Required</h1>
                    )}
                  </div>
                </div>

                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Building or House :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <Input
                        className='input'
                        type='text'
                        name='buildingOrHouse'
                        value={InfData?.buildingOrHouse}
                        onChange={handleInputChange}
                      />
                      {InfData.buildingOrHouse === "" && (
                        <h1 className='error-text'>
                          Building Or House Required
                        </h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Street or Road :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <Input
                        className='input'
                        type='text'
                        name='streetOrRoad'
                        value={InfData.streetOrRoad}
                        onChange={handleInputChange}
                      />
                      {InfData?.streetOrRoad === "" && (
                        <h1 className='error-text'>Street Or Road Required</h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Area or Town :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>

                    <Input
                      className='input'
                      type='text'
                      name='areaOrTown'
                      value={InfData.areaOrTown}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Country, City or Postcode :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <MySelect
                        placeholder='Select City'
                        isSimple={true}
                        value={InfData.postcode}
                        options={options}
                        onChange={(value) =>
                          handleInputChange("postcode", value)
                        }
                      />
                      {InfData.postcode === "" && (
                        <h1 className='error-text'>
                          Country City Or Postcode Required
                        </h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Eircode :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input
                      className='input'
                      type='text'
                      name='eirCode'
                      value={InfData.eirCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Mobile :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <Input
                        className='input'
                        placeholder='000-000-0000'
                        type='number'
                        name='mobile'
                        value={InfData.mobile}
                        onChange={handleInputChange}
                      />
                      {InfData?.mobile === "" && (
                        <h1 className='error-text'>Mobile Required</h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Other Contact :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input
                      className='input'
                      placeholder='000-000-0000'
                      type='number'
                      name='otherContact'
                      value={InfData.otherContact}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Email :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <Input
                        className='input'
                        type='email'
                        name='email'
                        value={InfData.email}
                        onChange={handleInputChange}
                      />
                      {InfData?.email === "" && (
                        <h1 className='error-text'>Email Required</h1>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div
                className='detail-sub-con'
                style={{
                  border: "none",
                  backgroundColor: "white",
                  height: "auto",
                }}>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Rank :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      {/* <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                  Select Rank
                </Dropdown.Button> */}
                      <MySelect
                        placeholder='Select Rank'
                        isSimple={true}
                        options={options}
                        value={InfData.rank}
                        onChange={(value) => {
                          console.log("New rank", value);
                          handleInputChange("rank", value);
                        }}
                      />
                      {InfData.rank === "" && (
                        <h1 className='error-text'>Rank Required</h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className='lbl'>Duty:</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      {/* <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                  Select Duty
                </Dropdown.Button> */}
                      <MySelect
                        placeholder='Select Duty'
                        isSimple={true}
                        value={InfData.duty}
                        onChange={(value) => handleInputChange("duty", value)}
                      />
                      {InfData.duty === "" && (
                        <h1 className='error-text'>Duty Required</h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Division :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <MySelect
                        placeholder='Select Division'
                        isSimple={true}
                        value={InfData.Division}
                        onChange={(value) =>
                          handleInputChange("division", value)
                        }
                      />
                      {InfData.Division === "" && (
                        <h1 className='error-text'>Division Required</h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>District :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <MySelect
                        placeholder='Select District'
                        isSimple={true}
                        value={InfData.District}
                        onChange={(value) =>
                          handleInputChange("district", value)
                        }
                      />
                      {InfData.District === "" && (
                        <h1 className='error-text'>District Required</h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Station :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}>
                      {/* <div className="input-container-with-sup d-flex flex-column"> */}
                      {/* <Input
                    placeholder="Enter text"
                    style={{ width: '100%', borderRight: '1px solid #d9d9d9', borderRadius: '4px 0 0 4px', padding: '0px', paddingLeft: '5px', margin: '0px', height: '33px' }} // Adjust border style
                    suffix={<div className="suffix-container">
                      <BsThreeDots />
                    </div>}
                  /> */}
                      {/* <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                    Select Station
                  </Dropdown.Button> */}
                      <MySelect
                        placeholder='Select Station'
                        isSimple={true}
                        value={InfData.selectStation}
                        onChange={(value) =>
                          handleInputChange("station", value)
                        }
                      />
                      {InfData.selectStation === "" && (
                        <h1 className='error-text'>Station Required</h1>
                      )}
                    </div>
                    <Button
                      className='butn primary-btn detail-btn ms-2'
                      onClick={() => openCloseModalsFtn("TransferScreen")}>
                      Tr
                    </Button>
                  </div>
                </div>

                <div className='lbl-txtarea-2'>
                  <div className='title-cont-txtarea'>
                    <p className=''></p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <TextArea
                      rows={2}
                      style={{
                        width: "100%",
                        borderRadius: "3px",
                        borderColor: "D9D9D9",
                      }}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Station Phone : </p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input
                      value={InfData?.stationPh}
                      name='stationPh'
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Templemore :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <MyDatePicker
                        className='date-picker'
                        isSimple={true}
                        value={
                          InfData.dateOfTemplemore
                            ? moment(InfData.dateOfTemplemore, "DD/MM/YYYY")
                            : null
                        }
                        onChange={(date, dateString) => {
                          handleInputChange(
                            "dateOfTemplemore",
                            date ? date.format("DD/MM/YYYY") : null
                          ); // Pass the string value
                        }}
                        format='DD/MM/YYYY'
                      />
                      {InfData.dateOfTemplemore === "" && (
                        <h1 className='error-text'>Templemore Required</h1>
                      )}
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Retired :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <div className='checkbox-con'>
                      <div
                        style={{
                          backgroundColor: "white",
                          marginRight: "8px",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                        <Checkbox
                          name='isPensioner'
                          checked={InfData.isPensioner}
                          onChange={handleInputChange}
                        />
                      </div>
                      <MyDatePicker
                        value={
                          InfData.dateRetired
                            ? moment(InfData.dateRetired, "DD/MM/YYYY")
                            : null
                        }
                        onChange={(date, dateString) => {
                          handleInputChange(
                            "dateRetired",
                            date ? date.format("DD/MM/YYYY") : null
                          ); // Pass the string value
                        }}
                        format='DD/MM/YYYY'
                      />
                    </div>
                  </div>
                </div>

                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Pension No :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input
                      type='text'
                      placeholder='Enter something...'
                      disabled={!InfData?.isPensioner}
                      value={InfData?.pensionNo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Class :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con d-flex flex-column'>
                      <Input
                        type='text'
                        name='class'
                        value={InfData?.class}
                        onChange={handleInputChange}
                      />
                      {InfData?.class === "" && (
                        <h1 className='error-text'>Class Required</h1>
                      )}
                    </div>
                  </div>
                </div>

                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Attested :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <MyDatePicker
                      style={{ width: "100%", borderRadius: "3px" }}
                      value={
                        InfData.attested
                          ? moment(InfData.attested, "DD/MM/YYYY")
                          : null
                      }
                      onChange={(date, dateString) => {
                        handleInputChange(
                          "attested",
                          date ? date.format("DD/MM/YYYY") : null
                        ); // Pass the string value
                      }}
                      format='DD/MM/YYYY'
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Graduation :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <MyDatePicker
                      className='date-picker'
                      value={
                        InfData.graduation
                          ? moment(InfData.graduation, "DD/MM/YYYY")
                          : null
                      }
                      onChange={(date, dateString) => {
                        handleInputChange(
                          "graduation",
                          date ? date.format("DD/MM/YYYY") : null
                        ); // Pass the string value
                      }}
                      format='DD/MM/YYYY'
                    />
                  </div>
                </div>
                <div className='lbl-txtarea-2'>
                  <div className='title-cont-txtarea'>
                    <p className=''>Notes</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <TextArea
                      name='notes'
                      value={InfData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      style={{
                        width: "100%",
                        borderRadius: "3px",
                        borderColor: "D9D9D9",
                      }}
                    />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col></Col>
          </Row>
        </div>
      </MyDrawer>
    </>
  );
}

export default AddNewGarda;
