import { NumberFilter, Space } from 'projectshell-crm';

// Toolbar.jsx renders one NumberFilter chip per numeric grid column.
export const NoFilter = () => <NumberFilter label="Balance" selectedValues={[]} operator="==" />;

export const GreaterThan = () => <NumberFilter label="Arrears" selectedValues={[50]} operator=">" />;

export const BetweenRange = () => <NumberFilter label="Subscription Fee" selectedValues={[150, 300]} operator="between" />;

export const ToolbarRow = () => (
  <Space size={8} wrap>
    <NumberFilter label="Balance" selectedValues={[]} />
    <NumberFilter label="Arrears" selectedValues={[0]} operator=">" />
    <NumberFilter label="Last Payment" selectedValues={[]} />
  </Space>
);
