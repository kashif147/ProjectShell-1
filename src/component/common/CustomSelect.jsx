import React, { useState } from 'react';
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
  placeholder = 'Select...',
  isMarginBtm = true,
  extra = null, // 👈 extra (checkbox, info, etc.)
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`${isMarginBtm ? 'my-input-wrapper' : ''}`}>
      {/* Label Row */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-1">
          <label
            htmlFor={name}
            className={`my-input-label ${hasError ? 'error' : ''} mb-0`}
          >
            {label}
          </label>
          {required && <span className="required-star">*</span>}
          {hasError && !disabled && (
            <span className="error-message">({errorMessage})</span>
          )}
        </div>

        {/* Extra item on right */}
        {extra && <div className="label-extra me-2">{extra}</div>}
      </div>

      {/* Select Field */}
      <div
        className={`my-input-container ${hasError ? 'error' : ''} ${
          isFocused ? 'focused' : ''
        } ${disabled ? 'disabled' : ''}`}
      >
        <select
          name={name || 'Select'}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`my-input-field-select ${hasError ? 'error' : ''} ${
            disabled ? 'disabled-select' : ''
          }`}
          disabled={disabled}
        >
          {placeholder && (
            <option
              value=""
              disabled
              hidden
              className={hasError ? 'placeholder-error' : ''}
            >
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.key || opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CustomSelect;
