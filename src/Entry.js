import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import MainDashBoard from "./pages/MainDashBoard";
import Header from "./component/common/Header";
import HeaderDetails from "./component/common/HeaderDetails";
import Projects from "./pages/Projects";
import SideNav from "./component/common/SideNav";
import { useLocation } from "react-router-dom";
import Configuratin from "./pages/Configuratin";
import Details from "./pages/Details";

function Entry() {
  const location = useLocation();
  return (
    <div className="">
      <Header />
      <div className="main-route d-flex ">
        {location?.pathname == "/Details" && (
          <div>
            <SideNav />
          </div>
        )}
        <div style={{ width: "100%", overflow: "hidden" }}>
          <div>
         
          <HeaderDetails />
          </div>
          <div className="main-main">
            <Routes>
              <Route path="/" element={<MainDashBoard />} />
              <Route path="Summary" element={<Projects />} />
              <Route path="Configuratin" element={<Configuratin /> } />
              <Route path="Details" element={<Details /> } />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Entry;
