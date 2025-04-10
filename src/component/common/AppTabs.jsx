
import React from 'react';
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';

import { Tabs } from 'antd';
import MyDeatails from './MyDeatails';

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
          children: 'Content of Tab Pane 2',
        },
        {
          key: '3',
          label: 'Correspondences',
          children: 'Content of Tab Pane 3',
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
          label: 'Roster',
          children: 'Content of Tab Pane 3',
        },
        {
          key: '3',
          label: 'Trainings',
          children: 'Content of Tab Pane 3',
        },
      ];
  return (
    <Tabs  defaultActiveKey="1" items={items} onChange={onChange} />

  )
}

export default AppTabs