import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyDrowpDown from "./MyDrowpDown";
import { SettingOutlined } from "@ant-design/icons";
// import Input from "antd/es/input/Input";
import { FaUserCircle } from "react-icons/fa";
import { HiMiniQuestionMarkCircle } from "react-icons/hi2";
import { IoMdSettings } from "react-icons/io";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { IoNotifications } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { Button, Input } from "antd";
import { PiPhoneCallBold } from "react-icons/pi";
import { BiLogOutCircle } from "react-icons/bi";
import logo from '../../assets/images/gra_logo.png'

const { Search } = Input;
function Header() {

  const [token, settoken] = useState(null);
  const [regNo, setregNo] = useState("")
  const navigate = useNavigate();
  const { filterByRegNo, topSearchData, ProfileDetails, ReportsTitle } = useTableColumns()
  const location = useLocation();
  const pathname = location?.pathname
  const profile = Array.isArray(ProfileDetails) && ProfileDetails.length > 0 ? ProfileDetails[0] : null;
  const navLinks = [
    {
      key: "1",
      label: (
        <Link to="Summary" state={{ search: "Profile" }} className="link" style={{ textDecoration: "none", }}>
          Summary
        </Link>
      ),
    },
    {
      key: "",
      label: (
        <Link className="link" to="Dummy" state={{ search: "Profile" }}>
          Dummy Page
        </Link>
      ),
    },
  ];
  const CasesnavLinks = [
    {
      key: "1",
      label: (
        <Link to="CasesSummary" state={{ search: "Cases" }} className="link" style={{ textDecoration: "none" }}>
          Summary
        </Link>
      ),
    },
    {
      key: "",
      label: (
        <Link className="link" to="Dummy" state={{ search: "Cases" }}>
          Dummy Page
        </Link>
      ),
    },
  ];
  const ClaimsnavLinks = [
    {
      key: "1",
      label: (
        <Link to="ClaimSummary" state={{ search: "Claims" }} className="link" style={{ textDecoration: "none" }}>
          Summary
        </Link>
      ),
    },
    {
      key: "",
      label: (
        <Link className="link" to="Dummy" state={{ search: "Claims" }}>
          Dummy Page
        </Link>
      ),
    },
  ];
  const ReportsnavLinks = [
    {
      key: "1",
      label: (
        <Link to="Report1" state={{ search: "Reports" }} className="link" style={{ textDecoration: "none" }}>
          Report1
        </Link>
      ),
    },
    {
      key: "",
      label: (
        <Link className="link" to="Reports" state={{ search: "Reports" }}>
          Report 2
        </Link>
      ),
    },
  ];
  const CorrespondencesLink = [
    {
      key: "1",
      label: (
        <Link to="/CorrespondencesSummary" state={{ search: "Correspondence" }} className="link" style={{ textDecoration: "none" }}>
          Summary
        </Link>
      ),
    },
    {
      key: "",
      label: (
        <Link className="link" to="Dummy" state={{ search: "Correspondences" }}>
          Dummy Page
        </Link>
      ),
    },
  ];
  const Roster = [
    {
      key: "1",
      label: (
        <Link to="/RosterSummary" state={{ search: "Rouster" }} className="link" style={{ textDecoration: "none" }}>
          Summary
        </Link>
      ),
    },
    {
      key: "",
      label: (
        <Link className="link" to="Dummy" state={{ search: "Correspondences" }}>
          Dummy Page
        </Link>
      ),
    },
  ];
  let arr = []
  const reportLink = ReportsTitle?.map((i, index) => {
    return {
      key: index,
      label: (
        <Link className="link" to="Reports" state={{ search: i, screen: i }}>
          {i}
        </Link>
      ),
    };
  }) || [];

  return (
    <div className="Header-border overflow-y-hidden">
      <div className="d-flex justify-content-between align-items-center bg">
        <div className="d-flex flex-row align-items-center" style={{ paddingLeft: '32px', width:'33%' }}>
          <img
            src={logo}
            alt="Company Logo"
            width={50}
            style={{ borderRadius: '10px', }}

          />
          <nav className="navbar navbar-expand-lg navbar-light">
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            {/* <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav align-items-center" style={{ paddingLeft: "30px" }}>
                <li className={`${pathname === "/Summary" || pathname === "/Details" ? "activ-link" : ""} nav-item nav-links-container`}>
                  <MyDrowpDown title={"Profile"} items={navLinks} />
                </li>
                <li className={`${pathname === "/CasesSummary" || pathname === "/CasesDetails" ? "activ-link" : ""} nav-item nav-links-container`}>
                  <MyDrowpDown title={"Cases"} items={CasesnavLinks} />
                </li>
                <li className={`${pathname === "/ClaimSummary" || pathname === "/Claims" ? "activ-link" : ""} nav-item nav-links-container`}>
                  <MyDrowpDown title={"Claims"} items={ClaimsnavLinks} />
                </li>
                <li className={`${pathname === "/CorrespondencesSummary" ? "activ-link" : ""} nav-item nav-links-container`}>
                  <MyDrowpDown title={"Correspondences"} items={CorrespondencesLink} />
                </li>
                <li className={`${pathname === "/RosterSummary" ? "activ-link" : ""} nav-item nav-links-container`}>
                  <MyDrowpDown title={"Roster"} items={Roster} />
                </li>
                <li className={`${pathname === "/Transfers" ? "activ-link" : ""} nav-item nav-links-container`}>
                  <Link className="links" to="Transfers" state={{ search: "Transfers" }}>Transfer Requests</Link>
                </li>
                <li className={`${pathname === "/Report2" || pathname === "/Report1" ? "activ-link" : ""} nav-item nav-links-container`}>
                  <MyDrowpDown title={"Reports"} items={reportLink} />
                </li>
                <li className={`${pathname === "/Configuratin" ? "activ-link" : ""} nav-item nav-links-container`}>
                  <Link className="links" to="Configuratin" state={{ search: "" }}>Configurations</Link>
                </li>
              </ul>
            </div> */}
          </nav>
        </div>
        <div style={{width:'33%'}}> 
        <Search
            placeholder="Reg No"
            onChange={(e) => setregNo(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                filterByRegNo(regNo);
                await navigate("/Details", {
                  state: {
                    name: profile?.fullName,
                    code: profile?.regNo,
                    search: 'Profile',
                  }
                });
              }
            }}
            className="top-search"
            style={{ marginRight: "",width:'100%' }}
          />
        </div>
        <div style={{width:'33%', justifyContent:'end'}} className="input-container d-flex align-items-center justify-content-end">
          <PiPhoneCallBold
            className="top-icon"
            onClick={() => navigate("/CorrespondencesSummary", { state: { search: "Correspondence" } })}
          />
          <IoNotifications className="top-icon" />
          <HiMiniQuestionMarkCircle className="top-icon" />
          <IoMdSettings className="top-icon" />
          <FaUserCircle className="top-icon" />
          <BiLogOutCircle
            className="top-icon"
            onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
          />
        </div>
      </div>
    </div>


  );
}

export default Header;
