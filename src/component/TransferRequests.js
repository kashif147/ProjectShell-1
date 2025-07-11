import React, { useState } from 'react'
import MyDrawer from './common/MyDrawer'
import { Button, Form, Input, Radio, Checkbox, Table, Space, DatePicker } from 'antd';
import MyDatePicker from './common/MyDatePicker';
import MySelect from './common/MySelect';
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useTableColumns } from '../context/TableColumnsContext ';
// import "../../styles/MyDetails.css";
import "../styles/MyDetails.css"
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
    const { ProfileDetails } = useTableColumns();

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
                            style={{}}
                        />
                    )
                }
                <div className="details-drawer mb-4 mt-4">
                    <p>{ProfileDetails?.regNo}</p>
                    <p>{ProfileDetails?.fullName}</p>
                    <p>{ProfileDetails?.duty}</p>
                </div>

                <div className='d-flex'>
                    <div className='w-50  '>
                        <div
                            className='d-flex align-items-center justify-content-center'
                            style={{
                                height: "44px",
                                backgroundColor: "#215E97",
                                color: "white",
                            }}>
                            <h3 className='text-center'>Current</h3>
                        </div>
                        <div className='body-container'>
                            <div className='transfer-main-inpts'>
                                <div className='transfer-inpts-title'>
                                    <p className='transfer-main-inpts-p'>Work location :</p>
                                </div>
                                <div className='transfer-inputs'>
                                    <div className='d-flex '>
                                        <p className='star-white '>*</p>
                                        <MySelect
                                            placeholder='Select Work location'
                                            isSimple={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='transfer-main-inpts'>
                                <div className='transfer-inpts-title'>
                                    <p className='transfer-main-inpts-p'>Branch :</p>
                                </div>

                                <div className='transfer-inputs'>
                                    <div className='d-flex '>
                                        <p className='star-white '>*</p>
                                        <Input />
                                    </div>
                                </div>
                            </div>
                            <div className='transfer-main-inpts1'>
                                <div className='transfer-inpts-title1'>
                                    <p className='transfer-main-inpts-p'></p>
                                </div>

                                <div className='transfer-inputs1'>
                                    <div className='d-flex '>
                                        <p className='star-white '>*</p>
                                        <TextArea rows={3} />
                                    </div>
                                </div>
                            </div>
                            <div className='transfer-main-inpts'>
                                <div className='transfer-inpts-title'>
                                    <p className='transfer-main-inpts-p'>Region :</p>
                                </div>

                                <div className='transfer-inputs'>
                                    <div className='d-flex '>
                                        <p className='star-white '>*</p>
                                        <MySelect
                                            isSimple={true}
                                            placeholder='Region'
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* <div className='transfer-main-inpts'>
                                    <div className='transfer-inpts-title'>
                                      <p className='transfer-main-inpts-p'>Division :</p>
                                    </div>
                
                                    <div className='transfer-inputs'>
                                      <div className='d-flex '>
                                        <p className='star-white '>*</p>
                                        <MySelect
                                          isSimple={true}
                                          placeholder='Select District'
                                        />
                                      </div>
                                    </div>
                                  </div> */}
                        </div>
                    </div>
                    <div className='w-50 ms-4 '>
                        <div
                            className='d-flex align-items-center justify-content-center'
                            style={{
                                height: "44px",
                                backgroundColor: "#215E97",
                                color: "white",
                            }}>
                            <h3 className='text-center'>New</h3>
                        </div>
                        <div className='body-container'>
                            <div className='transfer-main-inpts'>
                                <div className='transfer-inpts-title'>
                                    <p className='transfer-main-inpts-p'>Work location :</p>
                                </div>
                                <div className='transfer-inputs'>
                                    <div className='d-flex '>
                                        <p className='star'>*</p>
                                        <MySelect
                                            placeholder='Select Work location'
                                            isSimple={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='transfer-main-inpts'>
                                <div className='transfer-inpts-title'>
                                    <p className='transfer-main-inpts-p'>Branch  :</p>
                                </div>

                                <div className='transfer-inputs'>
                                    <div className='d-flex '>
                                        <p className='star-white '>*</p>
                                        <Input />
                                    </div>
                                </div>
                            </div>
                            <div className='transfer-main-inpts1'>
                                <div className='transfer-inpts-title1'>
                                    <p className='transfer-main-inpts-p'></p>
                                </div>

                                <div className='transfer-inputs1'>
                                    <div className='d-flex '>
                                        <p className='star-white '>*</p>
                                        <TextArea rows={3} />
                                    </div>
                                </div>
                            </div>
                            <div className='transfer-main-inpts'>
                                <div className='transfer-inpts-title'>
                                    <p className='transfer-main-inpts-p'>Region :</p>
                                </div>

                                <div className='transfer-inputs'>
                                    <div className='d-flex '>
                                        <p className='star'>*</p>
                                      <Input />
                                    </div>
                                </div>
                            </div>
                            {/* <div className='transfer-main-inpts'>
                                <div className='transfer-inpts-title'>
                                    <p className='transfer-main-inpts-p'>Division :</p>
                                </div>

                                <div className='transfer-inputs'>
                                    <div className='d-flex '>
                                        <p className='star'>*</p>
                                        <MySelect
                                            isSimple={true}
                                            placeholder='Select District'
                                        />
                                    </div>
                                </div>
                            </div> */}
                            <div className='transfer-main-inpts'>
                                <div className='transfer-inpts-title'>
                                    <p className='transfer-main-inpts-p'>Transfer Date :</p>
                                </div>

                                <div className='transfer-inputs'>
                                    <div className='d-flex '>
                                        <p className='star-white '>*</p>
                                        <DatePicker className='w-100' />
                                    </div>
                                </div>
                            </div>
                            <div className='transfer-main-inpts1'>
                                <div className='transfer-inpts-title1'>
                                    <p className='transfer-main-inpts-p'>Memo :</p>
                                </div>

                                <div className='transfer-inputs1'>
                                    <div className='d-flex '>
                                        <p className='star-white '>*</p>
                                        <TextArea rows={3} />
                                    </div>
                                </div>
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