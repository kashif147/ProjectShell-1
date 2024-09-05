import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyDrowpDown from "./MyDrowpDown";
import { SettingOutlined } from "@ant-design/icons";
import Input from "antd/es/input/Input";
import { FaUserCircle } from "react-icons/fa";
import { HiMiniQuestionMarkCircle } from "react-icons/hi2";
import { IoNotifications } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [token, settoken] = useState(null);
  const navigate = useNavigate();
const location = useLocation();
const pathname = location?.pathname
  const navLinks = [
    {
      key: "1",
      label: (
        <Link to="Summary" state={{ search: "Profile" }} className="link" style={{textDecoration:"none", }}>
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
        <Link to="Cases" state={{ search: "Cases" }} className="link" style={{textDecoration:"none"}}>
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
        <Link to="ClaimSummary" state={{ search: "Claims" }} className="link" style={{textDecoration:"none"}}>
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
  return (
    <div className="Header-border">
      <div className=" d-flex justify-content-between align-items-baseline">
        <nav class="navbar navbar-expand-lg navbar-light ">
          <button
            class="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav align-items-baseline"  style={{paddingLeft:"30px"}}>
              <li className={`${pathname=="/Summary"|| pathname=="/Details" ?"activ-link":"" } nav-item nav-links-container `}>
                <MyDrowpDown title={"Profile"} items={navLinks} />
                {/* <Link className="links" to="Configuratin"  state={{ search: "" }}>Profile</Link> */}
              </li>
              <li className={`${pathname=="/Cases"|| pathname=="/CasesDetails" ?"activ-link":"" } nav-item nav-links-container `}>
                <MyDrowpDown title={"Cases"} items={CasesnavLinks} />
              </li>
              <li  className={`${pathname=="/ClaimSummary"|| pathname=="/Claims" ?"activ-link":"" } nav-item nav-links-container `}>
                <MyDrowpDown title={"Claims"} items={ClaimsnavLinks} />
              </li>
              <li class="nav-item nav-links-container">
                <MyDrowpDown title={"Correspondences"} items={navLinks} />
              </li>
              <li class="nav-item nav-links-container">
                <MyDrowpDown title={"Documents"} items={navLinks} />
              </li>
              <li class="nav-item nav-links-container">
                <MyDrowpDown title={"Projects"} items={navLinks} />
              </li>
              <li class="nav-item nav-links-container">
                <MyDrowpDown title={"Roster"} items={navLinks} />
              </li>
              <li class="nav-item nav-links-container">
                <Link className="links" to="Configuratin"  state={{ search: "" }}>System Configuration</Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="input-container d-flex">
          <Input className=" top-search" style={{ marginRight: "1rem" }} />
          <IoNotifications style={{ fontSize: "27px", marginRight: "1rem" }} />
          <HiMiniQuestionMarkCircle
            style={{ fontSize: "27px", marginRight: "1rem" }}
          />
          <SettingOutlined style={{ fontSize: "20px", marginRight: "1rem" }} />
          <FaUserCircle style={{ fontSize: "27px", marginRight: "1rem" }} />
        </div>
      </div>
    </div>
  );
}

export default Header;
