import { useEffect, useRef } from 'react';
import { Gridmenu, Table, ControlOutlined } from 'projectshell-crm';

// Column chooser: in the app TableComponent renders it as the first column's header with a
// sliders icon as `title`; the checkbox list opens on click (no `open` prop).
const columnsForFilter = [
  { title: 'Membership No', dataIndex: 'membershipNo', key: 'membershipNo', isGride: true, width: 140 },
  { title: 'Name', dataIndex: 'name', key: 'name', isGride: true, width: 200 },
  { title: 'Station', dataIndex: 'station', key: 'station', isGride: true, width: 160 },
  { title: 'Category', dataIndex: 'category', key: 'category', isGride: false, width: 160 },
];

const noop = () => {};

const menu = (
  <Gridmenu
    title={<ControlOutlined style={{ fontSize: 18, color: 'var(--app-table-header-text)' }} />}
    screenName="Members"
    columnsForFilter={columnsForFilter}
    setColumnsForFilter={noop}
    setColumnsDragbe={noop}
  />
);

const rows = [
  { key: '1', membershipNo: 'GRA-104233', name: 'Siobhán Murphy', station: 'Pearse Street' },
  { key: '2', membershipNo: 'GRA-104871', name: 'Ciarán O’Brien', station: 'Anglesea Street' },
  { key: '3', membershipNo: 'GRA-101560', name: 'Declan Byrne', station: 'Henry Street' },
];

export const InTableHeader = () => (
  <Table
    size="small"
    pagination={false}
    dataSource={rows}
    columns={[
      { title: menu, key: 'menu', width: 56, render: () => null },
      ...columnsForFilter.filter((c) => c.isGride).map(({ title, dataIndex, key, width }) => ({ title, dataIndex, key, width })),
    ]}
  />
);

export const IconTrigger = () => menu;

export const TextTrigger = () => (
  <Gridmenu
    title="Columns"
    screenName="Members"
    columnsForFilter={columnsForFilter}
    setColumnsForFilter={noop}
    setColumnsDragbe={noop}
  />
);

// Clicks the real trigger after mount so the column checklist (search, drag handles,
// visible-column checkboxes) is shown. "Update Template" stays hidden: it needs the ASU role.
export const Open = () => {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.querySelector('button')?.click(), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ height: 300, display: 'flex', justifyContent: 'flex-end', width: 260 }}>
      <div>
        <Gridmenu
          title="Columns"
          screenName="Members"
          columnsForFilter={columnsForFilter}
          setColumnsForFilter={noop}
          setColumnsDragbe={noop}
        />
      </div>
    </div>
  );
};
