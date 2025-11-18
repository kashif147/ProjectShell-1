import { useState } from 'react';
import { Button, Drawer, Input, Modal, Table, Tabs } from 'antd';
import { BsFiletypeXls } from "react-icons/bs";
import '../../styles/TrigerReminderDrawer.css'
import MySelect from '../common/MySelect';
import * as XLSX from 'xlsx';
const { TabPane } = Tabs;

function TrigerBatchMemberDrawer({ isOpen, onClose, }) {
  const [data1, setData1] = useState([]);
  let selectedFile = null; // To store the selected file

  // Function to handle file selection
  const handleFileChange = (event) => {
    selectedFile = event.target.files[0];
  };
 
  const [excelData, setExcelData] = useState([]);
  // This will read the file and set array
  const readExcelFile = () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataArray = new Uint8Array(e.target.result);
      const workbook = XLSX.read(dataArray, { type: 'array' });
  
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
  
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); 
      setExcelData(jsonData); // save array
    };
  
    reader.readAsArrayBuffer(selectedFile);
  };
  const filename="my-data.csv"
  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(",") + "\n"; // Create CSV header
    const rows = data.map(row => Object.values(row).join(",")).join("\n"); // Create CSV rows
    return header + rows;
  };
  const downloadCSV = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Member#',
      dataIndex: 'memberNumber',
      key: 'memberNumber',
    },
    {
      title: 'Work Location',
      dataIndex: 'workLocation',
      key: 'workLocation',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Outstanding Amount',
      dataIndex: 'outstandingAmount',
      key: 'outstandingAmount',
    },
    {
      title: 'Payment Type',
      dataIndex: 'paymentType',
      key: 'paymentType',
    },
    {
      title: 'Last Payment Date',
      dataIndex: 'lastPaymentDate',
      key: 'lastPaymentDate',
    },
    {
      title: 'Membership Expiry Date',
      dataIndex: 'membershipExpiryDate',
      key: 'membershipExpiryDate',
    },
    // {
    //     title: 'Action',
    //     key: 'action',
    //     render: (text, record) => (
    //       <Button 
    //         type="link" 
    //         danger 
    //         onClick={() => console.log(record)}
    //       >
    //         Exclude
    //       </Button>
    //     ),
    //   },
  ];

  const data = [
    {
      key: '1',
      name: 'John Doe',
      memberNumber: '12345',
      workLocation: 'New York',
      status: 'Active',
      outstandingAmount: '€100',
      paymentType: 'Credit Card',
      lastPaymentDate: '2023-01-01',
      membershipExpiryDate: '2024-01-01',
    },
    // Add more data as needed
  ];

  const summaryColumns = [
    {
      dataIndex: "batchName",
      title: "Batch Name",
      ellipsis: true,
      width: 150,
    },
    {
      dataIndex: "batchDate",
      title: "Batch Date",
      ellipsis: true,
      width: 150,
    },
    {
      dataIndex: "batchStatus",
      title: "Batch Status",
      ellipsis: true,
      width: 150,
    },
    {
      dataIndex: "createdAt",
      title: "Created At",
      ellipsis: true,
      width: 150,
    },
    {
      dataIndex: "createdBy",
      title: "Created By",
      ellipsis: true,
      width: 150,
    },
    {
      dataIndex: "Count",
      title: "Count",
      ellipsis: true,
      width: 100,
    },
  ];

  const summaryData = [
    // {
    //   key: "1",
    //   batchName: "Batch A",
    //   batchDate: "2024-03-01",
    //   batchStatus: "Draft",
    //   createdAt: "2024-02-28",
    //   createdBy: "Admin",
    //   Count: 25,
    // },
     ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeKey, setactiveKey] = useState(1);

  return (
    <Drawer
      title="Batch Members"
      placement="right"
      width={1200}
      onClose={onClose}
      visible={isOpen}
      extra={
        <>
          <Button onClick={onClose} className="butn secoundry-btn me-2">
            Close
          </Button>
          <Button className="butn primary-btn">Save</Button>
        </>
      }
    >
      <div className='reminder-gride'>
        {/* INPUTS AT THE TOP, OUTSIDE TABS */}
        <div className="d-flex gap-2 mb-3">
          <div style={{ width: '50%' }}>
            <label className='custom-label'>Batch Name</label>
          <Input placeholder="Batch A" style={{}} disabled={true} value={"Batch A"} />
    
          </div>
          
          <div style={{ width: '50%' }}>
            <label className='custom-label'>Batch Name</label>
          <Input placeholder="2024-03-01" style={{  }} disabled={true} value={"2024-03-01" } />
          {/* <Input placeholder="Draft" style={{ width: 200 }} disabled={true} />
          <Input placeholder="25" style={{ width: 200 }} disabled={true} /> */}
          </div>
        </div>
        <div className="d-flex gap-2 mb-3">
        <div style={{ width: '50%' }}>
            <label className='custom-label'>Batch Status</label>
          <Input placeholder="Batch A" style={{}} disabled={true} value={"Draft"} />
          </div>
        <div style={{ width: '50%' }}>
            <label className='custom-label'>Count</label>
          <Input placeholder="" style={{}} disabled={true} value={"25"} />
          </div>
        </div>

        <div style={{backgroundColor:'#e6f8ff'}} className='mt-4 mb-4 p-2 d-flex  justify-content-end'>
            {/* <div className='float-end'> */}
<div>


            
        <Button className="butn secoundry-btn me-2 mb-2 " onClick={()=>readExcelFile()}>
                  Import Excel File
                </Button>
                <Button className="butn secoundry-btn me-2 mb-2" >
                  Exclude Member
                </Button>
                </div>
                {/* </div> */}
        </div>
        <Table rowSelection={{ type: "checkbox" }} className='mt-4' columns={columns}  />
        
      </div>

      <Modal
        className="right-modal"
        open={isModalOpen}
        title="Add Member"
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <MySelect isSimple={true} />
      </Modal>
    </Drawer>

  );
}

export default TrigerBatchMemberDrawer;
