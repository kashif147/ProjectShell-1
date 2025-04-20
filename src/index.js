import React from 'react';
import './styles/Utilites.css'
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TableColumnsProvider } from './context/TableColumnsContext ';
import { Provider, useDispatch, useSelector } from 'react-redux'
import store from './store';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './config/globals';
import AuthProvider from './pages/auth/AuthProvider';
import Entry from './Navigation/Entry';
import { privateRoutes, publicRoutes } from './config/routes'
import { validation } from './services/auth.services';

const root = ReactDOM.createRoot(document.getElementById('root'));

const RequireAuth = ({ children, auth }) => {
  return auth.isSignedIn ? children : <Navigate to="/" replace />;
};

const Router = ({ auth }) => {
  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            auth.isSignedIn ? (
              <Navigate to="/Summary" replace />
            ) : (
              route.element
            )
          }
        />
      ))}

      <Route
        element={
          <RequireAuth auth={auth}>
            <Entry />
          </RequireAuth>
        }
      >
        {privateRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>
    </Routes>
  );
};


const App = () => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  console.log('Auth=========>', auth);

  React.useEffect(() => {
    dispatch(validation());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return auth.isLoading ? <div>loading...</div> : <Router auth={auth} />;
};

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <TableColumnsProvider>
            <ToastContainer />
            <App />
          </TableColumnsProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </Provider>

);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
