import {
  signInRequest,
  signUpRequest,
} from '../api/auth.api';
import { setHeaders } from '../helpers/auth.helper';
import { setSignedIn, setUser } from '../store/slice/auth.slice';

export const signIn = data => {
  return dispatch => {
    signInRequest(data)
      .then(res => {
        if (res.status === 200) {
          setHeaders(res.headers);
          dispatch(setSignedIn(true));
          dispatch(setUser(res.data.data));
        } else {
          toast.error(res.data.errors[0] ?? 'Unable to Sign In');
        }
      })
      .catch(() => toast.error('Something went wrong'));
  };
};

export const signUp = data => {
  return dispatch => {
    signUpRequest(data)
      .then(res => {
        if (res.status === 200) {
          setHeaders(res.headers);
          dispatch(setSignedIn(true));
          dispatch(setUser(res.data.data));
        } else {
          toast.error(res.data.errors[0] ?? 'Unable to Sign Up');
        }
      })
      .catch(() => toast.error('Something went wrong'));
  };
};

