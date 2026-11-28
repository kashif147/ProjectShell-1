import { ReportViewer, Table, BarChartOutlined } from 'projectshell-crm';

const columns = [
  { title: 'Membership No', dataIndex: 'membershipNo', key: 'membershipNo' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Station', dataIndex: 'station', key: 'station' },
  { title: 'Date Cancelled', dataIndex: 'dateCancelled', key: 'dateCancelled' },
  { title: 'Reason', dataIndex: 'reason', key: 'reason' },
];

const rows = [
  { key: '1', membershipNo: 'GRA-099412', name: 'Aoife Kelly', station: 'Mill Street', dateCancelled: '14/03/2026', reason: 'Retired' },
  { key: '2', membershipNo: 'GRA-097215', name: 'Pádraig Walsh', station: 'Store Street', dateCancelled: '02/05/2026', reason: 'Non-payment' },
  { key: '3', membershipNo: 'GRA-101877', name: 'Niamh Doyle', station: 'Galway', dateCancelled: '21/06/2026', reason: 'Resigned' },
];

export const CancelledMembersReport = () => (
  <ReportViewer
    title="Cancelled Members Report"
    subtitle="Comprehensive analysis of cancelled membership data"
    data={rows}
    columns={columns}
    reportType="cancelled-members"
    onRefresh={() => {}}
    onExportPDF={() => {}}
    onExportExcel={() => {}}
    onPrint={() => {}}
  >
    <Table columns={columns} dataSource={rows} pagination={false} size="small" />
  </ReportViewer>
);

export const WithCustomAction = () => (
  <ReportViewer
    title="Membership Statistics"
    subtitle="Members by category and division, 2026 subscription year"
    data={rows}
    columns={columns}
    reportType="statistics"
    onRefresh={() => {}}
    customActions={[{ label: 'Chart View', icon: <BarChartOutlined />, onClick: () => {}, type: 'dashed' }]}
  >
    <Table columns={columns} dataSource={rows} pagination={false} size="small" />
  </ReportViewer>
);

export const EmptyContent = () => (
  <ReportViewer title="Arrears Report" subtitle="Members with outstanding subscription balances" reportType="arrears" />
);

export const Loading = () => (
  <ReportViewer title="Cancelled Members Report" subtitle="Comprehensive analysis of cancelled membership data" reportType="cancelled-members" loading data={[]}>
    <Table columns={columns} dataSource={[]} pagination={false} size="small" />
  </ReportViewer>
);
