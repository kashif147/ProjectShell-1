import { useEffect, useRef } from 'react';
import { DateRang } from 'projectshell-crm';

// The app renders these chips inside Toolbar's `.toolbar-filter-row` filter bar; the popover
// (Within the last / More than / Between) opens on click and has no `open` prop.
const Bar = ({ children }) => (
  <div className="d-flex align-items-center flex-wrap toolbar-filter-row" style={{ gap: 8 }}>
    {children}
  </div>
);

export const Empty = () => (
  <Bar>
    <DateRang label="Join Date" selectedValues={[]} operator="between" onApply={() => {}} />
  </Bar>
);

export const BetweenApplied = () => (
  <Bar>
    <DateRang label="Payment Date" selectedValues={['2026-01-01 00:00:00', '2026-03-31 23:59:59']} operator="between" onApply={() => {}} />
  </Bar>
);

export const WithinApplied = () => (
  <Bar>
    <DateRang label="Last Updated" selectedValues={[30, 'days']} operator="within" onApply={() => {}} />
  </Bar>
);

export const InFilterBar = () => (
  <Bar>
    <DateRang label="Join Date" selectedValues={[]} onApply={() => {}} />
    <DateRang label="Renewal Date" selectedValues={['2026-01-01 00:00:00', '2026-12-31 23:59:59']} onApply={() => {}} />
    <DateRang label="Cancellation Date" selectedValues={[6, 'months']} operator="more_than" onApply={() => {}} />
  </Bar>
);

// Clicks the real trigger after mount so the component's own date panel is shown
// (Between mode with the applied range pre-filled).
export const Open = () => {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.querySelector('.filter-button1')?.click(), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ height: 380 }}>
      <Bar>
        <DateRang label="Payment Date" selectedValues={['2026-01-01 09:00:00', '2026-03-31 17:30:00']} operator="between" onApply={() => {}} />
      </Bar>
    </div>
  );
};
