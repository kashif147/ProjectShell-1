import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "./component/common/Header";
import HeaderDetails from "./component/common/HeaderDetails";
import Sidbar from "./component/common/Sidbar";
import ProfileHeader from "./component/common/ProfileHeader";
import ResizableComp from "./component/common/ResizableComp";
import MyFooter from "./component/common/MyFooter";
import CornGrideSummary from "./pages/cornmarket/CornGrideSummary";
import ProtectedRoute from "./Navigation/ProtectedRoute";
import { Spin } from "antd";
import { generatePKCE } from "./utils/Utilities";
// import RemindersDetails from "./pages/reminders/RemindersDetails";

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
const CorrespondencesSummary = lazy(() =>
  import("./pages/Correspondences/CorrespondencesSummary")
);
const AddNewProfile = lazy(() => import("./pages/Profiles/AddNewProfile"));
const AddClaims = lazy(() => import("./pages/Claims/AddClaims"));
const Login = lazy(() => import("./pages/auth/Login"));
const LandingPage = lazy(() => import("./component/msft/LandingPage"));
const Reports = lazy(() => import("./pages/repots/Reports"));
const CorspndncDetail = lazy(() =>
  import("./pages/Correspondences/CorspndncDetail")
);

const Doucmnets = lazy(() => import("./pages/Doucmnets"));
const RosterDetails = lazy(() => import("./pages/roster/RosterDetails"));
const RusterSummary = lazy(() => import("./pages/roster/RusterSummary"));
const MembershipApplication = lazy(() =>
  import("./pages/application/MembershipApplication")
);
const ApproveMembership = lazy(() =>
  import("./pages/application/ApproveMembership")
);
const ChangCateSumm = lazy(() => import("./pages/Category/ChangCateSumm"));
const CateById = lazy(() => import("./pages/Category/CateById"));
const RemindersSummary = lazy(() =>
  import("./pages/reminders/RemindersSummary")
);
const Cancallation = lazy(() => import("./pages/Cancallation"));
const CancellationDetail = lazy(() =>
  import("./pages/cancellation/CancellationDetail")
);
const Batches = lazy(() => import("./pages/finance/Batches"));
const Import = lazy(() => import("./pages/finance/Import"));
const BatchMemberSummary = lazy(() =>
  import("./pages/finance/BatchMemberSummary")
);
const NotDesignedYet = lazy(() => import("./pages/NotDesign"));
const Sms = lazy(() => import("./pages/Correspondences/sms"));
const Email = lazy(() => import("./pages/Correspondences/Emails"));
const Notes = lazy(() => import("./pages/Correspondences/Notes"));
const Popout = lazy(() => import("../src/component/common/PopOut"));
const Members = lazy(() => import("./pages/membership/Members"));
const RemindersDetails = lazy(() =>
  import("./pages/reminders/RemindersDetails")
);
const MembershipDashboard = lazy(() =>
  import("./pages/membership/MembershipDashboard")
);
const TenantManagement = lazy(() =>
  import("./pages/tenant-management/TenantManagement")
);
const RoleManagement = lazy(() =>
  import("./pages/role-management/RoleManagement")
);
const UserManagement = lazy(() =>
  import("./pages/user-management/UserManagement")
);
const PermissionManagement = lazy(() =>
  import("./pages/permission-management/PermissionManagement")
);
const CancelledMembersReport = lazy(() =>
  import("./pages/reports/CancelledMembersReport")
);

function Entry() {
  const location = useLocation();

  const showSidebar = location.pathname !== "/";
  const showHeaderDetails = showSidebar;
  const showProfileHeaderRoutes = [
    "/Details",
    "/ClaimsDetails",
    "/CasesDetails",
    "/ClaimsById",
    "/CasesById",
    "/AddNewProfile",
    "/AddClaims",
    "/CorspndncDetail",
    "/Doucmnets",
    "/Roster",
  ];
  const showResizableCompRoutes = [
    "/ClaimsDetails",
    "/CasesDetails",
    "/AddNewProfile",
    "/AddClaims",
    "/ClaimsById",
    "/Doucmnets",
  ];
  const showFooterRoutes = ["/"];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      {showSidebar && <Header />}

      {/* Main layout body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        {showSidebar && <Sidbar />}

        {/* Main content column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header Details */}
          {showHeaderDetails && <HeaderDetails />}

          {/* Profile Header */}
          {/* {showProfileHeaderRoutes.includes(location.pathname) && <ProfileHeader />} */}

          {/* Content area + resizable section */}
          <div style={{ flex: 1, display: "flex" }}>
            <div
              style={{ flex: 1, scrollbarWidth: "none" }}
              className="main-main "
            >
              <Suspense
                fallback={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100vh", // full screen height
                      width: "100%", // full width
                    }}
                  >
                    <Spin size="large" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Login />} />
                  {/* <Route element={<ProtectedRoute />} > */}
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
                  <Route
                    path="CorrespondencesSummary"
                    element={<CorrespondencesSummary />}
                  />
                  <Route path="LandingPage" element={<LandingPage />} />
                  <Route path="Reports" element={<Reports />} />
                  <Route path="CorspndncDetail" element={<CorspndncDetail />} />
                  <Route path="RosterSummary" element={<RusterSummary />} />
                  <Route path="Doucmnets" element={<Doucmnets />} />
                  <Route path="Roster" element={<RosterDetails />} />
                  <Route
                    path="Applications"
                    element={<MembershipApplication />}
                  />
                  <Route
                    path="AproveMembersip"
                    element={<ApproveMembership />}
                  />
                  <Route path="ChangCateSumm" element={<ChangCateSumm />} />
                  <Route path="ChangeCatById" element={<CateById />} />
                  <Route
                    path="RemindersSummary"
                    element={<RemindersSummary />}
                  />
                  <Route path="Cancallation" element={<Cancallation />} />
                  <Route path="Batches" element={<Batches />} />
                  <Route path="Import" element={<Import />} />
                  <Route
                    path="BatchMemberSummary"
                    element={<BatchMemberSummary />}
                  />
                  <Route path="NotDesignedYet" element={<NotDesignedYet />} />
                  <Route path="Email" element={<Email />} />
                  <Route path="Sms" element={<Sms />} />
                  <Route path="Notes" element={<Notes />} />
                  <Route path="CornMarket" element={<CornGrideSummary />} />
                  <Route path="Popout" element={<Popout />} />
                  <Route path="members" element={<Members />} />
                  <Route
                    path="RemindersDetails"
                    element={<RemindersDetails />}
                  />
                  <Route
                    path="CancellationDetail"
                    element={<CancellationDetail />}
                  />
                  <Route
                    path="MembershipDashboard"
                    element={<MembershipDashboard />}
                  />
                  <Route
                    path="TenantManagement"
                    element={<TenantManagement />}
                  />
                  <Route path="RoleManagement" element={<RoleManagement />} />
                  <Route path="UserManagement" element={<UserManagement />} />
                  <Route
                    path="PermissionManagement"
                    element={<PermissionManagement />}
                  />
                  <Route
                    path="CancelledMembersReport"
                    element={<CancelledMembersReport />}
                  />
                </Routes>
              </Suspense>
            </div>

            {/* Optional right-side component */}
            {showResizableCompRoutes.includes(location.pathname) && (
              <ResizableComp />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {location?.pathname === "/" ? null : <MyFooter />}
      {/* <MyFooter /> */}
    </div>
  );
}

export default Entry;
