import { useState, useRef } from 'react';
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
  const hoverTimer = useRef(null);

  const handleReset = () => {
    onChange([]);
    onOperatorChange('==');
  };

  const handleApply = () => {
    setOpen(false);
    if (onApply) onApply();
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

  // 🧠 Keep menu open while hovering inside
  const handleMouseEnter = () => {
    clearTimeout(hoverTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimer.current = setTimeout(() => {
      setOpen(false);
    }, 200); // slight delay for smoother transition
  };

  const menu = (
    <div
      className="filter-dropdown-menu"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
        {badgeCount > 1 && <Badge count={badgeCount} className="red-badge" />}
        <DownOutlined className="dropdown-icon" />
      </Space>
    </div>
  );

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Dropdown
        overlay={menu}
        open={open}
        placement="bottomLeft"
        trigger={['hover']}
      >
        <div>{renderButtonContent()}</div>
      </Dropdown>
    </div>
  );
};

export default MultiFilterDropdown;

// 🔽 Optional inline CSS
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
    margin-left:4px;
  }

  .filter-button1.active {
    background-color: rgba(9, 30, 66, 0.08);
  }

  .filter-label {
    font-weight: 500;
    color: #000000e0;
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
