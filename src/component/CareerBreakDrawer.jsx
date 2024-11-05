import React, { useState } from 'react'
import MyDrawer from './common/MyDrawer'
import MyDatePicker from './common/MyDatePicker'
import { Input, Table, Space } from 'antd'
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
const { TextArea } = Input;

function CareerBreakDrawer({ open, onClose }) {
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
    const columnCountry = [
        {
            title: 'Start Date',
            dataIndex: 'RegionCode',
            key: 'RegionCode',
        },
        {
            title: 'End Date',
            dataIndex: 'RegionName',
            key: 'RegionName',
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
    return (
        <MyDrawer title="Career Break" open={open} onClose={onClose} width='578px'>
            <div>
                <Input
                    placeholder="Search by Reg No or Surname"
                    allowClear
                    // onSearch={onSearch}
                    style={{
                        width: "100%",
                        marginTop: '10px'
                    }}
                />
                <div className="details-drawer mb-4 mt-4">
                    <p>Garda Reg No</p>
                    <p>Fullname</p>
                    <p>Garda</p>
                </div>

                <div className='transfer-main-cont d-flex'>

                    <div className="drawer-inpts-container ">
                        <div className="drawer-lbl-container" style={{ width: "35%" }}>
                            <p>Start date :</p>
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
                        <div className="drawer-lbl-container" style={{ width: "35%" }}>
                            <p>End date :</p>
                        </div>
                        <div className="inpt-con" >
                            <p className="star">*</p>
                            <div className="inpt-sub-con" >
                                <MyDatePicker

                                />
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>


                </div>
                <div className="drawer-inpts-container " style={{height:'110px'}}>
                    <div className="drawer-lbl-container" style={{ width: "10%" }}>
                        <p>Memo :</p>
                    </div>
                    <div className="inpt-con w-80" >
                        <p className="star">*</p>
                        <div className="inpt-sub-con" >
                        <TextArea placeholder='Autosize height based on content lines
' rows={4} style={{ width: "100%", borderRadius: "3px", borderColor: 'D9D9D9' }} />
                        </div>
                        <p className="error"></p>
                    </div>
                </div>
               
                <div>
                    <h5>History</h5>
                    <Table
                        pagination={false}
                        columns={columnCountry}
                        className="drawer-tbl mt-4"
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

export default CareerBreakDrawer