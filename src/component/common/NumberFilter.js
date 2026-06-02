import React, { useEffect, useState } from "react";
import { Badge, Button, Dropdown, InputNumber, Menu, Radio, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { NUMERIC_FILTER_OPERATORS } from "../../utils/filterOperatorConstants";

const MODES = [
  { value: "==", label: "Equal to (=)" },
  { value: "!=", label: "Not equal to (≠)" },
  { value: "<", label: "Less than (<)" },
  { value: ">", label: "Greater than (>)" },
  { value: "<=", label: "Less than or equal (≤)" },
  { value: ">=", label: "Greater than or equal (≥)" },
  { value: "between", label: "Between (range)" },
];

function effectiveNumericOperator(operator) {
  return NUMERIC_FILTER_OPERATORS.has(String(operator))
    ? String(operator)
    : "==";
}

function selectedValuesAreMeaningful(selectedValues, operator) {
  if (!Array.isArray(selectedValues)) return false;
  const op = effectiveNumericOperator(operator);
  if (op === "between") {
    return selectedValues.length >= 2 && selectedValues.every((v) => isFiniteNumber(v));
  }
  return selectedValues.some((v) => isFiniteNumber(v));
}

function isFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return false;
  return Number.isFinite(Number(value));
}

function NumberFilter({
  label,
  selectedValues = [],
  operator = "==",
  onApply,
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("==");
  const [singleValue, setSingleValue] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  useEffect(() => {
    const effOp = effectiveNumericOperator(operator);
    setMode(effOp);
    if (selectedValuesAreMeaningful(selectedValues, effOp)) {
      if (effOp === "between") {
        setRangeStart(Number(selectedValues[0]));
        setRangeEnd(Number(selectedValues[1]));
        setSingleValue(null);
      } else {
        setSingleValue(Number(selectedValues[0]));
        setRangeStart(null);
        setRangeEnd(null);
      }
    } else {
      setSingleValue(null);
      setRangeStart(null);
      setRangeEnd(null);
    }
  }, [selectedValues, operator, open]);

  const handleApply = () => {
    let values = [];
    if (mode === "between") {
      values = [rangeStart, rangeEnd].filter((v) => isFiniteNumber(v));
    } else if (isFiniteNumber(singleValue)) {
      values = [singleValue];
    }

    onApply?.({
      label,
      operator: mode,
      selectedValues: values,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setSingleValue(null);
    setRangeStart(null);
    setRangeEnd(null);
    onApply?.({
      label,
      operator: "==",
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
            <div key={item.value} className="d-flex flex-column gap-2">
              <Radio value={item.value}>{item.label}</Radio>
              {mode === item.value && item.value === "between" && (
                <div className="d-flex flex-column gap-2 ps-4">
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={rangeStart}
                    onChange={setRangeStart}
                    placeholder="Min"
                    style={{ width: "100%" }}
                    addonBefore="€"
                  />
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={rangeEnd}
                    onChange={setRangeEnd}
                    placeholder="Max"
                    style={{ width: "100%" }}
                    addonBefore="€"
                  />
                </div>
              )}
              {mode === item.value && item.value !== "between" && (
                <div className="ps-4">
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={singleValue}
                    onChange={setSingleValue}
                    placeholder="Amount"
                    style={{ width: "100%" }}
                    addonBefore="€"
                  />
                </div>
              )}
            </div>
          ))}
        </Radio.Group>

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

  const badgeCount = selectedValuesAreMeaningful(selectedValues, operator)
    ? 1
    : 0;

  return (
    <Dropdown
      dropdownRender={() => menu}
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

export default NumberFilter;
