import React, { useState } from "react";
import {
  Drawer,
  Button,
  Tabs,
  Card,
  Row,
  Col,
  Progress,
  Tag,
  Modal
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Checkbox from "antd/es/checkbox/Checkbox";
import ReminderSubCard from "./ReminderSubCard";
import MyMenu from "../common/MyMenu";
import { BsFiletypeXls } from "react-icons/bs";
import CustomSelect from "../common/CustomSelect";
import { useReminders } from "../../context/CampaignDetailsProvider";
const { TabPane } = Tabs;

const BatchDrawer = ({ open, onClose, isDisable = false }) => {
  const { selectedId } = useReminders()
  console.log(selectedId, "selectedId")
  const [activeTab, setActiveTab] = useState("summary");
  const [tabChecks, setTabChecks] = useState({
    summary: false,
    reminder1: false,
    reminder2: false,
    reminder3: false,
  });
const totalR1 = selectedId?.members?.R1.length
const totalR2 = selectedId?.members?.R2.length
const totalR3 = selectedId?.members?.R3.length
const total = totalR1 + totalR2 + totalR3
const date = selectedId?.date
const user = selectedId?.user

  const handleTabCheck = (key, e) => {
    setTabChecks((prev) => ({
      ...prev,
      [key]: e.target.checked,
    }));
  };

  const columns = [
    {
      title: "Membership No",
      dataIndex: "membershipNo",
      key: "membershipNo",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile No",
      dataIndex: "mobileNo",
      key: "mobileNo",
    },
    {
      title: "Membership Status",
      dataIndex: "membershipStatus",
      key: "membershipStatus",
    },
    {
      title: "Membership Category",
      dataIndex: "membershipCategory",
      key: "membershipCategory",
    },
    {
      title: "Work Location",
      dataIndex: "workLocation",
      key: "workLocation",
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Section (Primary)",
      dataIndex: "section",
      key: "section",
    },
    {
      title: "Joining Date",
      dataIndex: "joiningDate",
      key: "joiningDate",
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
    },
    {
      title: "Last Payment Amount",
      dataIndex: "lastPaymentAmount",
      key: "lastPaymentAmount",
    },
    {
      title: "Last Payment Date",
      dataIndex: "lastPaymentDate",
      key: "lastPaymentDate",
    },
    {
      title: "Membership Fee",
      dataIndex: "membershipFee",
      key: "membershipFee",
    },
    {
      title: "Outstanding Balance",
      dataIndex: "outstandingBalance",
      key: "outstandingBalance",
    },
    {
      title: "Reminder No",
      dataIndex: "reminderNo",
      key: "reminderNo",
    },
    {
      title: "Reminder Date",
      dataIndex: "reminderDate",
      key: "reminderDate",
    },
    {
      title: "Cancellation Flag",
      dataIndex: "cancellationFlag",
      key: "cancellationFlag",
      render: (value) => (value ? "Yes" : "No"), // optional display
    },
  ];

  const data = [
    {
      key: 1,
      membershipNo: "IR-001",
      fullName: "Patrick O'Connor",
      email: "patrick.oconnor@example.ie",
      mobileNo: "+353 85 123 4567",
      membershipStatus: "Active",
      membershipCategory: "Gold",
      workLocation: "Garda HQ",
      branch: "Dublin Metropolitan",
      region: "Eastern",
      grade: "A",
      section: "Finance",
      joiningDate: "12/05/2021",   // DD/MM/YYYY
      expiryDate: "12/05/2026",
      lastPaymentAmount: "€250",
      lastPaymentDate: "01/06/2025",
      membershipFee: "€500",
      outstandingBalance: "€250",
      reminderNo: 2,
      reminderDate: "15/07/2025",
      cancellationFlag: false,
    },
    {
      key: 2,
      membershipNo: "IR-002",
      fullName: "Siobhán Murphy",
      email: "siobhan.murphy@example.ie",
      mobileNo: "+353 86 987 6543",
      membershipStatus: "Pending",
      membershipCategory: "Silver",
      workLocation: "Garda HQ",
      branch: "DMR South",
      region: "Eastern",
      grade: "B",
      section: "HR",
      joiningDate: "01/03/2022",
      expiryDate: "01/03/2025",
      lastPaymentAmount: "€150",
      lastPaymentDate: "15/05/2025",
      membershipFee: "€300",
      outstandingBalance: "€150",
      reminderNo: 1,
      reminderDate: "10/08/2025",
      cancellationFlag: false,
    },
    {
      key: 3,
      membershipNo: "IR-003",
      fullName: "Eoin Gallagher",
      email: "eoin.gallagher@example.ie",
      mobileNo: "+353 87 765 4321",
      membershipStatus: "Cancelled",
      membershipCategory: "Platinum",
      workLocation: "Galway",
      branch: "Connacht Division",
      region: "Western",
      grade: "C",
      section: "IT",
      joiningDate: "20/11/2020",
      expiryDate: "20/11/2023",
      lastPaymentAmount: "€600",
      lastPaymentDate: "10/10/2023",
      membershipFee: "€750",
      outstandingBalance: "€150",
      reminderNo: 3,
      reminderDate: "05/01/2024",
      cancellationFlag: true,
    },
  ];


  const [selectedKeysMap, setSelectedKeysMap] = useState({
    R1: [],
    R2: [],
    R3: [],
  });

  const getRowSelection = (reminderKey) => ({
    selectedRowKeys: selectedKeysMap[reminderKey],
    onChange: (keys) => {
      if (!isDisable) {
        setSelectedKeysMap((prev) => ({
          ...prev,
          [reminderKey]: keys,
        }));
      }
    },
    getCheckboxProps: () => ({ disabled: isDisable }), // ✅ disable row checkboxes
  });

  const handleExecute = (reminderKey, selectedRows) => {
    if (!isDisable) {
      console.log("Executing for", reminderKey, selectedRows);
    }
  };

  const handleExport = (reminderKey) => {
    if (!isDisable) {
      console.log("Exporting for", reminderKey);
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);


  const reminders = [
    {
      key: "reminder1",
      reminderKey: "R1",
      title: "Reminder 1 Details",
      count: totalR1,
      stats: { sent: 73, pending: 77, failed: 95, total: "$135,957" },
      data:selectedId?.members?.R1
    },
    {
      key: "reminder2",
      reminderKey: "R2",
      title: "Reminder 2 Details",
      count: totalR2,
      stats: { sent: 50, pending: 30, failed: 20, total: "€99,000" },
      data:selectedId?.members?.R2
    },
    {
      key: "reminder3",
      reminderKey: "R3",
      title: "Reminder 3 Details",
      count: totalR3,
      stats: { sent: 20, pending: 10, failed: 15, total: "€55,000" },
      data:selectedId?.members?.R3
    },
  ];

  return (
    <Drawer
      title="Batch Management"
      width={1200}
      open={open}
      onClose={onClose}
      extra={
        <Button className="btun primary-btn" disabled={isDisable}>
          Trigger Batch
        </Button>
      }
    >
      <style>{`
        .ant-table-cell {
          white-space: nowrap !important;
        }
      `}</style>
      <div className="p-3">
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Checkbox disabled={isDisable} />
            <CalendarOutlined />
          
            <span>{date}</span>
            <UserOutlined />
            <span>Created by {user}</span>
          </div>
        </Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="pt-2"
          tabBarExtraContent={
            activeTab !== "summary" && (
              <>
                <Button className="butn secoundry-btn me-2 mb-2" disabled={isDisable} onClick={() => setIsModalOpen(true)}>
                  + Add Member
                </Button>
                <Button className="butn secoundry-btn me-2 mb-2" disabled={isDisable}>
                  Exclude Member
                </Button>
                <MyMenu
                  items={[
                    {
                      key: '2',
                      label: 'Export as CSV',
                      icon: <BsFiletypeXls style={{
                        fontSize: "12px",
                        marginRight: "10px",
                        color: "#45669d",
                      }} />,
                      onClick: () => {
                        // downloadCSV()
                      }
                    },
                    {
                      key: '1',
                      label: 'Export as CSV',
                      icon: <BsFiletypeXls style={{
                        fontSize: "12px",
                        marginRight: "10px",
                        color: "#45669d",
                      }} />,
                    }
                  ]} />
              </>
            )
          }
        >
          <TabPane key="summary" tab={<span>Summary</span>}>
            <Row className="pt-2" gutter={16}>
              <Col span={6}>
                <Card>Reminder 1 <h3>0{totalR1}</h3></Card>
              </Col>
              <Col span={6}>
                <Card>Reminder 2 <h3>0{totalR2}</h3></Card>
              </Col>
              <Col span={6}>
                <Card>Reminder 3 <h3>0{totalR3}</h3></Card>
              </Col>
              <Col span={6}>
                <Card>Total Items <h3>{total}</h3></Card>
              </Col>
            </Row>

            <Row gutter={16} className="pt-2" style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Payment Methods Distribution">
                  <Progress type="circle" percent={41} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Payment Breakdown">
                  <p>Credit Card: 180 (40.9%)</p>
                  <p>Debit Card: 145 (33.0%)</p>
                  <p>Bank Card: 95 (21.6%)</p>
                  <p>Cash: 20 (4.5%)</p>
                </Card>
              </Col>
            </Row>
          </TabPane>
          {reminders.map((rem) => (
            <TabPane
              key={rem.key}
              tab={
                <span>
                  <Checkbox
                    checked={tabChecks[rem.key]}
                    onChange={(e) => handleTabCheck(rem.key, e)}
                    style={{ marginRight: 8 }}
                    disabled={isDisable}
                  />
                  {`${rem.title.split(" ")[0]} (${rem.count})`}
                </span>
              }
            >
              <ReminderSubCard
                reminderKey={rem.reminderKey}
                title={rem.title}
                totalItems={rem.count}
                stats={rem.stats}
                columns={columns}
                data={rem?.data}
                getRowSelection={getRowSelection}
                selectedKeysMap={selectedKeysMap}
                onExecute={handleExecute}
                onExport={handleExport}
                isDisable={isDisable}
              />
            </TabPane>
          ))}
        </Tabs>
      </div>
      <Modal
        className="right-modal"
        open={isModalOpen}
        title="Add Member"
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <CustomSelect placeholder="Select a memeber" />
      </Modal>
    </Drawer>
  );
};

export default BatchDrawer;
