import React from "react";
import { Button, Drawer, Space } from "antd";

function MyDrawer({ title, open, onClose, children, add,width=820, isHeader=false, }) {
  return (
    <Drawer
      width={width}
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button className="butn secoundry-btn" onClick={onClose}>
            Close
          </Button>
          <Button className="butn primary-btn" onClick={add}>
            Add 
          </Button>
        </Space>
      }
    >
      {children}
    </Drawer>
  );
}

export default MyDrawer;
