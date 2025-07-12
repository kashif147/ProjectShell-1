import React, { useState } from 'react';
import { Table, Input, Space } from 'antd';
import MyDrawer from './common/MyDrawer';
import MyInput from './common/MyInput';
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useTableColumns } from '../context/TableColumnsContext ';
import CustomSelect from './common/CustomSelect';
import "../styles/MyDetails.css";

const { Search } = Input;

function TransferRequests({ open, onClose, isSearch, formData, handleChange, errors = {} }) {
  const onSearch = (value, _e, info) => console.log(info?.source, value);

  const [selectionType] = useState('checkbox');

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log('selectedRowKeys:', selectedRowKeys, 'selectedRows:', selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };

  const { ProfileDetails } = useTableColumns();

  const columnCountry = [
    {
      title: 'Transfer Date',
      dataIndex: 'transferDate',
      key: 'transferDate',
    },
    {
      title: 'Station From',
      dataIndex: 'stationFrom',
      key: 'stationFrom',
    },
    {
      title: 'Station To',
      dataIndex: 'stationTo',
      key: 'stationTo',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];

  return (
    <MyDrawer title="Transfer Request" open={open} onClose={onClose}>
      <div>
        {isSearch && (
          <Search
            placeholder="Input search text"
            onSearch={onSearch}
          />
        )}
         {isSearch && (
        <div className="details-drawer mb-4 mt-4">
          <p>{ProfileDetails?.regNo}</p>
          <p>{ProfileDetails?.fullName}</p>
          <p>{ProfileDetails?.duty}</p>
        </div>
         )}
        <div className="d-flex">
          {/* Current Section (Disabled) */}
          <div className="w-50">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: '44px',
                backgroundColor: '#215E97',
                color: 'white',
              }}
            >
              <h3 className="text-center">Current</h3>
            </div>
            <div className="body-container">
              <CustomSelect
                label="Work Location"
                name="currentWorkLocation"
                value={formData?.currentWorkLocation}
                // options={workLocationOptions}
                disabled
              />

              <CustomSelect
                label="Branch"
                name="currentBranch"
                value={formData?.currentBranch}
                disabled
              />
              <CustomSelect
                label="Region"
                name="currentRegion"
                value={formData?.currentRegion}
                // options={regionOptions}
                disabled
              />
              <MyInput
                label="Description"
                name="currentDescription"
                type="textarea"
                value={formData?.currentDescription}
                disabled
              />


            </div>
          </div>

          {/* New Section (Editable) */}
          <div className="w-50 ms-4">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: '44px',
                backgroundColor: '#215E97',
                color: 'white',
              }}
            >
              <h3 className="text-center">New</h3>
            </div>
            <div className="body-container">
              <CustomSelect
                label="Work Location"
                name="newWorkLocation"
                value={formData?.newWorkLocation}
                onChange={value => handleChange('newWorkLocation', value)}
                required
                // options={workLocationOptions}
                hasError={!!errors?.newWorkLocation}
              />

              <CustomSelect
                label="Branch"
                name="newBranch"
                required
                value={formData?.newBranch}
                onChange={(e) => handleChange('newBranch', e.target.value)}
                hasError={!!errors?.newBranch}
              />
              <CustomSelect
                label="Region"
                name="newRegion"
                placeholder="Select Region"
                value={formData?.newRegion}
                onChange={(value) => handleChange('newRegion', value)}
                required
                // options={regionOptions}
                hasError={!!errors?.newRegion}
              />
              <MyInput
                label="Description"
                name="newDescription"
                type="textarea"
                placeholder="Write description"
                value={formData?.newDescription}
                onChange={(e) => handleChange('newDescription', e.target.value)}
              />
              <MyInput
                label="Transfer Date"
                name="transferDate"
                placeholder="DD/MM/YYYY"
                required
                value={formData?.transferDate}
                onChange={(e) => handleChange('transferDate', e.target.value)}
                hasError={!!errors?.transferDate}
              />

              <MyInput
                label="Memo"
                name="memo"
                type="textarea"
                placeholder="Enter memo"
                value={formData?.memo}
                onChange={(e) => handleChange('memo', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <h5>History</h5>
          <Table
            pagination={false}
            columns={columnCountry}
            className="drawer-tbl"
            rowClassName={(record, index) =>
              index % 2 !== 0 ? 'odd-row' : 'even-row'
            }
            rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
            bordered
          />
        </div>
      </div>
    </MyDrawer>
  );
}

export default TransferRequests;
