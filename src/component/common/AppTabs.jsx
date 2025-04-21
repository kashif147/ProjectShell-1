import React from 'react';
import { Button, Tabs } from 'antd';
import MyDeatails from './MyDeatails';
import CasesById from '../../pages/Cases/CasesById';
import ClaimsById from '../../pages/Claims/ClaimsById';
import CorspndncDetail from '../../pages/Correspondences/CorspndncDetail';
import RosterDetails from '../../pages/roster/RosterDetails';
import SimpleMenu from './SimpleMenu';
import { BsSliders, BsThreeDots } from "react-icons/bs";

function AppTabs() {
  const { TabPane } = Tabs;

  const onChange = (key) => {
    console.log(key);
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
      children: <MyDeatails />,
    },
    // {
    //   key: '3',
    //   label: 'Audit History',
    //   children: <MyDeatails />,
    // },
    {
      key: '4',
      label: 'Documents',
      children: <MyDeatails />,
    },
    {
      key: '5',
      label: 'Communication History',
      children: <MyDeatails />,
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
    // {
    //   key: '8',
    //   label: 'Correspondences',
    //   children: <CorspndncDetail />,
    // },
    // {
    //   key: '9',
    //   label: 'Roster',
    //   children: <RosterDetails />,
    // },
    // {
    //   key: '10',
    //   label: 'Documents',
    //   children: 'Documents content',
    // },
    // {
    //   key: '11',
    //   label: 'Projects',
    //   children: 'Projects content',
    // },
    // {
    //   key: '12',
    //   label: 'Trainings',
    //   children: 'Trainings content',
    // },
  ];

  return (
    <Tabs
      defaultActiveKey="1"
      onChange={onChange}
      style={{ width: '100vw' }}
    >
      {items.map((item) => (
        <TabPane tab={item.label} key={item.key}>
          {item.children}
        </TabPane>
      ))}

      {/* Final tab (non-functional) with button */}
      <TabPane
        key="button"
        tab={
          <div style={{ marginLeft: 8 }}>
            {/* <Button type="primary" size="small">Test</Button> */}
            <SimpleMenu
              title={
                <BsThreeDots
                  style={{ fontSize: "15px", fontWeight: 500 }}
                />
              }
              data={{ "Roster": "false", "Documents": "false", 'Projects': 'false', 'Trainings': 'false','Audit History':'false'}}
              isCheckBox={false}
              isSearched={false}
              isTransparent={true}
              vertical={true}

            />
          </div>
        }
        disabled
      />
    </Tabs>
  );
}

export default AppTabs;
