import { useState, useContext, useEffect } from "react";
import TableComponent from "../../component/common/TableComponent";
import { Row, Col, Button, Tabs } from "antd"; // ✅ IMPORT Row and Col
import TrigerBatchMemberDrawer from "../../component/finanace/TrigerBatchMemberDrawer";
import { ExcelContext } from "../../context/ExcelContext";
import "../../styles/ManualEntry.css";
import ManualPaymentEntry from "../../component/finanace/ManualPaymentEntry";
import MyDrawer from "../../component/common/MyDrawer";
import CommonPopConfirm from "../../component/common/CommonPopConfirm";
import { tableData } from "../../Data";

const inputStyle = {
  // ✅ DEFINE inputStyle BEFORE using it
  width: "100%",
  padding: "6px 11px",
  borderRadius: "6px",
  border: "1px solid #d9d9d9",
  backgroundColor: "#f5f5f5",
  color: "rgba(0, 0, 0, 0.85)",
  display: "block",
  marginTop: "4px",
};

const memberData = [
  {
    membershipNumber: "M12345",
    name: "Ali Raza",
    accountNumber: "IE29AIBK93115212345678",
    payrollNo: "PR12345",
  },
  {
    membershipNumber: "M67890",
    name: "Sara Khan",
    accountNumber: "IE64IRCE92050112345678",
    payrollNo: "PR67890",
  },
  {
    membershipNumber: "M54321",
    name: "Ahmed Noor",
    accountNumber: "IE12BOFI90001712345678",
    payrollNo: "PR54321",
  },
];

function BatchMemberSummary() {
  const {
    excelData,
    selectedRowIndex,
    selectedRowData,
    uploadedFile,
    batchTotals,
  } = useContext(ExcelContext);
  const [manualPayment, setmanualPayment] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const batchMemberSummaryData = excelData?.map((member) => {
    const matched = tableData.find(
      (item) => item.fullName === member["Member Name"]
    );
    return {
      fullName: matched ? matched.fullName : "", // Add fullName if matched
      ...member, // Spread rest of the member data
    };
  });
  const [fileUrl, setFileUrl] = useState(null);
  console.log("selectedRowData", selectedRowData);
  console.log("selectedRowIndex", selectedRowIndex);
  const inputStyle1 = {
    padding: "8px",
    border: "none",
    display: "inline-block",
    width: "100%",
  };
  console.log("batchMemberSummaryData", excelData);
  const [isBatchmemberOpen, setIsBatchmemberOpen] = useState(false);
  const dataSource = [
    {
      key: "1",
      MemberName: "John Doe",
      BankAccount: "DE12345678901234567890",
      PayrollNo: "P001",
      TotalAmount: "$200",
      Advance: "$200",
      Arrears: "$200",
      Comments: "Created on 2024-09-01",
    },
    {
      key: "2",
      MemberName: "Jane Smith",
      BankAccount: "DE09876543210987654321",
      PayrollNo: "P002",
      TotalAmount: "",
      Advance: "",
      Arrears: "$0",
      Comments: "Created on 2024-09-05",
    },
    {
      key: "3",
      MemberName: "Alice Brown",
      BankAccount: "DE11112222333344445555",
      PayrollNo: "P003",
      TotalAmount: "",
      Advance: "",
      Arrears: "$50",
      Comments: "Created on 2024-09-07",
    },
  ];
  const items = [
    {
      key: "1",
      label: "Batch Payments",
      children: (
        <TableComponent
          data={batchMemberSummaryData}
          screenName="BatchMemberSummary"
        />
      ),
    },
    {
      key: "2",
      label: "Exceptions",
      children: (
        <TableComponent data={excelData} screenName="BatchMemberSummary" />
      ),
    },
  ];
  const [activeKey, setactiveKey] = useState("1");
  const onChange = (key) => {
    setactiveKey(key);
  };
  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setFileUrl(url);

      // Revoke previous URL when component unmounts or file changes
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedFile]);
  // conosle.log("uploadedFile", uploadedFile);
  return (
    <div className="" style={{ width: "100%" }}>
      <Row
        gutter={[16, 16]}
        style={{
          paddingLeft: " 35px",
          paddingRight: "35px",
          paddingBottom: "20px",
          paaddingTop: "20px",
        }}
      >
        <Col span={4}>
          <label>Batch Type</label>
          <input
            value="Bank Draft"
            disabled
            style={{
              width: "100%",
              padding: "6px 11px",
              borderRadius: "6px",
              border: "1px solid #d9d9d9",
              backgroundColor: "#f5f5f5",
              color: "rgba(0, 0, 0, 0.85)",
              display: "block",
              marginTop: "4px",
            }}
          />
        </Col>
        <Col span={4}>
          <label>Batch Date</label>
          <input value="01-09-2024" disabled style={inputStyle} />
        </Col>
        <Col span={6}>
          <label>Batch Ref No</label>
          <input value="34586BCS" disabled style={inputStyle} />
        </Col>
        <Col span={8}>
          <label>Comments</label>
          <input value="Testing Comments" disabled style={inputStyle} />
        </Col>
        <Col span={2}>
          <label>Source</label>
          <br />
          {uploadedFile ? (
            <a href={fileUrl} download={uploadedFile.name} style={inputStyle1}>
              {uploadedFile.name}
            </a>
          ) : (
            <span style={{ color: "#888" }}>No file uploaded</span>
          )}
        </Col>
      </Row>
      <Row
        gutter={[16, 16]}
        style={{
          paddingLeft: "35px",
          paddingRight: "35px",
          paddingBottom: "20px",
        }}
      >
        <Col span={4}>
          <label>Total Arrears (€)</label>
          <input
            value={`€${batchTotals?.arrears}`}
            disabled
            style={{
              width: "100%",
              padding: "6px 11px",
              borderRadius: "6px",
              border: "1px solid #d9d9d9",
              backgroundColor: "#f5f5f5",
              color: "rgba(0, 0, 0, 0.85)",
              display: "block",
              marginTop: "4px",
            }}
          />
        </Col>
        <Col span={4}>
          <label>Total Current (€):</label>
          <input value={`€300.00`} disabled style={inputStyle} />
        </Col>
        <Col span={4}>
          <label>Total Advance</label>
          <input
            value={`€${batchTotals?.advance}`}
            disabled
            style={inputStyle}
          />
        </Col>
        <Col span={4}>
          <label>Batch Total (€)</label>
          <input value={`€${batchTotals?.total}`} disabled style={inputStyle} />
        </Col>
        <Col span={4}>
          <label>Total Records</label>
          <input value={excelData?.length} disabled style={inputStyle} />
        </Col>
        <Col span={2} style={{ display: "flex", alignItems: "flex-end" }}></Col>
      </Row>
      <Row
        gutter={[16, 16]}
        style={{
          paddingLeft: "35px",
          paddingRight: "35px",
          paddingBottom: "20px",
        }}
      >
        <Col span={2}>
          <div className="d-flex gap-2">
            <Button
              style={{
                backgroundColor: "#215e97",
                color: "white",
                borderRadius: "3px",
                width: "100%",
              }}
              onClick={() => setmanualPayment(!manualPayment)}
            >
              Add Members
            </Button>
            <CommonPopConfirm
              title="Do you want to exclude member?"
              onConfirm={() => console.log("Confirmed")}
              onCancel={() => console.log("Cancelled")}
            >
              <Button
                style={{
                  backgroundColor: "#215e97",
                  color: "white",
                  borderRadius: "3px",
                  width: "100%",
                }}
              >
                Exclude Members
              </Button>
            </CommonPopConfirm>
          </div>
        </Col>
      </Row>
      <Tabs
        activeKey={activeKey}
        items={items}
        onChange={onChange}
        className="batch-tabs"
      />
      <TrigerBatchMemberDrawer
        isOpen={isBatchmemberOpen}
        onClose={() => setIsBatchmemberOpen(!isBatchmemberOpen)}
      />
      <MyDrawer
        open={manualPayment}
        onClose={() => setmanualPayment(!manualPayment)}
        title={"Manual Payment Entry"}
        width={760}
        isManual={true}
      >
        <ManualPaymentEntry />
      </MyDrawer>
    </div>
  );
}

export default BatchMemberSummary;
