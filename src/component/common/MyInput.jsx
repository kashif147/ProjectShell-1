import React, { useState } from 'react';
import '../../styles/MyInput.css'; // Or .scss if you're using SCSS

const MyInput = ({
  label,
  placeholder,
  value,
  onChange,
  name,
  type = 'text',
  required = false,
  hasError = false,
  errorMessage = 'Required',
  disabled,
  rows=4
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
      <label htmlFor={name} className={`my-input-label ${hasError ? 'error' : ''}`}>
        {label}
        {required && <span className="required-star"> *</span>}
        {hasError && errorMessage && (
          <span className="error-message"> ({errorMessage})</span>
        )}
      </label>

      <div className={`my-input-container ${hasError ? 'error' : ''} ${isFocused ? 'focused' : ''}`}>
        {type === 'textarea' ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <input type={type} {...commonProps} />
        )}
        {hasError && (
          <span className="error-icon">ⓘ</span> 
        )}
      </div>
    </div>

  );
};

export default MyInput;
