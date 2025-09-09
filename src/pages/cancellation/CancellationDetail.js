import React, { useState } from "react";
import { Button, Tabs, Card, Row, Col, Table, Checkbox, Modal,Progress } from "antd";
import CustomSelect from "../../component/common/CustomSelect";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import MyMenu from "../../component/common/MyMenu";
import { BsFiletypeXls } from "react-icons/bs";
import { useReminders } from "../../context/CampaignDetailsProvider";

const { TabPane } = Tabs;

function CancellationDetail() {
      const { cancallationbyId, getCancellationById } = useReminders()
        const [activeTab, setActiveTab] = useState("summary");
        console.log(cancallationbyId, "console")
        const [isDisable, setIsDisable] = useState(false);
        const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    
        const getRowSelection = {
            selectedRowKeys,
            onChange: (newSelectedRowKeys, selectedRows) => {
                console.log("Selected Keys: ", newSelectedRowKeys);
                console.log("Selected Rows: ", selectedRows);
    
                setSelectedRowKeys(newSelectedRowKeys);
    
            },
        };
        const columns = [
            {
                title: "Membership No",
                dataIndex: "membershipNo",
                key: "membershipNo",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Full Name",
                dataIndex: "fullName",
                key: "fullName",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Mobile No",
                dataIndex: "mobileNo",
                key: "mobileNo",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Membership Status",
                dataIndex: "membershipStatus",
                key: "membershipStatus",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Membership Category",
                dataIndex: "membershipCategory",
                key: "membershipCategory",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Work Location",
                dataIndex: "workLocation",
                key: "workLocation",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Branch",
                dataIndex: "branch",
                key: "branch",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Region",
                dataIndex: "region",
                key: "region",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Grade",
                dataIndex: "grade",
                key: "grade",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Section (Primary)",
                dataIndex: "section",
                key: "section",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Joining Date",
                dataIndex: "joiningDate",
                key: "joiningDate",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Expiry Date",
                dataIndex: "expiryDate",
                key: "expiryDate",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Last Payment Amount",
                dataIndex: "lastPaymentAmount",
                key: "lastPaymentAmount",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Last Payment Date",
                dataIndex: "lastPaymentDate",
                key: "lastPaymentDate",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Membership Fee",
                dataIndex: "membershipFee",
                key: "membershipFee",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Outstanding Balance",
                dataIndex: "outstandingBalance",
                key: "outstandingBalance",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Reminder No",
                dataIndex: "reminderNo",
                key: "reminderNo",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Reminder Date",
                dataIndex: "reminderDate",
                key: "reminderDate",
                render: (text) => <span style={{ whiteSpace: "nowrap" }}>{text}</span>,
            },
            {
                title: "Cancellation Flag",
                dataIndex: "cancellationFlag",
                key: "cancellationFlag",
                render: (value) => (
                    <span style={{ whiteSpace: "nowrap" }}>{value ? "Yes" : "No"}</span>
                ),
            },
        ];
    
        const data = cancallationbyId?.members
        const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div>
       <div className="p-4">
                {/* Header Info */}
                <Card style={{ marginBottom: 16 }} >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Checkbox></Checkbox>
                        <CalendarOutlined />
                        <span>{cancallationbyId?.date}</span>
                        <UserOutlined />
                        <span>Processed by {cancallationbyId?.user}</span>
                    </div>
                </Card>

                {/* Tabs */}
                <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={
                    activeTab !== "summary" && (
                        <>
                            <Button className="butn secoundry-btn me-2 mb-2" onClick={() => setIsModalOpen(true)}>
                                + Add Member
                            </Button>
                            <Button className="butn secoundry-btn me-2 mb-2">
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
                    <TabPane key="summary" tab="Summary" className="mt-2">
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
                    <TabPane key="cancellations" tab="Cancellations" className="mt-2">
                        <Table
                            className="claims-table"
                            columns={columns}
                            dataSource={data}
                            pagination={{ pageSize: 5 }}
                            bordered
                            rowSelection={getRowSelection}
                        />
                    </TabPane>
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
    </div>
  )
}

export default CancellationDetail
