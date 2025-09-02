import React, { useState } from "react";
import { Drawer, Button, Tabs, Card, Row, Col, Tag, Table, Checkbox, Modal } from "antd";
import CustomSelect from "../common/CustomSelect";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import MyMenu from "../common/MyMenu";
import { BsFiletypeXls } from "react-icons/bs";
import { useReminders } from "../../context/CampaignDetailsProvider";

const { TabPane } = Tabs;

const CancellationDrawer = ({ open, onClose }) => {
    const { cancallationbyId, getCancellationById } = useReminders()
    const [activeTab, setActiveTab] = useState("cancellations");
    console.log(cancallationbyId, "console")

    const columns = [
        {
            title: "Member",
            dataIndex: "member",
            key: "member",
            render: (_, record) => (
                <div>
                    <div>{record.member}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div>
                </div>
            ),
        },
        { title: "Join Date", dataIndex: "joinDate", key: "joinDate" },
        { title: "Cancelled On", dataIndex: "cancelDate", key: "cancelDate" },
        { title: "Reason", dataIndex: "reason", key: "reason" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) =>
                status === "Cancelled" ? (
                    <Tag color="red">Cancelled</Tag>
                ) : (
                    <Tag color="orange">Pending</Tag>
                ),
        },
    ];

    const data = [
        {
            key: 1,
            member: "John Doe",
            email: "john@example.com",
            joinDate: "01/02/2022",
            cancelDate: "15/01/2025",
            reason: "Relocation",
            status: "Cancelled",
        },
        {
            key: 2,
            member: "Jane Smith",
            email: "jane@example.com",
            joinDate: "10/06/2023",
            cancelDate: "20/01/2025",
            reason: "Financial",
            status: "Cancelled",
        },
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <Drawer
            title="Membership Cancellation - January 2025"
            width={1000}
            open={open}
            onClose={onClose}
            extra={<Button className="btun primary-btn">Export Report</Button>}
        >
            <div className="p-4">
                {/* Header Info */}
                <Card style={{ marginBottom: 16 }} >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Checkbox></Checkbox>
                        <CalendarOutlined />
                        <span>2025-01-20</span>
                        <UserOutlined />
                        <span>Processed by Admin</span>
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
                    {/* ✅ Summary Tab */}


                    {/* ✅ Cancellation Tab */}
                    <TabPane key="cancellations" tab="Cancellations" className="mt-2">
                        <Table
                            columns={columns}
                            dataSource={data}
                            pagination={{ pageSize: 5 }}
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
        </Drawer>
    );
};

export default CancellationDrawer;
