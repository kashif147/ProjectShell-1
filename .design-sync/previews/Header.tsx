import { Header } from 'projectshell-crm';

// The CRM's top navigation bar (app launcher, member search, notifications, profile, logout).
// Signed out here: no tenant logo/title, notification badge 0, launcher tiles hidden by permissions.
// .app-top-nav is `width: 100vw` (flush to the window, as in the app), so the wrapper cancels the
// card's 24px padding to put it at the window edge.
export const TopNav = () => (
  <div style={{ margin: '-24px 0 0 -24px' }}>
    <Header />
  </div>
);
