import { AppTabs } from 'projectshell-crm';

// Member profile workspace (profile header + Membership/Finance/... tabs). Profile and
// subscription data load from profile-service / subscription-service via Redux thunks, so
// outside the app the header and tabs render without a loaded member.
const Frame = ({ children }) => (
  <div style={{ height: 720, width: '100%', display: 'flex', flexDirection: 'column' }}>{children}</div>
);

export const NoMemberLoaded = () => (
  <Frame>
    <AppTabs />
  </Frame>
);
