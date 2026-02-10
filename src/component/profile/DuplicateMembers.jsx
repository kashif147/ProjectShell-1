import React, { useState } from "react";
import { Button, Select, Tag, Drawer, Card, Row, Col, Space } from "antd";
import { FaSync, FaCodeBranch } from "react-icons/fa";
import { ReloadOutlined } from "@ant-design/icons";
import MyTable from "../common/MyTable";
import MySearchInput from "../common/MySearchInput";
import MergeAndReview from "./MergeAndReview";
import "../../styles/MyDrawer.css";

const DuplicateMembers = () => {
  const [searchText, setSearchText] = useState("");
  const [view, setView] = useState("list"); // 'list' | 'merge'
  const [selectedMember, setSelectedMember] = useState(null);
  const [isMergeDrawerOpen, setIsMergeDrawerOpen] = useState(false);
  const [onMergeClickHandler, setOnMergeClickHandler] = useState(null);

  // Mock Data
  const initialData = [
    {
      key: "1",
      memberName: "John Doe",
      email: "j.doe@example.com",
      memberId: "MBR-12345",
      dateFlagged: "2023-10-27",
      potentialMatch: "Jane Smith",
      confidence: "High",
      scoreColor: "green",
    },
    {
      key: "2",
      memberName: "Jane Smith",
      email: "jane.s@example.com",
      memberId: "MBR-12346",
      dateFlagged: "2023-10-27",
      potentialMatch: "John Doe",
      confidence: "High",
      scoreColor: "green",
    },
    {
      key: "3",
      memberName: "Sam Wilson",
      email: "sam.w@example.com",
      memberId: "MBR-12347",
      dateFlagged: "2023-10-26",
      potentialMatch: "Samuel Wilson",
      confidence: "Medium",
      scoreColor: "gold", // 'amber' in Tailwind is 'gold' in AntD or custom
    },
    {
      key: "4",
      memberName: "Emily Carter",
      email: "e.carter@example.com",
      memberId: "MBR-12348",
      dateFlagged: "2023-10-26",
      potentialMatch: "Emilia Carter",
      confidence: "Medium",
      scoreColor: "gold",
    },
    {
      key: "5",
      memberName: "Robert Brown",
      email: "rob.b@example.com",
      memberId: "MBR-12349",
      dateFlagged: "2023-10-25",
      potentialMatch: "Rob Brown",
      confidence: "Low",
      scoreColor: "red",
    },
  ];

  const [dataSource, setDataSource] = useState(initialData);

  const columns = [
    {
      title: "Member Name",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Membership ID",
      dataIndex: "memberId",
      key: "memberId",
    },
    {
      title: "Date Flagged",
      dataIndex: "dateFlagged",
      key: "dateFlagged",
    },
    {
      title: "Potential Match",
      dataIndex: "potentialMatch",
      key: "potentialMatch",
    },
    {
      title: "Match Confidence",
      dataIndex: "confidence",
      key: "confidence",
      render: (text, record) => (
        <Tag
          color={record.scoreColor}
          style={{ borderRadius: "12px", padding: "0 10px" }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          style={{ backgroundColor: "#135bec", borderColor: "#135bec" }}
          onClick={() => {
            setSelectedMember(record);
            setIsMergeDrawerOpen(true);
          }}
        >
          Review & Merge
        </Button>
      ),
    },
  ];

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    // Implement search filtering logic here if needed
    const filtered = initialData.filter(
      (item) =>
        item.memberName.toLowerCase().includes(e.target.value.toLowerCase()) ||
        item.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
        item.memberId.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setDataSource(filtered);
  };

  // if (view === 'merge') {
  //     return <MergeAndReview onBack={() => setView('list')} />;
  // }

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }} align="bottom">
          <Col xs={24} sm={12} md={8} style={{ paddingLeft: 0, marginLeft: 0 }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Search
              </label>
              <MySearchInput
                placeholder="Search by name, email, or ID..."
                value={searchText}
                onChange={handleSearch}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Sort By
              </label>
              <Select
                defaultValue="Date Flagged"
                style={{ width: "100%" }}
                options={[
                  { value: "date", label: "Date Flagged" },
                  { value: "name", label: "Name" },
                ]}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Confidence Score
              </label>
              <Select
                defaultValue="Confidence Score"
                style={{ width: "100%" }}
                options={[
                  { value: "high", label: "High Confidence" },
                  { value: "medium", label: "Medium Confidence" },
                  { value: "low", label: "Low Confidence" },
                ]}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                height: "100%",
              }}
            >
              <Space style={{ marginTop: "0" }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => setDataSource(initialData)}
                >
                  Refresh List
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        <div style={{ marginTop: "24px", padding: 0 }}>
          <MyTable
            columns={columns}
            dataSource={dataSource}
            loading={false}
            selection={true}
            tablePadding={{ paddingLeft: "0", paddingRight: "0" }}
          />
        </div>
      </Card>

      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaCodeBranch />
            <span>Merge & Review</span>
          </div>
        }
        open={isMergeDrawerOpen}
        onClose={() => setIsMergeDrawerOpen(false)}
        width={1000}
        styles={{ body: { padding: 0 } }}
        extra={
          <Button
            className="butn primary-btn"
            icon={<FaCodeBranch />}
            onClick={onMergeClickHandler}
          >
            Merge Profiles
          </Button>
        }
      >
        {/* Note: Assuming MergeAndReview accepts props or needs wrapping.
                    If it expects 'onBack' to close/switch view, we might not pass it,
                    or pass onClose to close the drawer.
                    Ideally it should just display content now. */}
        <MergeAndReview
          onBack={() => setIsMergeDrawerOpen(false)}
          onMergeClick={(handler) => setOnMergeClickHandler(() => handler)}
        />
      </Drawer>
    </div>
  );
};

export default DuplicateMembers;
