import React from 'react';
import { Dropdown, Menu } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import styled from 'styled-components';

// Styled components for the dropdown and button
const MenuContainer = styled.div`
  display: inline-block;
  position: relative;
  padding: 10px;
`;

const DropdownIcon = styled(EllipsisOutlined)`
  font-size: 24px;
  cursor: pointer;
  color: #1890ff; /* Customize the icon color */
  
  /* Remove transitions on click or hover */
  &:hover {
    transform: none; /* No transform on hover */
    color: #40a9ff; /* Hover color */
  }

  /* You can also disable the transition for click */
  &:active {
    transform: none; /* No transformation when clicked */
  }
`;

const CustomMenu = styled(Menu)`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 200px;
`;

const CustomMenuItem = styled(Menu.Item)`
  font-size: 14px;
  color: #333;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #e6f7ff;
  }

  i {
    margin-right: 8px; /* Space between icon and text */
  }
`;

const MyMenu = ({ items }) => {
  const menu = (
    <CustomMenu>
      {items?.map((item) => (
        <CustomMenuItem key={item.key} icon={item.icon}  onClick={item.onClick}>
          {item.label}
         
        </CustomMenuItem>
      ))}
    </CustomMenu>
  );

  return (
    <MenuContainer>
      <Dropdown overlay={menu} trigger={['click']}>
        <DropdownIcon style={{color:'#123c63'}} />
      </Dropdown>
    </MenuContainer>
  );
};

export default MyMenu;
