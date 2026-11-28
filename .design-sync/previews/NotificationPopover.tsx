import { NotificationPopover } from 'projectshell-crm';

// The header bell's popover body (Header.jsx). Notifications come from the
// signed-out NotificationProvider, so the list is empty. The wrapper mimics the
// antd Popover surface it sits in; rendering a real open Popover in the card
// mis-positioned it away from the bell.
export const Empty = () => (
  <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12)', width: 400 }}>
    <NotificationPopover isOpen={false} onNavigateToAll={() => {}} onClose={() => {}} />
  </div>
);

