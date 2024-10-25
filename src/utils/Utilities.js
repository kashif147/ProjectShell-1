import axios from "axios";
export const token = localStorage.getItem('token');
export const  baseURL = 'https://node-api-app-dxecgpajapacc4gs.northeurope-01.azurewebsites.net'


export const insertDataFtn = async (url, data, successNotification, faliearNotification, resetCounteries) => {
 debugger
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
    });
    console.log({successNotification}, response.data);
    resetCounteries()
    return response.data; 
  } catch (error) {
    console.error({faliearNotification}, error);
    throw error;
  }
};