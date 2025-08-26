import { useState, React, useRef, useEffect, useMemo } from "react";
import { Table, Checkbox, DatePicker, Modal, TimePicker, Radio } from 'antd'
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  RightOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { usePDF } from "react-to-pdf";
import { FaUser, } from "react-icons/fa6";
import { BsSliders, BsThreeDots } from "react-icons/bs";
import { FaAngleRight } from "react-icons/fa";
import {
  SearchOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import ContactDrawer from "./ContactDrawer";
import JiraLikeMenu from "./JiraLikeMenu";
import { useTableColumns } from "../../context/TableColumnsContext ";
import SimpleMenu from "./SimpleMenu";
import MyDrawer from "./MyDrawer";
import { Input, Button, Row, Upload, message, Col } from "antd";
import MySelect from "./MySelect";
import { IoSettingsOutline } from "react-icons/io5";
import {
  FaListCheck,
  FaCalendarDays,
  FaClipboardList,
  FaAngleLeft,
  FaEnvelopesBulk,
} from "react-icons/fa6";
import { LuArrowLeftRight } from "react-icons/lu";
import { FaMoneyCheckAlt } from "react-icons/fa";
import DateRang from "./DateRang";
import CreateBatchPayment from "./CreateBatchPayment";
import '../../styles/HeaderDetails.css'
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { fetchRegions } from "../../features/RegionSlice";
import AddNewGarda from "../details/AddNewGarda";
import TransferRequests from "../TransferRequests";
import MyDatePicker from "./MyDatePicker";
import New from "../corespondence/New";
import CreateClaim from "../claim/CreateClaim";
import ChangeCategoryDrawer from "../details/ChangeCategoryDrawer";
import MyInput from "./MyInput";
import CustomSelect from "./CustomSelect";
import ActionDropdown from "./ActionDropdown";
import { getAllApplications } from "../../features/ApplicationSlice";
import MultiFilterDropdown from "./MultiFilterDropdown";
import SaveViewMenu from "./SaveViewMenu";

function HeaderDetails() {
  const { Search } = Input;
  const { TextArea } = Input;
  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });
  const location = useLocation();
  const currentURL = `${location?.pathname}`;
  const nav = location?.pathname || "";
  const formattedNav = nav.replace(/^\//, " ");
  const [isSideNav, setisSideNav] = useState(true);
  const [ReportName, setReportName] = useState(null)
  const [imageUrl, setImageUrl] = useState("");
  const [checkboxes, setCheckboxes] = useState();
  const [trueFilters, settrueFilters] = useState();
  const [create, setCreate] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [TransferDrawer, setTransferDrawer] = useState(false)
  const [rosterDrawer, setrosterDrawer] = useState(false)
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [aprove, setaprove] = useState("001")
  const [isDrawerOpen, setisDrawerOpen] = useState(false)

  const showHidSavModal = () => {
    setIsSaveModalOpen(!isSaveModalOpen);
  };
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { searchFilters, lookupsForSelect, filterGridDataFtn, handlClaimDrawerChng, claimsDrawer, ProfileDetails, resetFilters, handleSave, report, isSaveChng, ReportsTitle, profilNextBtnFtn, profilPrevBtnFtn, gridData, rowIndex, resetFtn, globleFilters, } = useTableColumns();

  const plainOptions = ['Approve', 'Reject'];
  const screenName = location?.state?.search
  const format = 'HH:mm';
  const column = [
    {
      title: 'Title',
      dataIndex: 'Title',
      key: 'Title',
    },
    {
      title: 'Invite Attendies',
      dataIndex: 'Invite Attendies',
      key: 'Invite Attendies',
    },
    {
      title: 'Start Time',
      dataIndex: 'Start Time',
      key: 'Start Time',
    },
    {
      title: 'End Time',
      dataIndex: 'End Time',
      key: 'End Time',
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
    },
  ]
  const handleAction = (label, e) => {
    console.log("Label:", label);
    console.log("Event type:", e?.type); // now safe
  };
  const [contactDrawer, setcontactDrawer] = useState(false)

  const menuItems = [
    { label: "Bulk Changes", onClick: (e) => handleAction("Bulk Changes", e) },
    { label: "Print Labels", onClick: (e) => handleAction("Print Labels", e) },
    { label: "Generate Bulk NFC Tag", onClick: (e) => handleAction("Generate Bulk NFC Tag", e) },
    { label: "Bulk Email", onClick: (e) => handleAction("Bulk Email", e) },
    { label: "Bulk SMS", onClick: (e) => handleAction("Bulk SMS", e) },
    {
      label: "Assign IRO", onClick: (e) => {
        e?.domEvent?.stopPropagation();
        setcontactDrawer((prev) => !prev)
      }
    },
  ];
  const [statusOperator, setStatusOperator] = useState("==");
  const [statusValues, setStatusValues] = useState(["submitted", "draft"]);

  const handleApplyStatusFilter = () => {
    if (statusValues.length === 0) return;
    const allStatuses = ["submitted", "approved", "rejected", "in-progress"];
    const finalStatuses = statusOperator === '=='
      ? statusValues
      : allStatuses.filter((status) => !statusValues.includes(status));
    dispatch(getAllApplications(finalStatuses));
  };

  function filterSearchableColumns(data) {
    if (data) {
      const filteredResults = globleFilters?.reduce((acc, i) => {
        const filteredColumns = data.filter(
          (column) => column?.titleColumn === i?.titleColumn && i?.isCheck
        );
        return [...acc, ...filteredColumns];
      }, []);
      console.log(data, "data")
      settrueFilters(filteredResults);
      console.log(filteredResults, "filteredResults")
    }
  }
  console.log(trueFilters, "trueFilters")
  const currentSearchFilters = useMemo(() => {
    return searchFilters[screenName];
  }, [screenName, searchFilters]);

  useEffect(() => {
    if (screenName && currentSearchFilters) {
      filterSearchableColumns(currentSearchFilters, globleFilters);
    }
  }, [screenName, globleFilters]);
  const genaratePdf = (e) => {
    toPDF();
  };
  const dispatch = useDispatch();

  const regions = useSelector((state) => state.regions.regions, shallowEqual);
  useEffect(() => {
    dispatch(fetchRegions());
  }, [dispatch]);

  const gender = {
    Male: false,
    Female: false,
    "Not Specified": false,
  };

  const Mebership = {
    Probation: false,
    Trainee: false,
    Associate: false,
    Retired: false,
  };

  const Gender = [
    {
      key: "1",
      label: "Male",
    },
    {
      key: "2",
      label: "Female",
    },
    {
      key: "3",
      label: "Not Specified",
    },
  ];

  const Partnershipstatus = [
    {
      key: "1",
      label: "Single",
    },
    {
      key: "2",
      label: "Married",
    },
    {
      key: "3",
      label: "Seperated",
    },
    {
      key: "4",
      label: "Divorced",
    },
  ];

  const addMore = [
    { titleColumn: "Reg No", ellipsis: true, isGride: true, width: "100px" },
    { titleColumn: "Forename", ellipsis: true, isGride: true, width: "120px" },
    { titleColumn: "Surname", ellipsis: true, isGride: true, width: "420px" },
    { titleColumn: "Full Name", ellipsis: true, isGride: true, width: "420px" },
    {
      titleColumn: "Date Of Birth",
      ellipsis: true,
      isGride: true,
      width: "420px",
    },
    {
      titleColumn: "Date Retired",
      ellipsis: true,
      isGride: true,
      width: "420px",
    },
    {
      titleColumn: "Date Aged 65",
      ellipsis: true,
      isGride: true,
      width: "420px",
    },
    {
      titleColumn: "Date Of Death",
      ellipsis: true,
      isGride: true,
      width: "420px",
    },
    { titleColumn: "Rank", ellipsis: true, isGride: true, width: "100px" },
    { titleColumn: "Duty", ellipsis: true, isGride: true, width: "100px" },
    { titleColumn: "Station", ellipsis: true, isGride: true, width: "100px" },
    {
      titleColumn: "Station ID",
      ellipsis: true,
      isGride: true,
      width: "100px",
    },
    {
      titleColumn: "Station Ph",
      ellipsis: true,
      isGride: true,
      width: "100px",
    },
    {
      titleColumn: "Pension No",
      ellipsis: true,
      isGride: true,
      width: "100px",
    },
    {
      titleColumn: "GRA Member",
      ellipsis: true,
      isGride: true,
      width: "100px",
    },
    {
      titleColumn: "Date Joined",
      ellipsis: true,
      isGride: true,
      width: "100px",
    },
    { titleColumn: "Date Left", ellipsis: true, isGride: true, width: "100px" },
    {
      titleColumn: "Associate Member",
      ellipsis: true,
      isGride: true,
      width: "100px",
    },
    { titleColumn: "District", ellipsis: true, isGride: true, width: "100px" },
    { titleColumn: "Division", ellipsis: true, isGride: true, width: "100px" },
    { titleColumn: "Address", ellipsis: true, isGride: true, width: "250px" },
    { titleColumn: "Status", ellipsis: true, isGride: true, width: "100px" },
    { titleColumn: "Updated", ellipsis: true, isGride: true, width: "100px" },
  ];
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',   // The key in the data object corresponding to the name
      key: 'name',         // A unique key for this column
    },
    {
      title: 'Reg Number',
      dataIndex: 'regNumber', // The key in the data object corresponding to the registration number
      key: 'regNumber',       // A unique key for this column
    },
  ];
  const exportbtn = { "Export PDF": true, "Export CSV": true };
  const [isGardaDrwer, setisGardaDrwer] = useState(false)
  const topThreeDots = {
    BulkChnages: "false",
  };
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedValue1, setSelectedValue1] = useState('');
  const handleChangeCheckBox = (checkedValues) => {
    // Only keep the last selected option
    const latest = checkedValues[checkedValues.length - 1];
    setSelectedValue1(latest ? [latest] : []);
  };
  const [loading, setLoading] = useState(false);

  const handleChange = (value) => {
    setSelectedValue(value);
  };
  const goBack = () => {
    navigate(-1);
  };

  const handleChange1 = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      setLoading(false);
      setImageUrl(info.file.response.url);
      message.success("Image uploaded successfully");
    } else if (info.file.status === "error") {
      setLoading(false);
      message.error("Image upload failed.");
    }
  };

  const customRequest = ({ file, onSuccess, onError }) => {
    setTimeout(() => {
      if (file) {
        onSuccess({ url: URL.createObjectURL(file) }, file);
      } else {
        onError(new Error("Upload failed."));
      }
    }, 1000);
  };

  const uploadButton = (
    <Button
      style={{ marginTop: "5px" }}
      icon={loading ? <LoadingOutlined /> : <UploadOutlined />}
    >
      {loading ? "Uploading" : "Upload"}
    </Button>
  );

  const iconFtn = () => {
    return (
      <>
        {(location?.pathname === "/ClaimSummary" ||
          location?.pathname === "/Summary" ||
          location?.pathname === "/CorrespondencesSummary" ||
          location?.pathname === "/Transfers" ||
          location?.pathname === "/RosterSummary" ||
          location?.pathname === "/CasesSummary") && (
            <FaClipboardList
              style={{
                fontSize: "15px",
                color: "#45669d",
              }}
            />
          )}
      </>
    );
  };

  return (
    <div className="" style={{ width: '93vw' }}>
      <div
        className={`details-header d-flex w-100% overflow-hidden ${(location?.pathname == "/Details"
          || location?.pathname == "/CasesById"
          || location?.pathname == "/AddNewProfile"
          || location?.pathname == "/ClaimsById"
          || location?.pathname == "/AddClaims"
          || location?.pathname == "/Doucmnets"
        ) ? "Header-border" : ""
          }`}
      >
        <div style={{ width: "100%" }}>
          <div className="d-flex justify-content-between align-items-baseline">
            <div className="bred-cram-main d-flex align-items-center" onClick={goBack}>
              <>
                {location?.state?.search === "Profile" && (
                  <FaUser
                    style={{
                      fontSize: "16px",
                      marginRight: "5px",
                      color: "#45669d",
                      display: "inline-flex",
                      alignSelf: "center", // Align icon vertically
                    }}
                  />
                )}
                {location?.state?.search === "Cases" && (
                  <FaListCheck
                    style={{
                      fontSize: "16px",
                      marginRight: "5px",
                      color: "#45669d",
                      display: "inline-flex",
                      alignSelf: "center",
                    }}
                  />
                )}
                {location?.state?.search === "Rouster" && (
                  <FaCalendarDays
                    style={{
                      fontSize: "16px",
                      marginRight: "5px",
                      color: "#45669d",
                      display: "inline-flex",
                      alignSelf: "center",
                    }}
                  />
                )}
                {location?.state?.search === "Transfers" && (
                  <LuArrowLeftRight
                    style={{
                      fontSize: "16px",
                      marginRight: "5px",
                      color: "#45669d",
                      display: "inline-flex",
                      alignSelf: "center",
                    }}
                  />
                )}
                {location?.state?.search === "Correspondence" && (
                  <FaEnvelopesBulk
                    style={{
                      fontSize: "16px",
                      marginRight: "5px",
                      color: "#45669d",
                      display: "inline-flex",
                      alignSelf: "center",
                    }}
                  />
                )}
                <p>{location?.state?.search}</p>
                <p>&nbsp;{location?.pathname === "/Configuratin" ? "" : "/"}&nbsp;{iconFtn()}&nbsp;</p>
                {location?.pathname === "/ClaimsById" && (
                  <FaMoneyCheckAlt
                    style={{
                      fontSize: "16px",
                      marginRight: "5px",
                      color: "#45669d",
                      display: "inline-flex",
                      alignSelf: "center",
                    }}
                  />
                )}
                {location?.pathname === "/Details" && (
                  <FaUser
                    style={{
                      fontSize: "16px",
                      marginRight: "5px",
                      color: "#45669d",
                      display: "inline-flex",
                      alignSelf: "center",
                    }}
                  />
                )}
                {location?.pathname === "/CasesById" && (
                  <FaListCheck
                    style={{
                      fontSize: "16px",
                      marginRight: "5px",
                      color: "#45669d",
                      display: "inline-flex",
                      alignSelf: "center",
                    }}
                  />
                )}
                {
                  nav === '/CorrespondencesSummary'
                    || nav === '/Sms' || nav === '/Email'
                    || nav === '/Notes'
                    || nav === '/RosterSummary' || nav === '/Transfers' ?
                    <p>Summary</p> :
                    nav === '/Configuratin' ?
                      <>
                        {/* <IoSettingsOutline style={{
                          fontSize: "15px",
                          color: "#45669d",
                          marginRight: '2px'
                        }} /> */}
                        <p style={{}}></p>
                      </>
                      :
                      <p>{formattedNav}</p>
                }

                {location?.state?.code && (
                  <>
                    <p>&nbsp;/&nbsp;</p>
                    <p>{location.state.code}</p>
                  </>
                )}
              </>
            </div>
            {(location?.pathname == "/Details"
              || location?.pathname == "/CasesById"
              || location?.pathname == "/AddNewProfile"
              || location?.pathname == "/ClaimsById"
              || location?.pathname == "/AddClaims"
              || location?.pathname == "/Doucmnets"
              || location?.pathname == "/AproveMembersip"
              || location?.pathname == "/ChangeCatById"
              // || location?.pathname == "/ChangCateSumm"
            ) && (
                <div className="d-flex align-items-baseline">
                  {location?.pathname == "/AproveMembersip"
                    || location?.pathname == "/ChangeCatById"
                    ?
                    //   <MySelect
                    //   options={[{key:'001',
                    //     label:'Aprove'
                    //   },
                    //   {key:'002',
                    //     label:'Reject'
                    //   }
                    // ]}
                    // value={aprove}
                    // onChange={(e)=>setaprove(e)}
                    //   />

                    // <Checkbox.Group
                    //   style={{ marginRight: '10px' }}
                    //   options={plainOptions}
                    //   value={selectedValue1}
                    //   onChange={handleChangeCheckBox}
                    // />
                    <Radio.Group
                      style={{ marginRight: '10px' }}
                      options={plainOptions}
                      value={selectedValue1}
                      onChange={handleChangeCheckBox}
                      optionType='button'
                      buttonStyle='solid'
                    />
                    :
                    <Button style={{ marginRight: "50px", color: 'white', borderRadius: "3px", backgroundColor: "#45669d" }} onClick={() => {
                      if (nav == "/ClaimsById")
                        handlClaimDrawerChng()
                    }}>
                      Create
                    </Button>
                  }
                  <Button onClick={goBack} className="me-1 gray-btn butn" >
                    Return to summary
                  </Button>
                  <Button onClick={goBack} className="me-1 gray-btn butn">
                    Print
                  </Button>
                  <Button disabled={rowIndex == 0} onClick={profilPrevBtnFtn} className="me-1 gray-btn butn" >
                    <FaAngleLeft className="deatil-header-icon" />
                  </Button>
                  <p className="" style={{ fontWeight: "500", fontSize: "14px", marginLeft: "4px" }}>{rowIndex + 1} of {gridData?.length}</p>
                  <Button disabled={rowIndex == gridData?.length - 1} onClick={profilNextBtnFtn} className="me-1 gray-btn butn" style={{ marginLeft: "8px" }}>
                    <FaAngleRight className="deatil-header-icon" />
                  </Button>

                </div>
              )}
          </div>

          {(location?.pathname == "/ClaimSummary" ||
            location?.pathname == "/Applications" ||
            location?.pathname == "/members" ||
            location?.pathname == "/" ||
            location?.pathname == "/Summary" ||
            location?.pathname == "/CasesSummary"
            || location?.pathname == "/Transfers"
            || location?.pathname == "/CorrespondencesSummary"
            || location?.pathname == "/Reports"
            || location?.pathname == "/RosterSummary"
            || location?.pathname == "/ChangCateSumm"
            || location?.pathname == "/RemindersSummary"
            || location?.pathname == "/Cancallation"
            || location?.pathname == "/CornMarket"
            || location?.pathname == "/Batches"
            || location?.pathname == "/Sms"
            || location?.pathname == "/Email"
            || location?.pathname == "/Notes"
            || location?.pathname == "/Popout"
          ) && (
              <div className="search-main">
                <div className="title d-flex justify-content-between ">
                  <h2 className="title-main">
                    {nav == "/" && location?.state == null
                      ? `Profile`
                      : ` ${location?.state?.search}`}
                  </h2>



                  <div className="d-flex">{
                    nav === '/CorrespondencesSummary' || nav === "/Sms" || nav === "/Emails" ?
                      <div style={{ marginRight: '50px' }}>
                        <New />
                      </div>
                      :
                      nav === '/ClaimSummary' ?
                        <CreateClaim />
                        :
                        <Button onClick={() => {
                          if (nav == "/Applications") {
                            setisGardaDrwer(!isGardaDrwer)

                          } else if (nav == "/ClaimSummary") {
                            handlClaimDrawerChng()
                          }
                          else if (nav == "/Transfers")
                            setTransferDrawer(!TransferDrawer)
                          else if (nav === "/RosterSummary")
                            setrosterDrawer(!rosterDrawer)
                          else if (nav === "/Summary")
                            setisGardaDrwer(!isGardaDrwer)
                          else if (nav === "/RemindersSummary" || nav === "/Cancallation" || nav === "/Batches" || nav === "/CornMarket") {
                            setIsBatchOpen(!isBatchOpen);
                          }
                          else if (nav === "/ChangCateSumm") {
                            setisDrawerOpen(!isDrawerOpen)

                          }
                        }

                        }
                          style={{ marginRight: "50px", color: 'white', borderRadius: "3px", backgroundColor: "#45669d" }} className="butn" >
                          Create
                        </Button>
                  }
                    <SimpleMenu
                      title={
                        <>

                          <Button className="me-1 gray-btn butn">Export</Button>
                        </>
                      }
                      data={exportbtn}
                      isSearched={true}
                      isCheckBox={false}
                      actions={genaratePdf}
                    />

                    <Button className="me-1 gray-btn butn">Share</Button>
                    <Button className="me-1 gray-btn butn">DETAILS VIEW</Button>
                    <Button className="me-1 gray-btn butn">Grid VIEW</Button>
                    <ActionDropdown items={menuItems} />
                  </div>
                </div>
                <div className="d-flex search-fliters align-items-baseline">
                  <Row className="align-items-baseline">
                    <Input
                      placeholder="Reg No or Surname"
                      style={{
                        width: "25%",
                        // height: "31px",
                        // border: "1px solid",
                        color: "gray",
                      }}
                    // suffix={<SearchOutlined />}
                    />
                    {trueFilters?.map((item, index) =>
                      item?.titleColumn === "Date Of Birth" ? (
                        <DateRang key={index} title={item?.titleColumn} />
                      ) : (
                        <JiraLikeMenu
                          key={index}
                          title={item?.titleColumn}
                          data={item?.lookups}
                        />
                      )
                    )}
                    <MultiFilterDropdown
                      style={{ float: 'left' }}
                      label="Status"
                      options={["submitted", "approved", "rejected", "in-progress", "draft"]}
                      selectedValues={statusValues}
                      onChange={setStatusValues}
                      operator={statusOperator}
                      onOperatorChange={setStatusOperator}
                      onApply={handleApplyStatusFilter}
                    />
                    <div className="searchfilter- margin d-flex">
                      <SimpleMenu
                        title={
                          <>
                            More <PlusOutlined style={{ marginLeft: "-2px" }} />
                          </>
                        }
                        isSearched={false}
                      />
                      <SaveViewMenu />
                    </div>
                    <div>
                      <Button className="transparent bordr-less" style={{ color: "#333333" }} onClick={() => resetFtn()}>
                        Reset
                      </Button>
                      <Button className="transparent bordr-less" onClick={showHidSavModal} >Save fliter</Button>
                    </div>
                  </Row>
                </div>
              </div>
            )}
        </div>
      </div>
      <MyDrawer title={`${nav === "/CasesById"
        ? "Enter Cases"
        : nav == "/ClaimSummary" ? "Enter Claims"
          : nav === "/ClaimsById"
            ? "Enter Claims"
            : nav === "/Details"
              ? "Enter Profile"
              : ""}`}
        open={claimsDrawer} onClose={() => handlClaimDrawerChng()} width={600} >
        {
          nav == "/ClaimSummary" && (
            <div className="mb-4 pb-4">
              {/* Claim Date */}
              <div className="drawer-inpts-container">
                <div className="drawer-lbl-container">
                  <p>Claim Date:</p>
                </div>
                <div className="inpt-con">
                  <p className="star-white">*</p>
                  <div className="inpt-sub-con">
                    <MyDatePicker className="inp" />
                  </div>
                  <p className="error"></p>
                </div>
              </div>
              {/* Claim Type */}
              <div className="drawer-inpts-container">
                <div className="drawer-lbl-container">
                  <p>Claim Type:</p>
                </div>
                <div className="inpt-con">
                  <p className="star">*</p>
                  <div className="inpt-sub-con">
                    <MySelect isSimple={true} />
                  </div>
                  <p className="error"></p>
                </div>
              </div>

              {/* Start Date */}
              <div className="drawer-inpts-container">
                <div className="drawer-lbl-container">
                  <p>Start Date:</p>
                </div>
                <div className="inpt-con">
                  <p className="star-white">*</p>
                  <div className="inpt-sub-con">
                    <MyDatePicker className="inp" />
                  </div>
                  <p className="error"></p>
                </div>
              </div>

              {/* End Date */}
              <div className="drawer-inpts-container">
                <div className="drawer-lbl-container">
                  <p>End Date:</p>
                </div>
                <div className="inpt-con">
                  <p className="star-white">*</p>
                  <div className="inpt-sub-con">
                    <MyDatePicker className="inp" />
                  </div>
                  <p className="error"></p>
                </div>
              </div>

              {/* Is Approved */}
              <div className="drawer-inpts-container">
                <div className="drawer-lbl-container">
                  <p>Is Approved:</p>
                </div>
                <div className="inpt-con">
                  <p className="star-white">*</p>
                  <div className="inpt-sub-con">
                    <Checkbox className="inp"></Checkbox>
                  </div>
                  <p className="error"></p>
                </div>
              </div>

              {/* Number of Days */}
              <div className="drawer-inpts-container">
                <div className="drawer-lbl-container">
                  <p>Number of Days:</p>
                </div>
                <div className="inpt-con">
                  <p className="star-white">*</p>
                  <div className="inpt-sub-con">
                    <Input className="inp" type="number" placeholder="Enter number of days" />
                  </div>
                  <p className="error"></p>
                </div>
              </div>
              <div className="drawer-inpts-container">
                <div className="drawer-lbl-container">
                  <p>Pay Amount:</p>
                </div>
                <div className="inpt-con">
                  <p className="star-white">*</p>
                  <div className="inpt-sub-con">
                    <Input className="inp" type="number" placeholder="Enter pay amount" />
                  </div>
                  <p className="error"></p>
                </div>
              </div>
              <div className="drawer-inpts-container">
                <div className="drawer-lbl-container">
                  <p>Cheque No:</p>
                </div>
                <div className="inpt-con">
                  <p className="star-white">*</p>
                  <div className="inpt-sub-con">
                    <Input className="inp" placeholder="Enter cheque number" />
                  </div>
                  <p className="error"></p>
                </div>
              </div>

              <div className="drawer-inpts-container" style={{ height: '120px' }}>
                <div className="drawer-lbl-container">
                  <p>Description:</p>
                </div>
                <div className="inpt-con">
                  <p className="star-white">*</p>
                  <div className="inpt-sub-con">
                    <TextArea className="inp" rows={4} placeholder="Enter description" />
                  </div>
                  <p className="error"></p>
                </div>
              </div>
            </div>
          )
        }
      </MyDrawer>
      <Modal footer={<><Button onClick={async () => {
        try {
          await isSaveChng(true);
          await handleSave(ReportName);
          showHidSavModal()
        } catch (error) {
          console.error("Error saving changes:", error);
        }
      }}>Save</Button ><Button onClick={showHidSavModal}>Close</Button></>} title="Report" open={isSaveModalOpen} onOk={showHidSavModal} onCancel={showHidSavModal}>
        <Input onChange={(e) => setReportName(e.target.value)} value={ReportName} placeholder="Enter Name For Report" />
      </Modal>

      <AddNewGarda open={isGardaDrwer} onClose={() => setisGardaDrwer(!isGardaDrwer)} />
      <TransferRequests open={TransferDrawer} onClose={() => setTransferDrawer(!TransferDrawer)} isSearch={true} isChangeCat={true} />
      <MyDrawer title='Add New Events' open={rosterDrawer} onClose={() => setrosterDrawer(!rosterDrawer)} isrecursion={true}>
        <div>

          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container">
              <p></p>
            </div>
            <div className="inpt-con">
              <p className="star-white">*</p>
              <div className="inpt-sub-con">
                <Search className="inp"

                />
                <h1 className="error-text"></h1>
              </div>
              <p className="error"></p>
            </div>
          </div>
          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container">
              <p>Title :</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp"
                // onChange={(value) => drawrInptChng('LookupType', 'code', value.target.value)}
                // value={drawerIpnuts?.LookupType?.code}  
                />
                <h1 className="error-text"></h1>
              </div>
              <p className="error"></p>
            </div>
          </div>
          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container">
              <p>Invite Attendies</p>
            </div>
            <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp"
                // onChange={(value) => drawrInptChng('LookupType', 'code', value.target.value)}
                // value={drawerIpnuts?.LookupType?.code}  
                />
                <h1 className="error-text"></h1>
              </div>
              <p className="error"></p>
            </div>
          </div>
          <div className="drawer-inpts-container">
            <div className="drawer-lbl-container">
              <p>Time </p>
            </div>
            <div className="inpt-con">
              <p className="star-white">*</p>
              <div className="inpt-sub-con">
                <TimePicker.RangePicker format={format} style={{ width: '100%', borderRadius: '3px' }} />
                <h1 className="error-text"></h1>
              </div>
              <p className="error"></p>
            </div>
          </div>
          <div className="drawer-inpts-container" style={{ height: 'auto', }}>
            <div className="drawer-lbl-container">
              <p>Description </p>
            </div>
            <div className="inpt-con">
              <p className="star-white">*</p>
              <div className="inpt-sub-con">
                <TextArea
                  rows={7}
                />
                <h1 className="error-text"></h1>
              </div>
              <p className="error"></p>
            </div>
          </div>
          <Table
            pagination={false}
            columns={column}

            className="drawer-tbl"
            // rowClassName={(record, index) =>
            //     index % 2 !== 0 ? "odd-row" : "even-row"
            // }
            // rowSelection={{
            //     type: selectionType,
            //     ...rowSelection,
            // }}
            bordered
          />

        </div>
      </MyDrawer>
      <MyDrawer isPagination={false} width='1300px'
        title={`${nav === "/RemindersSummary" ? "Batch" : nav === "/Batches" ? "" : nav === "/CancellationBatch" ? "Cancellation Batch" : nav === "/CornMarket" ? "Corn Market Batch" : ""}`}
        open={isBatchOpen} onClose={() => {
          setIsBatchOpen(!isBatchOpen)

        }}
        add={() => {
          navigate("/BatchMemberSummary", { state: { search: "BatchMemberSummary" } })
          setIsBatchOpen(!isBatchOpen)
        }}
      >
        {
          nav === "/Batches" ? (
            <CreateBatchPayment />
          ) : (
            <div className="drawer-main-container">
              <MyInput
                label="Batch Name"
                name="batchName"
                required
                hasError={false} // Set to true if validation fails
                errorMessage="Batch name is required"
              />

              <MyDatePicker
                label="Batch Date"
                name="batchDate"
                required
                hasError={false}
                errorMessage="Batch date is required"
              />

              <CustomSelect
                label="Status"
                name="status"
                value="001"
                options={[
                  { value: "001", label: "Draft" },
                  { value: "002", label: "Inactive" },
                ]}
                disabled
                required
                hasError={false}
                errorMessage="Status is required"
              />
            </div>

          )
        }
      </MyDrawer>
      <ChangeCategoryDrawer
        open={isDrawerOpen}
        onClose={() => setisDrawerOpen(false)}
        isChangeCat={true}
      />
      <ContactDrawer open={contactDrawer} onClose={() => setcontactDrawer(false)} />

    </div>
  );
}

export default HeaderDetails;
