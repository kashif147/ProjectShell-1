import { HeaderDetails, CRMRoute } from 'projectshell-crm';

// The page header above every grid (breadcrumb, title, Save View toolbar, actions). It reads
// the current route, so each cell sets it with CRMRoute (members grid at "/Members").
export const MembersGridHeader = () => (
  <CRMRoute path="/Members">
    <div style={{ width: '100%' }}>
      <HeaderDetails />
    </div>
  </CRMRoute>
);

export const WithoutBreadcrumb = () => (
  <CRMRoute path="/Members">
    <div style={{ width: '100%' }}>
      <HeaderDetails hideBreadcrumb />
    </div>
  </CRMRoute>
);
