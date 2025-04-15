import axios from "axios";
import MyAlert from "../component/common/MyAlert";
import { notificationsMsg } from "../Data";
let token;
export const baseURL = process.env.REACT_APP_BASE_URL_DEV
// export const  baseURL = "http://localhost:3500"

export const insertDataFtn = async (url, data, successNotification, failureNotification, callback, addNotification) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(baseURL + url, data, {
      headers: {
        'Content-Type': 'application/json',
        maxBodyLength: Infinity,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 201) {
      MyAlert('success', successNotification);
      addNotification({
        type: "success",
        status: "completed",
        title: "Creation Successful",
        message: successNotification ?? "Operation completed successfully",
      });
      callback?.();
      return;
    } else {
      addNotification({
        title: "Creation Failed",
        message: failureNotification ?? "Something Wrong",
        type: "error",
        status: "completed",
      });
      return MyAlert('error', `${failureNotification}`, response?.data?.error);
    }
  } catch (error) {
    addNotification({
      title: "Creation Failed",
      message: failureNotification ?? "Something Wrong",
      type: "error",
      status: "completed",
    });
    console.error(error?.response, '222');
    MyAlert('error', failureNotification, error?.response?.data?.error);
  }
};

export const deleteFtn = async (url, id, callback) => {
  token = localStorage.getItem('token')
  const data = JSON.stringify({ id });
  const config = {
    method: 'delete',
    // maxBodyLength: Infinity,
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Use Bearer token for authorization
    },
    data: data,
  };
  try {
    const response = await axios.request(config);
    // toast.success('Successfully Deleted')
    MyAlert('success', 'You Have Successfully Deleted.')
    if (callback && typeof callback === 'function' && response?.data) {
      callback();
    }
    return response.data;
  } catch (error) {
    // toast.error('Something went wrong!')
    console.error('Error deleting region:', error);
    return MyAlert('error', 'Please Try Again');
  }

}

export const updateFtn = async (endPoint, data, callback) => {
  try {
    token = localStorage.getItem('token');
    const response = await axios.put(`${baseURL}${endPoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // toast.success(notificationsMsg?.updating?.sucess ?? 'Successfully Updated')
    MyAlert('success', notificationsMsg?.updating?.sucess)
    callback()
    return response.data;
  } catch (error) {
    // toast.error(notificationsMsg?.updating?.falier ?? 'Something went wrong!')
    MyAlert('error', notificationsMsg?.updating?.falier)

  }
};

