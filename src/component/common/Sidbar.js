import React from 'react';
import { Menu } from 'antd';
import {
  subscriptionItems,
  financeItems,
  correspondenceItems
} from '../../constants/SideNav';
import { useSelector } from 'react-redux';
import '../../styles/Sidbar.css';

const Sidbar = () => {
  const menuLblState = useSelector((state) => state.menuLbl);

  // Find the active menu (only one is true)
  const activeKey = Object.keys(menuLblState).find((key) => menuLblState[key]);

  // Mapping keys to their respective item arrays
  const itemsMap = {
    Subscriptions: subscriptionItems,
    Finance: financeItems,
    Correspondence: correspondenceItems,
    // Issues: issuesItems,
    // Events: eventsItems,
    // Courses: coursesItems,
    // // 'Professional Development': professionalDevelopmentItems,
    // Settings: settingsItems,
  };

  const menuItems = itemsMap[activeKey] || [];

  return (
    <Menu
      mode="inline"
      style={{ width:'4.9vw',height:'100vh', borderRight: 0 }}
      items={menuItems}
      className="sidebar-menu"
      onClick={(e) => console.log('Clicked:', e.key)}
    />
  );
};

export default Sidbar;
