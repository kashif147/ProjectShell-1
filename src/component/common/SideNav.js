import {React, useState} from 'react'
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  QuestionOutlined 
} from '@ant-design/icons';
import { FaUserCircle,  FaMoneyCheckAlt } from "react-icons/fa";
import { FaListCheck, FaArrowRightArrowLeft   } from "react-icons/fa6";
import { IoDocumentsOutline } from "react-icons/io5";

import { Button, Menu } from 'antd';
// import 'bootstrap/dist/css/bootstrap.min.css';

function SideNav() {
  const [isSideNav, setisSideNav] = useState(false)
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
      icon: isSideNav? <MenuUnfoldOutlined className='specific-icon'style={{ color: 'white' }} onClick={toggleCollapsed} />:<MenuFoldOutlined style={{ color: 'white' }} className='specific-icon'  onClick={toggleCollapsed} />,
    }, 
    {
      key: '2',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
         <FaUserCircle style={{ fontSize: '27px' }} />
        </div>,
      label: 'Profile',
    },
    {
      key: '2',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
        <FaListCheck /> 
        </div>,
      label: 'Cases',
    },
    
    {
      key: '3',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      <FaMoneyCheckAlt /> 
      </div>,
      label: 'Claims',
    },
    {
      key: '4',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      <FaArrowRightArrowLeft /> 
      </div>,
      label: 'Correspondences',
    },
    {
      key: '5',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      
      <IoDocumentsOutline /> 
      </div>,
      label: 'Documents',
    },
    {
      key: '6',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      
      <IoDocumentsOutline /> 
      </div>,
      label: 'Projects',
    },
    {
      key: '7',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      
      <IoDocumentsOutline /> 
      </div>,
      label: 'Roster',
    },
    {
      key: '8',
      icon: <div className={`${isSideNav==false? "label-nav": "label-nav-collaps"}`}>
      
      <IoDocumentsOutline /> 
      </div>,
      label: 'Tranings',
    },
   
  ];
  
  return (
    <div className='sid-nav-main'
      style={{
  
        maxWidth:'256',
        height:"100%"
      }}
    >
      <Menu
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        theme="dark"
        inlineCollapsed={isSideNav}
        items={items}
      />
    </div>
  )
}

export default SideNav
