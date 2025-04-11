
import React from 'react';
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';

import { Tabs } from 'antd';
import MyDeatails from './MyDeatails';
import CasesById from '../../pages/Cases/CasesById'
import ClaimsById from '../../pages/Claims/ClaimsById';
import CorspndncDetail from '../../pages/Correspondences/CorspndncDetail';
import RosterDetails from '../../pages/roster/RosterDetails'

function AppTabs() {
    const onChange = key => {
        console.log(key);
      };
    const items = [
        {
          key: '1',
          label: 'Profile',
          children: <MyDeatails />,
        },
        {
          key: '2',
          label: 'Cases',
          children: <CasesById/>,
        },
        {
          key: '4',
          label: 'Claims',
          children: <ClaimsById/>,
        },
        {
          key: '5',
          label: 'Correspondences',
          children: <CorspndncDetail/>,
        },
        {
          key: '3',
          label: 'Roster',
          children: <RosterDetails/>,
        },
        {
          key: '3',
          label: 'Documents',
          children: 'Content of Tab Pane 3',
        },
        {
          key: '3',
          label: 'Projects',
          children: 'Content of Tab Pane 3',
        },
        
        {
          key: '3',
          label: 'Trainings',
          children: 'Content of Tab Pane 3',
        },
      ];
  return (
    <Tabs  defaultActiveKey="1" items={items} onChange={onChange} style={{width:'100%'}}/>

  )
}

export default AppTabs