import React, { useState, useEffect, useRef } from 'react';
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
  const [inputValue, setInputValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const datePickerRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize input value from prop
  useEffect(() => {
    if (value && dayjs.isDayjs(value) && value.isValid()) {
      setInputValue(value.format(format));
    } else {
      setInputValue('');
    }
  }, [value, format]);

  // Auto-format function for manual typing
  const autoFormatDate = (inputStr) => {
    const digits = inputStr.replace(/\D/g, '');
    if (digits.length === 0) return '';
    
    let result = '';
    for (let i = 0; i < digits.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        result += '/';
      }
      result += digits[i];
    }
    return result;
  };

  // Handle manual input changes
  const handleInputChange = (e) => {
    if (disabled) return;
    
    const rawValue = e.target.value;
    const formatted = autoFormatDate(rawValue);
    setInputValue(formatted);
    
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

  // Handle date selection from calendar
  const handleDatePickerChange = (date) => {
    onChange(date);
    if (date) {
      setInputValue(date.format(format));
    } else {
      setInputValue('');
    }
    setShowCalendar(false);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
  };

  // Handle input blur
  const handleInputBlur = (e) => {
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        setIsFocused(false);
        setShowCalendar(false);
        if (inputValue && inputValue.length < 10) {
          setInputValue('');
          onChange(null);
        }
      }
    }, 100);
  };

  // Handle calendar icon click
  const handleCalendarClick = () => {
    if (disabled) return;
    if (!showCalendar) {
      setShowCalendar(true);
      // Force the calendar to open immediately
      setTimeout(() => {
        datePickerRef.current?.picker?.focus();
        datePickerRef.current?.picker?.setOpen(true);
      }, 0);
    }
  };

  // Handle key events
  const handleKeyDown = (e) => {
    if (!/[\d]|Backspace|Delete|Tab|Escape|Enter|Arrow/.test(e.key)) {
      e.preventDefault();
    }
    
    if (e.key === 'ArrowDown' || (e.altKey && e.key === 'ArrowDown')) {
      e.preventDefault();
      handleCalendarClick();
    }
    
    if (e.key === 'Escape') {
      setShowCalendar(false);
    }
  };

  // Custom popup container to position calendar properly
  const getPopupContainer = () => {
    return containerRef.current || document.body;
  };

  // Custom calendar placement to reduce gap
  const calendarPopupStyle = {
    position: 'absolute',
    top: '100%', // Position directly below the input
    left: 0,
    marginTop: '4px', // Small gap instead of default large gap
    zIndex: 1050,
  };

  // DatePicker input styles
  const getInputStyles = () => {
    const baseStyle = {
      width: '100%',
      height: '40px',
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
      paddingRight: '35px', // Space for calendar icon
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

  // Calendar icon styles
  const calendarIconStyles = {
    position: 'absolute',
    right: '11px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.45)',
    zIndex: 1,
    pointerEvents: disabled ? 'none' : 'auto',
    fontSize: '16px',
    userSelect: 'none',
  };

  // Label styles
  const getLabelStyles = () => ({
    color: hasError ? '#ff4d4f' : 'inherit',
  });

  return (
    <div 
      style={{ marginBottom: isMarginBtm ? '16px' : '0' }}
      ref={containerRef}
    >
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
        {/* Manual Input Field */}
        <input
          ref={inputRef}
          type="text"
          name={name}
          id={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          style={getInputStyles()}
          maxLength={10}
          autoComplete="off"
        />
        
        {/* Calendar Icon */}
        <span 
          style={calendarIconStyles}
          onClick={handleCalendarClick}
          onMouseDown={(e) => e.preventDefault()}
          role="button"
          tabIndex={-1}
          aria-label="Open calendar"
        >
          📅
        </span>

        {/* DatePicker for calendar functionality - Positioned properly */}
        <DatePicker
          ref={datePickerRef}
          style={{ 
            position: 'absolute',
            top: '100%',
            left: 0,
            opacity: 0,
            pointerEvents: 'none',
            width: '1px',
            height: '1px',
          }}
          value={value && dayjs.isDayjs(value) ? value : null}
          onChange={handleDatePickerChange}
          format={format}
          allowClear={false}
          open={showCalendar}
          onOpenChange={(open) => {
            setShowCalendar(open);
            if (!open) {
              inputRef.current?.focus();
            }
          }}
          getPopupContainer={getPopupContainer}
          inputReadOnly={true}
          // Custom dropdown alignment
          dropdownAlign={{
            points: ['tl', 'bl'], // top-left of popup to bottom-left of target
            offset: [0, 4], // No horizontal offset, 4px vertical gap
            overflow: { adjustX: true, adjustY: true }
          }}
        />
      </div>
    </div>
  );
};

export default MyDatePicker1;