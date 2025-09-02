import './App.css';
import './styles/Utilites.css'
import Entry from './Entry';
import React from 'react';
import AuthProvider from './pages/auth/AuthProvider';
import { useEffect } from 'react';




function App() {
    useEffect(() => {
    const loadWorklet = async () => {
      if ("sharedStorage" in window) {
        try {
          // 👇 Load your worklet from public
          await window.sharedStorage.worklet.addModule("/shared-storage-worklet.js");
          console.log("✅ Shared Storage worklet loaded");
        } catch (err) {
          console.error("❌ Error loading worklet:", err);
        }
      } else {
        console.warn("Shared Storage API not supported in this browser.");
      }
    };

    loadWorklet();
  }, []);
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


