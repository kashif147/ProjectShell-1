import React from "react";
import { Tabs } from "antd";
import { AndroidOutlined, AppleOutlined } from "@ant-design/icons";
import { Input, Row, Col } from "antd";

function MyDeatails() {
  return (
    <Tabs
      defaultActiveKey="2"
      items={[
        {
          label: "Personal Information",
          key: "1",
          children: (
            <div>
              <Row gutter={12}>
                <Col span={6}>
                  <p>Garda Reg No:</p>
                  <Input />
                  <p>Forename</p>
                  <Input />
                </Col>
                <Col span={6}>
                  <p>Sourcename:</p>
                  <Input />
                  <p>Date Of Birth</p>
                  <Input />
                </Col>
              </Row>
            </div>
          ),
        },
        {
          label: "Offical Information",
          key: "2",
          children: "Tab 3",
        },
        {
          label: "Membership",
          key: "3",
          children: "Tab 3",
        },
      ]}
    />
  );
}

export default MyDeatails;
