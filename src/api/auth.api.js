import request from './request';

export const signInRequest = data => {
  return request.post('/auth', data);
};

export const signUpRequest = data => {
  return request.post('/auth', data);
};

