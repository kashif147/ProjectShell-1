import React, { useState } from 'react';
import '../../styles/MySelect.css';
import { AiOutlineExclamationCircle } from 'react-icons/ai';

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
  extra = null,
  isIDs = false,
  isObjectValue = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    
    if (isObjectValue) {
      // Find the complete option object
      const selectedOption = options.find(opt => 
        isIDs ? opt.key === selectedValue : opt.label === selectedValue
      );
      
      if (selectedOption) {
        // Create a custom event with the object
        const customEvent = {
          ...e,
          target: {
            ...e.target,
            value: selectedOption // Pass the entire object
          }
        };
        onChange(customEvent);
        return;
      }
    }
    
    // Default behavior - pass string value
    onChange(e);
  };

  // Normalize value to handle undefined, null, or empty string
  const normalizedValue = value || '';

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
        className={`my-input-container ${hasError ? 'error' : ''} ${isFocused ? 'focused' : ''
          } ${disabled ? 'disabled' : ''}`}
      >
        <select
          name={name || 'Select'}
          value={normalizedValue}
          onChange={handleSelectChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`my-input-field-select ${hasError ? 'error' : ''} ${disabled ? 'disabled-select' : ''
            }`}
          disabled={disabled}
        >
          {/* Placeholder option - NOT disabled so users can select it to "deselect" */}
          <option value="" className={hasError ? 'placeholder-error' : ''}>
            {placeholder}
          </option>
          
          {options.map((opt) => {
            return (
              <option key={opt.key} value={isIDs ? opt.key : opt.label}>
                {opt.label}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default CustomSelect;