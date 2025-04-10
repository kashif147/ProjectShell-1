import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// import SideNav from "../component/common/SideNav";
import Sidbar from "../component/common/Sidbar";
import IdleModal from "../component/common/IdleModal"; 

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/" replace />; 
  }

  return (
    <div>
      {/* This div will be shown with each protected route */}
    

      {/* Render the actual protected content */}
      <IdleModal />
      <Outlet />
      
    </div>
  );
};
  
  export default ProtectedRoute;


  