import { PopOut } from 'projectshell-crm';

// Lookup management grid (Entry.js routes /worklocation, /region, /branch to it).
// No props: the type comes from the URL (previews run at "/", so Work Location)
// and rows come from Redux lookups, which a signed-out preview cannot load.
export const WorkLocationManagement = () => (
  <div style={{ width: '100%' }}>
    <PopOut />
  </div>
);
