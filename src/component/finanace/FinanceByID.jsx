
import SubTableComp from '../../component/common/SubTableComp';

function FinanceByID() {
  const columns = [
    {
      title: 'Bank Account',
      dataIndex: 'bankAccount',
      key: 'bankAccount',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Payroll No',
      dataIndex: 'payrollNo',
      key: 'payrollNo',
      ellipsis: true,
      width: 120,
    },
    {
      title: 'Payment Type',
      dataIndex: 'paymentType',
      key: 'paymentType',
      ellipsis: true,
      width: 130,
    },
    {
      title: 'Total Amount (€)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Arrears (€)',
      dataIndex: 'arrears',
      key: 'arrears',
      ellipsis: true,
      width: 130,
    },
    {
      title: 'Current (€)',
      dataIndex: 'current',
      key: 'current',
      ellipsis: true,
      width: 130,
    },
    {
      title: 'Advance (€)',
      dataIndex: 'advance',
      key: 'advance',
      ellipsis: true,
      width: 130,
    },
    {
      title: 'Batch Ref No',
      dataIndex: 'batchRefNo',
      key: 'batchRefNo',
      ellipsis: true,
      width: 130,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
  ];

  const dataSource = [
    {
      key: '1',
      bankAccount: '12345678',
      payrollNo: '1001',
      paymentType: 'Credit',
      totalAmount: '€500.00',
      arrears: '€300.00',
      current: '',
      advance: '€100.00',
      batchRefNo: 'B001',
      description: 'Monthly payments',
    },
  ];

  return (
    <div className='cases-main'>
      <SubTableComp
        columns={columns}
        dataSource={dataSource}
        className='claims-table'
      />
    </div>
  );
}

export default FinanceByID;
