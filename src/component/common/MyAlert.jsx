import { notification } from 'antd';

// MyAlert.js
const MyAlert = (type, message, description) => {
    notification[type]({
        message: message,
        description: description,
        placement: 'topRight', // You can set the position of the notification
    });
};

export default MyAlert;