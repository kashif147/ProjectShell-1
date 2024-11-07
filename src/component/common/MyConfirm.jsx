// MyConfirm.js
import React from 'react';
import { Modal, Button } from 'antd';

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
        okButtonProps: {
            className: 'custom-confirm-ok-button', // Apply the custom CSS class
        },
        cancelButtonProps: {
            style: { color: '#000' } // Optional: Customize cancel button if needed
        }
    });
};

export default MyConfirm;
