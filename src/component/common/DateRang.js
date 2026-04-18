import React, { useState, useEffect } from "react";
import {
  Dropdown,
  Menu,
  Input,
  Row,
  Col,
  Radio,
  Button,
  DatePicker,
  TimePicker,
  Space,
  InputNumber,
  Select,
  Badge,
} from "antd";
import MySelect from "./MySelect";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const units = [
  { label: "minutes", value: "minutes" },
  { label: "hours", value: "hours" },
  { label: "days", value: "days" },
  { label: "weeks", value: "weeks" },
  { label: "months", value: "months" },
  { label: "years", value: "years" },
];

const DATE_RANGE_OPS = new Set(["between", "within", "more_than"]);

function effectiveDateOperator(operator) {
  return DATE_RANGE_OPS.has(String(operator)) ? operator : "between";
}

function selectedValuesAreMeaningful(selectedValues) {
  if (!Array.isArray(selectedValues)) return false;
  return selectedValues.some((x) => {
    if (x === null || x === undefined) return false;
    if (typeof x === "number" && Number.isFinite(x)) return true;
    const s = String(x).trim();
    return s !== "" && s !== "null" && s !== "undefined";
  });
}

function DateRang({ label, selectedValues = [], operator = "between", onApply }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("between"); // 'within', 'more_than', 'between'
  const [dateRange, setDateRange] = useState([null, null]); // [dayjs, dayjs]
  const [relativeValue, setRelativeValue] = useState(null);
  const [relativeUnit, setRelativeUnit] = useState("minutes");

  useEffect(() => {
    const effOp = effectiveDateOperator(operator);
    if (Array.isArray(selectedValues) && selectedValuesAreMeaningful(selectedValues)) {
      if (effOp === "between") {
        setMode("between");
        const start = selectedValues[0] ? dayjs(selectedValues[0]) : null;
        const end = selectedValues[1] ? dayjs(selectedValues[1]) : null;
        setDateRange([start, end]);
      } else if (effOp === "within" || effOp === "more_than") {
        setMode(effOp);
        const raw = selectedValues[0];
        const num =
          raw !== null && raw !== undefined && raw !== ""
            ? Number(raw)
            : null;
        setRelativeValue(Number.isFinite(num) ? num : null);
        setRelativeUnit(selectedValues[1] || "minutes");
      }
    } else {
      setMode("between");
      setDateRange([null, null]);
      setRelativeValue(null);
      setRelativeUnit("minutes");
    }
  }, [selectedValues, operator, open]);

  const handleApply = () => {
    let values = [];
    let currentOperator = mode;

    if (mode === "between") {
      values = [
        dateRange[0] ? dateRange[0].format("YYYY-MM-DD HH:mm:ss") : null,
        dateRange[1] ? dateRange[1].format("YYYY-MM-DD HH:mm:ss") : null,
      ];
    } else {
      values = [relativeValue, relativeUnit];
    }

    onApply?.({
      label,
      operator: currentOperator,
      selectedValues: values.filter(v => v !== null && v !== undefined),
    });
    setOpen(false);
  };

  const handleReset = () => {
    setDateRange([null, null]);
    setRelativeValue(null);
    setRelativeUnit("minutes");
    onApply?.({
      label,
      operator: "between",
      selectedValues: [],
    });
    setOpen(false);
  };

  const menu = (
    <Menu className="filter-dropdown-menu" style={{ minWidth: "350px", padding: "16px" }}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="hide-scroll-webkit"
        style={{ maxHeight: "450px", overflowY: "auto" }}
      >
        <Radio.Group
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="d-flex flex-column gap-3"
          style={{ width: '100%' }}
        >
          {/* Within the last */}
          <div className="d-flex flex-column gap-2">
            <Radio value="within">Within the last</Radio>
            {mode === "within" && (
              <div className="d-flex gap-2 ps-4">
                <InputNumber
                  min={0}
                  value={relativeValue}
                  onChange={(val) => {
                    setRelativeValue(val);
                  }}
                  placeholder=""
                  style={{ width: '80px' }}
                />
                <Select
                  value={relativeUnit}
                  onChange={(val) => {
                    setRelativeUnit(val);
                  }}
                  style={{ width: '120px' }}
                >
                  {units.map(u => <Option key={u.value} value={u.value}>{u.label}</Option>)}
                </Select>
              </div>
            )}
          </div>

          {/* More than */}
          <div className="d-flex flex-column gap-2">
            <Radio value="more_than">More than</Radio>
            {mode === "more_than" && (
              <div className="d-flex gap-2 ps-4">
                <InputNumber
                  min={0}
                  value={relativeValue}
                  onChange={(val) => {
                    setRelativeValue(val);
                  }}
                  placeholder=""
                  style={{ width: '80px' }}
                />
                <Select
                  value={relativeUnit}
                  onChange={(val) => {
                    setRelativeUnit(val);
                  }}
                  style={{ width: '120px' }}
                >
                  {units.map(u => <Option key={u.value} value={u.value}>{u.label}</Option>)}
                </Select>
              </div>
            )}
          </div>

          {/* Between */}
          <div className="d-flex flex-column gap-2">
            <Radio value="between">Between</Radio>
            {mode === "between" && (
              <div className="d-flex flex-column gap-2 ps-4">
                <div className="d-flex gap-2">
                  <DatePicker
                    placeholder="Start date"
                    value={dateRange[0]}
                    onChange={(date) => {
                      const current = dateRange[0] || dayjs().startOf('day');
                      const newDate = date ? date.hour(current.hour()).minute(current.minute()).second(current.second()) : null;
                      setDateRange([newDate, dateRange[1]]);
                    }}
                    style={{ flex: 1 }}
                  />
                  <TimePicker
                    placeholder="Start time"
                    format="hh:mm A"
                    use12Hours
                    value={dateRange[0]}
                    onChange={(time) => {
                      const current = dateRange[0] || dayjs().startOf('day');
                      const newTime = time ? current.hour(time.hour()).minute(time.minute()).second(time.second()) : current;
                      setDateRange([newTime, dateRange[1]]);
                    }}
                    style={{ width: '120px' }}
                  />
                </div>
                <span style={{ fontSize: "14px", color: "#666" }}>and</span>
                <div className="d-flex gap-2">
                  <DatePicker
                    placeholder="End date"
                    value={dateRange[1]}
                    onChange={(date) => {
                      const current = dateRange[1] || dayjs().endOf('day');
                      const newDate = date ? date.hour(current.hour()).minute(current.minute()).second(current.second()) : null;
                      setDateRange([dateRange[0], newDate]);
                    }}
                    style={{ flex: 1 }}
                  />
                  <TimePicker
                    placeholder="End time"
                    format="hh:mm A"
                    use12Hours
                    value={dateRange[1]}
                    onChange={(time) => {
                      const current = dateRange[1] || dayjs().endOf('day');
                      const newTime = time ? current.hour(time.hour()).minute(time.minute()).second(time.second()) : current;
                      setDateRange([dateRange[0], newTime]);
                    }}
                    style={{ width: '120px' }}
                  />
                </div>
              </div>
            )}
          </div>
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

  const badgeCount = selectedValuesAreMeaningful(selectedValues) ? 1 : 0;

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      visible={open}
      onVisibleChange={setOpen}
      placement="bottomLeft"
    >
      <div className={`filter-button1 ${badgeCount > 0 ? "active" : ""}`}>
        <Space size={6} className="filter-button1__inner">
          <span className="filter-label">{label}</span>
          {badgeCount > 0 && (
            <Badge count={badgeCount} className="red-badge" />
          )}
          <DownOutlined className="dropdown-icon" />
        </Space>
      </div>
    </Dropdown>
  );
}

export default DateRang;
