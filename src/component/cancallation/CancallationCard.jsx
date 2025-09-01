import {useState} from 'react'
import { CalendarOutlined, BarChartOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Tag, Button } from "antd";
import CancellationDrawer from './CancellationDrawer';

function CancallationCard() {
  const [isCancellationOpen, setIsCancellationOpen] = useState(false);
  const cancellations = [
    {
      title: "Membership Cancellation - January 2025",
      date: "2025-01-12",
      user: "Admin User",
      selected: false,
      members: 55, // 👈 only total members now
    },
    {
      title: "Membership Cancellation - December 2024",
      date: "2024-12-28",
      user: "Sarah Johnson",
      selected: true,
      members: 38,
      triggered: "2024-12-28 11:45:00",
    },
    {
      title: "Membership Cancellation - November 2024",
      date: "2024-11-20",
      user: "Mike Davis",
      selected: false,
      members: 25,
    },
    {
      title: "Membership Cancellation - November 2024",
      date: "2024-11-20",
      user: "Mike Davis",
      selected: false,
      members: 25,
    },
  ];

  return (
    <div className="row">
      {cancellations.map((item, index) => (
        <div key={index} className="col-md-3 mb-4">
          <Card
            className="shadow-sm"
            bordered
            headStyle={{
              padding: "8px 12px",
              backgroundColor: item.triggered ? "#ffe7e7" : "#f5f5f5",
            }}
            bodyStyle={{ padding: "16px" }}
            title={
              <div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "13px" }}>{item.title}</span>
                  <Tag color={item.selected ? "red" : "default"}>
                    {item.selected ? "Selected" : "Unselected"}
                  </Tag>
                </div>
                {item?.triggered && (
                  <p style={{ fontSize: "11px", margin: "0px" }}>
                    {`${item?.triggered} by ${item.user}`}
                  </p>
                )}
              </div>
            }
          >
            {/* Date + User */}
            <div className="d-flex mb-3 text-muted" style={{ fontSize: "14px" }}>
              <CalendarOutlined className="me-2" /> {item.date}
              <span className="ms-3">
                <UserOutlined className="me-2" /> {item.user}
              </span>
            </div>
            <Card>
              <div className="fw-bold" style={{ fontSize: "26px", textAlign: "center" }}>
                {item.members}
              </div>
              <small style={{ display: "block", textAlign: "center" }} className="text-muted">
                Members
              </small>

            </Card>
            <Button onClick={() => setIsCancellationOpen(!isCancellationOpen)} className="primary-btn" block icon={<BarChartOutlined />} >
              View Details
            </Button>
            {/* </div> */}
          </Card>
        </div>
      ))}
      <CancellationDrawer
        open={isCancellationOpen}
        onClose={() => setIsCancellationOpen(false)}
      />
    </div>
  )
}

export default CancallationCard;
