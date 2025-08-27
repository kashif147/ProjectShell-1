import React, { useState } from 'react';
import { DatePicker } from 'antd';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import '../../styles/MySelect.css';
import moment from 'moment';

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
  extra = null, // 🔹 checkbox, info, etc
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`${isMarginBtm ? 'my-input-wrapper' : ''}`}>
      {/* 🔹 Row with label on left + extra on right */}
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

        {/* ✅ Checkbox / info aligned to far right */}
        {extra && <div>{extra}</div>}
      </div>

      {/* DatePicker input */}
      <div
        className={`my-input-container ${hasError ? 'error' : ''} ${
          isFocused ? 'focused' : ''
        } ${disabled ? 'disabled' : ''}`}
      >
        <DatePicker
          name={name}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="my-input-field-select"
          placeholder={placeholder}
          format="DD/MM/YYYY"
          value={value ? moment(value) : null}
        />
        {hasError && !disabled && (
          <AiOutlineExclamationCircle className="error-icon" />
        )}
      </div>
    </div>
  );
};

export default MyDatePicker;
