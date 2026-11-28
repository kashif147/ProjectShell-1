import { useEffect, useRef } from 'react';
import { MyDrowpDown } from 'projectshell-crm';

const membershipItems = [
  { key: 'applications', label: 'Applications' },
  { key: 'members', label: 'Members' },
  { key: 'transfers', label: 'Transfer Requests' },
  { key: 'cancellations', label: 'Cancellations' },
];

export const NavRow = () => (
  <div style={{ display: 'flex', gap: 24 }}>
    <MyDrowpDown title="Membership" items={membershipItems} />
    <MyDrowpDown title="Finance" items={[{ key: 'batches', label: 'Batches' }, { key: 'refunds', label: 'Refunds' }]} />
    <MyDrowpDown title="Reports" items={[{ key: 'listing', label: 'Membership Listing' }, { key: 'stats', label: 'Statistics' }]} />
  </div>
);

// Hovers the real trigger after mount so the component's own menu is shown.
export const Open = () => {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const a = ref.current?.querySelector('a');
      a?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      a?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    }, 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ height: 200 }}>
      <MyDrowpDown title="Membership" items={membershipItems} />
    </div>
  );
};
