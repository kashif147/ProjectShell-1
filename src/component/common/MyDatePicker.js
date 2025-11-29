import React, { useState } from 'react';
import { DatePicker } from 'antd';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import dayjs from "dayjs";
import '../../styles/MySelect.css';

// ✅ ADD THESE TWO LINES BELOW
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);


const MyDatePicker = ({
  label,
  name,
  value,
  onChange,
  required = false,
  hasError = false,
  errorMessage = 'Required',
  disabled = false,
  placeholder = 'Select date',
  isMarginBtm = true,
  extra = null,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const format = "DD/MM/YYYY";

  return (
    <div className={`${isMarginBtm ? 'my-input-wrapper' : ''}`}>
      <div className="d-flex justify-content-between">
        <div>
          <label
            htmlFor={name}
            className={`my-input-label ${hasError ? 'error' : ''}`}
          >
            {label}
            {required && <span className="required-star">*</span>}
            {hasError && !disabled && (
              <span className="error-message"> ({errorMessage})</span>
            )}
          </label>
        </div>
        {extra && <div>{extra}</div>}
      </div>

      <div
        className={`my-input-container ${hasError ? 'error' : ''} ${
          isFocused ? 'focused' : ''
        } ${disabled ? 'disabled' : ''}`}
      >
        <DatePicker
          name={name}
          onChange={onChange}
          // ✅ this now works correctly with DD/MM/YYYY format
          value={value ? dayjs(value) : null}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="my-input-field-select"
          placeholder={placeholder}
          format={format}
          allowClear
        />
        {hasError && !disabled && (
          <AiOutlineExclamationCircle className="error-icon" />
        )}
      </div>
    </div>
  );
};

export default MyDatePicker;
