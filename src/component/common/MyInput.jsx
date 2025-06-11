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
  errorMessage = 'Required'
}) => {
  const [isFocused, setIsFocused] = useState(false);

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
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="my-input-field"
        />
        {hasError && (
          <span className="error-icon">ⓘ</span> 
        )}
      </div>
    </div>
  );
};

export default MyInput;
