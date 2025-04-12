import './App.css';
import './styles/Utilites.css'
import Entry from './Entry';
import Login from './pages/auth/Login';
import { Routes, Route } from 'react-router-dom';
import React from 'react';
import AuthProvider from './pages/auth/AuthProvider';
import IdleModal from "./component/common/IdleModal"; // Import the IdleModal component




function App() {
  return (
    <AuthProvider>
      <div className="App">

        <div className="">
        {/* <Login/> */}
          <Entry />
          <IdleModal />
        </div>

      </div>
    </AuthProvider>
      

  );
}

export default App;


