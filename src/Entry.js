import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import MainDashBoard from './pages/MainDashBoard';
import Header from './component/common/Header';
import HeaderDetails from './component/common/HeaderDetails';
import Projects from './pages/Projects';
import SideNav from './component/common/SideNav';

function Entry() {
  return (
    <div  >
      <Header />
      <div className="main-route d-flex " >
        <div >
          <SideNav />
        </div>
        <div style={{width:"100%"}}>
          <div>

      <HeaderDetails />
          </div>

        <div className='main-main' style={{borderRight:"2px"}}>
      <Routes>
        <Route path="/" element={<MainDashBoard />} />
        <Route path='Details' element={<Projects />} />     
      </Routes>
      </div>
        </div>
      </div>
    </div>
  )
}

export default Entry
