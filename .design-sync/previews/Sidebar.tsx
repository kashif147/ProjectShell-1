import { Sidebar } from 'projectshell-crm';

// Signed out: the permission filter leaves only items with no permission requirement.
export const SignedOutModuleNav = () => (
  <div style={{ height: 420, display: 'flex' }}>
    <Sidebar />
  </div>
);
