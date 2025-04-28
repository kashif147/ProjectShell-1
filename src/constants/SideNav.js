// sidebarItems.js

import { FaEnvelope, FaCommentDots, FaFileAlt, FaHistory, FaUserAlt, FaCashRegister, FaCreditCard, FaRegFileAlt, FaRegHandshake, FaRegClock, FaRegListAlt, FaUsersCog } from 'react-icons/fa';
import {
  FaBan,
  FaBalanceScale,
  FaClipboardCheck,
  FaMoneyCheckAlt,
  FaCalendarAlt,
  FaUserPlus,
  FaUserMinus,
  FaChartBar,
  FaUserEdit,
  FaUserTimes,
  FaUserLock,
   
} from 'react-icons/fa';
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
    key: 'Batches',
    icon: <div className="icon"><FaCashRegister /></div>,
    label: <div className="sidebar-label">Batches</div>,
  },
  {
    key: 'Direct Debits',
    icon: <div className="icon"><FaCreditCard /></div>,
    label: <div className="sidebar-label">Direct Debits</div>,
    
  },
  {
    key: 'DD',
    icon: <div className="icon"><FaRegFileAlt /></div>,
    label: <div className="sidebar-label">DD</div>,
  },
  {
    key: 'Authorisations',
    icon: <div className="icon"><FaUserAlt /></div>,
    label: <div className="sidebar-label">Authorisations</div>,
  },
  {
    key: 'DD Batches',
    icon: <div className="icon"><FaCashRegister /></div>,
    label: <div className="sidebar-label">DD Batches</div>,
  },
  {
    key: 'Salary',
    icon: <div className="icon"><FaCreditCard /></div>,
    label: <div className="sidebar-label">Salary</div>,
  },
  {
    key: 'Deductions',
    icon: <div className="icon"><FaRegFileAlt /></div>,
    label: <div className="sidebar-label">Deductions</div>,
  },
  {
    key: 'DAS',
    icon: <div className="icon"><FaUserAlt /></div>,
    label: <div className="sidebar-label">DAS</div>,
  },
  {
    key: 'DAS Authorisations',
    icon: <div className="icon"><FaCashRegister /></div>,
    label: <div className="sidebar-label">DAS Authorisations</div>,
  },
  {
    key: 'Imports',
    icon: <div className="icon"><FaCreditCard /></div>,
    label: <div className="sidebar-label">Imports</div>,
  },
];
export const profileItems = [
  {
    key: 'Non Members',
    icon: <div className="icon"><FaUserAlt /></div>,
    label: <div className="sidebar-label">Non Members</div>,
  },
  {
    key: 'Members',
    icon: <div className="icon"><FaCashRegister /></div>,
    label: <div className="sidebar-label">Members</div>,
  },
  {
    key: 'Leavers',
    icon: <div className="icon"><FaCreditCard /></div>,
    label: <div className="sidebar-label">Leavers</div>,
  },
  {
    key: 'Joiners',
    icon: <div className="icon"><FaRegFileAlt /></div>,
    label: <div className="sidebar-label">Joiners</div>,
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
export const configurationItems = [
  {
    key: 'Organistaion Groups',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">Organistaion Groups</div>,
  },
  {
    key: 'Work Location Branches',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">Work Location Branches</div>,
  },
  {
    key: 'Region Committees',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">Region Committees</div>,
  },
  {
    key: 'Sections',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">Sections</div>,
  },
  {
    key: 'Rate Categories Youth Fourms',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">Rate Categories Youth Fourms</div>,
  },
  {
    key: 'Subscription Products',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">Subscription Products</div>,
  },
  {
    key: 'Templetes',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">Templetes</div>,
  },
  {
    key: 'System Configuration',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">System Configuration</div>,
  },
];
export const reportItems = [
  {
    key: 'Cancelled Members Report',
    icon: <div className="icon"><FaBan /></div>,
    label: <div className="sidebar-label">Cancelled Members Report</div>,
  },
  {
    key: 'Comparison Report',
    icon: <div className="icon"><FaBalanceScale /></div>,
    label: <div className="sidebar-label">Comparison Report</div>,
  },
  {
    key: 'Control Report',
    icon: <div className="icon"><FaClipboardCheck /></div>,
    label: <div className="sidebar-label">Control Report</div>,
  },
  {
    key: 'Deferred Income',
    icon: <div className="icon"><FaMoneyCheckAlt /></div>,
    label: <div className="sidebar-label">Deferred Income</div>,
  },
  {
    key: 'End of Year Reports',
    icon: <div className="icon"><FaCalendarAlt /></div>,
    label: <div className="sidebar-label">End of Year Reports</div>,
  },
  {
    key: 'Executive Council Report',
    icon: <div className="icon"><FaUsersCog /></div>,
    label: <div className="sidebar-label">Executive Council Report + drill down listings</div>,
  },
  {
    key: 'Joiners Report',
    icon: <div className="icon"><FaUserPlus /></div>,
    label: <div className="sidebar-label">Joiners Report</div>,
  },
  {
    key: 'Leavers Report',
    icon: <div className="icon"><FaUserMinus /></div>,
    label: <div className="sidebar-label">Leavers Report</div>,
  },
  {
    key: 'Live Stats',
    icon: <div className="icon"><FaChartBar /></div>,
    label: <div className="sidebar-label">Live Stats</div>,
  },
  {
    key: 'New Members Report',
    icon: <div className="icon"><FaUserEdit /></div>,
    label: <div className="sidebar-label">New Members Report</div>,
  },
  {
    key: 'Resigned Members Report',
    icon: <div className="icon"><FaUserTimes /></div>,
    label: <div className="sidebar-label">Resigned Members Report</div>,
  },
  {
    key: 'Suspended Members Report',
    icon: <div className="icon"><FaUserLock /></div>,
    label: <div className="sidebar-label">Suspended Members Report</div>,
  },
];
export const issuesItems = [
  {
    key: 'Issues',
    icon: <div className="icon"><FaUserAlt /></div>,
    label: <div className="sidebar-label">Issues</div>,
  },
  {
    key: 'Cases',
    icon: <div className="icon"><FaUserAlt /></div>,
    label: <div className="sidebar-label">Cases</div>,
  },
]
export const eventsItems = [
  {
    key: 'Manage Events',
    icon: <div className="icon"><FaUserAlt /></div>,
    label: <div className="sidebar-label">Manage Events</div>,
  },]