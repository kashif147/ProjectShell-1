import React, { useState } from 'react'
import MyDrawer from './common/MyDrawer'
import MyDatePicker from './common/MyDatePicker'
import { Input, Table, Space, Checkbox } from 'antd'
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useTableColumns } from '../context/TableColumnsContext ';
const { TextArea } = Input;


function CareerBreakDrawer({ open, onClose }) {
    const [selectionType, setSelectionType] = useState('checkbox');
        const{ProfileDetails} = useTableColumns();
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
        <MyDrawer title="Career Break" open={open} onClose={onClose} width='578px' isrecursion={true}>
            <div>
                <div className="details-drawer mb-4 mt-4">
                    <p>{ProfileDetails?.regNo}</p>
                    <p>{ProfileDetails?.fullName}</p>
                    <p>{ProfileDetails?.duty}</p>
                </div>
                <div className='transfer-main-cont'>

                    <div className="drawer-inpts-container ">
                        <div className="drawer-lbl-container" style={{ width: "15%" }}>
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
                        <div className="drawer-lbl-container" style={{ width: "15%" }}>
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
                <div className='d-flex justify-content-center pb-4'>
                    <Checkbox checked={true}>
                        Archived
                    </Checkbox>
                </div>
                <div className="drawer-inpts-container " style={{ height: '110px', width: '', }}>
                    <div className="drawer-lbl-container" style={{ width: "", }}>
                        <p>Memo :</p>
                    </div>
                    <div className="inpt-con " style={{ width: "" }} >
                        <p className="star">*</p>
                        <div className="inpt-sub-con" >
                            <TextArea placeholder='Autosize height based on content lines
' rows={4} style={{ width: "", borderRadius: "3px", borderColor: 'D9D9D9', }} />
                        </div>
                        <p className="error"></p>
                    </div>
                </div>
                <div style={{ marginTop: '10vh' }}>
                    <h5 className=''>History</h5>
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