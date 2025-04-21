import { Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Dummy from '../component/common/Dummy';
import ProfileSummary from '../pages/Profiles/ProfileSummary';
import ProfileDetails from '../pages/Profiles/ProfileDetails';
import CasesDetails from '../pages/Cases/CasesDetails';
import CasesById from '../pages/Cases/CasesById';
import CasesSummary from '../pages/Cases/CasesSummary';
import ClaimSummary from '../pages/Claims/ClaimSummary';
import Configuratin from '../pages/Configuratin';
import Filter from '../pages/Filters/Filter';
import ClaimsById from '../pages/Claims/ClaimsById';
import AddNewProfile from '../pages/Profiles/AddNewProfile';
import TransferSummary from '../pages/Transfers/TransferSummary';
import AddClaims from '../pages/Claims/AddClaims';
import CorrespondencesSummary from '../pages/Correspondences/CorrespondencesSummary';
import LandingPage from '../component/msft/LandingPage';
import Reports from '../pages/repots/Reports';
import CorspndncDetail from '../pages/Correspondences/CorspndncDetail';
import RusterSummary from '../pages/roster/RusterSummary';
import Doucmnets from '../pages/Doucmnets';
import RosterDetails from '../pages/roster/RosterDetails';
import ClaimsDetails from "../pages/Claims/ClaimsDetails";

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
  {
    path: '/CasesDetails',
    element: <CasesDetails />,
  },
  {
    path: '/CasesById',
    element: <CasesById />,
  },
  {
    path: '/CasesSummary',
    element: <CasesSummary />,
  },
  {
    path: '/ClaimSummary',
    element: <ClaimSummary />,
  },
  {
    path: '/ClaimsDetails',
    element: <ClaimsDetails />,
  },
  {
    path: '/Configuratin',
    element: <Configuratin />,
  },
  {
    path: '/Filters',
    element: <Filter />,
  },
  {
    path: '/ClaimsById',
    element: <ClaimsById />,
  },
  {
    path: '/AddNewProfile',
    element: <AddNewProfile />,
  },
  {
    path: '/Transfers',
    element: <TransferSummary />,
  },
  {
    path: '/AddClaims',
    element: <AddClaims />,
  },
  {
    path: '/CorrespondencesSummary',
    element: <CorrespondencesSummary />,
  },
  {
    path: '/LandingPage',
    element: <LandingPage />,
  },
  {
    path: '/Reports',
    element: <Reports />,
  },
  {
    path: '/CorspndncDetail',
    element: <CorspndncDetail />,
  },
  {
    path: '/RosterSummary',
    element: <RusterSummary />,
  },
  {
    path: '/Doucmnets',
    element: <Doucmnets />,
  },
  {
    path: '/Roster',
    element: <RosterDetails />,
  },
];
