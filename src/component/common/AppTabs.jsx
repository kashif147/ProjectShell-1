import { useState, Suspense, lazy } from 'react';
import { Tabs, Spin } from 'antd';
import {
  FaFolder,
  FaFileAlt,
  FaProjectDiagram,
  FaBook,
  FaHistory,
} from 'react-icons/fa';
import TransferRequests from '../TransferRequests';
import CategoryChangeRequest from '../details/ChangeCategoryDrawer'
import Reminder from '../profile/Reminder';

const { TabPane } = Tabs;

const MyDeatails = lazy(() => import('../profile/MembershipForm'));
const CasesById = lazy(() => import('../../pages/Cases/CasesById'));
const ClaimsById = lazy(() => import('../../pages/Claims/ClaimsById'));
const FinanceByID = lazy(() => import('../finanace/FinanceByID'));
const DoucmentsById = lazy(() => import('../corespondence/DoucmentsById'));
const CommunicationHistory = lazy(() => import('../corespondence/CommunicationHistory'));
const ThreeDotsMenu = lazy(() => import('../common/ThreeDotsMenu'));
const Roster = lazy(() => import('../../pages/roster/RosterDetails'));
const HistoryByID = lazy(() => import('../../pages/HistoryByID'));
const ProfileHeader = lazy(() => import('../common/ProfileHeader'));


const staticTabKeys = ['1', '2', '4', '5', '6', '7'];

function AppTabs() {
  const [activeKey, setActiveKey] = useState('1');
  const [visibleTabs, setVisibleTabs] = useState(staticTabKeys);
  const [TransferDrawer, setTransferDrawer] = useState(false);
  const [isReminder, setIsReminder] = useState(false);
    const [isDrawerOpen, setisDrawerOpen] = useState(false)

  const allItems = [
    { key: '1', label: 'Membership', children: <MyDeatails /> },
    { key: '2', label: 'Finance', children: <FinanceByID /> },
    { key: '4', label: 'Documents', children: <DoucmentsById /> },
    { key: '5', label: 'Communication History', children: <CommunicationHistory /> },
    { key: '6', label: 'Cases', children: <CasesById /> },
    { key: '7', label: 'Claims', children: <ClaimsById /> },
    { key: '8', label: 'Roster', children: <Roster /> },
    { key: '11', label: 'Audit History', children: <HistoryByID /> },
    { key: '9', label: 'Projects', children: <div>Projects</div> },
    { key: '10', label: 'Trainings', children: <div>Trainings</div> },
  ];

  const handleMenuClick = (key) => {
    const isStatic = staticTabKeys.includes(activeKey);

    setVisibleTabs((prev) => {
      const newTabs = [...prev];

      // Remove existing dynamic (non-static) tabs
      const updatedTabs = newTabs.filter((tabKey) => staticTabKeys.includes(tabKey));

      // Add new tab if it's not already in the list
      if (!updatedTabs.includes(key)) {
        updatedTabs.push(key);
      }

      return updatedTabs;
    });

    setActiveKey(key);
  };
  const handleTabChange = (key) => {
    const isStatic = staticTabKeys.includes(key);

    if (isStatic) {
      // Remove all dynamic tabs
      setVisibleTabs((prev) => prev.filter((tabKey) => staticTabKeys.includes(tabKey)));
    }

    setActiveKey(key);
  };
  const filteredItems = allItems.filter(item => visibleTabs.includes(item.key));
  const Menuitems = [
    { key: '8', label: 'Roster', icon: <FaFolder />, onClick: () => handleMenuClick('8') },
    // { key: '4', label: 'Documents', icon: <FaFileAlt />, onClick: () => handleMenuClick('4') },
    { key: '9', label: 'Projects', icon: <FaProjectDiagram />, onClick: () => handleMenuClick('9') },
    { key: '10', label: 'Trainings', icon: <FaBook />, onClick: () => handleMenuClick('10') },
    { key: '11', label: 'Audit History', icon: <FaHistory />, onClick: () => handleMenuClick('11') },
    { key: '12', label: 'Transfered History', icon: <FaHistory />, onClick: () => setTransferDrawer(true) },
    { key: '13', label: 'Membership Category', icon: <FaHistory />, onClick: () => setisDrawerOpen(true) },
    { key: '14', label: 'Reminders', icon: <FaHistory />, onClick: () => setIsReminder(true) }];
  const historyData =[
  {
    key: '1',
    oldCategory: 'general',
    newCategory: 'postgraduate_student',
    effectiveDate: '01/12/2023',
    notes: 'Member enrolled in postgraduate program',
    remarks: 'Approved by admin after verification',
  },
  {
    key: '2',
    oldCategory: 'postgraduate_student',
    newCategory: 'affiliate_non_practicing',
    effectiveDate: '01/12/2023',
    notes: 'Requested due to career break',
    remarks: 'Confirmed with HR letter',
  },
  {
    key: '3',
    oldCategory: 'affiliate_non_practicing',
    newCategory: 'retired_associate',
    effectiveDate: '01/12/2023',
    notes: 'Retirement request submitted',
    remarks: 'Final approval granted',
  },
];
  const columnHistory = [
  {
    title: "Old Category",
    dataIndex: "oldCategory",
    key: "oldCategory",
  },
  {
    title: "New Category",
    dataIndex: "newCategory",
    key: "newCategory",
  },
  {
    title: "Effective Date",
    dataIndex: "effectiveDate",
    key: "effectiveDate",
  },
  {
    title: "Reason",
    dataIndex: "Reason",
    key: "Reason",
  },
  {
    title: "Remarks",
    dataIndex: "remarks",
    key: "remarks",
  },
];

  return (
    <div className='d-flex'>
      <ProfileHeader />
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        destroyInactiveTabPane
        style={{ width: '100%' }}
      >
        {filteredItems.map((item) => (
          <TabPane tab={item.label} key={item.key}>
            <Suspense fallback={<Spin />}>
              {item.children}
            </Suspense>
          </TabPane>
        ))}
        <TabPane
          key="menu"
          tab={<div style={{ marginLeft: 8 }}><ThreeDotsMenu items={Menuitems} /></div>}
          disabled
        />
      </Tabs>
      <TransferRequests
        open={TransferDrawer}
        onClose={() => setTransferDrawer(false)}
        isSearch={false}
        isChangeCat={false}
      />
      <CategoryChangeRequest
        open={isDrawerOpen}
        onClose={() => setisDrawerOpen(false)}
        columnHistory={columnHistory}
        historyData={historyData}
      />
      <Reminder
        open={isReminder}
        onClose={() => setIsReminder(false)}
      />
    </div>
  );
}

export default AppTabs;
