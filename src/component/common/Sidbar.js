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
import '../../styles/Sidbar.css';

function Sidbar() {
  const [isSideNav, setIsSideNav] = useState(true);

  const toggleCollapsed = () => {
    setIsSideNav(!isSideNav);
  };

  const handleClick = ({ key }) => {
    switch (key) {
      case '':
        toggleCollapsed()
        break;
      case 'Profile':
        alert('Profile clicked');
        break;
      case 'Cases':
        alert('Cases clicked');
        break;
      case 'Correspondences':
        alert('Correspondences clicked');
        break;
      case 'Documents':
        alert('Documents clicked');
        break;
      case 'Projects':
        alert('Projects clicked');
        break;
      case 'Roster':
        alert('Roster clicked');
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
      key: 'Correspondences',
      icon: <div className="icon" ><FaArrowRightArrowLeft /></div>,
      label: <span className="sidebar-label">Correspondences</span>,
    },
    {
      key: 'Documents',
      icon: <div className="icon"><IoDocumentTextSharp /></div>,
      label: <span className="sidebar-label">Documents</span>,
    },
    {
      key: 'Projects',
      icon: <div className="icon"><FaDiagramProject /></div>,
      label: <span className="sidebar-label">Projects</span>,
    },
    {
      key: 'Transfers',
      icon: <div className="icon"><FaDiagramProject /></div>,
      label: <span className="sidebar-label">Projects</span>,
    },
    {
      key: 'Roster',
      icon: <div className="icon"><FaCalendarDays /></div>,
      label: <span className="sidebar-label">Roster</span>,
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
