import React, { useState } from 'react';
import '../../styles/MyInput.css';

const MyInput = ({
  label,
  placeholder = 'Enter...',
  value,
  onChange,
  name,
  type = 'text',
  required = false,
  hasError = false,
  errorMessage = 'Required',
  disabled = false,
  rows = 4,
  extra = null, // 🔹 new prop
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const commonProps = {
    id: name,
    name,
    value,
    onChange,
    placeholder,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    className: 'my-input-field',
    disabled,
  };

  return (
    <div className="my-input-wrapper">
      {/* 🔹 Label + Extra aligned like flex row */}
      <div className="d-flex justify-content-between">
        <label
          htmlFor={name}
          className={`my-input-label ${hasError ? 'error' : ''}`}
        >
          {label}
          {required && <span className="required-star"> *</span>}
          {hasError && errorMessage && (
            <span className="error-message"> ({errorMessage})</span>
          )}
        </label>
        {extra && <div className="ml-2">{extra}</div>}
      </div>

      {/* Input box */}
      <div
        className={`my-input-container ${hasError ? 'error' : ''} ${
          isFocused ? 'focused' : ''
        }`}
      >
        {type === 'textarea' ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <input type={type} {...commonProps} />
        )}
        {hasError && <span className="error-icon">ⓘ</span>}
      </div>
    </div>
  );
};

export default MyInput;
