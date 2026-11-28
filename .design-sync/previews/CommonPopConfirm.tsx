import { useEffect, useRef } from 'react';
import { CommonPopConfirm, Button, MinusCircleOutlined, DeleteOutlined } from 'projectshell-crm';

// Clicks the trigger once on mount so the card shows the confirmation open.
const OpenOnMount = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => (ref.current?.querySelector('button') as HTMLElement | null)?.click(), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ width: 460, height: 210, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 8 }}>
      {children}
    </div>
  );
};

export const MoveToExceptions = () => (
  <OpenOnMount>
    <CommonPopConfirm
      title="Move selected member(s) from Batch Payments to Exceptions?"
      description="They will be removed from the payment file list and appear under the Exceptions tab."
      okText="Move to exceptions"
      onConfirm={() => {}}
    >
      <Button danger icon={<MinusCircleOutlined />}>Move to Exceptions</Button>
    </CommonPopConfirm>
  </OpenOnMount>
);

export const DefaultTitle = () => (
  <OpenOnMount>
    <CommonPopConfirm onConfirm={() => {}}>
      <Button icon={<DeleteOutlined />}>Delete batch GRA-B-2025-11</Button>
    </CommonPopConfirm>
  </OpenOnMount>
);

export const Closed = () => (
  <CommonPopConfirm title="Are you sure you want to reject?" onConfirm={() => {}}>
    <Button className="butn secoundry-btn">Reject application</Button>
  </CommonPopConfirm>
);
