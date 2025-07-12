import React from 'react';
import { Button, Table, Input } from 'antd';
import MyDrawer from '../common/MyDrawer';
import CustomSelect from '../common/CustomSelect';
import MyInput from '../common/MyInput';
import { useTableColumns } from '../../context/TableColumnsContext ';
  const { Search } = Input;
const ChangeCategoryDrawer = ({
    open,
    onClose,
    //   ProfileDetails,
    formData,
    handleChange,
    errors,
    onAccept,
    onReject,
    isProfileDetails = false,
    // for history table if needed
    historyData = [], // array of change history
}) => {
    const { ProfileDetails } = useTableColumns();
    const columnHistory = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => text || '-', // Optional: format with dayjs(text).format('DD/MM/YYYY')
        },
        {
            title: 'Changed By',
            dataIndex: 'changedBy',
            key: 'changedBy',
        },
        {
            title: 'Previous Category',
            dataIndex: 'previousCategory',
            key: 'previousCategory',
        },
        {
            title: 'New Category',
            dataIndex: 'newCategory',
            key: 'newCategory',
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            ellipsis: true,
        },
    ];
  
    return (
        <MyDrawer title="Category Change Request" open={open} onClose={onClose}>

            <div>
                {isProfileDetails && (
                    <Search
                        placeholder="Input search text"
                        // onSearch={onSearch}
                    />
                )}
                {/* Member Info Section */}
                {
                    isProfileDetails && (
                        <div className="details-drawer mb-4 mt-4">
                            <p><strong>Reg No:</strong> {ProfileDetails?.regNo}</p>
                            <p><strong>Full Name:</strong> {ProfileDetails?.fullName}</p>
                            <p><strong>Duty:</strong> {ProfileDetails?.duty}</p>
                        </div>
                    )
                }


                {/* Main Side-by-Side Section */}
                <div className="d-flex">
                    {/* Current Section */}
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
                                label="Category"
                                name="currentCategory"
                                value={formData?.currentCategory}
                                disabled
                            />
                            <MyInput
                                label="Remarks"
                                name="currentRemarks"
                                type="textarea"
                                value={formData?.currentRemarks}
                                disabled
                            />
                        </div>
                    </div>

                    {/* New Section */}
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
                                label="Requested Category"
                                name="newCategory"
                                value={formData?.newCategory}
                                onChange={value => handleChange('newCategory', value)}
                                required
                                hasError={!!errors?.newCategory}
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

                {/* Optional History Table */}
                {columnHistory && (
                    <div className="mt-4">
                        <h5>History</h5>
                        <Table
                            pagination={false}
                            columns={columnHistory}
                            dataSource={historyData}
                            className="drawer-tbl"
                            rowClassName={(record, index) =>
                                index % 2 !== 0 ? 'odd-row' : 'even-row'
                            }
                            bordered
                        />
                    </div>
                )}


            </div>
        </MyDrawer>
    );
};

export default ChangeCategoryDrawer;
