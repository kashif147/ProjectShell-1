import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyDrowpDown from "./MyDrowpDown";
import { SettingOutlined } from "@ant-design/icons";
import {
  FaRegCircleUser,
  FaListCheck,

  FaDiagramProject,
} from 'react-icons/fa6';
import {
  FaRegUserCircle,
  FaRegMoneyBillAlt,
  FaRegEnvelope,
  FaCalendarAlt,
  FaRegClipboard,
  FaRegChartBar,
  FaRegFileAlt,
  FaCogs,
  FaUsers,
  FaToolbox,
  FaListUl,
  FaUserCircle,
} from 'react-icons/fa';
import { IoNotificationsOutline } from "react-icons/io5"; // outlined version
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2"; // outlined version
import { IoMdSettings } from "react-icons/io"; // already regular
import { PiPhoneCallLight } from "react-icons/pi";
import { TbReportAnalytics } from 'react-icons/tb';
import { LuCalendarClock } from 'react-icons/lu';
import { IoSettingsOutline } from 'react-icons/io5';
import { TbGridDots } from "react-icons/tb";
import { MdOutlineWork } from 'react-icons/md';
// import {  } from "react-icons/fa";
import { HiMiniQuestionMarkCircle } from "react-icons/hi2";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { IoNotifications } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { Button, Input } from "antd";
import { PiPhoneCallBold } from "react-icons/pi";
import { BiLogOutCircle } from "react-icons/bi";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import logo from '../../assets/images/gra_logo.png'
import { Dropdown } from 'antd';
import { PiDotsNineLight } from 'react-icons/pi';
import { updateMenuLbl } from '../../features/MenuLblSlice'
import { useDispatch, useSelector } from 'react-redux';
import '../../styles/AppLauncher.css';




const AppLauncherMenu = ({ closeDropdown }) => {
  const dispatch = useDispatch();
  const menuLbl = useSelector((state) => state.menuLbl);

  const handleUpdate = (key, value, e) => {
    dispatch(updateMenuLbl({ key, value }));
    closeDropdown();
  };


  const appItems = [
    { name: 'Subscriptions & Rewards', icon: FaRegUserCircle, bgColor: '#4CAF50' },
    { name: 'Finance', icon: FaRegMoneyBillAlt, bgColor: '#4CAF50' },
    { name: 'Correspondence', icon: FaRegClipboard, bgColor: '#FF7043' },
    { name: 'Events', icon: FaCalendarAlt, bgColor: '#EF5350' },
    { name: 'Courses', icon: LuCalendarClock, bgColor: '#7E57C2' },
    { name: 'Professional Development', icon: MdOutlineWork, bgColor: '#3F51B5' },
    { name: 'Settings', icon: IoSettingsOutline, bgColor: '#3F51B5' },
    { name: 'Configuration', icon: FaCogs, bgColor: '#5E35B1' },
    { name: 'Reports', icon: TbReportAnalytics, bgColor: '#A63D2F' }, // likely meant to be "Reports"
  ];

  return (
    <div className="lancher-div">
      <input
        style={{ width: '100%', border: 'none', backgroundColor: '#fff' }}
        placeholder="Search App"
      />
      <div className="app-launcher-menu">
        {appItems.map((app) => {
          const isActive = menuLbl[app.name];
          const Icon = app.icon;

          return (
            <div
              key={app.name}
              className={`app-item ${isActive ? 'active-item' : ''}`}
              onClick={(e) => handleUpdate(app.name, true, e)}
            >
              <div className="icon-circle" style={{ backgroundColor: app.bgColor }}>
                <Icon className="app-icon-size" />
              </div>
              <div className="app-name-blue">{app.name}</div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export const AppLauncher = () => {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  const handleVisibleChange = (flag) => {
    setVisible(flag);
  };
  return (
    <Dropdown
      dropdownRender={() => <AppLauncherMenu closeDropdown={() => setOpen(false)} />}
      trigger={['click']}
      open={open}
      onOpenChange={(flag) => setOpen(flag)}
      placement="bottomRight"
    >
      <div style={{ cursor: 'pointer', fontSize: '20px' }}>
        <PiDotsNineLight color={'#fff'} size={'30px'} />
      </div>
    </Dropdown>
  );
};

const { Search } = Input;
function Header() {
  const [token, settoken] = useState(null);
  const [regNo, setregNo] = useState("")
  const navigate = useNavigate();
  const {
    filterByRegNo,
    topSearchData,
    ProfileDetails,
    ReportsTitle,
    updateMenuLbl,
    updateMeu
  } = useTableColumns();
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
    <div className="Header-border overflow-y-hidden bg pt-2 pb-2" style={{borderBottom:'2px solid #dcdfe4', width:'100vw' }}>
      <div className="d-flex justify-content-between align-items-center " >
        <div className="d-flex flex-row align-items-center" style={{ paddingLeft: '2.5%', width: '33%' }}>
          <AppLauncher />
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
          </nav>
        </div>
        <div style={{ width: '33%' }}>
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
            style={{ marginRight: "", width: '100%' }}
          />
        </div>

        <div style={{ width: '33%', justifyContent: 'end' }} className="input-container d-flex align-items-center justify-content-end">
          <PiPhoneCallLight
            className="top-icon"
            onClick={() => navigate("/CorrespondencesSummary", { state: { search: "Correspondence" } })}
          />
          <IoNotificationsOutline className="top-icon" />
          <HiOutlineQuestionMarkCircle className="top-icon" />
          <IoMdSettings className="top-icon" />
          <FaRegUserCircle className="top-icon" />
          <FaArrowRightFromBracket
            style={{ marginRight: '30px', fontSize: '25px' }}  // also works
            color="red"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }}
          />
        </div>
      </div>
    </div>


  );
}

export default Header;
