import { ResizableComp } from 'projectshell-crm';

// The "Events History" side tab shown at the right edge of member screens
// (Entry.js). Clicking it opens an empty MyDrawer; no props.
export const EventsHistoryTab = () => (
  <div style={{ height: 320, display: 'flex', justifyContent: 'flex-end' }}>
    <ResizableComp />
  </div>
);
