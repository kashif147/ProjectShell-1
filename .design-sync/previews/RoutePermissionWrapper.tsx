import { RoutePermissionWrapper, Card, Tag, Typography } from 'projectshell-crm';

// RoutePermissionWrapper clones its single child and injects
// `routePermissions = { permissions: string[]; roles: string[] }` for the given
// path (Entry.js wraps /Details, /Summary, /MembershipDashboard, /UserManagement).
// Signed out, no route config is loaded, so both lists resolve empty.
type RoutePerms = { permissions: string[]; roles: string[] };

const Screen = ({ title, routePermissions }: { title: string; routePermissions?: RoutePerms }) => {
  const perms = routePermissions?.permissions ?? [];
  const roles = routePermissions?.roles ?? [];
  return (
    <Card title={title} size="small" style={{ width: 420 }}>
      <Typography.Text type="secondary">Permissions required by this route</Typography.Text>
      <div style={{ margin: '6px 0 10px' }}>
        {perms.length ? perms.map((p) => <Tag key={p} color="blue">{p}</Tag>) : <Tag>None required</Tag>}
      </div>
      <Typography.Text type="secondary">Roles required by this route</Typography.Text>
      <div style={{ marginTop: 6 }}>
        {roles.length ? roles.map((r) => <Tag key={r} color="geekblue">{r}</Tag>) : <Tag>None required</Tag>}
      </div>
    </Card>
  );
};

export const DetailsRoute = () => (
  <RoutePermissionWrapper path="/Details">
    <Screen title="Member Details — GRA-104233" />
  </RoutePermissionWrapper>
);

export const UserManagementRoute = () => (
  <RoutePermissionWrapper path="/UserManagement">
    <Screen title="User Management" />
  </RoutePermissionWrapper>
);
