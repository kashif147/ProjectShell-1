import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyDrowpDown from "./MyDrowpDown";
import { SettingOutlined } from "@ant-design/icons";
import Input from "antd/es/input/Input";
import { FaUserCircle } from "react-icons/fa";
import { HiMiniQuestionMarkCircle } from "react-icons/hi2";
import { IoNotifications } from "react-icons/io5";
import { Link } from "react-router-dom";

function Header() {
  const [token, settoken] = useState(null);
  const navigate = useNavigate();

  const navLinks = [
    {
      key: "1",
      label: (
        <Link to="Summary" state={{ search: "Profile" }}>
          Main Page
        </Link>
      ),
    },
    {
      key: "",
      label: (
        <Link to="Details" state={{ search: "Profile" }}>
          Details Page
        </Link>
      ),
    },
  ];
  return (
    <div className="Header-border">
      <div className="Header-padding d-flex justify-content-between align-items-baseline">
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
            <ul class="navbar-nav align-items-baseline">
              <li class="nav-item nav-links-container">
                <MyDrowpDown title={"Profile"} items={navLinks} />
              </li>
              <li class="nav-item nav-links-container">
                <MyDrowpDown title={"Cases"} items={navLinks} />
              </li>
              <li class="nav-item nav-links-container">
                <MyDrowpDown title={"Claims"} items={navLinks} />
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
