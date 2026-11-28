import { CRMRoute, SaveViewMenu } from 'projectshell-crm';

// SaveViewMenu only renders on grid-template screens (src/utils/gridTemplateRoutes.js);
// HeaderDetails places it above the grid as <SaveViewMenu className="ms-3" />.
export const MembersGrid = () => (
  <CRMRoute path="/Members">
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8 }}>
      <SaveViewMenu className="ms-3" />
    </div>
  </CRMRoute>
);

export const ApplicationsGrid = () => (
  <CRMRoute path="/Applications">
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8 }}>
      <SaveViewMenu className="ms-3" />
    </div>
  </CRMRoute>
);
