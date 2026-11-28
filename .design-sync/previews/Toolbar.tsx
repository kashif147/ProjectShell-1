import { Toolbar } from 'projectshell-crm';

// Toolbar has no props: it reads route, filter context and saved views. At "/" with no
// template loaded it renders the search box plus More / Reset / Filter.
export const DefaultGridToolbar = () => (
  <div style={{ width: '100%' }}>
    <Toolbar />
  </div>
);
