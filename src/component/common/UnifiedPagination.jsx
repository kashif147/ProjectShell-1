import React, { useMemo } from 'react';
import { Pagination } from 'antd';

/**
 * Get default page size based on total records
 */
export const getDefaultPageSize = (total) => {
  if (total < 1000) {
    return 500;
  } else if (total >= 50000) {
    return 5000;
  } else {
    return 500;
  }
};

/**
 * Calculate percentage-based page sizes
 * Returns an array of page size values based on percentages of total
 */
const calculatePercentageSizes = (total) => {
  const percentages = [0.1, 0.25, 0.5]; // 10%, 25%, 50%
  return percentages.map(p => Math.ceil(total * p));
};

/**
 * Get page size options based on dataset size
 * 
 * Strategy:
 * - Small (< 1,000): Include percentages and "All"
 * - Medium (1,000 - 10,000): Include percentages and "All"
 * - Large (10,000 - 50,000): Include percentages but no "All"
 * - Very Large (> 50,000): Only fixed sizes, no percentages
 */
const getPageSizeOptions = (total, customOptions) => {
  if (customOptions) {
    return customOptions;
  }

  const options = [];

  if (total < 1000) {
    // Small dataset: Show all options including percentages and "All"
    const percentageSizes = calculatePercentageSizes(total);
    percentageSizes.forEach(size => {
      if (size > 0 && size <= total) {
        options.push(size.toString());
      }
    });
    options.push('All');
    options.push('500', '1000');
  } else if (total < 10000) {
    // Medium dataset: Show percentages and "All"
    const percentageSizes = calculatePercentageSizes(total);
    percentageSizes.forEach(size => {
      if (size > 0 && size <= total) {
        options.push(size.toString());
      }
    });
    options.push('All');
    options.push('500', '1000');
  } else if (total < 50000) {
    // Large dataset: Show percentages but no "All" (performance)
    const percentageSizes = calculatePercentageSizes(total);
    percentageSizes.forEach(size => {
      if (size > 0 && size <= total) {
        options.push(size.toString());
      }
    });
    options.push('500', '1000', '5000');
  } else {
    // Very large dataset: Only fixed sizes for performance
    options.push('500', '1000', '5000', '10000');
  }

  // Remove duplicates and sort
  return [...new Set(options)].sort((a, b) => {
    const aNum = a === 'All' ? Infinity : parseInt(a);
    const bNum = b === 'All' ? Infinity : parseInt(b);
    return aNum - bNum;
  });
};

/**
 * Generate pagination config for Ant Design Table
 * 
 * @param {Object} options
 * @param {number} options.total - Total number of records
 * @param {number} options.current - Current page number
 * @param {number} options.pageSize - Current page size (optional)
 * @param {Function} options.onChange - Callback when page changes
 * @param {Function} options.onShowSizeChange - Callback when page size changes
 * @param {boolean} options.showSizeChanger - Show page size changer (default: true)
 * @param {boolean} options.showQuickJumper - Show quick jumper (default: false)
 * @param {boolean} options.showTotal - Show total count (default: true)
 * @param {Array<string>} options.pageSizeOptions - Custom page size options
 * @param {Function} options.showTotalFormatter - Custom formatter for total display
 * @param {string} options.itemName - Item name for total display
 * @returns {Object} Pagination config object for Ant Design Table
 */
export const getUnifiedPaginationConfig = ({
  total = 0,
  current = 1,
  pageSize: propPageSize,
  onChange,
  onShowSizeChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  pageSizeOptions: propPageSizeOptions,
  showTotalFormatter,
  itemName = 'items',
  ...restProps
}) => {
  const defaultPageSize = getDefaultPageSize(total);
  // Handle "All" option - convert to total if selected
  let pageSize = propPageSize ?? defaultPageSize;
  if (pageSize === 'All' || (typeof pageSize === 'string' && pageSize.toLowerCase() === 'all')) {
    pageSize = total > 0 ? total : defaultPageSize;
  } else {
    pageSize = parseInt(pageSize) || defaultPageSize;
  }
  const pageSizeOptions = getPageSizeOptions(total, propPageSizeOptions);

  const defaultShowTotal = (total, range) => {
    if (showTotalFormatter) {
      const result = showTotalFormatter(total, range);
      // If it's a React element, return it directly
      if (typeof result === 'object' && result !== null) {
        return result;
      }
      // Otherwise return the string
      return result;
    }
    // Ensure values are valid numbers, handle NaN cases
    const start = isNaN(range[0]) ? 0 : range[0];
    const end = isNaN(range[1]) ? 0 : range[1];
    const totalCount = isNaN(total) ? 0 : total;
    // Just show the values without "Page" prefix
    return `${start}-${end} of ${totalCount} ${itemName}`;
  };

  const handleChange = (page, size) => {
    if (onChange) {
      onChange(page, size);
    }
  };

  const handleShowSizeChange = (current, size) => {
    // Convert "All" to total for actual pageSize
    const actualSize = size === 'All' || size === total ? total : parseInt(size) || pageSize;
    if (onShowSizeChange) {
      onShowSizeChange(current, actualSize);
    }
    if (onChange) {
      onChange(current, actualSize);
    }
  };

  return {
    current,
    pageSize: pageSize === total ? total : pageSize,
    total,
    showSizeChanger,
    showQuickJumper,
    showTotal: showTotal ? defaultShowTotal : false,
    pageSizeOptions,
    position: ['bottomCenter'],
    size: 'default',
    onChange: handleChange,
    onShowSizeChange: handleShowSizeChange,
    style: { fontSize: '14px', ...restProps.style },
    ...restProps,
  };
};

/**
 * Unified Pagination Component
 * 
 * Automatically determines default page size based on total records:
 * - < 1000 records: default 500 rows
 * - >= 50,000 records: default 5000 rows
 * - Otherwise: default 500 rows
 * 
 * @param {Object} props
 * @param {number} props.total - Total number of records
 * @param {number} props.current - Current page number
 * @param {number} props.pageSize - Current page size (optional, will use default if not provided)
 * @param {Function} props.onChange - Callback when page changes: (page, pageSize) => void
 * @param {Function} props.onShowSizeChange - Callback when page size changes: (current, size) => void
 * @param {boolean} props.showSizeChanger - Show page size changer (default: true)
 * @param {boolean} props.showQuickJumper - Show quick jumper (default: false)
 * @param {boolean} props.showTotal - Show total count (default: true)
 * @param {Array<string>} props.pageSizeOptions - Custom page size options (optional)
 * @param {Function} props.showTotalFormatter - Custom formatter for total display
 * @param {string} props.itemName - Item name for total display (e.g., "users", "items")
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
const UnifiedPagination = ({
  total = 0,
  current = 1,
  pageSize: propPageSize,
  onChange,
  onShowSizeChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  pageSizeOptions: propPageSizeOptions,
  showTotalFormatter,
  itemName = 'items',
  className = '',
  style = {},
  ...restProps
}) => {
  // Determine default page size based on total records
  const defaultPageSize = useMemo(() => getDefaultPageSize(total), [total]);

  // Use provided pageSize or default
  // Handle "All" option - convert to total if selected
  let pageSize = propPageSize ?? defaultPageSize;
  if (pageSize === 'All' || (typeof pageSize === 'string' && pageSize.toLowerCase() === 'all')) {
    pageSize = total > 0 ? total : defaultPageSize;
  } else {
    pageSize = parseInt(pageSize) || defaultPageSize;
  }

  // Determine page size options based on dataset size
  const pageSizeOptions = useMemo(
    () => getPageSizeOptions(total, propPageSizeOptions),
    [total, propPageSizeOptions]
  );

  // Default total formatter
  const defaultShowTotal = (total, range) => {
    if (showTotalFormatter) {
      const result = showTotalFormatter(total, range);
      // If it's a React element, return it directly
      if (typeof result === 'object' && result !== null) {
        return result;
      }
      // Otherwise return the string
      return result;
    }
    // Ensure values are valid numbers, handle NaN cases
    const start = isNaN(range[0]) ? 0 : range[0];
    const end = isNaN(range[1]) ? 0 : range[1];
    const totalCount = isNaN(total) ? 0 : total;
    // Just show the values without "Page" prefix
    return `${start}-${end} of ${totalCount} ${itemName}`;
  };

  // Handle page change
  const handleChange = (page, size) => {
    if (onChange) {
      onChange(page, size);
    }
  };

  // Handle page size change
  const handleShowSizeChange = (current, size) => {
    // Convert "All" to total for actual pageSize
    const actualSize = size === 'All' || size === total ? total : parseInt(size) || pageSize;
    if (onShowSizeChange) {
      onShowSizeChange(current, actualSize);
    }
    if (onChange) {
      onChange(current, actualSize);
    }
  };

  // Render standalone component
  return (
    <div
      className={`unified-pagination-container ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 0,
        margin: 0,
        ...style,
      }}
    >
      <Pagination
        current={current}
        pageSize={pageSize === total ? total : pageSize}
        total={total}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        showTotal={showTotal ? defaultShowTotal : false}
        pageSizeOptions={pageSizeOptions}
        onChange={handleChange}
        onShowSizeChange={handleShowSizeChange}
        style={{ fontSize: '14px' }}
        {...restProps}
      />
    </div>
  );
};

export default UnifiedPagination;

