import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from "./component/common/Header";
import HeaderDetails from "./component/common/HeaderDetails";
import Sidbar from "./component/common/Sidbar";
import ProfileHeader from "./component/common/ProfileHeader";
import ResizableComp from "./component/common/ResizableComp";
import MyFooter from "./component/common/MyFooter";

// Lazy loaded components
const Dummy = lazy(() => import("./component/common/Dummy"));
const Configuratin = lazy(() => import("./pages/Configuratin"));
const ProfileDetails = lazy(() => import("./pages/Profiles/ProfileDetails"));
const ProfileSummary = lazy(() => import("./pages/Profiles/ProfileSummary"));
const CasesSummary = lazy(() => import("./pages/Cases/CasesSummary"));
const CasesDetails = lazy(() => import("./pages/Cases/CasesDetails"));
const ClaimSummary = lazy(() => import("./pages/Claims/ClaimSummary"));
const ClaimsDetails = lazy(() => import("./pages/Claims/ClaimsDetails"));
const ClaimsById = lazy(() => import("./pages/Claims/ClaimsById"));
const CasesById = lazy(() => import("./pages/Cases/CasesById"));
const Filter = lazy(() => import("./pages/Filters/Filter"));
const TransferSummary = lazy(() => import("./pages/Transfers/TransferSummary"));
const CorrespondencesSummary = lazy(() => import("./pages/Correspondences/CorrespondencesSummary"));
const AddNewProfile = lazy(() => import("./pages/Profiles/AddNewProfile"));
const AddClaims = lazy(() => import("./pages/Claims/AddClaims"));
const Login = lazy(() => import("./pages/auth/Login"));
const LandingPage = lazy(() => import("./component/msft/LandingPage"));
const Reports = lazy(() => import("./pages/repots/Reports"));
const CorspndncDetail = lazy(() => import("./pages/Correspondences/CorspndncDetail"));
const Doucmnets = lazy(() => import("./pages/Doucmnets"));
const RosterDetails = lazy(() => import("./pages/roster/RosterDetails"));
const RusterSummary = lazy(() => import("./pages/roster/RusterSummary"));
const MembershipApplication = lazy(() => import("./pages/application/MembershipApplication"));
const ApproveMembership = lazy(() => import("./pages/application/ApproveMembership"));
const ChangCateSumm = lazy(() => import("./pages/Category/ChangCateSumm"));
const CateById = lazy(() => import("./pages/Category/CateById"));
const RemindersSummary = lazy(() => import("./pages/reminders/RemindersSummary"));
const Cancallation = lazy(() => import("./pages/Cancallation"));
const Batches = lazy(() => import("./pages/finance/Batches"));
const Import = lazy(() => import("./pages/finance/Import"));
const BatchMemberSummary = lazy(() => import("./pages/finance/BatchMemberSummary"));
const NotDesignedYet = lazy(() => import("./pages/NotDesign"));

// const NotDesignedYet = lazy (()=>import("./pages/NotDesignedYet"));
// const ProtectedRoute = lazy(() => import("./Navigation/ProtectedRoute")); // Optional

function Entry() {
  const location = useLocation();

  const showSidebar = location.pathname !== "/";
  const showHeaderDetails = showSidebar;
  const showProfileHeaderRoutes = [
    "/Details", "/ClaimsDetails", "/CasesDetails", "/ClaimsById",
    "/CasesById", "/AddNewProfile", "/AddClaims", "/CorspndncDetail",
    "/Doucmnets", "/Roster"
  ];
  const showResizableCompRoutes = [
    "/ClaimsDetails", "/CasesDetails", "/AddNewProfile",
    "/AddClaims", "/ClaimsById", "/Doucmnets"
  ];
  const showFooterRoutes = [
    "/Details", "/CorspndncDetail", "/Doucmnets"
  ];

  return (
    <div style={{ width: "100%", height: "100vh", overflowX: "hidden" }}>
      {showSidebar && <Header />}

      <div className={`main-route ${showSidebar ? "d-flex" : ""}`} style={{ width: "100%" }}>
        {showSidebar && <Sidbar />}

        <div>
          <div style={{ width: "100vw" }}>
            {showHeaderDetails && <HeaderDetails />}
          </div>

          <div className={`main-route ${showSidebar ? "d-flex" : ""}`}>
            {showProfileHeaderRoutes.includes(location.pathname) && <ProfileHeader />}

            <div style={{ overflow: "hidden" }}>
              <div className="main-main">
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="Dummy" element={<Dummy />} />
                    <Route path="Details" element={<ProfileDetails />} />
                    <Route path="Summary" element={<ProfileSummary />} />
                    <Route path="CasesDetails" element={<CasesDetails />} />
                    <Route path="CasesById" element={<CasesById />} />
                    <Route path="CasesSummary" element={<CasesSummary />} />
                    <Route path="ClaimSummary" element={<ClaimSummary />} />
                    <Route path="ClaimsDetails" element={<ClaimsDetails />} />
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
                    <Route path="NotDesignedYet" element={<NotDesignedYet />} />
                  </Routes>
                </Suspense>
              </div>
            </div>

            {showResizableCompRoutes.includes(location.pathname) && <ResizableComp />}
          </div>
        </div>
      </div>

      {showFooterRoutes.includes(location.pathname) && (
        <div style={{ width: "100%", height: "5vh" }} className="footer">
          <MyFooter />
        </div>
      )}
    </div>
  );
}

export default Entry;
