import './App.css';
import './styles/Utilites.css'
import Entry from './Entry';
import React from 'react';
import AuthProvider from './pages/auth/AuthProvider';
// import { ExcelProvider } from './context/ExcelContext';




function App() {
  return (
    <AuthProvider>
      <div className="App">

        <div className="">
        {/* <Login/> */}
          <Entry />
         
        </div>

      </div>
    </AuthProvider>
      

  );
}

export default App;


