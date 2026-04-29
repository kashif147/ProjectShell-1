import React from 'react';
import { Dropdown, Button } from 'antd';
import { BsThreeDots } from "react-icons/bs";

const ActionDropdown = ({ items = [] }) => {
  return (
    <Dropdown
      menu={{
        items: items.map((item, index) => ({
          key: String(index),
          label: item.label,
          onClick: item.onClick,
        })),
      }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        className="me-1 gray-btn butn"
        icon={<BsThreeDots style={{ fontSize: "15px", fontWeight: 500 }} />}
      />
    </Dropdown>
  );
};

export default ActionDropdown;
