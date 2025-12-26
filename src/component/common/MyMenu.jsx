import React from "react";
import { Dropdown, Menu } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import styled from "styled-components";

const MenuContainer = styled.div`
  display: inline-block;
  position: relative;
  padding: 10px;
`;

const DropdownIcon = styled(EllipsisOutlined)`
  font-size: 24px;
  cursor: pointer;
  color: #123c63;

  &:hover {
    color: #40a9ff;
  }

  &:active {
    transform: none;
  }
`;

const CustomMenu = styled(Menu)`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 200px;

  .ant-dropdown-menu-item {
    color: #123c63;

    &:hover {
      background-color: #e6f7ff;
    }

    .anticon {
      color: #123c63; /* Icon color */
      margin-right: 8px;
    }

    .ant-dropdown-menu-title-content {
      color: #123c63; /* Label color */
    }
  }
`;

const MyMenu = ({ items, disabled }) => {
  const menu = (
    <CustomMenu>
      {items?.map((item) => (
        <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
          {item.label}
        </Menu.Item>
      ))}
    </CustomMenu>
  );

  return (
    <MenuContainer>
      <Dropdown overlay={menu} trigger={["click"]} disabled={disabled}>
        <DropdownIcon />
      </Dropdown>
    </MenuContainer>
  );
};

export default MyMenu;
