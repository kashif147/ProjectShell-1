import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import MainDashBoard from "../pages/MainDashBoard";
import Header from "../component/common/header/Header";
import HeaderDetails from "../component/common/HeaderDetails";
import SideNav from "../component/common/SideNav";
import { useLocation } from "react-router-dom";
import Dummy from "../component/common/Dummy";
import Configuratin from "../pages/Configuratin";
import ProfileDetails from "../pages/Profiles/ProfileDetails";
import ProfileSummary from "../pages/Profiles/ProfileSummary";
import CasesSummary from "../pages/Cases/CasesSummary";
import CasesDetails from "../pages/Cases/CasesDetails";
import ClaimSummary from "../pages/Claims/ClaimSummary";
import ClaimsDetails from "../pages/Claims/ClaimsDetails";
import ProfileHeader from "../component/common/ProfileHeader";
import ResizableComp from "../component/common/ResizableComp";
import Filter from "../pages/Filters/Filter";
import Claims from "../pages/Claims/Claims";
import TransferSummary from "../pages/Transfers/TransferSummary";
import ClaimsById from "../pages/Claims/ClaimsById";
import CasesById from "../pages/Cases/CasesById";
import CorrespondencesSummary from "../pages/Correspondences/CorrespondencesSummary";
import AddNewProfile from "../pages/Profiles/AddNewProfile";
import AddClaims from "../pages/Claims/AddClaims";
import Login from "../pages/auth/Login";
import LandingPage from "../component/msft/LandingPage";
import Reports from "../pages/repots/Reports";
import ProtectedRoute from "./ProtectedRoute";
import MyFooter from "../component/common/MyFooter";
import CorspndncDetail from "../pages/Correspondences/CorspndncDetail";
import Doucmnets from "../pages/Doucmnets";
import RosterDetails from "../pages/roster/RosterDetails";
import RusterSummary from "../pages/roster/RusterSummary";
import { generatePKCE } from "../helpers/crypt.helper";
import IdleModal from "../component/common/IdleModal";
// import RousterDetails from "./pages/rouster/RousterDetails";

const Entry = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const queryParams = new URLSearchParams(location.search);
  //   const authCode = queryParams.get("code");

  //   if (authCode) {
  //     const { code_verifier, code_challenge } = generatePKCE();
  //     console.log("CODE_VERIFIER=====>", code_verifier);
  //     console.log("CODE_CHALLENGE=====>", code_challenge);

  //   }
  // }, [location, navigate]);

  // const exchangeCodeForToken = async (code) => {
  //   try {
  //     const response = await fetch("YOUR_BACKEND_ENDPOINT", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ code }),
  //     });
  //     const { user } = await response.json();
  //     return user;
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  // if (loading) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center vh-100">
  //       <div className="spinner-border text-primary" role="status">
  //         <span className="visually-hidden">Loading...</span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="">{
      location?.pathname != "/" &&
      <Header />
    }
      <div>
        {
          location?.pathname != "/" &&
          <HeaderDetails />
        }
      </div>
      <div className="main-route d-flex ">
        {(location?.pathname == "/Details"
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
              <SideNav />
            </div>
          )}
        {(location?.pathname == "/Details"
          || location?.pathname == "/ClaimsDetails" ||
          location?.pathname == "/CasesDetails" ||
          location?.pathname == "/ClaimsById"
          || location?.pathname == "/CasesById"
          || location?.pathname == "/AddNewProfile"
          || location?.pathname == "/AddClaims"
          || location?.pathname == "/CorspndncDetail"
          || location?.pathname == "/Doucmnets"
          || location?.pathname == "/Roster"

        ) && (
            <ProfileHeader />
          )}
        <div style={{ width: "100%", overflow: "hidden" }}>
          <div className="main-main">
            <Outlet/>
          </div>
        </div>
        {(location?.pathname == "/Details"
          || location?.pathname == "/ClaimsDetails"
          || location?.pathname == "/CasesDetails"
          || location?.pathname == "/AddNewProfile"
          || location?.pathname == "/AddClaims"
          || location?.pathname == "/ClaimsById"
          || location?.pathname == "/Doucmnets"
        ) && (
            <ResizableComp />
          )}
      </div>
      {((location?.pathname == "/Details" || location?.pathname == "/CorspndncDetail" || location?.pathname == "/Doucmnets") && (
        <div style={{ width: '100%', height: '50px' }} className="footer">
          <MyFooter />
        </div>
      ))}
      <IdleModal />
    </div>
  );
}

export default Entry;
