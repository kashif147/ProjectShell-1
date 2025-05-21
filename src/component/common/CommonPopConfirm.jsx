// components/CommonPopConfirm.js
import React from 'react';
import { Popconfirm, Button } from 'antd';

const CommonPopConfirm = ({
    title = "Are you sure?",
    onConfirm,
    onCancel,
    children,
    okText = "Confirm",
    cancelText = "Cancel",
    placement = "top",
}) => {
    return (
        <Popconfirm
            title={title}
            onConfirm={onConfirm}
            onCancel={onCancel}
            okText={okText}
            cancelText={cancelText}
            placement={placement}
            okButtonProps={{ className: "butn primary-btn" }}
            cancelButtonProps={{ className: "butn secoundry-btn" }}
        >
            {children}
        </Popconfirm>
    );
};

export default CommonPopConfirm;
