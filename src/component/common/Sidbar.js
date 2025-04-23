import React from 'react';
import { Menu } from 'antd';
import {
  subscriptionItems,
  financeItems,
  correspondenceItems,
  configurationItems,
  profileItems,
  reportItems,
  issuesItems,
  eventsItems
} from '../../constants/SideNav';
import { useSelector } from 'react-redux';
import '../../styles/Sidbar.css';
import { useNavigate } from "react-router-dom";

const Sidbar = () => {
  const menuLblState = useSelector((state) => state.menuLbl);

  // Find the active menu (only one is true)
  const activeKey = Object.keys(menuLblState).find((key) => menuLblState[key]);

  // Mapping keys to their respective item arrays
  const itemsMap = {
    'Subscriptions & Rewards': subscriptionItems,
    Finance: financeItems,
    Correspondence: correspondenceItems,
   Configuration:configurationItems,
   Profiles:profileItems,
   Reports:reportItems,
   "Issue Management": issuesItems,
    Events: eventsItems,
    // Courses: coursesItems,
    // // 'Professional Development': professionalDevelopmentItems,
    // Settings: settingsItems,
  };
  const navigate = useNavigate();
  const menuItems = itemsMap[activeKey] || [];
  const handleClick = ({ key }) => {
    switch (key) {
      // case '':
      //   toggleCollapsed()
      //   break;
      case 'Profiles':
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
      case 'System Configuration':
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
      case 'Applications':
        navigate("/Applications", {
          state: {
            search: 'Applications',
          }
        })
        break;
      case 'Trainings':
        alert('Trainings clicked');
        break;
      case 'Change Category':
        navigate("/ChangCateSumm", {
          state: {
            search: 'Change Category Summary',
          }
        })
        break;
      default:
        console.log('Unknown key:', key);
    }
  };
  return (
    <Menu
      mode="inline"
      style={{ width:'5vw',height:'100vh', borderRight: 0 }}
      items={menuItems}
      className="sidebar-menu"
      onClick={handleClick}

    />
  );
};

export default Sidbar;
