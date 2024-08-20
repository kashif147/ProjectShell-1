import { useState, React } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  RightOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Input, Button, Row } from "antd";
import MySelect from "./MySelect";
import SideNav from "./SideNav";
import { FaLess } from "react-icons/fa";
import MyDrowpDown from "./MyDrowpDown";
import { SerachFitersLookups } from "../../Data";
import { SearchOutlined } from "@ant-design/icons";
import { BsThreeDots } from "react-icons/bs";
import JiraLikeMenu from "./JiraLikeMenu";
import SimpleMenu from "./SimpleMenu";


function HeaderDetails() {
  const { Search } = Input;
  const location = useLocation();
  const currentURL = `${location?.pathname}`;
  const nav = location?.pathname || "";
  const formattedNav = nav.replace(/^\//, "");

  const [isSideNav, setisSideNav] = useState(true);
  const navigate = useNavigate()
console.log(location,"location")
  const mriatalStatus =
    {
      Male: false,
      Female: false,
      Other: false,  
    }

  const Mebership =
    {
      Probation: false,
      Trainee: false,
      Associate: false,  
      Retired: false,  
    }

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
const testing = { 
  testinig:"false",
  testinigA:"false",
  testinigB:"false",
  testinigc:"false",
}
  const [selectedValue, setSelectedValue] = useState(null);

  const handleChange = (value) => {
    setSelectedValue(value);
  };
  const goBack = () => {
    navigate(-1); 
  }; 
console.log(SerachFitersLookups,"123")
  return (
    <div className="details-header d-flex w-100% overflow-hidden">
      <div style={{ width: "100%" }}>
        <div className="d-flex ">
          <p className="bred-cram-main" onClick={goBack}>
            {(location?.key == "default" && nav == "/") || nav == "/"
              ? `Profile / Main`
              : ` ${location?.state?.search}  / ${formattedNav}`}
          </p>
        </div>
        
        {(location?.pathname == "/CasesSummary" || location?.pathname == "/Summary" || location?.pathname == "/ClaimSummary"  ) && (
        <div className="search-main">
          <div className="title d-flex justify-content-between ">
            <h2 className="title-main" >
              {nav == "/" && location?.state == null
                ? `Profile`
                : ` ${location?.state?.search}`}
            </h2>
            <div className="d-flex">
              <Button className="me-1 gray-btn butn">Export</Button>
              <Button className="me-1 gray-btn butn">Share</Button>
              <Button className="me-1 gray-btn butn">DETAILS VIEW</Button>
              <Button className="me-1 gray-btn butn">LIST VIEW</Button>
              <Button className="me-1 gray-btn butn">LIST VIEW</Button>
              <SimpleMenu  title={<> <BsThreeDots /></>} data={testing} checkbox={false} isSearched={false} />
            
            </div>
          </div>
          <div className="d-flex search-fliters align-items-baseline">
            <Row className="align-items-baseline">
            <Input
              placeholder="Search..."
              style={{ width: "13%", height:"31px" }}
              suffix={<SearchOutlined />}
            />
            <Input
              placeholder="Postal Code"
              style={{ width: "13%", height:"31px" }}
              className="margin"
            />
            <JiraLikeMenu title="Gender" data={mriatalStatus}  />
            <JiraLikeMenu title="Partnership" data={SerachFitersLookups} />
            <JiraLikeMenu title="Subscriptions" data={SerachFitersLookups} />
            <JiraLikeMenu title="Membership" data={Mebership} />
            <div className="searchfilter- margin">
            <SimpleMenu  title={<>More <PlusOutlined style={{marginLeft:"-2px"}}/></>} data={testing} isSearched={false}  />
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
  );
}

export default HeaderDetails;
