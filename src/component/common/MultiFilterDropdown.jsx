import { useState, useRef, useEffect } from "react";
import { Dropdown, Checkbox, Badge, Space, Select, Divider, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";

const { Option } = Select;

const operators = [
  { symbol: "==", label: "= (equal)" },
  { symbol: "!=", label: "!= (not equal)" },
];

const MultiFilterDropdown = ({
  label,
  options = [],
  selectedValues = [],
  operator: propOperator = "==",
  onApply,
}) => {
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef(null);

  // ✅ No need for local state - use props directly and apply changes immediately

  const handleCheckboxChange = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    
    // ✅ Call onApply immediately with new selection
    onApply?.({ label, operator: propOperator, selectedValues: newSelectedValues });
  };
  const handleReset = () => {
    // ✅ Apply empty selection immediately
    onApply?.({ label, operator: "==", selectedValues: [] });
  };

  const handleApply = () => {
    // ✅ Already applied immediately, just close dropdown
    setOpen(false);
  };

  const handleOperatorChange = (value) => {
    // ✅ Call onApply immediately with operator change
    onApply?.({ label, operator: value, selectedValues });
  };

  // 🧭 Hover behavior
  const handleMouseEnter = () => {
    clearTimeout(hoverTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimer.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const badgeCount = selectedValues.length;

  const menu = (
    <div
      className="filter-dropdown-menu"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Select
        value={propOperator}
        onChange={handleOperatorChange}
        size="small"
        style={{ width: "100%", marginBottom: 8 }}
      >
        {operators.map((op) => (
          <Option key={op.symbol} value={op.symbol}>
            {op.label}
          </Option>
        ))}
      </Select>

      <Divider style={{ margin: "8px 0" }} />

      <div className="checkbox-list">
        {options.map((option) => (
          <Checkbox
            key={option}
            checked={selectedValues.includes(option)} // ✅ Use prop directly
            onChange={() => handleCheckboxChange(option)}
          >
            {option}
          </Checkbox>
        ))}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3 mb-1">
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleApply}
        >
          Apply
        </Button>
      </div>
    </div>
  );

  const renderButtonContent = () => (
    <div className={`filter-button1 ${badgeCount > 0 ? "active" : ""}`}>
      <Space size={4}>
        <span className="filter-label">{label}</span>
        {badgeCount > 0 && (
          <Badge count={badgeCount} className="red-badge" />
        )}
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
        trigger={["hover"]}
      >
        <div>{renderButtonContent()}</div>
      </Dropdown>
    </div>
  );
};

export default MultiFilterDropdown;

// 💅 Inline styles for visual consistency
const style = document.createElement("style");
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
    margin-left: 4px;
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
    max-height: 300px;
    overflow-y: auto;
  }

  .checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`;
document.head.appendChild(style);