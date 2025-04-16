// sidebarItems.js

import { FaEnvelope, FaCommentDots, FaFileAlt, FaHistory, FaUserAlt, FaCashRegister, FaCreditCard, FaRegFileAlt, FaRegHandshake, FaRegClock, FaRegListAlt, FaUsersCog } from 'react-icons/fa';

export const correspondenceItems = [
  {
    key: 'Email',
    icon: <div className="icon"><FaEnvelope /></div>,
    label: <div className="sidebar-label">Email</div>,
  },
  {
    key: 'SMS',
    icon: <div className="icon"><FaCommentDots /></div>,
    label: <div className="sidebar-label">SMS</div>,
  },
  {
    key: 'Notes & Letters',
    icon: <div className="icon"><FaFileAlt /></div>,
    label: <div className="sidebar-label">Notes & Letters</div>,
  },
  {
    key: 'Communication History',
    icon: <div className="icon"><FaHistory /></div>,
    label: <div className="sidebar-label">Communication History</div>,
  },
];

export const financeItems = [
  {
    key: 'Membership',
    icon: <div className="icon"><FaUserAlt /></div>,
    label: <div className="sidebar-label">Membership</div>,
  },
  {
    key: 'Finance Batches',
    icon: <div className="icon"><FaCashRegister /></div>,
    label: <div className="sidebar-label">Finance Batches</div>,
  },
  {
    key: 'Refunds',
    icon: <div className="icon"><FaCreditCard /></div>,
    label: <div className="sidebar-label">Refunds</div>,
  },
  {
    key: 'Online Payments',
    icon: <div className="icon"><FaRegFileAlt /></div>,
    label: <div className="sidebar-label">Online Payments</div>,
  },
];

export const subscriptionItems = [
  {
    key: 'Profiles',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">Profiles</div>,
  },
  {
    key: 'Applications',
    icon: <div className="icon"><FaRegListAlt /></div>,
    label: <div className="sidebar-label">Applications</div>,
  },
  {
    key: 'Membership',
    icon: <div className="icon"><FaUserAlt /></div>,
    label: <div className="sidebar-label">Membership</div>,
  },
  {
    key: 'Reminders',
    icon: <div className="icon"><FaRegClock /></div>,
    label: <div className="sidebar-label">Reminders</div>,
  },
  {
    key: 'Cancellations',
    icon: <div className="icon"><FaRegFileAlt /></div>,
    label: <div className="sidebar-label">Cancellations</div>,
  },
  {
    key: 'Transfer Requests',
    icon: <div className="icon"><FaRegHandshake /></div>,
    label: <div className="sidebar-label">Transfer Requests</div>,
  },
  {
    key: 'Change Category',
    icon: <div className="icon"><FaRegListAlt /></div>,
    label: <div className="sidebar-label">Change Category</div>,
  },
  {
    key: 'CornMarket',
    icon: <div className="icon"><FaRegListAlt /></div>,
    label: <div className="sidebar-label">CornMarket</div>,
  },
  {
    key: 'Recruit a Friend',
    icon: <div className="icon"><FaRegHandshake /></div>,
    label: <div className="sidebar-label">Recruit a Friend</div>,
  },
];
