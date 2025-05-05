import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// import SideNav from "../component/common/SideNav";
import IdleModal from "../component/common/IdleModal"; 

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/" replace />; 
  }

  return (
    <>

      <IdleModal />
      <Outlet />
      
    </>
  );
};
  
  export default ProtectedRoute;


  