import React, { useEffect, useState } from "react";
import { Badge, Button, Dropdown, Input, Menu, Radio, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { STRING_FILTER_OPERATORS } from "../../utils/filterOperatorConstants";

const MODES = [
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does not contain" },
  { value: "starts_with", label: "Starts with" },
  { value: "ends_with", label: "Ends with" },
  { value: "==", label: "Equals" },
  { value: "!=", label: "Does not equal" },
];

function effectiveStringOperator(operator) {
  return STRING_FILTER_OPERATORS.has(String(operator))
    ? String(operator)
    : "contains";
}

function selectedValuesAreMeaningful(selectedValues) {
  if (!Array.isArray(selectedValues)) return false;
  return selectedValues.some((v) => String(v ?? "").trim() !== "");
}

function TextFilter({
  label,
  selectedValues = [],
  operator = "contains",
  onApply,
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("contains");
  const [textValue, setTextValue] = useState("");

  useEffect(() => {
    const effOp = effectiveStringOperator(operator);
    setMode(effOp);
    if (selectedValuesAreMeaningful(selectedValues)) {
      setTextValue(String(selectedValues[0] ?? ""));
    } else {
      setTextValue("");
    }
  }, [selectedValues, operator, open]);

  const handleApply = () => {
    const trimmed = String(textValue ?? "").trim();
    onApply?.({
      label,
      operator: mode,
      selectedValues: trimmed ? [trimmed] : [],
    });
    setOpen(false);
  };

  const handleReset = () => {
    setTextValue("");
    onApply?.({
      label,
      operator: "contains",
      selectedValues: [],
    });
    setOpen(false);
  };

  const menu = (
    <Menu
      className="filter-dropdown-menu"
      style={{ minWidth: "320px", padding: "16px" }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Radio.Group
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="d-flex flex-column gap-2"
          style={{ width: "100%" }}
        >
          {MODES.map((item) => (
            <Radio key={item.value} value={item.value}>
              {item.label}
            </Radio>
          ))}
        </Radio.Group>

        <div className="mt-3">
          <Input
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Enter text"
            onPressEnter={handleApply}
            allowClear
          />
        </div>

        <Menu.Divider className="my-3" />
        <div className="d-flex justify-content-end gap-2">
          <Button size="small" onClick={handleReset}>
            Reset
          </Button>
          <Button size="small" type="primary" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>
    </Menu>
  );

  const badgeCount = selectedValuesAreMeaningful(selectedValues) ? 1 : 0;

  return (
    <Dropdown
      popupRender={() => menu}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
    >
      <div className={`filter-button1 ${badgeCount > 0 ? "active" : ""}`}>
        <Space size={6} align="center" className="filter-button1__inner">
          <span className="filter-label">{label}</span>
          {badgeCount > 0 && <Badge count={badgeCount} className="red-badge" />}
          <DownOutlined className="dropdown-icon" />
        </Space>
      </div>
    </Dropdown>
  );
}

export default TextFilter;
