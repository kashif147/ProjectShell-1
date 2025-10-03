import React, { Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./component/common/Header";
import HeaderDetails from "./component/common/HeaderDetails";
import Sidebar from "./component/common/Sidebar";
import ResizableComp from "./component/common/ResizableComp";
import MyFooter from "./component/common/MyFooter";
import CornGrideSummary from "./pages/cornmarket/CornGrideSummary";
import ProtectedRoute from "./Navigation/ProtectedRoute";
import { AuthorizationProvider } from "./context/AuthorizationContext";
import { Spin } from "antd";
import RoutePermissionWrapper from "./component/common/RoutePermissionWrapper";
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
const ReportViewerDemo = lazy(() => import("./pages/ReportViewerDemo"));
const AuthorizationExample = lazy(() => import("./pages/AuthorizationExample"));
const DynamicPermissionsExample = lazy(() =>
  import("./pages/DynamicPermissionsExample")
);
const DynamicRoutePermissionsExample = lazy(() =>
  import("./pages/DynamicRoutePermissionsExample")
);
const PolicyClientExample = lazy(() => import("./pages/PolicyClientExample"));
const ProductTypesManagement = lazy(() =>
  import("./pages/product-management/ProductTypesManagement")
);
const ProductManagementDemo = lazy(() =>
  import("./pages/product-management/ProductManagementDemo")
);

function Entry() {
  const location = useLocation();

  const showSidebar = location.pathname !== "/";
  const showHeaderDetails = showSidebar;

  // Debug logging
  console.log("Entry Debug - Current pathname:", location.pathname);
  console.log("Entry Debug - showSidebar:", showSidebar);
  console.log("Entry Debug - showHeaderDetails:", showHeaderDetails);
  const showResizableCompRoutes = [
    "/ClaimsDetails",
    "/CasesDetails",
    "/AddNewProfile",
    "/AddClaims",
    "/ClaimsById",
    "/Doucmnets",
  ];

  return (
    <AuthorizationProvider>
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
          {showSidebar && <Sidebar />}

          {/* Main content column */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0, // Allow flex item to shrink
            }}
          >
            {/* Header Details */}
            {showHeaderDetails && <HeaderDetails />}

            {/* Profile Header */}
            {/* {showProfileHeaderRoutes.includes(location.pathname) && <ProfileHeader />} */}

            {/* Content area + resizable section */}
            <div style={{ flex: 1, display: "flex" }}>
              <div
                style={{
                  flex: 1,
                  scrollbarWidth: "none",
                  overflow: "auto",
                  minWidth: 0, // Allow content to shrink
                }}
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

                    {/* Protected Routes with Authorization */}
                    <Route
                      path="Dummy"
                      element={
                        <ProtectedRoute>
                          <Dummy />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Details"
                      element={
                        <RoutePermissionWrapper path="/Details">
                          <ProtectedRoute>
                            <ProfileDetails />
                          </ProtectedRoute>
                        </RoutePermissionWrapper>
                      }
                    />

                    <Route
                      path="Summary"
                      element={
                        <RoutePermissionWrapper path="/Summary">
                          <ProtectedRoute>
                            <ProfileSummary />
                          </ProtectedRoute>
                        </RoutePermissionWrapper>
                      }
                    />

                    <Route
                      path="CasesDetails"
                      element={
                        <ProtectedRoute>
                          <CasesDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="CasesById"
                      element={
                        <ProtectedRoute>
                          <CasesById />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="CasesSummary"
                      element={
                        <ProtectedRoute>
                          <CasesSummary />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="ClaimSummary"
                      element={
                        <ProtectedRoute>
                          <ClaimSummary />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="ClaimsDetails"
                      element={
                        <ProtectedRoute>
                          <ClaimsDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Configuratin"
                      element={
                        <ProtectedRoute>
                          <Configuratin />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Filters"
                      element={
                        <ProtectedRoute>
                          <Filter />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="ClaimsById"
                      element={
                        <ProtectedRoute>
                          <ClaimsById />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="AddNewProfile"
                      element={
                        <ProtectedRoute>
                          <AddNewProfile />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Transfers"
                      element={
                        <ProtectedRoute>
                          <TransferSummary />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="AddClaims"
                      element={
                        <ProtectedRoute>
                          <AddClaims />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="CorrespondencesSummary"
                      element={
                        <ProtectedRoute>
                          <CorrespondencesSummary />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="LandingPage"
                      element={
                        <ProtectedRoute>
                          <LandingPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Reports"
                      element={
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="CorspndncDetail"
                      element={
                        <ProtectedRoute>
                          <CorspndncDetail />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="RosterSummary"
                      element={
                        <ProtectedRoute>
                          <RusterSummary />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Doucmnets"
                      element={
                        <ProtectedRoute>
                          <Doucmnets />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Roster"
                      element={
                        <ProtectedRoute>
                          <RosterDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Applications"
                      element={
                        <ProtectedRoute>
                          <MembershipApplication />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="AproveMembersip"
                      element={
                        <ProtectedRoute>
                          <ApproveMembership />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="ChangCateSumm"
                      element={
                        <ProtectedRoute>
                          <ChangCateSumm />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="ChangeCatById"
                      element={
                        <ProtectedRoute>
                          <CateById />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="RemindersSummary"
                      element={
                        <ProtectedRoute>
                          <RemindersSummary />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Cancallation"
                      element={
                        <ProtectedRoute>
                          <Cancallation />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Batches"
                      element={
                        <ProtectedRoute>
                          <Batches />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Import"
                      element={
                        <ProtectedRoute>
                          <Import />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="BatchMemberSummary"
                      element={
                        <ProtectedRoute>
                          <BatchMemberSummary />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="NotDesignedYet"
                      element={
                        <ProtectedRoute>
                          <NotDesignedYet />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Email"
                      element={
                        <ProtectedRoute>
                          <Email />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Sms"
                      element={
                        <ProtectedRoute>
                          <Sms />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Notes"
                      element={
                        <ProtectedRoute>
                          <Notes />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="CornMarket"
                      element={
                        <ProtectedRoute>
                          <CornGrideSummary />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Popout"
                      element={
                        <ProtectedRoute>
                          <Popout />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="members"
                      element={
                        <ProtectedRoute>
                          <Members />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="RemindersDetails"
                      element={
                        <ProtectedRoute>
                          <RemindersDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="CancellationDetail"
                      element={
                        <ProtectedRoute>
                          <CancellationDetail />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="MembershipDashboard"
                      element={
                        <RoutePermissionWrapper path="/MembershipDashboard">
                          <ProtectedRoute>
                            <MembershipDashboard />
                          </ProtectedRoute>
                        </RoutePermissionWrapper>
                      }
                    />

                    <Route
                      path="TenantManagement"
                      element={
                        <ProtectedRoute>
                          <TenantManagement />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="RoleManagement"
                      element={
                        <ProtectedRoute>
                          <RoleManagement />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="UserManagement"
                      element={
                        <RoutePermissionWrapper path="/UserManagement">
                          <ProtectedRoute>
                            <UserManagement />
                          </ProtectedRoute>
                        </RoutePermissionWrapper>
                      }
                    />

                    <Route
                      path="PermissionManagement"
                      element={
                        <ProtectedRoute>
                          <PermissionManagement />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="ProductTypesManagement"
                      element={
                        <ProtectedRoute>
                          <ProductTypesManagement />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="ProductManagementDemo"
                      element={
                        <ProtectedRoute>
                          <ProductManagementDemo />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="CancelledMembersReport"
                      element={
                        <ProtectedRoute>
                          <CancelledMembersReport />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="ReportViewerDemo"
                      element={
                        <ProtectedRoute>
                          <ReportViewerDemo />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="AuthorizationExample"
                      element={
                        <ProtectedRoute>
                          <AuthorizationExample />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="DynamicPermissionsExample"
                      element={
                        <ProtectedRoute>
                          <DynamicPermissionsExample />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="DynamicRoutePermissionsExample"
                      element={
                        <ProtectedRoute>
                          <DynamicRoutePermissionsExample />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="PolicyClientExample"
                      element={
                        <ProtectedRoute>
                          <PolicyClientExample />
                        </ProtectedRoute>
                      }
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
    </AuthorizationProvider>
  );
}

export default Entry;
