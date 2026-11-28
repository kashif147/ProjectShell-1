import { MyTable } from 'projectshell-crm';

const columns = [
  { title: 'Membership No', dataIndex: 'membershipNo', key: 'membershipNo', width: 140 },
  { title: 'Name', dataIndex: 'name', key: 'name', width: 200 },
  { title: 'Category', dataIndex: 'category', key: 'category', width: 160 },
  { title: 'Station', dataIndex: 'station', key: 'station', width: 160 },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
];

const rows = [
  { key: '1', membershipNo: 'GRA-104233', name: 'Siobhán Murphy', category: 'General', station: 'Pearse Street', status: 'Active' },
  { key: '2', membershipNo: 'GRA-104871', name: 'Ciarán O’Brien', category: 'Probationer', station: 'Anglesea Street', status: 'Active' },
  { key: '3', membershipNo: 'GRA-099412', name: 'Aoife Kelly', category: 'Retired Associate', station: 'Mill Street', status: 'Lapsed' },
  { key: '4', membershipNo: 'GRA-101560', name: 'Declan Byrne', category: 'General', station: 'Henry Street', status: 'Active' },
];

export const Basic = () => (
  <MyTable columns={columns} dataSource={rows} selection={false} tablePadding={{ paddingLeft: '0', paddingRight: '0' }} scroll={{ x: 'max-content', y: 300 }} />
);

export const WithSelection = () => (
  <MyTable columns={columns} dataSource={rows} tablePadding={{ paddingLeft: '0', paddingRight: '0' }} scroll={{ x: 'max-content', y: 300 }} />
);

export const Loading = () => (
  <MyTable columns={columns} dataSource={[]} loading selection={false} tablePadding={{ paddingLeft: '0', paddingRight: '0' }} scroll={{ x: 'max-content', y: 200 }} />
);
