import React, { useId, useMemo, useState } from "react";
import { Select } from "antd";
import "../../styles/MySelect.css";
import { AiOutlineExclamationCircle } from "react-icons/ai";

function sortSelectOptions(options = []) {
  return [...options].sort((a, b) =>
    String(a?.label ?? "").localeCompare(String(b?.label ?? ""), undefined, {
      sensitivity: "base",
    }),
  );
}

function getOptionValue(opt, isIDs) {
  if (isIDs) return opt.key ?? opt.value ?? opt.label;
  return opt.label ?? opt.value ?? opt.key;
}

function resolveDisplayedValue(value, isObjectValue) {
  if (value == null || value === "") return "";
  if (isObjectValue && typeof value === "object") {
    return value.label ?? value.name ?? value.value ?? "";
  }
  return value;
}

const CustomSelect = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  required = false,
  hasError = false,
  errorMessage = "Required",
  disabled = false,
  placeholder = "Select...",
  isMarginBtm = true,
  extra = null,
  isIDs = false,
  isObjectValue = false,
  showSearch = false,
  sortOptions = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const autoId = useId().replace(/:/g, "");
  const selectId = id ?? (name ? String(name) : `select-${autoId}`);

  const preparedOptions = useMemo(() => {
    const list = sortOptions ? sortSelectOptions(options) : options;
    return list.map((opt, index) => ({
      ...opt,
      optionValue: getOptionValue(opt, isIDs),
      optionKey: opt.key || opt.value || opt.label || index,
    }));
  }, [options, sortOptions, isIDs]);

  const emitChange = (selectedValue, sourceEvent = null) => {
    if (isObjectValue) {
      const selectedOption = preparedOptions.find(
        (opt) => String(opt.optionValue) === String(selectedValue),
      );
      if (selectedOption) {
        onChange({
          ...(sourceEvent || {}),
          target: {
            ...(sourceEvent?.target || {}),
            value: selectedOption,
          },
        });
        return;
      }
    }

    if (sourceEvent) {
      onChange(sourceEvent);
      return;
    }

    onChange({
      target: {
        name: name || "Select",
        value: selectedValue,
      },
    });
  };

  const handleNativeSelectChange = (e) => {
    emitChange(e.target.value, e);
  };

  const handleAntSelectChange = (selectedValue) => {
    emitChange(selectedValue ?? "");
  };

  const normalizedValue = resolveDisplayedValue(value, isObjectValue);
  const antSelectValue =
    normalizedValue === "" ? undefined : normalizedValue;

  return (
    <div className={`${isMarginBtm ? "my-input-wrapper" : ""}`}>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-1">
          <label
            htmlFor={selectId}
            className={`my-input-label ${hasError ? "error" : ""} mb-0`}
          >
            {label}
          </label>
          {required && <span className="required-star">*</span>}
          {hasError && !disabled && (
            <span className="error-message">({errorMessage})</span>
          )}
        </div>
        {extra && <div className="label-extra me-2">{extra}</div>}
      </div>

      <div
        className={`my-input-container ${hasError ? "error" : ""} ${
          isFocused ? "focused" : ""
        } ${disabled ? "disabled" : ""}`}
      >
        {showSearch ? (
          <Select
            id={selectId}
            variant="borderless"
            showSearch
            allowClear={!required && !disabled}
            placeholder={placeholder}
            value={antSelectValue}
            disabled={disabled}
            className="my-input-ant-select"
            classNames={{ popup: "my-input-ant-select-dropdown" }}
            optionFilterProp="label"
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(String(input ?? "").toLowerCase())
            }
            options={preparedOptions.map((opt) => ({
              value: opt.optionValue,
              label: opt.label,
              key: opt.optionKey,
            }))}
            onChange={handleAntSelectChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        ) : (
          <select
            id={selectId}
            name={name || "Select"}
            value={normalizedValue}
            onChange={handleNativeSelectChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`my-input-field-select ${hasError ? "error" : ""} ${
              disabled ? "disabled-select" : ""
            }`}
            disabled={disabled}
          >
            <option value="" className={hasError ? "placeholder-error" : ""}>
              {placeholder}
            </option>
            {preparedOptions.map((opt) => (
              <option key={opt.optionKey} value={opt.optionValue}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {hasError && !disabled && !showSearch && (
          <AiOutlineExclamationCircle className="error-icon" />
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
