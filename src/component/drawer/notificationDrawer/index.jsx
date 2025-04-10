import React, { useState } from "react";
import { Button, Drawer, Space } from "antd";

const NotificationDrawer = ({ open, onClose }) => {
  return (
    <Drawer
      title="Notification"
      placement="right"
      width="25%"
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button className="butn secoundry-btn" onClick={onClose}>
            Close
          </Button>
        </Space>
      }
    >
      <div className="details-con-header1">
        <p>hello</p>
      </div>
    </Drawer>
  );
};

export default NotificationDrawer;
