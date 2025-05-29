import { useState, Suspense, lazy } from 'react';
import { Tabs, Spin } from 'antd';
import {
  FaFolder,
  FaFileAlt,
  FaProjectDiagram,
  FaBook,
  FaHistory,
} from 'react-icons/fa';

const { TabPane } = Tabs;

const MyDeatails = lazy(() => import('./MyDeatails'));
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
  ];

  return (
    <div className='d-flex'>
       <ProfileHeader />
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        destroyInactiveTabPane
        style={{width:'100%' }}
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
  
    </div>
  );
}

export default AppTabs;
