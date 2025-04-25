import { useState } from 'react';
import { Button, Drawer, Input, Modal, Table, Tabs } from 'antd';
import '../../../styles/TrigerReminderDrawer.css'
import MySelect from '../MySelect';


const { TabPane } = Tabs;

function CancallationDrawer({ isOpen, onClose, }) {
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
  ];

  const data = [
    {
      key: '1',
      name: 'John Doe',
      memberNumber: '12345',
      workLocation: 'New York',
      status: 'Active',
      outstandingAmount: '$100',
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
    {
      key: "1",
      batchName: "Batch A",
      batchDate: "2024-03-01",
      batchStatus: "Draft",
      createdAt: "2024-02-28",
      createdBy: "Admin",
      Count: 25,
    },
     ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeKey, setactiveKey] = useState(1);

  return (
    <Drawer
      title="Cancellation"
      placement="right"
      width={1200}
      onClose={onClose}
      visible={isOpen}
      extra={
        <>
          <Button onClick={onClose} className="butn secoundry-btn me-2">
            Close
          </Button>
          <Button className="butn primary-btn">Cancel Batch</Button>
        </>
      }
    >
      <div className='reminder-gride'>
        {/* INPUTS AT THE TOP, OUTSIDE TABS */}
        <div className="d-flex gap-2 mb-3">
          <Input placeholder="Batch A" style={{ width: 200 }} disabled={true} />
          <Input placeholder="2024-03-01" style={{ width: 200 }} disabled={true} />
          <Input placeholder="25" style={{ width: 200 }} disabled={true} />
          {/* <Input placeholder="Draft" style={{ width: 200 }} disabled={true} />
          <Input placeholder="25" style={{ width: 200 }} disabled={true} /> */}
        </div>
        <div className="d-flex gap-2 mb-3">
          {/* <Input placeholder="Batch A" style={{ width: 200 }} disabled={true} />
          <Input placeholder="2024-03-01" style={{ width: 200 }} disabled={true} /> */}
          {/* <Input placeholder="Draft" style={{ width: 200 }} disabled={true} /> */}
          <Input placeholder="25" style={{ width: 200 }} disabled={true} />
        </div>
        <Tabs
          defaultActiveKey={String(activeKey)}
          activeKey={String(activeKey)}
          onChange={(key) => setactiveKey(Number(key))}
          tabBarExtraContent={
            activeKey > 1 && (
              <>
                <Button className="ant-btn ant-btn-primary me-2" onClick={() => setIsModalOpen(true)}>
                  + Add Member
                </Button>
                <Button className="ant-btn ant-btn-primary" onClick={() => setIsModalOpen(true)}>
                  Exclude Member
                </Button>
              </>
            )
          }
        >
          <TabPane tab="Summary" key="1">
            <div className="mt-4">
              <Table columns={summaryColumns} dataSource={summaryData} />
            </div>
          </TabPane>
          <TabPane tab="Cancellation" key="2">
            <div className="mt-4">
              <Table rowSelection={{ type: "checkbox" }} columns={columns} dataSource={data} />
            </div>
          </TabPane>
          {/* <TabPane tab="Reminder 2" key="3">
            <div className="mt-4">
              <Table rowSelection={{ type: "checkbox" }} columns={columns} dataSource={data} />
            </div>
          </TabPane>
          <TabPane tab="Reminder 3" key="4">
            <div className="mt-4">
              <Table rowSelection={{ type: "checkbox" }} columns={columns} dataSource={data} />
            </div>
          </TabPane> */}
        </Tabs>
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

export default CancallationDrawer;
