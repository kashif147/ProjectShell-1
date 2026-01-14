import {React, useState} from 'react'
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  QuestionOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { FaUser } from "react-icons/fa6";
import { FaUserCircle,  FaMoneyCheckAlt } from "react-icons/fa";
import { FaListCheck, FaArrowRightArrowLeft,FaCalendarDays,    } from "react-icons/fa6";
import { IoDocumentsOutline } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { Button, Menu } from 'antd';
import { TfiMenu } from "react-icons/tfi";
import { FaDiagramProject, FaSun  } from "react-icons/fa6";
import { IoDocumentsSharp } from "react-icons/io5";
import { MdWbSunny } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClassNames } from '@emotion/react';
import '../../styles/SideNav.css'
// import 'bootstrap/dist/css/bootstrap.min.css';

function SideNav() {
  const location = useLocation();
const nav = location?.pathname

  const navigate = useNavigate();

  const [isSideNav, setisSideNav] = useState(true);
  const toggleCollapsed = () => setisSideNav(!isSideNav);

  const items = [
    {
      key: '1',
      icon: (
        <div className='icon' >
          <TfiMenu
                       onClick={toggleCollapsed}
          />
        </div>
      )
    },
    {
      key: 'Profile',
      icon: (
        <div className={`${isSideNav && nav==='/Details'  ? "icon-collapsed" :  "icon"}`}>
          <FaUser />
        </div>
      ),
      label: 'Profile',
      className:`${nav==='/Details' && isSideNav===false? 'selected-dev':''}`
    
    },
    {
      key: 'Cases',
      icon: (
        <div className={`${isSideNav && nav==='/CasesById'  ? "icon-collapsed": "icon"}`}>
          <FaListCheck />
        </div>
      ),
      label: 'Cases',
      className:`${nav==='/CasesById' && isSideNav===false? 'selected-dev':''}`
    },
    {
      key: 'Claims',
      icon: (
        <div className={`${isSideNav && nav==='/ClaimsById'  ? "icon-collapsed": "icon"}`}>
          <FaMoneyCheckAlt />
        </div>
      ),
      label: 'Claims',
      className:`${nav==='/ClaimsById' && isSideNav===false? 'selected-dev':''}`
    },
    {
      key: 'Correspondences',
      icon: (
        <div className={`${isSideNav && nav==='/CorspndncDetail'  ? "icon-collapsed": "icon"}`}>
          <FaArrowRightArrowLeft />
        </div>
      ),
      label: 'Correspondences',
       className:`${nav==='/CorspndncDetail' && isSideNav===false? 'selected-dev':''}`
      },
      {
        key: 'Documents',
        icon: (
          <div className={`${isSideNav && nav==='/Doucmnets'  ? "icon-collapsed": "icon"}`}>
          <IoDocumentsSharp />
        </div>
      ),
      label: 'Documents',
      // className:`${nav==='' && isSideNav===false? 'selected-dev':''}`
      className:`${nav==='/Doucmnets' && isSideNav===false? 'selected-dev':''}`
      
    },
    {
      key: 'Projects',
      icon: (
        <div className={`icon`}>
          <FaDiagramProject />
        </div>
      ),
      label: 'Projects',
    },
    {
      key: 'Roster',
      icon: (
        <div className='icon'>
          <FaCalendarDays  />
        </div>
      ),
      label: 'Roster',
    },
    {
      key: 'Tranings',
      icon: (
        <div className='icon'>
          <FaSun  />
        </div>
      ),
      label: 'Tranings',
    },
  ];

  const handleClick = ({ key }) => {
    switch (key) {
      case 'Profile':
        navigate("/Details");
        break;
      case 'Cases':
        navigate("/CasesById");
        break;
      case 'Claims':
        navigate("/ClaimsById");
        break;
      case 'Correspondences':
        navigate("/CorspndncDetail");
        break;
      case 'Documents':
        navigate("/Doucmnets");
        break;
      case 'Roster':
        navigate("/Roster");
        break;
      default:
        
    }
  };

  return (

      <Menu
        mode="inline"
        theme="dark"
        style={{
          width: isSideNav ? '60px' : '200px',
          transition: 'width 0.3s',
        }}
        inlineCollapsed={isSideNav}
        items={items}
        onClick={handleClick}
        className={`${isSideNav ? "menu-collapsed" : "menu-expanded"}`}
      />


  )
}

export default SideNav
