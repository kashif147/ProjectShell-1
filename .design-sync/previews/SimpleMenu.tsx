import { SimpleMenu, MoreOutlined } from 'projectshell-crm';

export const ExportButton = () => (
  <SimpleMenu
    title="Export"
    triggerClassName="me-1 gray-btn butn"
    data={{ 'Export PDF': true, 'Export CSV': true }}
    isCheckBox={false}
    actions={() => {}}
  />
);

export const MoreFiltersButton = () => <SimpleMenu title="More" triggerClassName="gray-btn butn" />;

export const RowActionsTrigger = () => (
  <SimpleMenu
    title={<MoreOutlined style={{ fontSize: 15 }} />}
    data={{ Delete: 'false', Attached: 'false', View: 'false', 'Print Label': 'false', 'Transfer Requests': false, 'Career Break': false, 'Category Changes': false }}
    isCheckBox={false}
    actions={() => {}}
    record={{ _id: '6721f0c4a9e1b2d3c4f50a17', membershipNo: 'GRA-104233' }}
    index={0}
  />
);
