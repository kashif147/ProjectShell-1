import React from 'react';
import { Table, Card } from 'antd';
import ApiPagination from './ApiPagination';

/**
 * Example usage of ApiPagination component
 * 
 * This demonstrates:
 * 1. Using ApiPagination with a render function (children)
 * 2. Displaying data in an Ant Design Table
 * 3. Handling pagination state changes
 * 4. Custom API endpoint configuration
 */
const ApiPaginationExample = () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <Card title="API Pagination Example" style={{ margin: '24px' }}>
      <ApiPagination
        apiEndpoint="/api/items"
        itemName="items"
        showSizeChanger={true}
        showQuickJumper={true}
        showTotal={true}
        onDataChange={(data) => {
          
        }}
        onPaginationChange={({ page, pageSize, total, totalPages }) => {
          
        }}
        transformResponse={(response) => {
          // Custom response transformer if API returns different format
          // Default expects: { data: [], total: number }
          return {
            data: response.items || response.data || [],
            total: response.total || response.count || 0,
          };
        }}
      >
        {({ data, loading, pagination }) => (
          <div>
            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              rowKey="id"
              pagination={false} // Disable Table's built-in pagination
              scroll={{ y: 400 }}
            />
            <div style={{ marginTop: '16px', textAlign: 'center', color: '#666' }}>
              Showing page {pagination.page} of {pagination.totalPages} 
              {' '}({pagination.pageSize === 'All' ? 'All' : pagination.pageSize} per page)
            </div>
          </div>
        )}
      </ApiPagination>
    </Card>
  );
};

/**
 * Standalone usage example (without render function)
 * Use this when you only need the pagination controls
 */
export const StandaloneApiPaginationExample = () => {
  return (
    <Card title="Standalone API Pagination" style={{ margin: '24px' }}>
      <ApiPagination
        apiEndpoint="/api/items"
        itemName="users"
        showSizeChanger={true}
        showQuickJumper={false}
        onPaginationChange={(pagination) => {
          
        }}
      />
    </Card>
  );
};

export default ApiPaginationExample;

