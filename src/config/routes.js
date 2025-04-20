import { Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Dummy from '../component/common/Dummy';
import ProfileSummary from '../pages/Profiles/ProfileSummary';
import ProfileDetails from '../pages/Profiles/ProfileDetails';

export const publicRoutes = [
  {
    path: '/',
    exact: true,
    element: <Login />,
  },
  {
    path: '/Dummy',
    element: <Dummy />,
  },
];

export const privateRoutes = [
  {
    path: '/Summary',
    exact: true,
    element: <ProfileSummary />,
  },
  {
    path: '/Details',
    element: <ProfileDetails />,
  },

];
