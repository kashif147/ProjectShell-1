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

function TransferRequests({ open, onClose, isSearch,isChangeCat }) {
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
 const columnHistory = [
  {
    title: "Transfer Date",
    dataIndex: "transferDate",
    key: "transferDate",
  },
  {
    title: "Station From",
    dataIndex: "stationFrom",
    key: "stationFrom",
  },
  {
    title: "Station To",
    dataIndex: "stationTo",
    key: "stationTo",
  },
  {
    title: "Notes",
    dataIndex: "notes",
    key: "notes",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (text) => {
      let color = "default";
      if (text === "Approved") color = "green";
      else if (text === "Rejected") color = "red";
      else if (text === "Pending") color = "orange";
      return <span style={{ color }}>{text}</span>;
    },
  },
];

  const historyData = [
    {
      key: "1",
      transferDate: "10/06/2024",
      stationFrom: "Dublin City University",
      stationTo: "University College Dublin",
      notes: "Requested transfer for further studies",
      status: "Approved",
    },
    {
      key: "2",
      transferDate: "10/07/2024",
      stationFrom: "Limerick Institute Of Technology",
      stationTo: "Tus (Limerick)",
      notes: "Institute merger adjustment",
      status: "Approved",
    },
    {
      key: "3",
      transferDate: "10/08/2025",
      stationFrom: "National University Ireland Galway",
      stationTo: "Roscrea College",
      notes: "Awaiting admin approval",
      status: "Pending",
    },
    // {
    //   key: "4",
    //   transferDate: "2024-09-15",
    //   stationFrom: "Trinity College",
    //   stationTo: "Royal College Of Surgeons",
    //   notes: "Rejected due to incomplete application",
    //   status: "Rejected",
    // },
  ];
  return (
    <MyDrawer 
    title={` ${isChangeCat?"Transfer Request":"Transfer History"}`}
    open={open} onClose={oncloseftn}
      add={onSubmit}
      width={"1000px"}
    >
      <div>
        {isSearch === true && isChangeCat && (
          <Search
            placeholder="Input search text "
            className='pb-4'
            onSearch={onSearch}
          />
        )}
        {isSearch === false && isChangeCat && (
          <div className="details-drawer mb-4 mt-4">
            <p>{`${ProfileDetails?.forename}  ${ProfileDetails?.surname}`}</p>
            <p>{ProfileDetails?.regNo}</p>
            <p>{ProfileDetails?.duty}</p>
          </div>
        )}
        {
          isChangeCat &&(
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
                value={ProfileDetails?.worklocation}
                options={[...workLocations.map(loc => ({ value: loc, label: loc })), { value: 'other', label: 'other' }]}
                disabled
              />
              <CustomSelect
                label="Branch"
                name="currentBranch"
                value={ProfileDetails?.branch}
                disabled
                options={allBranches.map(branch => ({
                  value: branch,
                  label: branch,
                }))}
              />
              <CustomSelect
                label="region"
                name="currentRegion"
                value={ProfileDetails?.region}
                options={allRegions.map(region => ({ value: region, label: region }))}
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

                disabled={true}
                options={allRegions.map(region => ({ value: region, label: region }))}
                hasError={!!errors.newRegion}
              />

              {/* <MyInput
                label="Transfer Date"
                name="transferDate"
                placeholder="DD/MM/YYYY"
                required
                value={formData.transferDate}
                onChange={(e) => handleChange('transferDate', e.target.value)}
                hasError={!!errors.transferDate}
              /> */}
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
          )
        }

        <div>
          <Table
            pagination={false}
            columns={columnHistory}
            dataSource={historyData}
            className="drawer-tbl"
            rowClassName={(record, index) =>
              index % 2 !== 0 ? 'odd-row' : 'even-row'
            }
            // rowSelection={{
            //   type: selectionType,
            //   ...rowSelection,
            // }}
            bordered
          />
        </div>
      </div>
    </MyDrawer>
  );
}

export default TransferRequests;
