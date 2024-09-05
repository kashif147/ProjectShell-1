import { useState, React, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePDF } from "react-to-pdf";
import { FaUser } from "react-icons/fa6";
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
import {
  SearchOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { BsThreeDots } from "react-icons/bs";
import JiraLikeMenu from "./JiraLikeMenu";
import SimpleMenu from "./SimpleMenu";
import { FaChevronDown } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { FaListCheck, FaArrowRightArrowLeft,FaCalendarDays, FaClipboardList,   } from "react-icons/fa6";
import { FaUserCircle,  FaMoneyCheckAlt } from "react-icons/fa";

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
  const navigate = useNavigate();
  console.log(location, "location");
  const inputRef = useRef(null);

  const genaratePdf = (e) => {
    e.stopPropagation();
    console.log("testing");
    toPDF();
  };
  const mriatalStatus = {
    Male: false,
    Female: false,
    Other: false,
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
      label: "Other",
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

  const addMore = {
    Mebership: "false",
  };
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
          location?.pathname === "/Cases") && (
          <FaClipboardList
            style={{
              fontSize: "15px",
              marginRight: "10px",
              marginLeft: "10px",
            }}
          />
        )}
      </>
    );
  };
  return (
    <div className="">
      <div
        className={`details-header d-flex w-100% overflow-hidden ${
          location?.pathname == "/Details" ? "Header-border" : ""
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
                    <p>{location?.state?.search}</p>
                    <p>&nbsp; &nbsp;/{iconFtn()}</p>
                    { location?.pathname=="/Details" &&
                      <FaUser
                        style={{
                          fontSize: "16px",
                          marginLeft: "10px",
                          marginRight: "10px",
                        }}
                      />
                    }
                    { location?.pathname=="/CasesDetails" &&
                      <FaListCheck
                        style={{
                          fontSize: "16px",
                          marginLeft: "10px",
                          marginRight: "10px",
                        }}
                      />
                    }
                    { location?.pathname=="/ClaimsDetails" &&
                      <FaMoneyCheckAlt
                        style={{
                          fontSize: "16px",
                          marginLeft: "10px",
                          marginRight: "10px",
                        }}
                      />
                    }
                    <p>{formattedNav}</p>
                    {location?.state?.name && (
                      <>
                        <p>&nbsp; &nbsp;/&nbsp; &nbsp;</p>

                        <p> {location.state.code}</p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            {}
            {location?.pathname == "/Details" && (
              <div className="d-flex align-items-baseline">
                <Button onClick={goBack} className="me-1 gray-btn butn">
                  Return to summary
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
            location?.pathname == "/Summary" ||
            location?.pathname == "/ClaimSummary") && (
            <div className="search-main">
              <div className="title d-flex justify-content-between ">
                <h2 className="title-main">
                  {nav == "/" && location?.state == null
                    ? `Profile`
                    : ` ${location?.state?.search}`}
                </h2>
                <div className="d-flex">
                  <SimpleMenu
                    title={
                      <>
                        <Button className="me-1 gray-btn butn">Export</Button>
                      </>
                    }
                    data={addMore}
                    isSearched={true}
                    isCheckBox={true}
                    actions={genaratePdf}
                  />

                  <Button className="me-1 gray-btn butn">Share</Button>
                  <Button className="me-1 gray-btn butn">DETAILS VIEW</Button>
                  <Button className="me-1 gray-btn butn">LIST VIEW</Button>
                </div>
              </div>
              <div className="d-flex search-fliters align-items-baseline">
                <Row className="align-items-baseline">
                  <Input
                    placeholder="Search..."
                    style={{
                      width: "13%",
                      height: "31px",
                      border: "1px solid",
                    }}
                    suffix={<SearchOutlined />}
                  />
                  <Input
                    placeholder="Postal Code"
                    style={{ width: "13%", height: "31px" }}
                    className="margin"
                  />
                  <JiraLikeMenu title="Gender" data={mriatalStatus} />
                  <JiraLikeMenu
                    title="Partnership"
                    data={SerachFitersLookups}
                  />
                  <JiraLikeMenu
                    title="Subscriptions"
                    data={SerachFitersLookups}
                  />
                  <JiraLikeMenu title="Membership" data={Mebership} />
                  {/* {trueKeys.includes("Mebership") == true && (
                  )} */}
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
    </div>
  );
}

export default HeaderDetails;
