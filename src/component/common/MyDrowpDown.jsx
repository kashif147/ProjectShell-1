import React from "react";
import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Space } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function MyDrowpDown({ title, items }) {
  const navigate = useNavigate();

  const onClick = ({ key }) => {
    // message.info(`Click on item ${key}`);
  };

  return (
    <Dropdown
      style={{ cursor: "pointer" }}
      menu={{
        items,
        onClick,
      }}
    >
      <a
        onClick={(e) => e.preventDefault()}
        style={{
          color: "black",
          fontSize: "14px",
          fontWeight: "600",
          color: "#696969",
         
        }}
      >
        <Space>
          {title}
          <DownOutlined
            style={{
              cursor: "pointer",
              color: "black",
              fontSize: "10px",
              fontWeight: "800",
              height: "0.2rem",
            }}
            height={"0.2rem"}
          />
        </Space>
      </a>
    </Dropdown>
  );
}

export default MyDrowpDown;
