import React from 'react'
import TableComponent from '../../component/common/TableComponent';
import { Row, Col } from 'antd'; // ✅ IMPORT Row and Col

const inputStyle = { // ✅ DEFINE inputStyle BEFORE using it
  width: '100%',
  padding: '6px 11px',
  borderRadius: '6px',
  border: '1px solid #d9d9d9',
  backgroundColor: '#f5f5f5',
  color: 'rgba(0, 0, 0, 0.85)',
  display: 'block',
  marginTop: '4px'
};

function BatchMemberSummary() {
    
  const dataSource = [
    {
      key: '1',
      MemberName: 'John Doe',
      BankAccount: 'DE12345678901234567890',
      PayrollNo: 'P001',
      TotalAmount: '$200',
      Advance: '$200',
      Arrears: '$200',
      Comments: 'Created on 2024-09-01',
    },
    {
      key: '2',
      MemberName: 'Jane Smith',
      BankAccount: 'DE09876543210987654321',
      PayrollNo: 'P002',
      TotalAmount: '',
      Advance: '',
      Arrears: '$0',
      Comments: 'Created on 2024-09-05',
    },
    {
      key: '3',
      MemberName: 'Alice Brown',
      BankAccount: 'DE11112222333344445555',
      PayrollNo: 'P003',
      TotalAmount: '',
      Advance: '',
      Arrears: '$50',
      Comments: 'Created on 2024-09-07',
    },
  ];
  
    return (
        <div className='' style={{ width: '93vw', }}>
           <Row gutter={[16, 16]} style={{paddingLeft:' 35px', paddingRight:'35px',paddingBottom:'20px', paaddingTop:'20px'}}>
      <Col span={4}>
        <label>Batch Type</label>
        <input
          value="Bank Draft"
          disabled
          style={{
            width: '100%',
            padding: '6px 11px',
            borderRadius: '6px',
            border: '1px solid #d9d9d9',
            backgroundColor: '#f5f5f5',
            color: 'rgba(0, 0, 0, 0.85)',
            display: 'block',
            marginTop: '4px'
          }}
        />
      </Col>
      <Col span={4}>
        <label>Batch Date</label>
        <input value="01-09-2024" disabled style={inputStyle} />
      </Col>
      <Col span={4}>
        <label>Batch Ref No</label>
        <input value="34586BCS" disabled style={inputStyle} />
      </Col>
      <Col span={4}>
        <label>Comments</label>
        <input value="Testing Comments" disabled style={inputStyle} />
      </Col>
      <Col span={4}>
        <label>Source</label>
        <input value="Testing Source" disabled style={inputStyle} />
      </Col>
      <Col span={4}>
        <label>Total Records</label>
        <input value="345" disabled style={inputStyle} />
      </Col>
    </Row>  
            <TableComponent data={dataSource} screenName="BatchMemberSummary" />
            {/* <Table
  columns={columns}
  dataSource={dataSource} // replace with your data array
  rowKey="id" // replace with a unique key field from your data
/> */}
        </div>
    )
}

export default BatchMemberSummary