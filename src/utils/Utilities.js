import axios from "axios";
import MyAlert from "../component/common/MyAlert";
let token;
export const  baseURL = process.env.REACT_APP_BASE_URL_DEV


export const insertDataFtn = async (url, data, successNotification, failureNotification) => {
  
  const token = localStorage.getItem('token'); // Explicit declaration with const
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
    });

    console.log({ successNotification }, response?.status);

    if (response.status === 201) { // Strict equality check

      MyAlert('success', successNotification);

    } else {
      return MyAlert('error', failureNotification);
    }
  } catch (error) {
    console.error(error);
    MyAlert('error', failureNotification); 
  }
};

export const deleteFtn = async (url,id, callback)=>{
  token = localStorage.getItem('token')
  const data = JSON.stringify({ id });
  const config = {
    method: 'delete',
    maxBodyLength: Infinity,
    url: url,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Use Bearer token for authorization
    },
    data: data,
};
try {
  const response = await axios.request(config);
 MyAlert('success','You Have Successfully Deleted.')
 if (callback && typeof callback === 'function' && response?.data) {
  callback(); 
}
  return response.data; 
} catch (error) {
  console.error('Error deleting region:', error);
 return  MyAlert('error','Please Try Again'); 
}

}