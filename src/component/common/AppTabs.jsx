import { useState, Suspense, lazy } from 'react';
import { Tabs, Spin } from 'antd';
import { FaFolder, FaFileAlt, FaProjectDiagram, FaBook, FaHistory } from 'react-icons/fa';

const MyDeatails = lazy(() => import('./MyDeatails'));
const CasesById = lazy(() => import('../../pages/Cases/CasesById'));
const ClaimsById = lazy(() => import('../../pages/Claims/ClaimsById'));
const FinanceByID = lazy(() => import('../finanace/FinanceByID'));
const DoucmentsById = lazy(() => import('../corespondence/DoucmentsById'));
const CommunicationHistory = lazy(() => import('../corespondence/CommunicationHistory'));
const ThreeDotsMenu = lazy(() => import('../common/ThreeDotsMenu'));
const Roster = lazy(() => import('../../pages/roster/RosterDetails'));

function AppTabs() {
  const { TabPane } = Tabs;
  const [activeKey, setActiveKey] = useState("1");

  const onChange = (key) => {
    console.log("Switched to tab:", key);
    setActiveKey(key);
  };

  const items = [
    {
      key: '1',
      label: 'Membership',
      children: <MyDeatails />,
    },
    {
      key: '2',
      label: 'Finance',
      children: <FinanceByID />,
    },
    {
      key: '4',
      label: 'Documents',
      children: <DoucmentsById />,
    },
    {
      key: '5',
      label: 'Communication History',
      children: <CommunicationHistory />,
    },
    {
      key: '6',
      label: 'Cases',
      children: <CasesById />,
    },
    {
      key: '7',
      label: 'Claims',
      children: <ClaimsById />,
    },
    {
      key: '8',
      children: <Roster />,
    },
  ];
  const Menuitems = [
  { key: "Roster", label: "Roster", icon: <FaFolder />, onClick: () => setActiveKey("8") },
  { key: "Documents", label: "Documents", icon: <FaFileAlt /> },
  { key: "Projects", label: "Projects", icon: <FaProjectDiagram /> },
  { key: "Trainings", label: "Trainings", icon: <FaBook /> },
  { key: "Audit History", label: "Audit History", icon: <FaHistory /> }
  
];

  return (
    <Tabs
      activeKey={activeKey}
      onChange={onChange}
      destroyInactiveTabPane
      style={{ width: '100vw' }}
    >
      {items.map((item) => (
        <TabPane tab={item.label} key={item.key}>
          <Suspense fallback={<Spin />}>
            {item.children}
          </Suspense>
        </TabPane>
      ))}

      <TabPane
        key="button"
        tab={
          <div style={{ marginLeft: 8 }}>
           <ThreeDotsMenu items={Menuitems} />
          </div>
        }
        disabled
      />
    </Tabs>
  );
}

export default AppTabs;
