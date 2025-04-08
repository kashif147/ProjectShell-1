export const setHeaders = headers => {
  localStorage.setItem('token', headers['access-token']);
};

export const getHeaders = () => {
  return {
    token: localStorage.getItem('token'),
  };
};

export const deleteHeaders = () => {
  localStorage.removeItem('token');
};
