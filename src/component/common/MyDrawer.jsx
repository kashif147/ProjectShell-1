import { React, useState, useEffect, useContext } from "react";
import { Button, Drawer, Space, Pagination, Input, Table, Checkbox, Radio, } from "antd";
import MySelect from "./MySelect";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { FaFile } from "react-icons/fa";
import MyDatePicker from "./MyDatePicker";
import TextArea from "antd/es/input/TextArea";
import { FaUserAlt } from "react-icons/fa";
import { BiRefresh } from "react-icons/bi";
import { useDispatch, useSelector } from 'react-redux';
import '../../styles/MyDrawer.css'
import { useTableColumns } from '../../context/TableColumnsContext ';
import { ExcelContext } from "../../context/ExcelContext";
import { insertDataFtn } from "../../utils/Utilities";
import { useFormState } from "react-dom";
import { getContactTypes } from "../../features/ContactTypeSlice";
import MyConfirm from "../common/MyConfirm";
import { deleteFtn } from "../../utils/Utilities";
import { getContacts } from "../../features/ContactSlice";
import CommonPopConfirm from "./CommonPopConfirm";
import { baseURL } from "../../utils/Utilities";
import { useNavigate, useLocation } from "react-router-dom";
import CustomSelect from "./CustomSelect";
import MyInput from "./MyInput";
import {
  FaAngleLeft,
} from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa";


function MyDrawer({ title, open, onClose, children, add, width = 900, isHeader = false, isPagination = false, isContact = false, isEdit, update, isPyment = false, isAss = false, InfData, pymntAddFtn, pymentCloseFtn, isAddMemeber = false, isAprov = false, isrecursion = false, total, onChange, pageSize, showSizeChanger = true, showQuickJumper = true, isGarda, isAppRej, isGardaCheckbx, isManual, infoDataChk, isLoading, handleChangeApprove, rejFtn, draftFtn }) {
  const { selectLokups, lookupsForSelect, contactTypes, disableFtn, isDisable } = useTableColumns();
  const { excelData, selectedRowIndex, selectedRowData } = useContext(ExcelContext);
  const dispatch = useDispatch()
  const drawerInputsInitalValues = {
    Solicitors: {
      ContactName: "",
      ContactPhone: "",
      ContactEmail: "",
      ContactAddress: {
        BuildingOrHouse: "",
        StreetOrRoad: "",
        AreaOrTown: "",
        CityCountyOrPostCode: "",
        Eircode: ""
      },
      ContactTypeID: "",
      isDeleted: false
    },
  }
  const [contactDrawer, setcontactDrawer] = useState(false)
  useEffect(() => {
    if (contactDrawer) {
      dispatch(getContactTypes());
    }
  }, [contactDrawer]);
  const Navigate = useNavigate()
  const location = useLocation();
  const [drawerIpnuts, setdrawerIpnuts] = useState(drawerInputsInitalValues)
  const [isPayment, setisPayment] = useState(false)
  const [isAproved, setisAproved] = useState(false)
  const [isRecursion, setisRecursion] = useState(false)
  const [selectionType, setSelectionType] = useState('checkbox');
  const [recData, setrecData] = useState({
    timeDur: 'Day'
  })
  const [contact, setContact] = useState({
    Surname: "",
    Forename: "",
    ContactPhone: "",
    ContactEmail: "",
    ContactAddress: {
      BuildingOrHouse: "",
      StreetOrRoad: "",
      AreaOrTown: "",
      CityCountyOrPostCode: "",
      Eircode: "",
    },
    ContactTypeID: "",
    isDeleted: false,
  });
  const updateContact = (key, value) => {
    setContact((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const updateAddress = (key, value) => {
    setContact((prev) => ({
      ...prev,
      ContactAddress: {
        ...prev.ContactAddress,
        [key]: value,
      },
    }));
  };
  const [isEndDate, setisEndDate] = useState(true)
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };

  const drawrInptChng = (drawer, field, value) => {
    setdrawerIpnuts((prevState) => {
      // Check if the field is nested inside ContactAddress
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prevState,
          [drawer]: {
            ...prevState[drawer],
            [parent]: {
              ...prevState[drawer][parent], // Preserve existing values
              [child]: value, // Update only the specific nested field
            },
          },
        };
      } else {
        return {
          ...prevState,
          [drawer]: {
            ...prevState[drawer],
            [field]: value, // Update top-level field
          },
        };
      }
    });
  };

  const [errors, setErrors] = useState();
  const [isUpdate, setisUpdate] = useState();

  const validateSolicitors = (drawerType) => {
    let newErrors = { [drawerType]: {} };

    if (drawerType === "Solicitors") {
      if (!drawerIpnuts?.Solicitors?.Forename) {
        newErrors[drawerType].Forename = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.Surname) {
        newErrors[drawerType].Surname = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.ContactEmail) {
        newErrors[drawerType].ContactEmail = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.ContactPhone) {
        newErrors[drawerType].ContactPhone = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.ContactAddress?.BuildingOrHouse) {
        newErrors[drawerType].BuildingOrHouse = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.ContactAddress?.AreaOrTown) {
        newErrors[drawerType].AreaOrTown = "Required";
      }
    }
    // Set errors only if there are validation failures
    setErrors(newErrors);
    // Check if there are any errors in the object
    return Object.keys(newErrors[drawerType]).length === 0;
  };

  const CriticalIllnessSchemePaymentsClm = [
    {
      title: 'File Reference',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Amount',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Payment Date',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Cheque No',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },

    {
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" >
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const Clm = [
    {
      title: 'Meeting Type',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Meeting',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Meeting Date',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Meeting APL',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'APL Date',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Status',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },

    {
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" >
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];

  const optionForSelect = [
    { key: "1", label: "1" },
    { key: "2", label: "2" },
    { key: "3", label: "3" },
    { key: "4", label: "4" },
    { key: "5", label: "5" },
    { key: "6", label: "6" },
    { key: "7", label: "7" },
    { key: "8", label: "8" },
    { key: "9", label: "9" },
    { key: "10", label: "10" },
    { key: "11", label: "11" },
    { key: "12", label: "12" },
    { key: "13", label: "13" },
    { key: "14", label: "14" },
    { key: "15", label: "15" },
    { key: "16", label: "16" },
    { key: "17", label: "17" },
    { key: "18", label: "18" },
    { key: "19", label: "19" },
    { key: "20", label: "20" },
    { key: "21", label: "21" },
    { key: "22", label: "22" },
    { key: "23", label: "23" },
    { key: "24", label: "24" },
    { key: "25", label: "25" },
    { key: "26", label: "26" },
    { key: "27", label: "27" },
    { key: "28", label: "28" },
    { key: "29", label: "29" },
    { key: "30", label: "30" },
    { key: "31", label: "31" },
    { key: "32", label: "32" },
    { key: "33", label: "33" },
    { key: "34", label: "34" },
    { key: "35", label: "35" },
    { key: "36", label: "36" },
    { key: "37", label: "37" },
    { key: "38", label: "38" },
    { key: "39", label: "39" },
    { key: "40", label: "40" },
    { key: "41", label: "41" },
    { key: "42", label: "42" },
    { key: "43", label: "43" },
    { key: "44", label: "44" },
    { key: "45", label: "45" },
    { key: "46", label: "46" },
    { key: "47", label: "47" },
    { key: "48", label: "48" },
    { key: "49", label: "49" },
    { key: "50", label: "50" },
    { key: "51", label: "51" },
    { key: "52", label: "52" },
    { key: "53", label: "53" },
    { key: "54", label: "54" },
    { key: "55", label: "55" },
    { key: "56", label: "56" },
    { key: "57", label: "57" },
    { key: "58", label: "58" },
    { key: "59", label: "59" },
    { key: "60", label: "60" },
    { key: "61", label: "61" },
    { key: "62", label: "62" },
    { key: "63", label: "63" },
    { key: "64", label: "64" },
    { key: "65", label: "65" },
    { key: "66", label: "66" },
    { key: "67", label: "67" },
    { key: "68", label: "68" },
    { key: "69", label: "69" },
    { key: "70", label: "70" },
    { key: "71", label: "71" },
    { key: "72", label: "72" },
    { key: "73", label: "73" },
    { key: "74", label: "74" },
    { key: "75", label: "75" },
    { key: "76", label: "76" },
    { key: "77", label: "77" },
    { key: "78", label: "78" },
    { key: "79", label: "79" },
    { key: "80", label: "80" },
    { key: "81", label: "81" },
    { key: "82", label: "82" },
    { key: "83", label: "83" },
    { key: "84", label: "84" },
    { key: "85", label: "85" },
    { key: "86", label: "86" },
    { key: "87", label: "87" },
    { key: "88", label: "88" },
    { key: "89", label: "89" },
    { key: "90", label: "90" },
    { key: "91", label: "91" },
    { key: "92", label: "92" },
    { key: "93", label: "93" },
    { key: "94", label: "94" },
    { key: "95", label: "95" },
    { key: "96", label: "96" },
    { key: "97", label: "97" },
    { key: "98", label: "98" },
    { key: "99", label: "99" },
  ];
  const optionForyearorday = [
    { key: "Day", label: "Day" },
    { key: "Week", label: "Week" },
    { key: "Month", label: "Month" },
    { key: "Year", label: "Year" }
  ]
  const updateTimeDur = (name, value) => {
    setrecData((prevData) => ({
      ...prevData, // Spread the previous state to retain other properties
      [name]: value, // Update only the `timeDur` property
    }));
  };
  const { contactsLoading, } = useSelector(
    (state) => state.contactType
  );
  const [isUpdateRec, setisUpdateRec] = useState({ Solicitors: false })
  const addIdKeyToLookup = (idValue, drawer) => {
    setdrawerIpnuts((prev) => {
      if (!prev?.[drawer]) return prev; // Ensure the key exists in state
      return {
        ...prev,
        [drawer]: {
          ...prev[drawer],
          id: idValue,
        },
      };
    });
  };
  const [data, setdata] = useState({
    Solicitors: [],
  })
  const IsUpdateFtn = (drawer, value, data) => {
    if (value == false) {
      setisUpdateRec((prev) => ({
        ...prev,
        [drawer]: false,
      }));
      resetCounteries(drawer)
      return
    }
    setisUpdateRec((prev) => ({
      ...prev,
      [drawer]: value,
    }));

    const filteredData = Object.keys(drawerInputsInitalValues[drawer]).reduce((acc, key) => {
      if (data.hasOwnProperty(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    setdrawerIpnuts((prev) => ({
      ...prev,
      [drawer]: {
        ...prev[drawer],
        ...filteredData,
      },
    }));
  };
  const columnsSolicitors = [
    {
      title: "Surname",
      dataIndex: "Surname",
      key: "Surname",
    },
    {
      title: "Forename",
      dataIndex: "Forename",
      key: "Forename",
    },
    {
      title: "Phone",
      dataIndex: "ContactPhone",
      key: "ContactPhone",
    },
    {
      title: "Email",
      dataIndex: "ContactEmail",
      key: "ContactEmail",
    },
    {
      title: "Building/House",
      dataIndex: ["ContactAddress", "BuildingOrHouse"],
      key: "BuildingOrHouse",
    },
    {
      title: "Street/Road",
      dataIndex: ["ContactAddress", "StreetOrRoad"],
      key: "StreetOrRoad",
    },
    {
      title: "Area/Town",
      dataIndex: ["ContactAddress", "AreaOrTown"],
      key: "AreaOrTown",
    },
    {
      title: "City/Postcode",
      dataIndex: ["ContactAddress", "CityCountyOrPostCode"],
      key: "CityCountyOrPostCode",
    },
    {
      title: "Eircode",
      dataIndex: ["ContactAddress", "Eircode"],
      key: "Eircode",
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" >
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Solicitors', !isUpdateRec?.Solicitors, record)
            addIdKeyToLookup(record?._id, "Solicitors")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/contact`, record?._id,);
                dispatch(getContacts())
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const resetCounteries = (drawer, callback) => {
    setdrawerIpnuts((prevState) => ({
      ...prevState,
      [drawer]: drawerInputsInitalValues[drawer],
    }));
    if (callback & typeof callback === 'function') {
      callback()
    }
  };
  const addFtn = () => {
    if (!validateSolicitors('Solicitors')) return;
    insertDataFtn(`/contact`, drawerIpnuts?.Solicitors,
      'Data inserted successfully:', 'Data did not insert:', () => {
        resetCounteries('Solicitors')
      })
  }
  return (
    <Drawer
      width={width}
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      extra={
        <div className="d-flex space-evenly gap-3" >
          {
            isContact && (
              <div className="mx-auto" style={{ marginRight: '80%' }}>
                <Button onClick={() => setcontactDrawer(!contactDrawer)}
                  className="butn" style={{ color: '#215E97', marginRight: '250px' }}>
                  Add Contact
                </Button>
              </div>
            )
          }
          {
            isAddMemeber && (
              <div className="mx-auto" style={{}}>
                <Button onClick={() => setcontactDrawer(!contactDrawer)}
                  className="butn" style={{ color: '#215E97', marginLeft: '-80%' }}>
                  <FaUserAlt />
                  Add Member
                </Button>
              </div>
            )
          }
          {
            isPyment && (
              <div className="" style={{ marginRight: '' }}>
                <Button onClick={() => setisPayment(!isPayment)}
                  className="butn secondary me-2" style={{ color: '#215E97', marginRight: '' }}>
                  Add Payment
                </Button>
              </div>
            )
          }
          {
            isAprov && (
              <div className="mx-auto" style={{ marginRight: '', color: '#215E97', }}>
                <Button onClick={() => setisAproved(!isAproved)} className="butn secondary me-2" style={{ color: '#215E97', }}

                >
                  Approvals

                </Button>
              </div>
            )
          }
          {
            isrecursion && (
              <div className="mx-auto" style={{ marginRight: '', color: '#215E97', }}>
                <Button onClick={() => setisRecursion(!isRecursion)} className="butn secondary me-2" style={{ color: '#215E97', }}
                >
                  Recursion
                  <BiRefresh style={{ fontSize: "24px" }} />
                </Button>
              </div>
            )
          }

          <Space>
            {
              isAss == true && (
                <>
                  <Button className="gray-btn butn" onClick={onClose}>
                    <FaFile />
                    NOK
                  </Button>
                  <Button className="gray-btn butn" >
                    <FaFile />
                    Ins.Co.
                  </Button>
                </>
              )
            }

            {
              isGardaCheckbx && (
                <Checkbox>Multiple</Checkbox>
              )
            }
            {isAppRej && (
              <Radio.Group>
                <Radio value="approved" onClick={handleChangeApprove}>
                  Approve
                </Radio>
                <CommonPopConfirm
                  title="Are you sure you want to reject?"
                  onConfirm={rejFtn}
                >
                  <Radio value="rejected">Reject</Radio>
                </CommonPopConfirm>
              </Radio.Group>
            )}


            <Button className="butn secoundry-btn me-4" onClick={onClose}>
              Close
            </Button>
            {
              !isGarda ?
                <Button className="butn primary-btn"
                  // onClick={isEdit == true ? update : add} onKeyDown={(event) => event.key === "Enter" && (isEdit ? update() : add())}>
                  onClick={async () => {
                    if (isDisable && location?.pathname != "/Batches") {
                      disableFtn(false);
                    } else if (!isEdit && !location?.pathname != "/Batches") {
                      add();
                    }
                    else if (location?.pathname === "/Batches") {

                      await Navigate('/BatchMemberSummary', {
                        state: {
                          search: "BatchMemberSummary",
                        }
                      });
                      onClose()
                    }
                    else {
                      update();
                    }

                  }}>
                  {isDisable == true && !isManual ? "Add" : 'Save'}
                </Button>
                :
                <>
                  {/* <Radio.Group
                    options={optionsWithDisabled}
                    value={value4}
                    onChange={(e) => setValue4(e.target.value)}
                    optionType='button'
                    buttonStyle='solid'
                  /> */}
                  {/* <Checkbox.Group
                    value={[infoDataChk?.status]}
                    // onChange={(val) => handleInputChange("status", val[0])
                      
                    // }
                  > */}

                  {/* </Checkbox.Group> */}

                </>

            }
            {
              isGarda || isManual && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Button className="me-1 gray-btn butn">
                    <FaAngleLeft className="deatil-header-icon" />
                  </Button>
                  <p style={{ fontWeight: "500", fontSize: "14px", margin: "0 8px" }}>{selectedRowIndex} of {selectedRowData?.length}</p>
                  <Button className="me-1 gray-btn butn">
                    <FaAngleRight className="deatil-header-icon" />
                  </Button>
                </div>
              )
            }

          </Space>
          {
            title === "Registration Request" && isDisable===false &&
            <Button className="butn primary-btn" onClick={draftFtn}>
              Draft
            </Button>
          }
        </div>
      }
    >
      <div className="">

        {children}
        {
          isPagination &&
          (
            <div style={{ width: '100%', backgroundColor: 'red' }}>
              <div className="bottom-div">
                <Pagination
                  total={total}
                  showSizeChanger={showSizeChanger}
                  showQuickJumper={showQuickJumper}
                  showTotal={(total) => `Total ${total} items`}
                  onChange={onChange}
                  pageSize={pageSize}
                />

              </div>
            </div>
          )
        }
      </div>
      {/* <Drawer open={contactDrawer}
        onClose={() => setcontactDrawer(!contactDrawer)}
        width="740px"
        title="Contacts123"
        extra={
          <Space>
            <Button className="butn secoundry-btn" onClick={() => setcontactDrawer(!contactDrawer)}>
              Close
            </Button>

            <Button className="butn primary-btn"
              onClick={isUpdate?.Contacts == true ? update : addFtn}
              onKeyDown={(event) => event.key === "Enter" && (isUpdate?.Contacts ? update() : addFtn())}>
              {isUpdate?.Contacts == true ? "Save" : 'Add'}
            <                                                                                                   /Button>
          </Space>
        }
      >
        <div className="drawer-main-cntainer">
          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container" style={{ width: "25%" }}>
              <p>Lookup for</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <MySelect
                  isSimple={true}
                  placeholder={title}
                  value={drawerIpnuts?.Solicitors?.ContactTypeID}
                  options={selectLokups?.contactTypes}
                />
                <p className="error">{errors?.Solicitors?.ContactTypeID}</p>
              </div>
            </div>
          </div>
          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container" style={{ width: "25%" }}>
              <p>Contact Type :</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <MySelect
                  isSimple={true}
                  placeholder="Select Contact type"
                  value={drawerIpnuts?.Solicitors?.ContactTypeID}
                  options={selectLokups?.contactTypes}
                />
                <p className="error">{errors?.Solicitors?.ContactTypeID}</p>
              </div>
            </div>
          </div>

          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container" style={{ width: "25%" }}>
              <p>Name :</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input
                  className="inp"
                  value={drawerIpnuts?.Solicitors?.ContactName}
                  onChange={(e) => drawrInptChng("Solicitors", "ContactName", e.target.value)}
                />
                <p className="error">{errors?.Solicitors?.ContactName}</p>
              </div>
            </div>
          </div>

          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container" style={{ width: "25%" }}>
              <p>Email :</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input
                  value={drawerIpnuts?.Solicitors?.ContactEmail}
                  onChange={(e) => drawrInptChng("Solicitors", "ContactEmail", e.target.value)}
                />
                <p className="error">{errors?.Solicitors?.ContactEmail}</p>
              </div>
            </div>
          </div>

          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container" style={{ width: "25%" }}>
              <p>Phone :</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input
                  value={drawerIpnuts?.Solicitors?.ContactPhone}
                  onChange={(e) => drawrInptChng("Solicitors", "ContactPhone", e.target.value)}
                />
                <p className="error">{errors?.Solicitors?.ContactPhone}</p>
              </div>
            </div>
          </div>

          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container" style={{ width: "25%" }}>
              <p>Building or House :</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input
                  value={drawerIpnuts?.Solicitors?.ContactAddress?.BuildingOrHouse}
                  onChange={(e) => drawrInptChng("Solicitors", "ContactAddress.BuildingOrHouse", e.target.value)}
                />
                <p className="error">{errors?.Solicitors?.["ContactAddress.BuildingOrHouse"]}</p>
              </div>
            </div>
          </div>

          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container" style={{ width: "25%" }}>
              <p>Street or Road :</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input
                  value={drawerIpnuts?.Solicitors?.ContactAddress?.StreetOrRoad}
                  onChange={(e) => drawrInptChng("Solicitors", "ContactAddress.StreetOrRoad", e.target.value)}
                />
                <p className="error">{errors?.Solicitors?.["ContactAddress.StreetOrRoad"]}</p>
              </div>
            </div>
          </div>

          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container" style={{ width: "25%" }}>
              <p>City, County or Postcode :</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input
                  value={drawerIpnuts?.Solicitors?.ContactAddress?.CityCountyOrPostCode}
                  onChange={(e) => drawrInptChng("Solicitors", "ContactAddress.CityCountyOrPostCode", e.target.value)}
                />
                <p className="error">{errors?.Solicitors?.["ContactAddress.CityCountyOrPostCode"]}</p>
              </div>
            </div>
          </div>

          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container" style={{ width: "25%" }}>
              <p>Eircode :</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input
                  value={drawerIpnuts?.Solicitors?.ContactAddress?.Eircode}
                  onChange={(e) => drawrInptChng("Solicitors", "ContactAddress.Eircode", e.target.value)}
                />
                <p className="error">{errors?.Solicitors?.["ContactAddress.Eircode"]}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={solicitorColumns}
              //  dataSource={lookups}
              //  loading={lookupsloading}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />
          </div>
        </div>
      </Drawer> */}
      <Drawer
        open={contactDrawer}
        onClose={() => setcontactDrawer(!contactDrawer)}
        width="1040px"
        title="Contacts"
        extra={
          <Space>
            <Button className="butn secoundry-btn" onClick={() => setcontactDrawer(!contactDrawer)}>
              Close
            </Button>
            <Button
              className="butn primary-btn"
              onClick={isUpdate?.Contacts == true ? update : addFtn}
              onKeyDown={(event) => event.key === "Enter" && (isUpdate?.Contacts ? update() : addFtn())}
            >
              {isUpdate?.Contacts == true ? "Save" : 'Add'}
            </Button>
          </Space>
        }
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <CustomSelect
              label="Contact Type:"
              placeholder="Select Contact type"
              options={selectLokups?.contactTypes}
              value={drawerIpnuts?.Solicitors?.ContactTypeID}
              onChange={(e) => drawrInptChng('Solicitors', 'ContactTypeID', e)}
              required
              hasError={!!errors?.Solicitors?.ContactTypeID}
              errorMessage={errors?.Solicitors?.ContactTypeID}
              style={{ width: "25%" }}
            />

            <CustomSelect
              label="Title:"
              placeholder="Select Title"
              options={lookupsForSelect?.Titles}
              style={{ width: "25%" }}
            />

            <MyInput
              label="Forename:"
              name="Forename"
              placeholder="Enter forename"
              value={drawerIpnuts?.Solicitors?.Forename}
              onChange={(e) => drawrInptChng('Solicitors', 'Forename', e.target.value)}
              required
              hasError={!!errors?.Solicitors?.Forename}
              errorMessage={errors?.Solicitors?.Forename}
              style={{ width: "25%" }}
            />

            <MyInput
              label="Surname:"
              name="Surname"
              placeholder="Enter surname"
              value={drawerIpnuts?.Solicitors?.Surname}
              onChange={(e) => drawrInptChng('Solicitors', 'Surname', e.target.value)}
              required
              hasError={!!errors?.Solicitors?.Surname}
              errorMessage={errors?.Solicitors?.Surname}
              style={{ width: "25%" }}
            />

            <MyInput
              label="Email:"
              name="ContactEmail"
              type="email"
              placeholder="Enter email"
              value={drawerIpnuts?.Solicitors?.ContactEmail}
              onChange={(e) => drawrInptChng('Solicitors', 'ContactEmail', e.target.value)}
              required
              hasError={!!errors?.Solicitors?.ContactEmail}
              errorMessage={errors?.Solicitors?.ContactEmail}
              style={{ width: "25%" }}
            />

            <MyInput
              label="Mobile:"
              name="ContactPhone"
              placeholder="Enter mobile number"
              value={drawerIpnuts?.Solicitors?.ContactPhone}
              onChange={(e) => drawrInptChng('Solicitors', 'ContactPhone', e.target.value)}
              required
              hasError={!!errors?.Solicitors?.ContactPhone}
              errorMessage={errors?.Solicitors?.ContactPhone}
              style={{ width: "25%" }}
            />

            <MyInput
              label="Building or House:"
              name="BuildingOrHouse"
              placeholder="Enter building/house"
              value={drawerIpnuts?.Solicitors?.ContactAddress?.BuildingOrHouse}
              onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.BuildingOrHouse', e.target.value)}
              required
              hasError={!!errors?.Solicitors?.BuildingOrHouse}
              errorMessage={errors?.Solicitors?.BuildingOrHouse}
              style={{ width: "25%" }}
            />

            <MyInput
              label="Street or Road:"
              name="StreetOrRoad"
              placeholder="Enter street/road"
              value={drawerIpnuts?.Solicitors?.ContactAddress?.StreetOrRoad}
              onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.StreetOrRoad', e.target.value)}
              style={{ width: "25%" }}
            />

            <MyInput
              label="Area or Town:"
              name="AreaOrTown"
              placeholder="Enter area/town"
              value={drawerIpnuts?.Solicitors?.ContactAddress?.AreaOrTown}
              onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.AreaOrTown', e.target.value)}
              required
              hasError={!!errors?.Solicitors?.AreaOrTown}
              errorMessage={errors?.Solicitors?.AreaOrTown}
              style={{ width: "25%" }}
            />

            <MyInput
              label="County, City or Postcode:"
              name="CityCountyOrPostCode"
              placeholder="Enter county/city/postcode"
              value={drawerIpnuts?.Solicitors?.ContactAddress?.CityCountyOrPostCode}
              onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.CityCountyOrPostCode', e.target.value)}
              style={{ width: "25%" }}
            />

            <MyInput
              label="Eircode:"
              name="Eircode"
              placeholder="Enter Eircode"
              value={drawerIpnuts?.Solicitors?.ContactAddress?.Eircode}
              onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.Eircode', e.target.value)}
              style={{ width: "25%" }}
            />
          </div>

          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnsSolicitors}
              dataSource={data?.Solicitors}
              loading={contactsLoading}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />
          </div>
        </div>
      </Drawer>
      <Drawer open={isRecursion}
        onClose={() => setisRecursion(!isRecursion)}
        width="526px"
        title="Repeat"
        extra={
          <Space>
            <Button className="butn secoundry-btn" onClick={() => setisRecursion(!isRecursion)}>
              Close
            </Button>
            <Button className="butn primary-btn" onClick={() => setisRecursion(!isRecursion)}>
              Add
            </Button>

          </Space>
        }

      >
        <div className='transfer-main-cont'>
          <div className="details-drawer mb-4">
            <p>{InfData?.gardaRegNo}45217A</p>
            <p>{InfData?.fullname}Jack Smith</p>
            <p>Garda</p>
          </div>
          <div className="row">
            <div className="col-md-2">
              Start
            </div>
            <div className="col-md-10">
              <MyDatePicker />
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-md-2">
              <BiRefresh style={{ fontSize: '24px' }} />
            </div>
            <div className="col-md-10">
              <div className="d-flex align-items-baseline">
                <div className="w-25 me-2">
                  Repeat Every
                </div>
                <div className="w-10 me-2" >
                  <MySelect options={optionForSelect} />
                </div>
                <div className="w-25 me-2" >
                  <MySelect onChange={(e) => updateTimeDur('timeDur', e)} options={optionForyearorday} value={recData?.timeDur} />
                </div>
              </div>
              {
                (recData?.timeDur === "Week" || recData?.timeDur === "Day") && (
                  <div>

                    <div className="d-flex mt-4 align-items-baseline">
                      <div className="day-con ">
                        M
                      </div>
                      <div className="day-con">
                        T
                      </div>
                      <div className="day-con">
                        W
                      </div>
                      <div className="day-con">
                        T
                      </div>
                      <div className="day-con">
                        F
                      </div>
                      <div className="day-con">
                        S
                      </div>
                      <div className="day-con">
                        S
                      </div>
                    </div>
                    <div className="pt-3 d-flex flex-column ">
                      <p>
                        Occurs every Tuesday until{
                          isEndDate === true && (recData?.timeDur === "Week" || recData?.timeDur === "Day") && (
                            <span onClick={() => setisEndDate(false)} style={{ cursor: "pointer", color: '#215E97' }}> Choose an end date</span>
                          )
                        }
                      </p>
                      {
                        isEndDate === false && (recData?.timeDur === "Week" || recData?.timeDur === "Day") &&
                        (
                          <div className="d-flex ">
                            <div style={{ width: '50%' }} className="me-4">
                              <MyDatePicker />
                            </div>
                            <p style={{ cursor: 'pointer', color: '#215E97' }} onClick={() => setisEndDate(true)}>Remove end Date</p>
                          </div>)
                      }
                    </div>
                  </div>
                )}{
                (recData?.timeDur === "Year" || recData?.timeDur === "Month") &&
                (
                  <div className="d-flex flex-column pt-4">
                    <Checkbox>
                      On December 16
                    </Checkbox>
                    <Checkbox>
                      On third Monday of December
                    </Checkbox>
                    <div className="pt-3 d-flex flex-column">
                      <p>
                        Occur on day 16 of every month{
                          isEndDate === true && (recData?.timeDur === "Year" || recData?.timeDur === "Month") && (
                            <span onClick={() => setisEndDate(false)} style={{ cursor: "pointer", color: '#215E97' }}> Choose an end date</span>
                          )
                        }
                      </p>
                      {
                        isEndDate === false && (
                          <div className="d-flex ">
                            <div style={{ width: '50%' }} className="me-4">
                              <MyDatePicker />
                            </div>
                            <p style={{ cursor: 'pointer', color: '#215E97' }} onClick={() => setisEndDate(true)}>Remove end Date</p>
                          </div>
                        )
                      }
                    </div>
                  </div>

                )
              }
              {/* <div>
                {
                  isEndDate === false && (
                    <div className="d-flex ">
                      <div style={{ width: '50%' }} className="me-4">
                        <MyDatePicker />
                      </div>
                      <p style={{ cursor: 'pointer' }} onClick={() => setisEndDate(true)}>Remove end Date</p>
                    </div>
                  )
                }
              </div> */}
            </div>
          </div>
        </div>

      </Drawer>
      <Drawer open={isPayment}
        onClose={() => setisPayment(!isPayment)}
        width="526px"
        title="Critical Illness Scheme Payments"
        extra={
          <Space>
            <Button className="butn secoundry-btn" onClick={() => setisPayment(!isPayment)}>
              Close
            </Button>
            <Button className="butn primary-btn" onClick={pymntAddFtn}>
              Add
            </Button>

          </Space>
        }

      >
        <div className='transfer-main-cont'>
          <div className="details-drawer mb-4">
            <p>{InfData?.gardaRegNo}</p>
            <p>{InfData?.fullname}</p>
            <p>Garda</p>
          </div>
          <div className='w-100'>

            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>File Reference :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Payment Amount :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input placeholder="0.00" type="number" />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Payment Date :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <MyDatePicker />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Cheque # :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Refund Amount :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input placeholder="0.00" disabled={true} />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Refund Date :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <MyDatePicker />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container " style={{ height: '100px' }}>
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Memo :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <TextArea rows={4} placeholder="Autosize height based on content lines" />

                </div>
                <p className="error"></p>
              </div>
            </div>

          </div>
          <h5>History</h5>
          <Table
            pagination={false}
            columns={CriticalIllnessSchemePaymentsClm}
            className="drawer-tbl"
            rowClassName={(record, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
            bordered
          />
        </div>

      </Drawer>
      <Drawer open={isAproved}
        onClose={() => setisAproved(!isAproved)}
        width="867px"
        title="Approvals"
        extra={
          <Space>
            <Button className="butn secoundry-btn" onClick={() => setisAproved(!isAproved)}>
              Close
            </Button>
            <Button className="butn primary-btn" onClick={() => { }}>
              Add
            </Button>

          </Space>
        }

      >
        <div className='transfer-main-cont'>
          <div className="details-drawer mb-4">
            <p>{InfData?.gardaRegNo}</p>
            <p>{InfData?.fullname}</p>
            <p>Garda</p>
          </div>
          <div className='w-100'>
            <div className="row">
              <div className="col-md-6">
                <div className="drawer-inpts-container " style={{}}>
                  <div className="drawer-lbl-container" style={{ width: "40%", }}>
                    <p>Meeting Type :</p>
                  </div>
                  <div className="inpt-con" style={{ width: '60%', }} >
                    <p className="star">*</p>
                    <div className="inpt-sub-con" >
                      <MySelect placeholder="Select Meeting Type" isSimple={true} />
                    </div>
                    <p className="error"></p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="drawer-inpts-container " style={{}}>
                  <div className="drawer-lbl-container" style={{ width: "40%", }}>
                    <p></p>
                  </div>
                  <div className="inpt-con" style={{ width: '60%', }} >
                    <p className="star-white">*</p>
                    <div className="inpt-sub-con" >

                    </div>
                    <p className="error"></p>
                  </div>
                </div>
              </div>

            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="drawer-inpts-container " style={{}}>
                  <div className="drawer-lbl-container" style={{ width: "40%", }}>
                    <p>Meeting Date :</p>
                  </div>
                  <div className="inpt-con" style={{ width: '60%', }} >
                    <p className="star">*</p>
                    <div className="inpt-sub-con" >
                      <MySelect placeholder="Select Meeting Type" isSimple={true} />
                    </div>
                    <p className="error"></p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="drawer-inpts-container " style={{}}>
                  <div className="drawer-lbl-container" style={{ width: "40%", }}>
                    <p>Meeting Date APL :</p>
                  </div>
                  <div className="inpt-con" style={{ width: '60%', }} >
                    <p className="star-white">*</p>
                    <div className="inpt-sub-con" >
                      <MyDatePicker />
                    </div>
                    <p className="error"></p>
                  </div>
                </div>

              </div>

            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="drawer-inpts-container " style={{}}>
                  <div className="drawer-lbl-container" style={{ width: "40%", }}>
                    <p>Meeting Outcome :</p>
                  </div>
                  <div className="inpt-con" style={{ width: '60%', }} >
                    <p className="star">*</p>
                    <div className="inpt-sub-con" >
                      <Input />
                    </div>
                    <p className="error"></p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="drawer-inpts-container " style={{}}>
                  <div className="drawer-lbl-container" style={{ width: "40%", }}>
                    <p>Meeting APL Outcome :</p>
                  </div>
                  <div className="inpt-con" style={{ width: '60%', }} >
                    <p className="star-white">*</p>
                    <div className="inpt-sub-con" >
                      <MyDatePicker />
                    </div>
                    <p className="error"></p>
                  </div>
                </div>

              </div>

            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="drawer-inpts-container " style={{}}>
                  <div className="drawer-lbl-container" style={{ width: "40%", }}>
                    <p>Meeting Status :</p>
                  </div>
                  <div className="inpt-con" style={{ width: '60%', }} >
                    <p className="star">*</p>
                    <div className="inpt-sub-con" >
                      <Input />
                    </div>
                    <p className="error"></p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="drawer-inpts-container " style={{}}>
                  <div className="drawer-lbl-container" style={{ width: "40%", }}>
                    <p>Authorised Amount :</p>
                  </div>
                  <div className="inpt-con" style={{ width: '60%', }} >
                    <p className="star-white">*</p>
                    <div className="inpt-sub-con" >
                      <Input placeholder="0.00" disabled={true} />
                    </div>
                    <p className="error"></p>
                  </div>
                </div>

              </div>

            </div>



          </div>
          <h5>History</h5>
          <Table
            pagination={false}
            columns={Clm}
            className="drawer-tbl"
            rowClassName={(record, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
            bordered
          />
        </div>

      </Drawer>
    </Drawer>
  );
}

export default MyDrawer;
