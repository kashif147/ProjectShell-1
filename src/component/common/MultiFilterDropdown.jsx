import { useState } from 'react';
import { Dropdown, Checkbox, Badge, Space, Select, Divider, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Option } = Select;

const operators = [
  { symbol: '==', label: '= (equal)' },
  { symbol: '!=', label: '!= (Not equal)' }
];

const MultiFilterDropdown = ({
  label,
  options = [],
  selectedValues = [],
  onChange,
  operator = '==',
  onOperatorChange,
  onApply
}) => {
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    onChange([]);
    onOperatorChange('==');
  };

  const handleApply = () => {
    setOpen(false);
    if (onApply) onApply(); // ✅ Only trigger on Apply
  };

  const handleCheckboxChange = (checkedValue) => {
    if (selectedValues.includes(checkedValue)) {
      onChange(selectedValues.filter((val) => val !== checkedValue));
    } else {
      onChange([...selectedValues, checkedValue]);
    }
  };

  const handleOperatorChange = (value) => {
    onOperatorChange(value);
  };

  const badgeCount = selectedValues.length;
  const firstValue = selectedValues[0];
  const operatorLabel = operators.find(op => op.symbol === operator)?.label;

  const menu = (
    <div className="filter-dropdown-menu">
      <div className="operator-container">
        <Select
          value={operator}
          onChange={handleOperatorChange}
          size="small"
          style={{ width: "100%", backgroundColor: '#fff', border: 'none' }}
        >
          {operators.map((op) => (
            <Option key={op.symbol} value={op.symbol}>{op.label}</Option>
          ))}
        </Select>
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div className="checkbox-list">
        {options.map((option) => (
          <Checkbox
            key={option}
            checked={selectedValues.includes(option)}
            onChange={() => handleCheckboxChange(option)}
          >
            {option}
          </Checkbox>
        ))}
      </div>

      <div className="dropdown-action-buttons mt-3 mb-3 d-flex justify-content-end gap-2">
        <Button size="small" className="butn secoundry-btn" onClick={handleReset}>
          Reset
        </Button>
        <Button type="primary" className="butn primary-btn me-4" size="small" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  );

  const renderButtonContent = () => (
    <div className={`filter-button1 ${badgeCount > 0 ? 'active' : ''}`}>
      <Space size={4}>
        <span className="filter-label">{label}</span>
        {badgeCount > 0 && (
          <span className="operator-value-container">
            <span className="operator-display">{operatorLabel}</span>
            <span className="selected-value">{firstValue}</span>
          </span>
        )}
        {badgeCount > 1 && <Badge count={badgeCount} className="red-badge" />}
        <DownOutlined className="dropdown-icon" />
      </Space>
    </div>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} open={open} onOpenChange={setOpen} placement="bottomLeft">
      <div>{renderButtonContent()}</div>
    </Dropdown>
  );
};

export default MultiFilterDropdown;

// 🔽 Optional: Style injection (or move to a CSS file)
const style = document.createElement('style');
style.innerHTML = `
  .filter-button1 {
    border: none;
    border-radius: 3px;
    padding: 5px 9px !important;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    background-color: rgba(9, 30, 66, 0.04);
    font-size: 14px !important;
    font-weight: 600 !important;
    box-shadow: none !important;
    margin-left:4px
  }

  .filter-button1.active {
    background-color: rgba(9, 30, 66, 0.08);
  }

  .filter-label {
    font-weight: 500;
    color: #000000e0;
  }

  .operator-value-container {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 6px;
  }

  .operator-display {
    font-weight: 600;
    color: #215E97;
    padding: 1px;
    font-size: 14px !important;
    background-color: #fff;
  }

  .selected-value {
    font-weight: 600;
    color: #215E97;
    font-size: 14px !important;
    // padding: px;
  }

  .red-badge .ant-badge-count {
    background-color: #ff4d4f;
    color: #fff;
    box-shadow: none;
  }

  .dropdown-icon {
    font-size: 10px;
    color: #215E97;
  }

  .filter-dropdown-menu {
    padding: 10px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 250px;
  }

  .operator-container {
    margin-bottom: 10px;
  }

  .checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 10px;
  }
`;
document.head.appendChild(style);
