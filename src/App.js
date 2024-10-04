import logo from './logo.svg';
import './App.css';
import Entry from './Entry';

import React from 'react';
import AuthProvider from './pages/auth/AuthProvider';
import Login from './pages/auth/Login';

function App() {
  return (
    <AuthProvider>
    <div className="App">
        {/* <h1>Welcome to My React App</h1> */}
        <Login />
    </div>
</AuthProvider>
      
    //   <div className="">
      
    //   <Entry />
 
    //  </div>
  );
}

export default App;


