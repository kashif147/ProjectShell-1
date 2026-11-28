import { ApiPagination, Table } from 'projectshell-crm';

// ApiPagination always fetches its own data (axios GET apiEndpoint, spreading apiConfig into the
// request config). An axios `adapter` in apiConfig answers locally (no network request) and
// transformResponse supplies the page, so the control renders as it does against the members API.
const members = [
  { _id: '1', membershipNo: 'GRA-104233', name: 'Siobhán Murphy', station: 'Pearse Street', category: 'General' },
  { _id: '2', membershipNo: 'GRA-104871', name: 'Ciarán O’Brien', station: 'Anglesea Street', category: 'Probationer' },
  { _id: '3', membershipNo: 'GRA-099412', name: 'Aoife Kelly', station: 'Mill Street', category: 'Retired Associate' },
  { _id: '4', membershipNo: 'GRA-101560', name: 'Declan Byrne', station: 'Henry Street', category: 'General' },
];
const endpoint = '/profile-service/api/members';
const localAdapter = { adapter: async (config) => ({ data: {}, status: 200, statusText: 'OK', headers: {}, config }) };

export const MembersPager = () => (
  <div style={{ width: 760 }}>
    <ApiPagination
      apiEndpoint={endpoint}
      apiConfig={localAdapter}
      itemName="members"
      transformResponse={() => ({ data: members, total: 2480 })}
    />
  </div>
);

export const LargeDataset = () => (
  <div style={{ width: 760 }}>
    <ApiPagination
      apiEndpoint={endpoint}
      apiConfig={localAdapter}
      itemName="subscriptions"
      showQuickJumper
      transformResponse={() => ({ data: members, total: 64210 })}
    />
  </div>
);

export const WithRenderProp = () => (
  <div style={{ width: 760 }}>
    <ApiPagination apiEndpoint={endpoint}
      apiConfig={localAdapter} itemName="members" transformResponse={() => ({ data: members, total: 4 })}>
      {({ data, loading }) => (
        <Table
          size="small"
          rowKey="_id"
          loading={loading}
          pagination={false}
          dataSource={data}
          columns={[
            { title: 'Membership No', dataIndex: 'membershipNo' },
            { title: 'Name', dataIndex: 'name' },
            { title: 'Station', dataIndex: 'station' },
            { title: 'Category', dataIndex: 'category' },
          ]}
        />
      )}
    </ApiPagination>
  </div>
);
