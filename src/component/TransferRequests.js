import React, { useState } from 'react'
import MyDrawer from './common/MyDrawer'
import { Button, Form, Input, Radio, Checkbox, Table, Space } from 'antd';
import MyDatePicker from './common/MyDatePicker';
import MySelect from './common/MySelect';
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useTableColumns } from '../context/TableColumnsContext ';
const { TextArea } = Input;
const { Search } = Input;


function TransferRequests({ open, onClose, isSearch }) {
    const onSearch = (value, _e, info) => console.log(info?.source, value);
    const [selectionType, setSelectionType] = useState('checkbox');
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === 'Disabled User',
            name: record.name,
        }),
    };
    const{ProfileDetails} = useTableColumns();

    const columnCountry = [
        {
            title: 'Transfer Date',
            dataIndex: 'RegionCode',
            key: 'RegionCode',
        },
        {
            title: 'Station From',
            dataIndex: 'RegionName',
            key: 'RegionName',
        },
        {
            title: 'Station To',
            dataIndex: 'DisplayName',
            key: 'DisplayName',
        },
        {
            title: 'Notes',
            dataIndex: 'DisplayName',
            key: 'DisplayName',
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
                <Space size="middle" >
                    <FaEdit size={16} style={{ marginRight: "10px" }} />
                    <AiFillDelete size={16} />
                </Space>
            ),
        },
    ];
    const [form] = Form.useForm();
    const [formLayout, setFormLayout] = useState('horizontal');
    const onFormLayoutChange = ({ layout }) => {
        setFormLayout(layout);
    };

    return (
        <MyDrawer title="Transfer Request" open={open} onClose={onClose}>
            <div>
                {
                    isSearch && (
                        <Search
                        placeholder="input search text"
                        onSearch={onSearch}
                        style={{                       }}
                      />
                    )
                }
                <div className="details-drawer mb-4 mt-4">
                    <p>{ProfileDetails?.regNo}</p>
                    <p>{ProfileDetails?.fullName}</p>
                    <p>{ProfileDetails?.duty}</p>
                </div>

                <div className='transfer-main-cont d-flex'>
                    <div className='w-50'>
                        <div className="drawer-inpts-container ">
                            <div className="drawer-lbl-container" style={{ width: "33%" }}>
                                <p>Current Station :</p>
                            </div>
                            <div className="inpt-con" >
                                <p className="star">*</p>
                                <div className="inpt-sub-con" >
                                    <MySelect placeholder='.' isSimple={true} />

                                </div>
                                <p className="error"></p>
                            </div>
                        </div>
                        <div className="drawer-inpts-container ">
                            <div className="drawer-lbl-container" style={{ width: "33%" }}>
                                <p>Requested Date :</p>
                            </div>
                            <div className="inpt-con" >
                                <p className="star">*</p>
                                <div className="inpt-sub-con" >
                                    {/* <MySelect placeholder='Select County' isSimple={true} /> */}
                                    <MyDatePicker />
                                </div>
                                <p className="error"></p>
                            </div>
                        </div>
                        <div className="drawer-inpts-container " style={{ height: '115px' }}>
                            <div className="drawer-lbl-container" style={{ width: "33%", height: 'auto', display: 'flex', alignItems: 'center' }}>
                                <p>Memo :</p>
                            </div>
                            <div className="inpt-con" >
                                <p className="star-white">*</p>
                                <div className="inpt-sub-con" >
                                    <TextArea rows={4} style={{ width: "100%", borderRadius: "3px", borderColor: 'D9D9D9' }} />
                                </div>
                                <p className="error"></p>
                            </div>
                        </div>
                        <div className="drawer-inpts-container mt-10">
                            <div className="drawer-lbl-container" style={{ width: "33%", height: 'auto', display: 'flex', alignItems: 'center' }}>
                                <p></p>
                            </div>
                            <div className="inpt-con" >
                                <p className="star-white">*</p>
                                <div className="inpt-sub-con d-flex justify-content-end" >
                                    <Checkbox checked={true}>
                                        Transfer was Successful
                                    </Checkbox>
                                </div>
                                <p className="error"></p>
                            </div>
                        </div>
                    </div>
                    <div className='w-50 '>
                        <div className="drawer-inpts-container ">
                            <div className="drawer-lbl-container" style={{ width: "33%", height: 'auto', display: 'flex', alignItems: 'center' }}>
                                <p>Requested Station :</p>
                            </div>
                            <div className="inpt-con" >
                                <p className="star">*</p>
                                <div className="inpt-sub-con" >
                                    <MySelect placeholder='Select Station' isSimple={true} />
                                </div>
                                <p className="error"></p>
                            </div>
                        </div>
                        <div className="drawer-inpts-container ">
                            <div className="drawer-lbl-container" style={{ width: "33%", height: 'auto', display: 'flex', alignItems: 'center' }}>
                                <p>Resulted Station :</p>
                            </div>
                            <div className="inpt-con" >
                                <p className="star">*</p>
                                <div className="inpt-sub-con" >
                                    <MySelect placeholder='Select Station' isSimple={true} />
                                </div>
                                <p className="error"></p>
                            </div>
                        </div>
                        <div className="drawer-inpts-container ">
                            <div className="drawer-lbl-container" style={{ width: "33%", height: 'auto', display: 'flex', alignItems: 'center' }}>
                                <p>Meeting Date :</p>
                            </div>
                            <div className="inpt-con" >
                                <p className="star">*</p>
                                <div className="inpt-sub-con" >
                                    <MyDatePicker />
                                </div>
                                <p className="error"></p>
                            </div>
                        </div>
                        <div className="drawer-inpts-container ">
                            <div className="drawer-lbl-container" style={{ width: "33%", height: 'auto', display: 'flex', alignItems: 'center' }}>
                                <p></p>
                            </div>
                            <div className="inpt-con" >
                                <p className="star-white">*</p>
                                <div className="inpt-sub-con" >
                                    <Checkbox checked={true}>
                                        Priority
                                    </Checkbox>
                                </div>
                                <p className="error"></p>
                            </div>
                        </div>
                        <div className="drawer-inpts-container ">
                            <div className="drawer-lbl-container" style={{ width: "33%", height: 'auto', display: 'flex', alignItems: 'center' }}>
                                <p>Transfer Date :</p>
                            </div>
                            <div className="inpt-con" >
                                <p className="star-white">*</p>
                                <div className="inpt-sub-con" >
                                  <MyDatePicker />
                                </div>
                                <p className="error"></p>
                            </div>
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
                            index % 2 !== 0 ? "odd-row" : "even-row"
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
    )
}

export default TransferRequests