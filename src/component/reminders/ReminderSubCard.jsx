// ReminderCard.jsx
import React from "react";
import { Card, Row, Col, Button, Table } from "antd";
import { PlayCircleOutlined, CloseOutlined } from "@ant-design/icons";
import MySearchInput from "../common/MySearchInput";

const ReminderSubCard = ({
    reminderKey,
    title,
    totalItems,
    stats = {},
    columns,
    data,
    getRowSelection,
    selectedKeysMap,
    onExport,
    onExecute,
}) => {
    return (
        <div className="mt-1 ms-1 me-1 w-100">
            <Card className="">
                {/* Header */}
                <div className="d-flex justify-content-between">
                    <h5 className="m-0">{title}</h5>
                    <div className="p-2 rounded-pill bg-light shadow-sm fw-semibold">
                        <p className="m-0">{totalItems} Items</p>
                    </div>
                </div>

                {/* Search + Actions */}
                <div className="d-flex align-items-center ">
                    <div className="flex-grow-1 me-2">

                    </div>

                    {/* Execute Button */}
                    {/* {selectedKeysMap?.[reminderKey]?.length > 0 && (
                        <>
                        <Button
                        
                            className="butn primary-btn me-2"
                            style={{ height: "40px", backgroundColor:'red'}}
                            icon={<CloseOutlined  />}
                            onClick={() => onExecute(reminderKey, selectedKeysMap[reminderKey])}
                        >
                            Exclude ({selectedKeysMap[reminderKey].length})
                        </Button>
                        <Button
                            className="butn primary-btn me-2"
                            style={{ height: "40px" }}
                            icon={<PlayCircleOutlined />}
                            onClick={() => onExecute(reminderKey, selectedKeysMap[reminderKey])}
                        >
                            Execute ({selectedKeysMap[reminderKey].length})
                        </Button>
                        </>
                    )} */}

                    {/* Export Button */}

                </div>

                {/* Stats Row */}
              
            </Card>
            <div className="pt-2 pb-2 w-50">
                <MySearchInput placeholder="Search by name, email or membership no." className="w-50" />

            </div>
            <Table
                className="claims-table"
                rowSelection={getRowSelection(reminderKey)}
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered
            />
        </div>
    );
};

export default ReminderSubCard;
