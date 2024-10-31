// MyConfirm.js
import React from 'react';
import { Modal } from 'antd';

const MyConfirm = ({ title, message, onConfirm }) => {
    const handleOk = () => {
        onConfirm();
        Modal.destroyAll(); 
    };

    const handleCancel = () => {
        Modal.destroyAll(); 
    };

    Modal.confirm({
        title: title,
        content: message,
        onOk: handleOk,
        onCancel: handleCancel,
        okText: 'Yes', 
        cancelText: 'No', 
    });
};

export default MyConfirm;
