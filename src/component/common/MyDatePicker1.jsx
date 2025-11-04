import React, { useState } from 'react';
import { DatePicker } from 'antd';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
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
  placeholder = 'Select date',
  isMarginBtm = true,
  format = "DD/MM/YYYY"
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleDateChange = (date) => {
    onChange(date);
  };

  // Parse the value properly considering it might be in string format
  const parseValue = (val) => {
    if (!val) return null;
    if (dayjs.isDayjs(val)) {
      return val;
    }
    // If it's a string, parse it with the specified format
    if (typeof val === 'string') {
      return dayjs(val, format);
    }
    
    return null;
  };

  // DatePicker styles based on state
  const getDatePickerStyles = () => {
    const baseStyle = {
      width: '100%',
      height: '40px', // 👈 ADD HEIGHT HERE
      position: 'relative',
      zIndex: 0,
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

  // Error icon styles
  const errorIconStyles = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#ff4d4f',
    fontSize: '16px',
    zIndex: 1,
  };

  // Label styles
  const getLabelStyles = () => ({
    color: hasError ? '#ff4d4f' : 'inherit',
  });

  return (
    <div style={{ marginBottom: isMarginBtm ? '16px' : '0' }}>
      <label 
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
        <DatePicker
          name={name}
          value={parseValue(value)}
          onChange={handleDateChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          format={format}
          inputReadOnly={false}
          style={getDatePickerStyles()} // 👈 This applies the styles with height
          // Additional Ant Design props for better error handling
          status={hasError ? 'error' : ''}
        />
        {/* {hasError && !disabled && (
          <AiOutlineExclamationCircle style={errorIconStyles} />
        )} */}
      </div>
    </div>
  );
};

export default MyDatePicker1;