import React, { useState } from 'react';
import { DatePicker } from 'antd';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import '../../styles/MySelect.css';
import dayjs from 'dayjs';
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
}) => {
  const [isFocused, setIsFocused] = useState(false);
  console.log(moment(value).format('DD/MM/YYYY'), "ppp")
  return (
    <div className={`${isMarginBtm ? 'my-input-wrapper' : ''}`}>
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

      <div
        className={`my-input-container ${hasError ? 'error' : ''} ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}

      >
        <DatePicker
          name={name}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="my-input-field-select"
          placeholder={placeholder}
          format="DD-MM-YYYY"
          value={value}
        />
        {hasError && !disabled && (
          <AiOutlineExclamationCircle className="error-icon" />
        )}
      </div>
    </div>
  );
};

export default MyDatePicker;
