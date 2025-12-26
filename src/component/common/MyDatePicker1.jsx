import React, { useState, useEffect } from 'react';
import { DatePicker } from 'antd';
import '../../styles/MySelect.css';
import dayjs from 'dayjs';

const MyDatePicker1 = ({
  label,
  name,
  value,
  onChange,
  required = false,
  hasError = false,
  errorMessage = 'Required',
  disabled = false,
  placeholder = 'DD/MM/YYYY',
  isMarginBtm = true,
  format = "DD/MM/YYYY"
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  // Initialize display value
  useEffect(() => {
    if (value && dayjs.isDayjs(value)) {
      setDisplayValue(value.format(format));
    } else if (!value) {
      setDisplayValue('');
    }
  }, [value, format]);

  // Auto-format function
  const autoFormatDate = (inputStr) => {
    // Remove all non-digits
    const digits = inputStr.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    
    let result = '';
    
    // Add slashes at appropriate positions
    for (let i = 0; i < digits.length && i < 8; i++) { // Max 8 digits (YYYY)
      if (i === 2 || i === 4) {
        result += '/';
      }
      result += digits[i];
    }
    
    return result;
  };

  const handleInput = (e) => {
    if (disabled) return;
    
    const rawValue = e.target.value;
    const formatted = autoFormatDate(rawValue);
    
    // Update display
    setDisplayValue(formatted);
    
    // Parse if complete
    if (formatted.length === 10) {
      const parsed = dayjs(formatted, format, true);
      if (parsed.isValid()) {
        onChange(parsed);
      } else {
        onChange(null);
      }
    } else {
      onChange(null);
    }
  };

  const handleDatePickerChange = (date) => {
    onChange(date);
    if (date) {
      setDisplayValue(date.format(format));
    } else {
      setDisplayValue('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Clear incomplete dates
    if (displayValue && displayValue.length < 10) {
      setDisplayValue('');
      onChange(null);
    }
  };

  // DatePicker styles based on state
  const getDatePickerStyles = () => {
    const baseStyle = {
      width: '100%',
      height: '40px', // 👈 HEIGHT INCLUDED
      position: 'relative',
      zIndex: 0,
      borderRadius: '6px',
      border: '1px solid #d9d9d9',
      padding: '4px 11px',
      fontSize: '14px',
      fontFamily: 'inherit',
      backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
      color: disabled ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.88)',
      cursor: disabled ? 'not-allowed' : 'text',
      outline: 'none',
      transition: 'all 0.3s',
    };

    if (hasError && !disabled) {
      return {
        ...baseStyle,
        border: '1px solid #ff4d4f',
        boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.1)',
      };
    }

    if (isFocused && !disabled) {
      return {
        ...baseStyle,
        border: '1px solid #4096ff',
        boxShadow: '0 0 0 2px rgba(64, 150, 255, 0.1)',
      };
    }

    return baseStyle;
  };

  // Container styles
  const containerStyles = {
    position: 'relative',
    width: '100%',
  };

  // Label styles
  const getLabelStyles = () => ({
    color: hasError ? '#ff4d4f' : 'inherit',
  });

  return (
    <div style={{ marginBottom: isMarginBtm ? '16px' : '0' }}>
      <label 
        className='my-input-label'
        htmlFor={name} 
        style={getLabelStyles()}
      >
        {label}
        {required && <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>}
        {hasError && !disabled && (
          <span style={{ color: '#ff4d4f', marginLeft: '4px' }}> ({errorMessage})</span>
        )}
      </label>

      <div style={containerStyles}>
        <input
          type="text"
          name={name}
          value={displayValue}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          style={getDatePickerStyles()}
          maxLength={10}
          onKeyDown={(e) => {
            // Only allow numbers and control keys
            if (!/[\d]|Backspace|Delete|Tab|Escape|Enter|Arrow/.test(e.key)) {
              e.preventDefault();
            }
          }}
        />
        {/* Hidden DatePicker for calendar functionality */}
        <DatePicker
          style={{ display: 'none' }}
          value={value && dayjs.isDayjs(value) ? value : null}
          onChange={handleDatePickerChange}
          format={format}
        />
      </div>
    </div>
  );
};

export default MyDatePicker1;