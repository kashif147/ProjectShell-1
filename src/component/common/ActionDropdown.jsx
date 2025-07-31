import React from 'react';
import { Dropdown, Menu, Button } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { BsThreeDots } from "react-icons/bs";

const ActionDropdown = ({ items = [] }) => {
  const menu = (
    <Menu>
      {items.map((item, index) => (
        <Menu.Item key={index} onClick={item.onClick}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
      <Button
        className="me-1 gray-btn butn"
        icon={<BsThreeDots style={{ fontSize: "15px", fontWeight: 500 }} />}
      />
    </Dropdown>
  );
};

export default ActionDropdown;
