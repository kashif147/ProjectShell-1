import React, { useState } from 'react';
import { Transfer, Button } from 'antd';

const MyTransfer = () => {
  const [targetKeys, setTargetKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const mockData = [
    { key: '1', title: 'Accommodations', description: 'Description of item 1' },
    { key: '2', title: 'Allowance', description: 'Description of item 2' },
    { key: '2', title: 'Community Police', description: 'Description of item 2' },
    { key: '2', title: 'Garda Review', description: 'Description of item 2' },
    { key: '2', title: 'Legal Aid', description: 'Description of item 2' },
  ];

  const handleChange = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  const handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  return (
    <div>
      <Transfer
        dataSource={mockData}
        titles={['Committees', 'Members']}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        render={item => item.title}
        showSearch // Enable search functionality
        filterOption={(inputValue, item) => item.title.toLowerCase().includes(inputValue.toLowerCase())} // Search filtering
      />
      
    </div>
  );
};

export default MyTransfer;
