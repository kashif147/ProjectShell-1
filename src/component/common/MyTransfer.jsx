import React, { useEffect, useState } from 'react';
import { Transfer } from 'antd';
const MyTransfer = () => {
  const [mockData, setMockData] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const getMock = () => {
    const tempTargetKeys = [];
   
  
  const  tempMockData = [
        { key: "0", title: "Accommodations", description: "description of content1", chosen: true },
        { key: "1", title: "Allowance", description: "Allowance", chosen: false },
        { key: "2", title: "Legal Aid", description: "Community Police", chosen: true },
        { key: "3", title: "Garda Review", description: "Garda Review", chosen: false },
        { key: "4", title: "Legal Aid", description: "description of content5", chosen: true },

    ]
      
    setMockData(tempMockData);
    setTargetKeys(tempTargetKeys);
  };
  useEffect(() => {
    getMock();
  }, []);
  const filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1;
  const handleChange = (newTargetKeys) => {
    setTargetKeys(newTargetKeys);
  };
  const handleSearch = (dir, value) => {
    console.log('search:', dir, value);
  };
  return (
    <Transfer
      dataSource={mockData}
      showSearch
      filterOption={filterOption}
      targetKeys={targetKeys}
      onChange={handleChange}
      onSearch={handleSearch}
      render={(item) => item.title}
    />
  );
};
export default MyTransfer;