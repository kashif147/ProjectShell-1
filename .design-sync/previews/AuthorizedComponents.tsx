import { AuthorizedComponents as AuthorizedButton, PlusOutlined, DeleteOutlined } from 'projectshell-crm';

// The bundle's AuthorizedComponents export is the file's default: AuthorizedButton.
// The preview runs signed out, so any permission/role requirement is unmet.

export const Ungated = () => (
  <AuthorizedButton type="primary" icon={<PlusOutlined />} onClick={() => {}}>
    Add member
  </AuthorizedButton>
);

export const PermissionDenied = () => (
  <AuthorizedButton permission="payments:write" onClick={() => {}}>
    Create batch payment
  </AuthorizedButton>
);

export const RoleDenied = () => (
  <AuthorizedButton roles={['ASU']} tooltip="Only a tenant administrator can run Year-End Renewal" onClick={() => {}}>
    Run Year-End Renewal
  </AuthorizedButton>
);

export const Danger = () => (
  <AuthorizedButton danger icon={<DeleteOutlined />} onClick={() => {}}>
    Remove from batch
  </AuthorizedButton>
);

export const Disabled = () => (
  <AuthorizedButton disabled onClick={() => {}}>
    Export members
  </AuthorizedButton>
);
