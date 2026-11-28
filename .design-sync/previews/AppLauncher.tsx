import { AppLauncher } from 'projectshell-crm';

// The trigger icon is white: it lives in the CRM's brand-coloured top bar.
export const InHeaderBar = () => (
  <div className="app-top-nav" style={{ background: 'var(--app-brand-primary, #215e97)', padding: '4px 12px', width: 360, display: 'flex', alignItems: 'center', gap: 12 }}>
    <AppLauncher />
    <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Membership CRM</span>
  </div>
);
