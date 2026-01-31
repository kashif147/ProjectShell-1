import React, { useState } from 'react'
import MyDrawer from '../common/MyDrawer'
import MyDatePicker from '../common/MyDatePicker'
import MyInput from '../common/MyInput'
import { Input, Table, Space, Button } from 'antd'
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useTableColumns } from '../../context/TableColumnsContext ';
const { TextArea } = Input;


function CreateCasesDrawer({ open, onClose }) {
    const [selectionType, setSelectionType] = useState('checkbox');
    const { ProfileDetails } = useTableColumns();
    const [caseData, setCaseData] = useState({});

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === 'Disabled User',
            name: record.name,
        }),
    };

    const casesColumns = [
        {
            title: 'Case Number',
            dataIndex: 'caseNumber',
            key: 'caseNumber',
        },
        {
            title: 'Case Type',
            dataIndex: 'caseType',
            key: 'caseType',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
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

    const handleInputChange = (field, value) => {
        setCaseData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        // Add your submit logic here
        console.log("Case Data:", caseData);
        onClose();
    };

    const handleCancel = () => {
        setCaseData({});
        onClose();
    };

    const extra = (
        <div className="d-flex flex-wrap align-items-center gap-3">
            <Button 
                className="butn secondary"
                style={{ color: "#215E97" }}
                onClick={handleCancel}
            >
                Cancel
            </Button>
            <Button 
                className="butn primary-btn"
                onClick={handleSubmit}
            >
                Submit
            </Button>
        </div>
    );

    return (
        <MyDrawer 
            title="Create Case" 
            open={open} 
            onClose={onClose} 
            width='578px'
            extra={extra}
        >
            <div>
                <div className="details-drawer mb-4 mt-4">
                    <p><strong>{ProfileDetails?.regNo}</strong></p>
                    <p><strong>{ProfileDetails?.fullName}</strong></p>
                    <p><strong>{ProfileDetails?.duty}</strong></p>
                </div>
                <div className='transfer-main-cont'>

                    {/* Case Number */}
                    <div className="drawer-inpts-container">
                        <div className="drawer-lbl-container" style={{ width: "30%" }}>
                            <p>Case Number :</p>
                        </div>
                        <div className="inpt-con">
                            <p className="star">*</p>
                            <div className="inpt-sub-con">
                                <MyInput 
                                    placeholder="Enter case number"
                                    value={caseData.caseNumber || ''}
                                    onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                                />
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>

                    {/* Case Type */}
                    <div className="drawer-inpts-container">
                        <div className="drawer-lbl-container" style={{ width: "30%" }}>
                            <p>Case Type :</p>
                        </div>
                        <div className="inpt-con">
                            <p className="star">*</p>
                            <div className="inpt-sub-con">
                                <MyInput 
                                    placeholder="Enter case type"
                                    value={caseData.caseType || ''}
                                    onChange={(e) => handleInputChange('caseType', e.target.value)}
                                />
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>

                    {/* Case Status */}
                    <div className="drawer-inpts-container">
                        <div className="drawer-lbl-container" style={{ width: "30%" }}>
                            <p>Status :</p>
                        </div>
                        <div className="inpt-con">
                            <p className="star">*</p>
                            <div className="inpt-sub-con">
                                <MyInput 
                                    placeholder="Enter status"
                                    value={caseData.status || ''}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                />
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="drawer-inpts-container" style={{ height: '110px', alignItems: 'flex-start' }}>
                        <div className="drawer-lbl-container" style={{ width: "30%" }}>
                            <p style={{ marginTop: "8px" }}>Description :</p>
                        </div>
                        <div className="inpt-con">
                            <div className="inpt-sub-con">
                                <TextArea 
                                    rows={3}
                                    placeholder="Enter case description"
                                    value={caseData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>

                    {/* Cases Table */}
                    <div style={{ marginTop: '24px' }}>
                        <h4 style={{ marginBottom: '16px' }}>Cases History</h4>
                        <Table
                            rowSelection={{
                                type: selectionType,
                                ...rowSelection,
                            }}
                            columns={casesColumns}
                            dataSource={[]}
                            pagination={false}
                            className="drawer-tbl mt-4"
                        />
                    </div>
                </div>
            </div>
        </MyDrawer>
    )
}

export default CreateCasesDrawer
