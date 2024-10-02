import React from "react";
import { Button, Drawer, Space } from "antd";

function MyDrawer({ title, open, onClose, children, add,width=520 }) {
  return (
    <Drawer
      width={width}
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button className="butn btn-border" onClick={onClose}>
            Close
          </Button>
          <Button className="gray-btn butn" onClick={add}>
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
