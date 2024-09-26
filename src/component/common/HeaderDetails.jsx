import { useState, React, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePDF } from "react-to-pdf";
import { FaUser } from "react-icons/fa6";
import { useTableColumns } from "../../context/TableColumnsContext ";
import SimpleMenu from "./SimpleMenu";
import MyDrawer from "./MyDrawer";
import {
  RightOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Input, Button, Row, Upload, message, Col } from "antd";
import MySelect from "./MySelect";
import SideNav from "./SideNav";
import { FaChevronUp, FaLess } from "react-icons/fa";
import MyDrowpDown from "./MyDrowpDown";
import { SerachFitersLookups } from "../../Data";
import { BsSliders, BsThreeDots } from "react-icons/bs";
import {
  SearchOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import JiraLikeMenu from "./JiraLikeMenu";
// import SimpleMenu from "./SimpleMenu";
import { FaChevronDown } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import {
  FaListCheck,
  FaArrowRightArrowLeft,
  FaCalendarDays,
  FaClipboardList,
} from "react-icons/fa6";
import { FaUserCircle, FaMoneyCheckAlt } from "react-icons/fa";
import DateRang from "./DateRang";

function HeaderDetails() {
  const { Search } = Input;
  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });
  const location = useLocation();
  const currentURL = `${location?.pathname}`;
  const nav = location?.pathname || "";
  const formattedNav = nav.replace(/^\//, "");
  const [isSideNav, setisSideNav] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [checkboxes, setCheckboxes] = useState();
  const [trueFilters, settrueFilters] = useState();
  const [create, setCreate] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { searchFilters, filterGridDataFtn } = useTableColumns();
  function filterSearchableColumns(data) {
    settrueFilters(data.filter((column) => column.isSearch === true));
  }
  useEffect(() => {
    filterSearchableColumns(searchFilters);
  }, [searchFilters]);

  const genaratePdf = (e) => {
    // e.stopPropagation();
    // console.log("testing");
    toPDF();
  };

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
  const exportbtn = { "Export PDF": true, "Export CSV": true };

  const topThreeDots = {
    BulkChnages: "false",
  };
  const [selectedValue, setSelectedValue] = useState(null);
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
          location?.pathname === "/CasesSummary") && (
            <FaClipboardList
              style={{
                fontSize: "15px",
                marginRight: "10px",
                marginLeft: "10px",
                color: "#45669d",
              }}
            />
          )}
      </>
    );
  };
  return (
    <div className="">
      <div
        className={`details-header d-flex w-100% overflow-hidden ${(location?.pathname == "/Details"
            || location?.pathname == "/CasesById"
            || location?.pathname == "/AddNewProfile"
            || location?.pathname == "/ClaimsById"
          ) ? "Header-border" : ""
          }`}
      >
        <div style={{ width: "100%" }}>
          <div className="d-flex justify-content-between align-items-baseline">
            <div className="d-flex">
              <div className="bred-cram-main d-flex" onClick={goBack}>
                {location?.key === "default" && nav === "/" ? (
                  <>
                    <p>Profile / Main</p>
                  </>
                ) : (
                  <>
                    {location?.state?.search == "Profile" &&
                      (location?.pathname == "/Summary" ||
                        location?.pathname == "/Details") && (
                        <FaUser
                          style={{
                            fontSize: "16px",
                            marginRight: "10px",
                            color: "#45669d",
                          }}
                        />
                      )}
                    {location?.state?.search == "Cases" &&
                      (location?.pathname == "CasesSummary" ||
                        location?.pathname == "/CasesDetails") && (
                        <FaListCheck
                          style={{
                            fontSize: "16px",
                            marginLeft: "10px",
                            marginRight: "10px",
                            color: "#45669d",
                          }}
                        />
                      )}
                    <p>{location?.state?.search}</p>
                    <p>&nbsp; &nbsp;/{iconFtn()}</p>
                    {location?.pathname == "/ClaimsDetails" && (
                      <FaMoneyCheckAlt
                        style={{
                          fontSize: "16px",
                          marginLeft: "10px",
                          marginRight: "10px",
                        }}
                      />
                    )}
                    <p>{formattedNav}</p>
                    {location?.state?.code && (
                      <>
                        <p>&nbsp; &nbsp;/&nbsp; &nbsp;</p>

                        <p> {location.state.code}</p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {(location?.pathname == "/Details"
              || location?.pathname == "/CasesById"
              || location?.pathname == "/AddNewProfile"
              || location?.pathname == "/ClaimsById"
            ) && (
                <div className="d-flex align-items-baseline">
                  <Button style={{ marginRight: "50px", color: 'white', borderRadius: "3px", backgroundColor: "#45669d" }} onClick={() => setCreate(!create)}>
                    Create
                  </Button>
                  <Button onClick={goBack} className="me-1 gray-btn butn" >
                    Return to summary
                  </Button>
                  <Button onClick={goBack} className="me-1 gray-btn butn">
                    Print
                  </Button>
                  <p className="lbl">1 of 12</p>
                  <span className=" ">
                    <FaChevronDown className="deatil-header-icon" />
                  </span>
                  <span>
                    <FaChevronUp className="deatil-header-icon" />
                  </span>

                </div>
              )}
          </div>

          {(location?.pathname == "/ClaimSummary" ||
            location?.pathname == "/" ||
            location?.pathname == "/Summary" ||
            location?.pathname == "/CasesSummary" 
            || location?.pathname == "/Transfers"
            || location?.pathname == "/CorrespondencesSummary"
          ) && (
              <div className="search-main">
                <div className="title d-flex justify-content-between ">
                  <h2 className="title-main">
                    {nav == "/" && location?.state == null
                      ? `Profile`
                      : ` ${location?.state?.search}`}
                  </h2>
                  <div className="d-flex">
                    <Button onClick={() => navigate("/AddNewProfile")} style={{ marginRight: "50px", color: 'white', borderRadius: "3px", backgroundColor: "#45669d" }} className="butn" >
                      Create
                    </Button>
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
                    <SimpleMenu
                      title={
                        <BsThreeDots
                          style={{ fontSize: "15px", fontWeight: 500 }}

                        />
                      }
                      data={{ "Bulk Changes": "false", "Print Labels": "false" }}
                      isCheckBox={false}
                      isSearched={false}
                      isTransparent={true}
                      vertical={true}

                    />
                  </div>
                </div>
                <div className="d-flex search-fliters align-items-baseline">
                  <Row className="align-items-baseline">

                    <Input
                      placeholder="Reg No or Surname"
                      style={{
                        width: "21%",
                        height: "31px",
                        border: "1px solid",
                        color: "gray",
                      }}
                      suffix={<SearchOutlined />}
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

                    <div className="searchfilter- margin">
                      <SimpleMenu
                        title={
                          <>
                            More <PlusOutlined style={{ marginLeft: "-2px" }} />
                          </>
                        }
                        data={addMore}
                        isSearched={false}
                      />
                    </div>

                    <div>
                      <Link className="link" style={{ color: "#333333" }}>
                        Reset
                      </Link>
                      <Link className="link">Save fliter</Link>
                    </div>
                  </Row>
                </div>
              </div>
            )}
        </div>
      </div>
      <MyDrawer title="Enter Profile" open={create} onClose={() => setCreate(!create)} >

      </MyDrawer>
    </div>
  );
}

export default HeaderDetails;
