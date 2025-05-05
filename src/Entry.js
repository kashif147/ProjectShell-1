import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./component/common/Header";
import HeaderDetails from "./component/common/HeaderDetails";
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
import TransferSummary from "./pages/Transfers/TransferSummary";
import ClaimsById from "./pages/Claims/ClaimsById";
import CasesById from "./pages/Cases/CasesById";
import CorrespondencesSummary from "./pages/Correspondences/CorrespondencesSummary";
import AddNewProfile from "./pages/Profiles/AddNewProfile";
import AddClaims from "./pages/Claims/AddClaims";
import Login from "./pages/auth/Login";
import LandingPage from "./component/msft/LandingPage";
import Reports from "./pages/repots/Reports";
import ProtectedRoute from "./Navigation/ProtectedRoute";
import MyFooter from "./component/common/MyFooter";
import CorspndncDetail from "./pages/Correspondences/CorspndncDetail";
import Doucmnets from "./pages/Doucmnets";
import RosterDetails from "./pages/roster/RosterDetails";
import RusterSummary from "./pages/roster/RusterSummary";
// import RousterDetails from "./pages/rouster/RousterDetails";
import Sidbar from "./component/common/Sidbar";
import MembershipApplication from "./pages/application/MembershipApplication";
import ApproveMembership from "./pages/application/ApproveMembership";
import ChangCateSumm from "./pages/Category/ChangCateSumm";
import CateById from "./pages/Category/CateById";
import RemindersSummary from "./pages/reminders/RemindersSummary";
import Cancallation from "./pages/Cancallation";
import Batches from "./pages/finance/Batches";
import Import from "./pages/finance/Import";
import "antd/dist/reset.css";
import BatchMemberSummary from "./pages/finance/BatchMemberSummary";

// test
function Entry() {
  const location = useLocation();
  return (
    <div style={{ width: '100%', height: '100vh', overflowX: 'hidden' }}>
      {location?.pathname !== "/" && <Header />}
  
      <div
        className={`main-route ${location.pathname !== "/" ? "d-flex" : ""}`}
        style={{ width: '100%' }}
        >
        {location?.pathname !== "/" && (
          <div>
            <Sidbar />
          </div>
        )}
         <div style={{}}>
      <div style={{width: '100vw'}}>
      {
        location?.pathname !== "/" && 
        <HeaderDetails />
      }
      </div>
      <div 
      className={`main-route ${location.pathname !== "/" ? "d-flex" : ""}`}>
        {/* {(location?.pathname == "/Details"
          || location?.pathname == "/ClaimsDetails" ||
          location?.pathname == "/CasesDetails" ||
          location?.pathname == "/ClaimsById" ||
          location?.pathname == "/CasesById"
          || location?.pathname == "/AddNewProfile"
          || location?.pathname == "/AddClaims"
          || location?.pathname == "/CorspndncDetail"
          || location?.pathname == "/Doucmnets"
          || location?.pathname == "/Roster"
        ) && (
            <div className="sid-nav-main">
            </div>
            <SideNav />
          )} */}
        {(location?.pathname === "/Details"
          || location?.pathname === "/ClaimsDetails" ||
          location?.pathname === "/CasesDetails" ||
          location?.pathname === "/ClaimsById"
          || location?.pathname === "/CasesById"
          || location?.pathname === "/AddNewProfile"
          || location?.pathname === "/AddClaims"
          || location?.pathname === "/CorspndncDetail"
          || location?.pathname === "/Doucmnets"
          // || location?.pathname == "/AproveMembersip"
          || location?.pathname === "/Roster"

        ) && (
            <ProfileHeader />
          )}
        <div style={{  overflow: "hidden" }}>

          <div className="main-main">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="Dummy" element={<Dummy />} />
              {/* <Route element={<ProtectedRoute />}>               */}
              <Route path="Details" element={<ProfileDetails />} />
              <Route path="Summary" element={<ProfileSummary />} />
              <Route path="CasesDetails" element={< CasesDetails />} />
              <Route path="CasesById" element={<CasesById />} />
              <Route path="CasesSummary" element={< CasesSummary />} />
              <Route path="ClaimSummary" element={< ClaimSummary />} />
              <Route path="ClaimsDetails" element={< ClaimsDetails />} />
              <Route path="Configuratin" element={<Configuratin />} />
              <Route path="Filters" element={<Filter />} />
              <Route path="ClaimsById" element={<ClaimsById />} />
              <Route path="AddNewProfile" element={<AddNewProfile />} />
              <Route path="Transfers" element={<TransferSummary />} />
              <Route path="AddClaims" element={<AddClaims />} />
              <Route path="CorrespondencesSummary" element={<CorrespondencesSummary />} />
              <Route path="LandingPage" element={<LandingPage />} /> 
              <Route path="Reports" element={<Reports />} />
              <Route path="CorspndncDetail" element={<CorspndncDetail />} />
              <Route path="RosterSummary" element={<RusterSummary />} />
              <Route path="Doucmnets" element={<Doucmnets />} />
              <Route path="Roster" element={<RosterDetails />} />
              <Route path="Applications" element={<MembershipApplication />} />
              <Route path="AproveMembersip" element={<ApproveMembership />} />
              <Route path="ChangCateSumm" element={<ChangCateSumm />} />
              <Route path="ChangeCatById" element={<CateById />} />
              <Route path="RemindersSummary" element={<RemindersSummary />} />
              <Route path="Cancallation" element={<Cancallation />} />
              <Route path="Batches" element={<Batches />} />
              <Route path="Import" element={<Import />} />
              <Route path="BatchMemberSummary" element={<BatchMemberSummary />} />
              
              {/* </Route>  */}
                          </Routes>
          </div>
        </div>
        {(
           location?.pathname === "/ClaimsDetails"
          || location?.pathname === "/CasesDetails"
          || location?.pathname === "/AddNewProfile" 
          || location?.pathname === "/AddClaims"
          || location?.pathname === "/ClaimsById"
          || location?.pathname === "/Doucmnets"
        ) && (
            <ResizableComp />
          )}
      </div>
      {((location?.pathname === "/Details" ||location?.pathname === "/CorspndncDetail"||location?.pathname === "/Doucmnets" ) && (
      <div style={{width:'100%',height:'50px'}} className="footer">
      <MyFooter />
      </div>
      ))}
      </div>
      </div>
    </div>
  );
  
}

export default Entry;
