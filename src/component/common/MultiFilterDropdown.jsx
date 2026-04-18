import { useState, useRef, useEffect } from "react";
import { Dropdown, Checkbox, Badge, Space, Select, Divider, Button, Alert } from "antd";
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
  const [tempSelectedValues, setTempSelectedValues] = useState(selectedValues);
  const hoverTimer = useRef(null);

  // Sync tempSelectedValues when prop selectedValues changes (e.g. on load or reset)
  useEffect(() => {
    setTempSelectedValues(selectedValues);
  }, [selectedValues]);

  // Also reset tempSelectedValues when the dropdown is CLOSED without applying
  useEffect(() => {
    if (!open) {
      setTempSelectedValues(selectedValues);
    }
  }, [open, selectedValues]);

  // Check if this is a warning/empty state
  const isEmptyWarning = options[0] && options[0].startsWith("⚠️");
  const warningMessage = isEmptyWarning ? options[0] : "";

  // Check if it's loading
  const isLoading = options.length === 1 && options[0] === "Loading...";

  // Check if there are no REAL options (just empty string or loading)
  // We have options if: array length > 1 OR (length = 1 and not empty string/loading/warning)
  const hasRealOptions = options.length > 1 ||
    (options.length === 1 && options[0] !== "" && options[0] !== "Loading..." && !options[0].startsWith("⚠️"));

  const handleCheckboxChange = (value) => {
    // Ensure we are working with an array
    const currentSelected = Array.isArray(tempSelectedValues) ? tempSelectedValues : [];

    // Case-insensitive comparison
    const stringValue = String(value).toLowerCase();
    const exists = currentSelected.some(v => String(v).toLowerCase() === stringValue);

    const newSelectedValues = exists
      ? currentSelected.filter((v) => String(v).toLowerCase() !== stringValue)
      : [...currentSelected, value];

    setTempSelectedValues(newSelectedValues);

    // Immediate Apply: Notify parent of the change right away
    onApply?.({ label, operator: propOperator, selectedValues: newSelectedValues });
  };

  const handleReset = () => {
    onApply?.({ label, operator: "==", selectedValues: [] });
    setTempSelectedValues([]);
  };

  const handleOperatorChange = (value) => {
    onApply?.({ label, operator: value, selectedValues: tempSelectedValues });
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

  const badgeCount = Array.isArray(tempSelectedValues) ? tempSelectedValues.length : 0;

  const isGeoFilter =
    label === "Region" || label === "Branch" || label === "Work Location";

  // Warning/Empty Menu Content
  const getMenuContent = () => {
    if (isEmptyWarning) {
      return (
        <div
          className="filter-dropdown-menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ minWidth: "250px", padding: "12px" }}
        >
          <Alert
            message={isGeoFilter ? "No matching options" : "No Data Available"}
            description={
              <div style={{ marginTop: "8px" }}>
                <div style={{ marginBottom: "8px" }}>
                  {warningMessage.replace("⚠️ ", "")}
                </div>
                <div style={{ fontSize: "12px", color: "#8c8c8c", fontStyle: "italic" }}>
                  {isGeoFilter
                    ? "Try adjusting or clearing other Region, Branch, or Work Location filters."
                    : "No data available for the selected criteria."}
                </div>
              </div>
            }
            type="info"
            showIcon
            style={{ border: "1px solid #91d5ff", backgroundColor: "#e6f7ff" }}
          />
        </div>
      );
    }

    if (isLoading) {
      return (
        <div
          className="filter-dropdown-menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ minWidth: "250px", padding: "12px" }}
        >
          <Alert
            message="Loading..."
            description="Please wait while we fetch the data."
            type="info"
            showIcon
            style={{ border: "1px solid #91d5ff", backgroundColor: "#e6f7ff" }}
          />
        </div>
      );
    }

    // Check for empty options (no data from API)
    // This happens when options = [""] and it's Region or Branch filter
    const isEmptyApiResponse = isGeoFilter && options.length === 1 && options[0] === "";

    if (isEmptyApiResponse) {
      return (
        <div
          className="filter-dropdown-menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ minWidth: "250px", padding: "12px" }}
        >
          <Alert
            message="No Data Found"
            description={
              <div style={{ marginTop: "8px" }}>
                <div style={{ marginBottom: "8px" }}>
                  No options returned for {label} with the current filter combination.
                </div>
                <div style={{ fontSize: "12px", color: "#8c8c8c", fontStyle: "italic" }}>
                  Try adjusting Region, Branch, or Work Location selections.
                </div>
              </div>
            }
            type="warning"
            showIcon
            style={{ border: "1px solid #ffe58f", backgroundColor: "#fffbe6" }}
          />
        </div>
      );
    }

    // Normal Filter Menu Content - show checkboxes when we have real options
    return (
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
          {options.filter(opt => opt && String(opt).trim() !== "").map((option) => {
            const stringOption = String(option);
            const isChecked = Array.isArray(tempSelectedValues) &&
              tempSelectedValues.some(v => String(v).toLowerCase() === stringOption.toLowerCase());

            return (
              <Checkbox
                key={stringOption}
                checked={isChecked}
                onChange={() => handleCheckboxChange(option)}
              >
                {option}
              </Checkbox>
            );
          })}
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3 mb-1">
          <Button size="small" onClick={handleReset} style={{ width: "100%" }}>
            Reset Filters
          </Button>
        </div>
      </div>
    );
  };

  const renderButtonContent = () => {
    // For empty/warning/loading states, show normal button but with disabled styling
    const isDisabledState =
      isEmptyWarning ||
      isLoading ||
      (isGeoFilter && options.length === 1 && options[0] === "");

    return (
      <div
        className={`filter-button1 ${badgeCount > 0 ? "active" : ""} ${isDisabledState ? "disabled-state" : ""}`}
        style={isDisabledState ? {
          opacity: 0.7,
          backgroundColor: badgeCount > 0 ? "rgba(9, 30, 66, 0.08)" : "rgba(9, 30, 66, 0.04)",
          cursor: "pointer"
        } : {}}
      >
        <Space size={6} className="filter-button1__inner">
          <span className="filter-label">{label}</span>
          {badgeCount > 0 && (
            <Badge count={badgeCount} className="red-badge" />
          )}
          <DownOutlined className="dropdown-icon" />
        </Space>
      </div>
    );
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Dropdown
        overlay={getMenuContent()}
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
    padding: 6px 14px 6px 10px !important;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    background-color: rgba(9, 30, 66, 0.04);
    font-size: 14px !important;
    font-weight: 600 !important;
    box-shadow: none !important;
    margin-left: 4px;
    overflow: visible;
    flex-shrink: 0;
    min-height: 30px;
    max-width: 100%;
  }

  .filter-button1__inner.ant-space {
    overflow: visible;
  }

  .filter-button1 .ant-space-item {
    overflow: visible;
  }

  .filter-button1.active {
    background-color: rgba(9, 30, 66, 0.08);
  }

  .filter-button1.disabled-state {
    opacity: 0.7;
    cursor: pointer !important;
  }

  .filter-label {
    font-weight: 500;
    color: #000000e0;
    white-space: nowrap;
    padding-right: 2px;
  }

  .filter-button1.disabled-state .filter-label {
    color: #595959;
  }

  .filter-button1 .red-badge.ant-badge {
    overflow: visible;
    font-size: 12px;
  }

  .red-badge .ant-badge-count,
  .filter-button1 .red-badge .ant-badge-count {
    background-color: #ff4d4f !important;
    color: #fff !important;
    box-shadow: none !important;
    min-width: 20px;
    height: 20px;
    line-height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
  }

  .dropdown-icon {
    font-size: 10px;
    color: #215E97;
  }

  .filter-button1.disabled-state .dropdown-icon {
    color: #8c8c8c;
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

  .ant-alert {
    border-radius: 4px;
    margin: 0;
  }
`;
document.head.appendChild(style);