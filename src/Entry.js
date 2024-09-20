import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import MainDashBoard from "./pages/MainDashBoard";
import Header from "./component/common/Header";
import HeaderDetails from "./component/common/HeaderDetails";
import SideNav from "./component/common/SideNav";
import { useLocation } from "react-router-dom";
import Dummy from "./component/common/Dummy";
import Configuratin from "./pages/Configuratin";
import ProfileDetails from "./pages/Profiles/ProfileDetails";
import ProfileSummary from "./pages/Profiles/ProfileSummary";
import CasesSummary from "./pages/Cases/CasesSummary"; 
import CasesDetails from "./pages/Cases/CasesDetails";
import ClaimSummary from "./pages/Claims/ClaimSummary";
import ClaimsDetails from "./pages/Claims/ClaimsDetails";
import ProfileHeader from "./component/common/ProfileHeader";
import ResizableComp from "./component/common/ResizableComp";
import Filter from "./pages/Filters/Filter";
import Claims from "./pages/Claims/Claims";

function Entry() {
  const location = useLocation();
  return (
    <div className="">
      <Header />
      <div>
          
          <HeaderDetails />
       
        </div>
      <div className="main-route d-flex ">
        {(location?.pathname == "/Details" || location?.pathname == "/ClaimsDetails" || location?.pathname == "/CasesDetails") && (
          <div>
            <SideNav />
          </div>
        )}
        {(location?.pathname == "/Details" || location?.pathname == "/ClaimsDetails" || location?.pathname == "/CasesDetails") && (
        
            <ProfileHeader />
       
        )}
        <div style={{ width: "100%", overflow: "hidden" }}>
         
          <div className="main-main">
            <Routes>
              <Route path="/" element={<MainDashBoard />} />
              <Route path="Dummy" element={<Dummy />} />
              <Route path="Details" element={<ProfileDetails />} />
              <Route path="Summary" element={<ProfileSummary />}  />
              <Route path="CasesDetails" element={< CasesDetails/> } />
              <Route path="CasesSummary" element={< CasesSummary/> } />
              <Route path="ClaimSummary" element={< Claims/> } />
              <Route path="ClaimsDetails" element={< ClaimsDetails/> } />
              <Route path="Configuratin" element={<Configuratin /> } />
              <Route path="Filters" element={<Filter /> } />
            </Routes>
          </div>
        </div>
        {(location?.pathname == "/Details" || location?.pathname == "/ClaimsDetails" || location?.pathname == "/CasesDetails") && (
        <ResizableComp />
        )}
      </div>
    </div>
  );
}

export default Entry;
