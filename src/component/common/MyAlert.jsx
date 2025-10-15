import { notification } from 'antd';

const MyAlert = (message, type = 'info', description = '') => {
  notification[type]({
    message,
    description,
    placement: 'topRight',
  });
};

export default MyAlert;
