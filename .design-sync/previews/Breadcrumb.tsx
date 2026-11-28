import { Breadcrumb, CRMRoute } from 'projectshell-crm';

// Breadcrumb takes no props: it derives its trail from the current route
// (routeBreadcrumbMap in Breadcrumb.jsx), so each cell sets the route with CRMRoute.
const Frame = ({ path }) => (
  <CRMRoute path={path}>
    <div style={{ minHeight: 32, width: 640 }}>
      <Breadcrumb />
    </div>
  </CRMRoute>
);

export const Members = () => <Frame path="/Members" />;
export const CasesSummary = () => <Frame path="/CasesSummary" />;
export const DirectDebit = () => <Frame path="/DirectDebit" />;
export const UserManagement = () => <Frame path="/UserManagement" />;
