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
  extra = null,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState('');

  const handleChange = (e) => {
    let val = e.target.value;

    // 🔹 Mobile: only numbers
    if (type === 'mobile') {
      if (/^\d*$/.test(val)) {
        onChange(e);
        setInternalError('');
      } else {
        setInternalError('Only numbers are allowed');
      }
      return;
    }

    // 🔹 Email validation
    if (type === 'email') {
      onChange(e);

      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setInternalError('Invalid email address');
      } else {
        setInternalError('');
      }
      return;
    }

    // 🔹 Default behavior
    onChange(e);
    setInternalError('');
  };

  const commonProps = {
    id: name,
    name,
    value,
    onChange: handleChange,
    placeholder,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    className: 'my-input-field',
    disabled,
    maxLength: type === 'mobile' ? (maxLength || 11) : maxLength,
  };

  const showError = hasError || internalError;

  return (
    <div className="my-input-wrapper">
      <div className="d-flex justify-content-between">
        <label
          htmlFor={name}
          className={`my-input-label ${showError ? 'error' : ''}`}
        >
          {label}
          {required && <span className="required-star"> *</span>}
          {showError && (
            <span className="error-message">
              ({internalError || errorMessage})
            </span>
          )}
        </label>
        {extra && <div className="ml-2">{extra}</div>}
      </div>

      <div
        className={`my-input-container ${showError ? 'error' : ''} ${
          isFocused ? 'focused' : ''
        }`}
      >
        {type === 'textarea' ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <input
            type={type === 'mobile' ? 'text' : type}
            {...commonProps}
          />
        )}
        {showError && <span className="error-icon">ⓘ</span>}
      </div>
    </div>
  );
};

export default MyInput;
