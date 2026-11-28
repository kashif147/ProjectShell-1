import { UserProfilePopover, Popover, Avatar } from 'projectshell-crm';

export const SignedOutContent = () => (
  <div style={{ width: 320 }}>
    <UserProfilePopover onLogout={() => {}} onClose={() => {}} />
  </div>
);

export const OpenFromHeaderAvatar = () => (
  <div style={{ height: 460, display: 'flex', justifyContent: 'flex-end', padding: 16 }}>
    <Popover
      content={<UserProfilePopover onLogout={() => {}} onClose={() => {}} />}
      trigger="click"
      open
      placement="bottomRight"
      styles={{ body: { padding: 0 } }}
    >
      <Avatar style={{ backgroundColor: '#1e3a5f', cursor: 'pointer' }}>U</Avatar>
    </Popover>
  </div>
);
