import { SubTableComp, Tag } from 'projectshell-crm';

const claimColumns = [
  { title: 'Claim Ref', dataIndex: 'claimRef', key: 'claimRef', width: 130 },
  { title: 'Claim Type', dataIndex: 'claimType', key: 'claimType', width: 180 },
  { title: 'Date Lodged', dataIndex: 'dateLodged', key: 'dateLodged', width: 130 },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 110, align: 'right' as const },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (s: string) => <Tag color={s === 'Paid' ? 'green' : s === 'Rejected' ? 'red' : 'gold'}>{s}</Tag>,
  },
];

const claimRows = [
  { key: '1', claimRef: 'CLM-2026-0412', claimType: 'Legal Assistance', dateLodged: '14/03/2026', amount: '€1,250.00', status: 'Paid' },
  { key: '2', claimRef: 'CLM-2026-0587', claimType: 'Injury on Duty', dateLodged: '02/06/2026', amount: '€640.00', status: 'Pending' },
  { key: '3', claimRef: 'CLM-2026-0731', claimType: 'Death Benefit', dateLodged: '19/09/2026', amount: '€5,000.00', status: 'Rejected' },
];

export const ClaimsSubTable = () => <SubTableComp columns={claimColumns} dataSource={claimRows} />;

const paymentColumns = [
  { title: 'Payment Date', dataIndex: 'date', key: 'date', width: 140 },
  { title: 'Method', dataIndex: 'method', key: 'method', width: 160 },
  { title: 'Batch', dataIndex: 'batch', key: 'batch', width: 200 },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 110, align: 'right' as const },
];

const paymentRows = [
  { key: '1', date: '28/02/2026', method: 'Payroll Deduction', batch: 'DED-2026-02 Garda Payroll', amount: '€24.50' },
  { key: '2', date: '31/03/2026', method: 'Payroll Deduction', batch: 'DED-2026-03 Garda Payroll', amount: '€24.50' },
];

export const PaymentsSubTable = () => <SubTableComp columns={paymentColumns} dataSource={paymentRows} />;

export const Empty = () => <SubTableComp columns={claimColumns} dataSource={[]} />;
