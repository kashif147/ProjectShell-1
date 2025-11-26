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
import OnlinePayment from "./pages/finance/OnlinePayment";
// import RemindersDetails from "./pages/reminders/RemindersDetails";

// Wrapper for lazy loading with retry logic
const lazyWithRetry = (componentImport) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // Check if it's a chunk loading error
      if (
        error?.name === "ChunkLoadError" ||
        error?.message?.includes("Loading chunk") ||
        error?.message?.includes("Failed to fetch dynamically imported module") ||
        error?.message?.includes("ChunkLoadError")
      ) {
        // Schedule reload and return a placeholder component
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return {
          default: () => (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <Spin size="large" tip="Reloading application..." />
            </div>
          ),
        };
      }
      throw error;
    }
  });
};

// Lazy loaded components with retry
const Dummy = lazyWithRetry(() => import("./component/common/Dummy"));
const Configuratin = lazyWithRetry(() => import("./pages/Configuratin"));
const ProfileDetails = lazyWithRetry(() => import("./pages/Profiles/ProfileDetails"));
const ProfileSummary = lazyWithRetry(() => import("./pages/Profiles/ProfileSummary"));
const CasesSummary = lazyWithRetry(() => import("./pages/Cases/CasesSummary"));
const CasesDetails = lazyWithRetry(() => import("./pages/Cases/CasesDetails"));
const ClaimSummary = lazyWithRetry(() => import("./pages/Claims/ClaimSummary"));
const ClaimsDetails = lazyWithRetry(() => import("./pages/Claims/ClaimsDetails"));
const ClaimsById = lazyWithRetry(() => import("./pages/Claims/ClaimsById"));
const CasesById = lazyWithRetry(() => import("./pages/Cases/CasesById"));
const Filter = lazyWithRetry(() => import("./pages/Filters/Filter"));
const TransferSummary = lazyWithRetry(() => import("./pages/Transfers/TransferSummary"));
const CorrespondencesSummary = lazyWithRetry(() =>
  import("./pages/Correspondences/CorrespondencesSummary")
);
const AddNewProfile = lazyWithRetry(() => import("./pages/Profiles/AddNewProfile"));
const AddClaims = lazyWithRetry(() => import("./pages/Claims/AddClaims"));
const Login = lazyWithRetry(() => import("./pages/auth/Login"));
const LandingPage = lazyWithRetry(() => import("./component/msft/LandingPage"));
const Reports = lazyWithRetry(() => import("./pages/repots/Reports"));
const TempletsSummary = lazyWithRetry(() => import("./pages/templete/TempletsSummary"));
const TempleteConfig = lazyWithRetry(() => import("./pages/templete/TemplateConfiguration"));
const CorspndncDetail = lazyWithRetry(() =>
  import("./pages/Correspondences/CorspndncDetail")
);

const Doucmnets = lazyWithRetry(() => import("./pages/Doucmnets"));
const RosterDetails = lazyWithRetry(() => import("./pages/roster/RosterDetails"));
const RusterSummary = lazyWithRetry(() => import("./pages/roster/RusterSummary"));
const MembershipApplication = lazyWithRetry(() =>
  import("./pages/application/MembershipApplication")
);
const ApplicationMgt = lazyWithRetry(() =>
  import("./component/applications/ApplicationMgtDrawer")
);
const ApproveMembership = lazyWithRetry(() =>
  import("./pages/application/ApproveMembership")
);
const ChangCateSumm = lazyWithRetry(() => import("./pages/Category/ChangCateSumm"));
const CateById = lazyWithRetry(() => import("./pages/Category/CateById"));
const RemindersSummary = lazyWithRetry(() =>
  import("./pages/reminders/RemindersSummary")
);
const Cancallation = lazyWithRetry(() => import("./pages/Cancallation"));
const CancellationDetail = lazyWithRetry(() =>
  import("./pages/cancellation/CancellationDetail")
);
const Batches = lazyWithRetry(() => import("./pages/finance/Batches"));
const Import = lazyWithRetry(() => import("./pages/finance/Import"));
const Cheque = lazyWithRetry(() => import("./pages/finance/Cheque"));
const StandingOrders = lazyWithRetry(() => import("./pages/finance/StandingOrders"));
const BatchMemberSummary = lazyWithRetry(() =>
  import("./pages/finance/BatchMemberSummary")
);
const Deductions = lazyWithRetry(() => import("./pages/finance/Deductions"));
const Reconciliation = lazyWithRetry(() => import("./pages/finance/Reconciliation"));
const NotDesignedYet = lazyWithRetry(() => import("./pages/NotDesign"));
const Sms = lazyWithRetry(() => import("./pages/Correspondences/sms"));
const Email = lazyWithRetry(() => import("./pages/Correspondences/Emails"));
const Notes = lazyWithRetry(() => import("./pages/Correspondences/Notes"));
const Popout = lazyWithRetry(() => import("../src/component/common/PopOut"));
const Members = lazyWithRetry(() => import("./pages/membership/Members"));
const RemindersDetails = lazyWithRetry(() =>
  import("./pages/reminders/RemindersDetails")
);
const MembershipDashboard = lazyWithRetry(() =>
  import("./pages/membership/MembershipDashboard")
);
const TenantManagement = lazyWithRetry(() =>
  import("./pages/tenant-management/TenantManagement")
);
const RoleManagement = lazyWithRetry(() =>
  import("./pages/role-management/RoleManagement")
);
const UserManagement = lazyWithRetry(() =>
  import("./pages/user-management/UserManagement")
);
const PermissionManagement = lazyWithRetry(() =>
  import("./pages/permission-management/PermissionManagement")
);
const CancelledMembersReport = lazyWithRetry(() =>
  import("./pages/reports/CancelledMembersReport")
);
const ReportViewerDemo = lazyWithRetry(() => import("./pages/ReportViewerDemo"));
const AuthorizationExample = lazyWithRetry(() => import("./pages/AuthorizationExample"));
const DynamicPermissionsExample = lazyWithRetry(() =>
  import("./pages/DynamicPermissionsExample")
);
const DynamicRoutePermissionsExample = lazyWithRetry(() =>
  import("./pages/DynamicRoutePermissionsExample")
);
const PolicyClientExample = lazyWithRetry(() => import("./pages/PolicyClientExample"));
const ProductTypesManagement = lazyWithRetry(() =>
  import("./pages/product-management/ProductTypesManagement")
);
const ProductManagementDemo = lazyWithRetry(() =>
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
                      path="templeteSummary"
                      element={
                        <ProtectedRoute>
                          <TempletsSummary />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="templeteConfig"
                      element={
                        <ProtectedRoute>
                          <TempleteConfig />
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
                      path="applicationMgt"
                      element={
                        <ProtectedRoute>
                          <ApplicationMgt />
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
                      path="Deductions"
                      element={
                        <ProtectedRoute>
                          <Deductions />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="StandingOrders"
                      element={
                        <ProtectedRoute>
                          <StandingOrders />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Cheque"
                      element={
                        <ProtectedRoute>
                          <Cheque />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="Reconciliation"
                      element={
                        <ProtectedRoute>
                          <Reconciliation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="onlinePayment"
                      element={
                        <ProtectedRoute>
                          <OnlinePayment />
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
