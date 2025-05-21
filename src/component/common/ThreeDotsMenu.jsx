import React, { memo, useCallback } from 'react';
import { Dropdown } from 'antd';
import { BsThreeDots } from 'react-icons/bs';

const ThreeDotsMenu = memo(({ items = [], onSelect }) => {
  const handleClick = useCallback(
    ({ key }) => {
      if (onSelect) onSelect(key);
      else {
        // fallback if no onSelect provided, find item's onClick and call it
        const item = items.find(i => i.key === key);
        if (item?.onClick) item.onClick();
      }
    },
    [onSelect, items]
  );

  const menuItems = items.map(({ key, label, icon }) => ({
    key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        {label}
      </span>
    ),
  }));

  return (
    <Dropdown menu={{ items: menuItems, onClick: handleClick }} trigger={['click']} arrow>
      <BsThreeDots
        style={{ cursor: 'pointer', fontSize: 18 }}
      />
    </Dropdown>
  );
});

export default ThreeDotsMenu;
