import React from 'react';
import { Table, Tag, Space, Button } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import CustomSelect from '../../component/common/CustomSelect';
import MyInput from '../../component/common/MyInput';


const TemplateManagement = () => {
    // Mock data based on your image
    const dataSource = [
        {
            key: '1',
            templateName: 'Welcome Email',
            category: 'Welcome',
            lastUpdated: 'Oct 22,2023',
            status: 'Active',
        },
        {
            key: '2',
            templateName: 'Password Reset',
            category: 'Account',
            lastUpdated: 'Oct 21,2023',
            status: 'Active',
        },
        {
            key: '3',
            templateName: 'Payment Confirmation',
            category: 'Payment',
            lastUpdated: 'Oct 19,2023',
            status: 'Inactive',
        },
        {
            key: '4',
            templateName: 'New Feature Announcement',
            category: 'Marketing',
            lastUpdated: 'Sep 30,2023',
            status: 'Active',
        },
    ];

    // Columns configuration
    const columns = [
        {
            title: 'TEMPLATE NAME',
            dataIndex: 'templateName',
            key: 'templateName',
            sorter: (a, b) => a.templateName.localeCompare(b.templateName),
        },
        {
            title: 'CATEGORY',
            dataIndex: 'category',
            key: 'category',
            sorter: (a, b) => a.category.localeCompare(b.category),
        },
        {
            title: 'LAST UPDATED',
            dataIndex: 'lastUpdated',
            key: 'lastUpdated',
            sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {status}
                </Tag>
            ),
            filters: [
                { text: 'Active', value: 'Active' },
                { text: 'Inactive', value: 'Inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'ACTIONS',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="action-btn"
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(record)}
                        className="action-btn"
                    >
                        Preview
                    </Button>
                </Space>
            ),
        },
    ];

    const handleEdit = (record) => {
        console.log('Edit:', record);
        // Handle edit logic
    };

    const handlePreview = (record) => {
        console.log('Preview:', record);
        // Handle preview logic
    };

    const handleSearch = (value) => {
        console.log('Search:', value);
        // Handle search logic
    };

    const handleCategoryChange = (value) => {
        console.log('Category:', value);
        // Handle category filter logic
    };

    const handleStatusChange = (value) => {
        console.log('Status:', value);
        // Handle status filter logic
    };

    return (
        <div className="template-management-wrapper p-4">
            {/* Search and Filter Section */}
           <div className="row g-3 align-items-end">

  {/* 4 columns - Search Input */}
  <div className="col-12 col-md-4">
    <MyInput
      label="Search"
      placeholder="Search by template name..."
      name="Search"
      prefixIcon="search"
      onChange={handleSearch}
    />
  </div>

  {/* 2 columns - Category Select */}
  <div className="col-12 col-md-2">
    <CustomSelect
      label="All Categories"
      placeholder="All Categories"
      options={[
        { value: 'welcome', label: 'Welcome' },
        { value: 'account', label: 'Account' },
        { value: 'payment', label: 'Payment' },
        { value: 'marketing', label: 'Marketing' },
      ]}
      onChange={handleCategoryChange}
    />
  </div>

  {/* 2 columns - Status Select */}
  <div className="col-12 col-md-2">
    <CustomSelect
      label="Any Status"
      placeholder="Any Status"
      options={[
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]}
      onChange={handleStatusChange}
    />
  </div>

  {/* Remaining 4 columns (empty) */}
  <div className="col-12 col-md-4"></div>

</div>

            <Table
                columns={columns}
                dataSource={dataSource}
                className="drawer-tbl"
                bordered
                pagination={{
                    total: 10,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                }}
            />
        </div>
    );
};

export default TemplateManagement;