import React from 'react';
import { Menu } from 'antd';
import {
  FaUser,
  FaListCheck,
  FaCalendarDays,
  FaArrowRightArrowLeft,
  FaDiagramProject,
} from 'react-icons/fa6';
import { IoSettingsOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { FaRegCircleUser } from "react-icons/fa6";
import { FaRegEnvelope } from "react-icons/fa";
import { LuCalendarClock } from "react-icons/lu";

import '../../styles/Sidbar.css';

function Sidbar() {
  const navigate = useNavigate();

  const handleClick = ({ key }) => {
    switch (key) {
      case 'Profile':
        navigate('/Summary', { state: { search: 'Profile' } });
        break;
      case 'Claims':
        navigate('/ClaimSummary', { state: { search: 'Claims' } });
        break;
      case 'Cases':
        navigate('/CasesSummary', { state: { search: 'Cases' } });
        break;
      case 'Correspondences':
        navigate('/CorrespondencesSummary', { state: { search: 'Correspondences' } });
        break;
      case 'Transfer Requests':
        navigate('/Transfers', { state: { search: 'Transfers' } });
        break;
      case 'Configuration':
        navigate('/Configuratin', { state: { search: '' } });
        break;
      case 'Roster':
        navigate('/RosterSummary', { state: { search: 'Rosters' } });
        break;
      default:
        console.log('Unknown key:', key);
    }
  };

  const items = [
    {
      key: 'Profile',
      icon: <div className="icon"><FaRegCircleUser  /></div>,
      label: <div className="sidebar-label">Profile</div>,
    },
    {
      key: 'Cases',
      icon: <div className="icon"><FaListCheck /></div>,
      label: <div className="sidebar-label">Cases</div>,
    },
    {
      key: 'Claims',
      icon: <div className="icon"><FaListCheck /></div>,
      label: <div className="sidebar-label">Claims</div>,
    },
    {
      key: 'Correspondences',
      icon: <div className="icon"><FaRegEnvelope /></div>,
      label: <div className="sidebar-label">Correspondences</div>,
    },
    {
      key: 'Transfer Requests',
      icon: <div className="icon"><FaDiagramProject /></div>,
      label: <div className="sidebar-label">Transfer Requests</div>,
    },
    {
      key: 'Roster',
      icon: <div className="icon"><LuCalendarClock /></div>,
      label: <div className="sidebar-label">Roster</div>,
    },
    {
      key: 'Configuration',
      icon: <div className="icon"><IoSettingsOutline /></div>,
      label: <div className="sidebar-label">Configuration</div>,
    },
  ];

  return (
    <div className="sid-nav-main">
      <Menu
        mode="inline"
        style={{ width: '100px', borderRight: 0 }}
        items={items}
        onClick={handleClick}
        className="sidebar-menu"
      />
    </div>
  );
}

export default Sidbar;
