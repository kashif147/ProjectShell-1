import { ExportCSV } from 'projectshell-crm';

const members = [
  { 'Membership No': 'GRA-104233', Name: 'Siobhán Murphy', Category: 'General', Station: 'Pearse Street' },
  { 'Membership No': 'GRA-104871', Name: 'Ciarán O’Brien', Category: 'Probationer', Station: 'Anglesea Street' },
];

// In the app this sits as an item in SimpleMenu's grid actions dropdown; the white panel
// here stands in for that antd dropdown (a bare antd <Menu> picks up the CRM's sidebar gradient).
export const InActionsMenu = () => (
  <div style={{ width: 220 }}>
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12)', padding: 4 }}>
      <div style={{ padding: '5px 12px' }}>View</div>
      <div style={{ padding: '5px 12px' }}><ExportCSV data={members} filename="Members-data.csv" metadata={['Members report', 'Filters: Status = Active']} /></div>
      <div style={{ padding: '5px 12px' }}>Print Label</div>
    </div>
  </div>
);

export const Standalone = () => (
  <ExportCSV data={members} filename="Members-data.csv" />
);
