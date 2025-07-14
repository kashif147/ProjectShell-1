import React, { useState } from 'react';
import { Table, Input, Space } from 'antd';
import MyDrawer from './common/MyDrawer';
import MyInput from './common/MyInput';
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useTableColumns } from '../context/TableColumnsContext ';
import CustomSelect from './common/CustomSelect';
import { workLocations } from '../Data';
import { workLocationDetails } from '../Data';
import { CatOptions } from '../Data';
import "../styles/MyDetails.css";
import dayjs from 'dayjs';

const { Search } = Input;

function TransferRequests({ open, onClose, isSearch }) {
  const onSearch = (value, _e, info) => console.log(info?.source, value);

  const [formData, setFormData] = useState({
    newWorkLocation: '',
    newBranch: '',
    newRegion: '',
    newDescription: '',
    transferDate: '',
    memo: '',
  });

  const [errors, setErrors] = useState({});
  const allBranches = Array.from(
    new Set(Object.values(workLocationDetails).map(d => d.branch)),
  );
  const allRegions = Array.from(
    new Set(Object.values(workLocationDetails).map(d => d.region)),
  );
  const handleChange = (eventOrName, value) => {
    if (eventOrName?.target) {
      const { name, type, value, checked } = eventOrName.target;
      const finalValue = type === "checkbox" ? checked : value;
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: finalValue,
        };
        if (name === "newWorkLocation" && workLocationDetails[finalValue]) {
          updated.newBranch = workLocationDetails[finalValue].branch;
          updated.newRegion = workLocationDetails[finalValue].region;
        }
        return updated;
      });
    } else {
      const name = eventOrName;
      const formattedValue = dayjs.isDayjs(value)
        ? value.format("DD/MM/YYYY")
        : value;

      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: formattedValue,
        };

        // Handle WorkLocation → branch & region
        if (name === "newWorkLocation" && workLocationDetails[formattedValue]) {
          updated.branch = workLocationDetails[formattedValue].newBranch;
          updated.region = workLocationDetails[formattedValue].newRegion;
        }

        return updated;
      });
      debugger
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

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

  const oncloseftn = () => {
    onClose()

    setFormData(
      {
        newWorkLocation: '',
        newBranch: '',
        newRegion: '',
        newDescription: '',
        transferDate: '',
        memo: '',
      }
    )
     setErrors({});
  }
  const onSubmit = () => {
  const requiredFields = [
    'newWorkLocation',
    'newBranch',
    'newRegion',
    'transferDate'
  ];
  
  const newErrors = {};
  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].trim?.() === '') {
      newErrors[field] = 'This field is required';
    }
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  console.log('Submitted data:', formData);
};
  return (
    <MyDrawer title="Transfer Request" open={open} onClose={oncloseftn}
    add={onSubmit}
    >
      <div>
        {isSearch === true && (
          <Search
            placeholder="Input search text "
            className='pb-4'
            onSearch={onSearch}
          />
        )}
        {isSearch === false && (
          <div className="details-drawer mb-4 mt-4">
            <p>{`${ProfileDetails?.forename}  ${ProfileDetails?.surname}`}</p>
            <p>{ProfileDetails?.regNo}</p>
            <p>{ProfileDetails?.duty}</p>
          </div>
        )}
        <div className="d-flex">
          {/* Current Section (Disabled) */}
          <div className="w-50">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: '35px',
                backgroundColor: '#215E97',
                color: 'white',
              }}
            >
              <h3 className="text-center" style={{ fontSize: '15px' }}>Current</h3>
            </div>
            <div className="body-container">
              <CustomSelect
                label="Work Location"
                name="currentWorkLocation"
                value={ProfileDetails?.workLocation}
                options={[...workLocations.map(loc => ({ value: loc, label: loc })), { value: 'other', label: 'other' }]}
                disabled
              />
              <CustomSelect
                label="Branch"
                name="currentBranch"
                value={ProfileDetails?.branch}
                disabled
              />
              <CustomSelect
                label="Region"
                name="currentRegion"
                value={ProfileDetails?.region}
                disabled
              />
              <MyInput
                label="Description"
                name="currentDescription"
                type="textarea"
                value={ProfileDetails?.description}
                disabled
              />
            </div>
          </div>

          {/* New Section (Editable) */}
          <div className="w-50 ms-4">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: '35px',
                backgroundColor: '#215E97',
                color: 'white',
              }}
            >
              <h3 className="text-center" style={{ fontSize: '15px', margin: '0px' }}>New</h3>
            </div>
            <div className="body-container">
              <CustomSelect
                label="Work Location"
                name="newWorkLocation"
                value={formData.newWorkLocation}
                onChange={handleChange}
                required
                options={[...workLocations.map(loc => ({ value: loc, label: loc })), { value: 'other', label: 'other' }]}
                hasError={!!errors.newWorkLocation}
              />
              <CustomSelect
                label="Branch"
                name="newBranch"
                required
                disabled={true}
                value={formData.newBranch}
                options={allBranches.map(branch => ({
                  value: branch,
                  label: branch,
                }))}
                onChange={(e) => handleChange('newBranch', e.target.value)}
                hasError={!!errors.newBranch}
              />
              <CustomSelect
                label="Region"
                name="newRegion"
                placeholder="Select Region"
                value={formData.newRegion}
                onChange={(value) => handleChange('newRegion', value)}
                required
                disabled={true}
                options={allRegions.map(region => ({ value: region, label: region }))}
                hasError={!!errors.newRegion}
              />
              <MyInput
                label="Description"
                name="newDescription"
                type="textarea"
                placeholder="Write description"
                value={formData.newDescription}
                onChange={(e) => handleChange('newDescription', e.target.value)}
              />
              <MyInput
                label="Transfer Date"
                name="transferDate"
                placeholder="DD/MM/YYYY"
                required
                value={formData.transferDate}
                onChange={(e) => handleChange('transferDate', e.target.value)}
                hasError={!!errors.transferDate}
              />
              <MyInput
                label="Memo"
                name="memo"
                type="textarea"
                placeholder="Enter memo"
                value={formData.memo}
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
