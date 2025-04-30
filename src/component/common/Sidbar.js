import React, { useEffect,useMemo } from 'react';
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
import { useNavigate,useLocation } from "react-router-dom";

const Sidbar = () => {
  const menuLblState = useSelector((state) => state.menuLbl);
  const location = useLocation();
  const navigate = useNavigate();

  // Find active tab
  const activeKey = Object.keys(menuLblState).find((key) => menuLblState[key]);
  const itemsMap = {
    'Subscriptions & Rewards': subscriptionItems,
    Finance: financeItems,
    Correspondence: correspondenceItems,
    Configuration: configurationItems,
    Profiles: profileItems,
    Reports: reportItems,
    "Issue Management": issuesItems,
    Events: eventsItems,
  };
  const menuItems = itemsMap[activeKey] || [];
  const selectedKey = useMemo(() => {
    if (location.pathname === '/Summary') return 'Profiles';
    if (location.pathname === '/ClaimSummary') return 'Claims';
    if (location.pathname === '/CasesSummary') return 'Cases';
    if (location.pathname === '/CorrespondencesSummary') return 'Correspondences';
    if (location.pathname === '/Transfers') return 'Transfer Requests';
    if (location.pathname === '/Configuratin') return 'System Configuration';
    if (location.pathname === '/RosterSummary') return 'Roster';
    if (location.pathname === '/Batches') return 'Batches';
    if (location.pathname === '/Applications') return 'Applications';
    if (location.pathname === '/RemindersSummary') return 'Reminders';
    if (location.pathname === '/Cancallation') return 'Cancellations';
    if (location.pathname === '/ChangCateSumm') return 'Change Category';
    if (location.pathname === '/Import') return 'Imports';
    return '';
  }, [location.pathname]);

  const handleClick = ({ key }) => {
    switch (key) {
      case 'Profiles':
        navigate("/Summary", { state: { search: 'Profile' } });
        break;
      case 'Claims':
        navigate("/ClaimSummary", { state: { search: 'Claims' } });
        break;
      case 'Cases':
        navigate("/CasesSummary", { state: { search: 'Cases' } });
        break;
      case 'Correspondences':
        navigate("/CorrespondencesSummary", { state: { search: 'Correspondences' } });
        break;
      case 'Transfer Requests':
        navigate("/Transfers", { state: { search: 'Transfers' } });
        break;
      case 'System Configuration':
        navigate("/Configuratin", { state: { search: '' } });
        break;
      case 'Roster':
        navigate("/RosterSummary", { state: { search: 'Rosters' } });
        break;
      case 'Batches':
        navigate("/Batches", { state: { search: 'Batches' } });
        break;
      case 'Applications':
        navigate("/Applications", { state: { search: 'Applications' } });
        break;
      case 'Reminders':
        navigate("/RemindersSummary", { state: { search: 'Reminders' } });
        break;
      case 'Cancellations':
        navigate("/Cancallation", { state: { search: 'Cancallation' } });
        break;
      case 'Trainings':
        alert('Trainings clicked');
        break;
      case 'Change Category':
        navigate("/ChangCateSumm", { state: { search: 'Change Category Summary' } });
        break;
      case 'Imports':
        navigate("/Import", { state: { search: 'Imports' } });
        break;
      case 'Batches':
        navigate("/Batches", { state: { search: 'Batches' } });
        break;
      default:
        console.log('Unknown key:', key);
    }
  };

  useEffect(() => {
    if (menuLblState["Subscriptions & Rewards"] === true) {
      navigate("/Summary", { state: { search: 'Profile' } });
    }
    if (menuLblState["Finance"] === true) {
      navigate("/Batches", { state: { search: 'Batches' } });
    }
    if (menuLblState["Correspondence"] === true) {
      navigate("/CorrespondencesSummary", { state: { search: 'Correspondences' } });
    }
    if (menuLblState["Configuration"] === true) {
      navigate("/Configuratin", { state: { search: 'Configuration' } });
    }
  }, [menuLblState]);
  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}  
      style={{ width: '7vw', height: '100vh', borderRight: 0 }}
      items={menuItems}
      className="sidebar-menu"
      onClick={handleClick}
    />
  );
};

export default Sidbar;
