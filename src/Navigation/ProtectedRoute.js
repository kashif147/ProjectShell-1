import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// import SideNav from "../component/common/SideNav";
import IdleModal from "../component/common/IdleModal"; 

const ProtectedRoute = ({ children }) => {
  // Logic to handle protected routes: if the user is not logged in, show only the login page; 
// if logged in, redirect to the profile page.

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


  