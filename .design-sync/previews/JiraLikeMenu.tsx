import { JiraLikeMenu } from 'projectshell-crm';

// Legacy lookup-filter chip. Its checkbox lookups come from TableColumnsContext.searchFilters
// keyed by router location.state.search, which is empty outside a grid page, so only the
// trigger button renders; the dropdown opens on click (no `open` prop).
const Row = ({ children }) => <div className="d-flex align-items-center" style={{ gap: 8 }}>{children}</div>;

export const FilterChip = () => (
  <Row>
    <JiraLikeMenu title="Station" data={{ 'Pearse Street': false, 'Anglesea Street': false }} />
  </Row>
);

export const Simple = () => (
  <Row>
    <JiraLikeMenu title="More" isSimple />
  </Row>
);

export const ChipRow = () => (
  <Row>
    <JiraLikeMenu title="Region" />
    <JiraLikeMenu title="Category" />
    <JiraLikeMenu title="Status" />
  </Row>
);
