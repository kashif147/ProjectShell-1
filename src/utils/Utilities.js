import axios from "axios";
export const token = localStorage.getItem('token');
export const  baseURL = process.env.REACT_APP_BASE_URL_DEV


export const insertDataFtn = async (url, data, successNotification, faliearNotification, resetCounteries) => {

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
    });
    console.log({successNotification}, response.data);
    resetCounteries()
    return
  } catch (error) {
   return console.error({faliearNotification}, error);

  }
};