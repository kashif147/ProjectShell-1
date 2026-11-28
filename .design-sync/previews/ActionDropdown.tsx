import { useEffect, useRef } from 'react';
import { ActionDropdown } from 'projectshell-crm';

const memberActions = [
  { label: 'Change Category', onClick: () => {} },
  { label: 'Transfer Request', onClick: () => {} },
  { label: 'Log Issue', onClick: () => {} },
  { label: 'Cancel Membership', onClick: () => {} },
];

// Clicks the trigger once on mount so the card shows the menu the way a user sees it.
const OpenOnMount = ({ children, height = 200 }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.querySelector('button')?.click(), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ height, width: 260, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
      {children}
    </div>
  );
};

export const Closed = () => (
  <div style={{ width: 260, display: 'flex', justifyContent: 'flex-end' }}>
    <ActionDropdown items={memberActions} />
  </div>
);

export const Open = () => (
  <OpenOnMount>
    <ActionDropdown items={memberActions} />
  </OpenOnMount>
);

export const BatchActions = () => (
  <OpenOnMount height={150}>
    <ActionDropdown
      items={[
        { label: 'Export batch GRA-B-2025-11 to Excel', onClick: () => {} },
        { label: 'Print batch summary', onClick: () => {} },
      ]}
    />
  </OpenOnMount>
);
