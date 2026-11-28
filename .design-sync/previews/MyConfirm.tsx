import { useEffect } from 'react';
import { MyConfirm, Button } from 'projectshell-crm';

// MyConfirm is a function, not a component: MyConfirm({ title, message, onConfirm }) opens an antd
// confirm modal pinned near the bottom of the viewport. Each cell opens it on mount.
const Fire = ({ title, message }) => {
  useEffect(() => {
    const modal = MyConfirm({ title, message, onConfirm: () => {} });
    return () => modal?.destroy?.();
  }, []);
  return <Button onClick={() => MyConfirm({ title, message, onConfirm: () => {} })}>Open confirm</Button>;
};

export const DeactivateOffice = () => (
  <Fire title="Deactivate Office" message={'Deactivate "Pearse Street"? It will no longer appear in active lists.'} />
);

export const ConfigureSchedule = () => (
  <Fire title="Configure schedule?" message={'"Anglesea Street" was created with default hours. Set opening hours and closures now?'} />
);

export const Defaults = () => <Fire />;
