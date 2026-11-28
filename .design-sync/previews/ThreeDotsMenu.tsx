import { ThreeDotsMenu, Tabs, HistoryOutlined, TagsOutlined, AuditOutlined, CalendarOutlined, ProjectOutlined } from 'projectshell-crm';

const profileTabItems = [
  { key: '11', label: 'Audit History', icon: <HistoryOutlined />, iconColor: '#722ed1' },
  { key: '13', label: 'Category Changes', icon: <TagsOutlined />, iconColor: '#2f54eb' },
  { key: '7', label: 'Claims', icon: <AuditOutlined />, iconColor: '#fa541c' },
  { key: '16', label: 'Events', icon: <CalendarOutlined />, iconColor: '#13c2c2' },
  { key: '9', label: 'Projects', icon: <ProjectOutlined />, iconColor: 'var(--app-brand-accent)' },
];

// As used in the member record tab strip (AppTabs): the overflow tab holds the menu.
export const InMemberTabStrip = () => (
  <div style={{ width: 640 }}>
    <Tabs
      defaultActiveKey="1"
      items={[
        { key: '1', label: 'Personal Details' },
        { key: '2', label: 'Membership' },
        { key: '3', label: 'Finance' },
        { key: '4', label: 'Correspondence' },
        { key: 'menu', disabled: true, label: <div style={{ marginLeft: 8 }}><ThreeDotsMenu items={profileTabItems} /></div> },
      ]}
    />
  </div>
);

export const Standalone = () => (
  <div style={{ padding: 8 }}>
    <ThreeDotsMenu
      items={[
        { key: 'view', label: 'View member' },
        { key: 'transfer', label: 'Transfer station' },
        { key: 'resign', label: 'Record resignation' },
      ]}
      onSelect={() => {}}
    />
  </div>
);
