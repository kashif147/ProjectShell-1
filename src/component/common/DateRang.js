import React, { useState, useEffect } from "react";
import {
  Dropdown,
  Menu,
  Input,
  Row,
  Col,
  Checkbox,
  Button,
  DatePicker,
  Space,
} from "antd";
import MySelect from "./MySelect";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const data = [
  { key: "Comming week", label: "Coming week" },
  { key: "Two weeks", label: "Two weeks" },
  { key: "Three weeks", label: "Three weeks" },
];

function DateRang({ label, selectedValues = [], operator = "between", onApply }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("between"); // 'between' or 'next'
  const [dateRange, setDateRange] = useState([null, null]);
  const [nextValue, setNextValue] = useState(null);

  useEffect(() => {
    if (Array.isArray(selectedValues) && selectedValues.length > 0) {
      if (operator === "between") {
        setMode("between");
        const start = selectedValues[0] ? dayjs(selectedValues[0]) : null;
        const end = selectedValues[1] ? dayjs(selectedValues[1]) : null;
        setDateRange([start, end]);
      } else if (operator === "next") {
        setMode("next");
        setNextValue(selectedValues[0]);
      }
    } else {
      setDateRange([null, null]);
      setNextValue(null);
    }
  }, [selectedValues, operator, open]);

  const handleApply = () => {
    let values = [];
    let currentOperator = mode;

    if (mode === "between") {
      values = [
        dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : null,
        dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : null,
      ];
    } else {
      values = [nextValue];
    }

    onApply?.({
      label,
      operator: currentOperator,
      selectedValues: values.filter(v => v !== null),
    });
    setOpen(false);
  };

  const handleReset = () => {
    setDateRange([null, null]);
    setNextValue(null);
    onApply?.({
      label,
      operator: "between",
      selectedValues: [],
    });
    setOpen(false);
  };

  const menu = (
    <Menu className="filter-dropdown-menu" style={{ minWidth: "300px", padding: "12px" }}>
      <Menu.Item key="next-mode">
        <div className="d-flex flex-column" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={mode === "next"}
            onChange={(e) => e.target.checked && setMode("next")}
            className="checkbox mb-2"
          >
            In next
          </Checkbox>
          <MySelect
            options={data}
            placeholder="Please select"
            value={nextValue}
            onChange={(val) => {
              setNextValue(val);
              setMode("next");
            }}
            disabled={mode !== "next"}
            style={{ width: '100%' }}
          />
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="between-mode">
        <div className="d-flex flex-column align-items-baseline" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={mode === "between"}
            onChange={(e) => e.target.checked && setMode("between")}
            className="checkbox mb-2"
          >
            Between
          </Checkbox>
          <div className="d-flex align-items-center gap-2">
            <DatePicker
              value={dateRange[0]}
              onChange={(date) => {
                setDateRange([date, dateRange[1]]);
                setMode("between");
              }}
              disabled={mode !== "between"}
            />
            <span style={{ fontSize: "14px" }}>and</span>
            <DatePicker
              value={dateRange[1]}
              onChange={(date) => {
                setDateRange([dateRange[0], date]);
                setMode("between");
              }}
              disabled={mode !== "between"}
            />
          </div>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <div className="d-flex justify-content-end gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
        <Button size="small" type="primary" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </Menu>
  );

  const badgeCount = (Array.isArray(selectedValues) && selectedValues.length > 0) ? 1 : 0;

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      visible={open}
      onVisibleChange={setOpen}
      placement="bottomLeft"
    >
      <div className={`filter-button1 ${badgeCount > 0 ? "active" : ""}`}>
        <Space size={4}>
          <span className="filter-label">{label}</span>
          {badgeCount > 0 && (
            <div className="ant-badge red-badge">
              <span className="ant-badge-count" style={{ backgroundColor: '#ff4d4f' }}>1</span>
            </div>
          )}
          <DownOutlined className="dropdown-icon" />
        </Space>
      </div>
    </Dropdown>
  );
}

export default DateRang;
