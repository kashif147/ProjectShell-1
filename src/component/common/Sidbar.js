import React, { useState } from 'react';
import { Menu, Button } from 'antd';
import {
  FaUser,
  FaListCheck,
  FaCalendarDays,
  FaArrowRightArrowLeft,
  FaDiagramProject,
  FaSun,
  FaBars,
} from 'react-icons/fa6';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";
import '../../styles/Sidbar.css';

function Sidbar() {
  const [isSideNav, setIsSideNav] = useState(true);
  const navigate = useNavigate();

  const toggleCollapsed = () => {
    setIsSideNav(!isSideNav);
  };

  const handleClick = ({ key }) => {
    switch (key) {
      case '':
        toggleCollapsed()
        break;
      case 'Profile':
        navigate("/Summary", {
          state: {
            search: 'Profile',
          }
        })
        break;
      case 'Claims':
        navigate("/ClaimSummary", {
          state: {
            search: 'Claims',
          }
        })
        break;
      case 'Cases':
        navigate("/CasesSummary", {
          state: {
            search: 'Cases',
          }
        })
        break;
      case 'Correspondences':
        navigate("/CorrespondencesSummary", {
          state: {
            search: 'Correspondences',
          }
        })
        break;
      case 'Transfer Requests':
        navigate("/Transfers", {
          state: {
            search: 'Transfers',
          }
        })
        break;
      case 'Configuration':
        navigate("/Configuratin", {
          state: {
            search: '',
          }
        })
        break;
      case 'Roster':
        navigate("/RosterSummary", {
          state: {
            search: 'Rosters',
          }
        })
        break;
      case 'Trainings':
        alert('Trainings clicked');
        break;
      default:
        console.log('Unknown key:', key);
    }
  };

  const items = [
    {
      key: '',
      icon: <div className="icon"><FaBars /></div>,
      label: <span className="sidebar-label"></span>,
    },
    {
      key: 'Profile',
      icon: <div className={`${isSideNav ? "icon-collapsed" :  "icon"}`}><FaUser /></div>,
      label: <span className="sidebar-label">Profile</span>,
    },
    {
      key: 'Cases',
      icon: <div className="icon"><FaListCheck /></div>,
      label: <span className="sidebar-label">Cases</span>,
    },
    {
      key: 'Claims',
      icon: <div className="icon"><FaListCheck /></div>,
      label: <span className="sidebar-label">Claims</span>,
    },
    {
      key: 'Correspondences',
      icon: <div className="icon" ><FaArrowRightArrowLeft /></div>,
      label: <span className="sidebar-label">Correspondences</span>,
    },
    // {
    //   key: 'Documents',
    //   icon: <div className="icon"><IoDocumentTextSharp /></div>,
    //   label: <span className="sidebar-label">Documents</span>,
    // },
    
    {
      key: 'Transfer Requests',
      icon: <div className="icon"><FaDiagramProject /></div>,
      label: <span className="sidebar-label">Transfer Requests</span>,
    },
    {
      key: 'Roster',
      icon: <div className="icon"><FaCalendarDays /></div>,
      label: <span className="sidebar-label">Roster</span>,
    },
    {
      key: 'Configuration',
      icon: <div className="icon"><IoSettingsOutline /></div>,
      label: <span className="sidebar-label">Configuration</span>,
    },
  ];

  return (
    <div className="sid-nav-main">
      {/* <Button onClick={toggleCollapsed} className="toggle-btn">
        
      </Button> */}
      <Menu
        mode="inline"
        // theme="dark"
        style={{
          width: isSideNav ? '60px' : '200px',
          transition: 'width 0.3s',
        }}
        inlineCollapsed={isSideNav}
        items={items}
        onClick={handleClick}
        className={isSideNav ? 'menu-collapsed' : 'menu-expanded'}
      />
    </div>
  );
}

export default Sidbar;
