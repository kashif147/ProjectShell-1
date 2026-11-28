import { ProfileHeader } from 'projectshell-crm';

// Member profile header (AppTabs.jsx). Member data comes from Redux
// (profileDetails / subscription), which a signed-out preview cannot load,
// so the fields render empty; layout and deceased are the prop axes.
// showButtons is omitted: its actions depend on a loaded subscription status,
// so signed out it renders identically to SideLayout.
export const SideLayout = () => (
  <div style={{ width: 320, height: 640 }}>
    <ProfileHeader layout="side" onLayoutChange={() => {}} />
  </div>
);

export const TopLayout = () => (
  <div style={{ width: '100%' }}>
    <ProfileHeader layout="top" onLayoutChange={() => {}} />
  </div>
);


export const Deceased = () => (
  <div style={{ width: 320, height: 640 }}>
    <ProfileHeader layout="side" isDeceased onLayoutChange={() => {}} />
  </div>
);
