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


// import 'bootstrap/dist/css/bootstrap.min.css';

function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isSideNav, setisSideNav] = useState(true)
  const toggleCollapsedFtn = ()=>{
      setisSideNav(!isSideNav)
  }
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };
  const toggleCollapsed = () => {
    toggleCollapsedFtn()
  };
  const items = [
    {
      key: '1',
      icon:
      <div className={`${isSideNav==false? "label-nav1": "label-nav-collaps1"}`}>
        <TfiMenu   className=''style={{ color: 'white', fontSize: '25px' }} onClick={toggleCollapsed} />
      </div>
    }, 
    {
      key: '2',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
         <FaUser  style={{ fontSize: '24px',  }} />
        </div>,
      label: 'Profile',
      className: location?.state=="/Details" ? 'custom-highlight' : '',
      onclick:()=>navigate("/ClaimsById")
    },
    {
      key: '3',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
        <FaListCheck   style={{ fontSize: '24px' }} /> 
        </div>,
      label: 'Cases',
    },
    
    {
      key: '4',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      <FaMoneyCheckAlt style={{ fontSize: '24px' }} /> 
      </div>,
      label: 'Claims',
    },
    {
      key: '5',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      <FaArrowRightArrowLeft style={{ fontSize: '24px' }} /> 
      </div>,
      label: 'Correspondences',
    },
    {
      key: '6',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      
      <IoDocumentsSharp  style={{ fontSize: '24px' }} /> 
      </div>,
      label: 'Documents',
    },
    {
      key: '7',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      
      <FaDiagramProject  style={{ fontSize: '24px' }} /> 
      </div>,
      label: 'Projects',
    },
    {
      key: '8',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      
      <FaCalendarDays style={{ fontSize: '24px' }} /> 
      </div>,
      label: 'Roster',
    },
    {
      key: '9',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      
      <FaSun style={{ fontSize: '24px' }} /> 
      </div>,
      label: 'Tranings',
    },
   
  ];
  const handleClick = ({ key }) => {
    switch (key) {
      case '2':
        navigate("/ClaimsById");
        break;
      case '3':
        console.log("Navigate to Cases");
        break;
      case '4':
        navigate("/ClaimsById");
        break;
      case '5':
        console.log("Navigate to Correspondences");
        break;
      case '6':
        console.log("Navigate to Documents");
        break;
      case '7':
        console.log("Navigate to Projects");
        break;
      case '8':
        console.log("Navigate to Roster");
        break;
      case '9':
        console.log("Navigate to Trainings");
        break;
      default:
        console.log("Toggle Menu");
    }
  };
  
  return (
    <div className='sid-nav-main'
      style={{
        height:"100%",
       
      }}
    >
      <Menu
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        theme="dark"
        style={{ width: isSideNav ? '60px' : '200px' }}
        inlineCollapsed={isSideNav}
        items={items}
        onClick={handleClick}
      />
    </div>
  )
}

export default SideNav
