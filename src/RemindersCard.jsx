import React from "react";
import { Card, Button, Tag } from "antd";
import { CalendarOutlined, UserOutlined, BarChartOutlined } from "@ant-design/icons";
import BatchDrawer from "./component/reminders/BatchDrawer";
import { useState } from "react";
import { useView } from "./context/ViewContext";
import { useReminders } from "./context/CampaignDetailsProvider";
import { campaigns } from "./Data";



const RemindersCard = () => {
  const {getRemindersById} = useReminders()
  const [isbatchOpen, setisbatchOpen] = useState(false);
  const [isDisable, setIsDisable] = useState(false);

  return (
    <div className="mt-4">
      <div className="row">
        {campaigns.map((item, index) => (
          <div key={index} className="col-md-3 mb-4">
            <Card
              className="shadow-sm"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)", // stronger shadow
                border: "1px solid #d9d9d9",            // AntD default border
                borderRadius: "8px",                    // optional rounded corners
              }}
              bordered
              headStyle={{
                padding: "8px 12px",
                backgroundColor: item.triggered ? "#adf368ff" : "#f5f5f5", // 👈 header bg only
              }}
              bodyStyle={{ padding: "12px" }}
              title={
                <div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: "13px" }}>{item.title}</span>
                    {/* <Tag color={item.selected ? "blue" : "default"}>
                      {item.selected ? "Selected" : "Unselected"}
                    </Tag> */}
                  </div>
                  {
                    item?.triggered &&
                    <p style={{ fontSize: "11px", margin: '0px' }}>{`${item?.triggered} Jack Smith`}</p>
                  }

                </div>
              }
            >
              <div className="d-flex mb-3 text-muted" style={{ fontSize: "14px" }}>
                <CalendarOutlined className="me-2" /> {item.date}
                <span className="ms-3">
                  <UserOutlined className="me-2" /> {item.user}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <div className="text-center bg-light p-2 rounded flex-fill me-2">
                  <div className="fw-bold text-primary">{item.stats.R1}</div>
                  <small className="text-muted">R1</small>
                </div>
                <div className="text-center bg-light p-2 rounded flex-fill me-2" style={{ backgroundColor: "#f6fff6" }}>
                  <div className="fw-bold text-success">{item.stats.R2}</div>
                  <small className="text-muted">R2</small>
                </div>
                <div className="text-center bg-light p-2 rounded flex-fill" style={{ backgroundColor: "#fffaf6" }}>
                  <div className="fw-bold text-warning">{item.stats.R3}</div>
                  <small className="text-muted">R3</small>
                </div>
              </div>
              <Button className="primary-btn mt-2" onClick={() => {
                setisbatchOpen(!isbatchOpen)
                getRemindersById(item?.id)
                if (item?.selected === true) {
                  setIsDisable(!isDisable)
                }
              }
              } block icon={<BarChartOutlined />}>
                View Details
              </Button>
            </Card>
          </div>
        ))}
      </div>
      <BatchDrawer open={isbatchOpen} onClose={() => setisbatchOpen(!isbatchOpen)} isDisable={isDisable} />
    </div>
  );
};

export default RemindersCard;
