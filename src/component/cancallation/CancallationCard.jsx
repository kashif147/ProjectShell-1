import {useState} from 'react'
import { CalendarOutlined, BarChartOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Tag, Button } from "antd";
import CancellationDrawer from './CancellationDrawer';
import { cancellations } from '../../Data';
import { useReminders } from '../../context/CampaignDetailsProvider';

function CancallationCard() {
  const [isCancellationOpen, setIsCancellationOpen] = useState(false);
  const {cancallationbyId, getCancellationById} = useReminders()

  return (
    <div className="row">
      {cancellations.map((item, index) =>{
         
        return (
        <div key={index} className="col-md-3 mb-4">
          <Card
            className="shadow-sm"
            bordered
            headStyle={{
              padding: "8px 12px",
              backgroundColor: item.isSelected ? "#ffe7e7" : "#f5f5f5",
            }}
            bodyStyle={{ padding: "16px" }}
            title={
              <div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "13px" }}>{item.title}</span>
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
            <Card bodyStyle={{ padding: 0 }}>
              <div className="fw-bold" style={{ fontSize: "26px", textAlign: "center" }}>
                {item?.members}
              </div>
              <small style={{ display: "block", textAlign: "center" }} className="text-muted ">
                Members
              </small>
            </Card>
            <Button onClick={() => {setIsCancellationOpen(!isCancellationOpen)
             getCancellationById(item?.id)
            }} className="primary-btn mt-1" block icon={<BarChartOutlined />} >
              View Details
            </Button>
            {/* </div> */}
          </Card>
        </div>
      )})}
      <CancellationDrawer
        open={isCancellationOpen}
        onClose={() => setIsCancellationOpen(false)}
      />
    </div>
  )
}

export default CancallationCard;
