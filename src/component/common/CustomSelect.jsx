import React, { useState } from 'react';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import '../../styles/MySelect.css'; 

const CustomSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  hasError = false,
  errorMessage = 'Required',
  disabled = false,
  placeholder,
  isMarginBtm=true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`${isMarginBtm? "my-input-wrapper" :''}`}>
      <label
        htmlFor={name}
        className={`my-input-label ${hasError ? 'error' : ''} `}
      >
        {label}
        {required && <span className="required-star">*</span>}
        {hasError && !disabled && (
          <span className="error-message"> ({errorMessage})</span>
        )}
      </label>

      <div
        className={` my-input-container ${hasError ? 'error' : ''} ${isFocused ? 'focused' : ''} ${
          disabled ? 'disabled' : ''
        }`}
      >
        <select
          // id={name}
          name={name||''}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="my-input-field-select"
          disabled={disabled}
          placeholder={placeholder}
        >
          {/* <option value=""></option> */}
           {placeholder && !value && (
    <option value="" >
      {placeholder}
    </option>
  )}
          {options.map(opt => (
            <option key={opt.key} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>

        {hasError && !disabled && <AiOutlineExclamationCircle className="error-icon" />}
      </div>
    </div>
  );
};

export default CustomSelect;
