import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pagination, Spin, message } from 'antd';
import axios from 'axios';
import { baseURL } from '../../utils/Utilities';

/**
 * API Pagination Component with Dynamic Page Size Options
 * 
 * This component provides a complete pagination solution that:
 * - Fetches data from an API endpoint based on page and pageSize
 * - Supports flexible page size options including percentages (10%, 25%, 50%, All)
 * - Automatically adjusts page size options based on total record count
 * - Handles large datasets gracefully by limiting "All" option for huge totals
 * - Tracks all pagination state: data, loading, page, pageSize, total, totalPages
 * 
 * PAGINATION LOGIC:
 * ================
 * 
 * 1. Page Size Calculation:
 *    - Fixed sizes: 500, 1000 (always available for performance)
 *    - Percentage sizes: Calculated as percentages of total (10%, 25%, 50%)
 *    - "All" option: Only shown if total < 10,000 to prevent performance issues
 * 
 * 2. Dynamic Page Size Options Strategy:
 *    - Small datasets (< 1,000): Show 10%, 25%, 50%, All, 500, 1000
 *    - Medium datasets (1,000 - 10,000): Show 10%, 25%, 50%, All, 500, 1000
 *    - Large datasets (10,000 - 50,000): Show 10%, 25%, 50%, 500, 1000 (no "All")
 *    - Very large datasets (> 50,000): Show 500, 1000, 5000, 10000 (no percentages)
 * 
 * 3. Total Count Influence:
 *    - Total count determines which page size options are available
 *    - For large totals, percentage options are removed to prevent loading too much data
 *    - "All" option is disabled for totals > 10,000 to maintain performance
 *    - Default page size is set based on total: 500 for < 1,000, 5000 for > 50,000
 * 
 * 4. API Integration:
 *    - Fetches from /api/items endpoint with query params: page, pageSize
 *    - Expects response format: { data: [], total: number }
 *    - Automatically refetches when page or pageSize changes
 *    - Handles loading states and errors gracefully
 * 
 * @param {Object} props
 * @param {string} props.apiEndpoint - API endpoint URL (default: '/api/items')
 * @param {Function} props.onDataChange - Callback when data changes: (data) => void
 * @param {Function} props.onPaginationChange - Callback when pagination changes: ({ page, pageSize, total, totalPages }) => void
 * @param {number} props.initialPage - Initial page number (default: 1)
 * @param {number} props.initialPageSize - Initial page size (optional, auto-calculated)
 * @param {boolean} props.showSizeChanger - Show page size selector (default: true)
 * @param {boolean} props.showQuickJumper - Show quick page jumper (default: false)
 * @param {boolean} props.showTotal - Show total count display (default: true)
 * @param {string} props.itemName - Item name for display (default: 'items')
 * @param {Object} props.apiConfig - Additional axios config (headers, params, etc.)
 * @param {Function} props.transformResponse - Transform API response: (response) => ({ data, total })
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {React.ReactNode} props.children - Render function: ({ data, loading, pagination }) => ReactNode
 */
const ApiPagination = ({
  apiEndpoint = '/api/items',
  onDataChange,
  onPaginationChange,
  initialPage = 1,
  initialPageSize,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  itemName = 'items',
  apiConfig = {},
  transformResponse,
  className = '',
  style = {},
  children,
}) => {
  // State management for pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /**
   * Calculate default page size based on total records
   * Strategy: Use 500 for small datasets, 5000 for very large datasets
   */
  const getDefaultPageSize = useCallback((totalCount) => {
    if (totalCount < 1000) {
      return 500;
    } else if (totalCount >= 50000) {
      return 5000;
    } else {
      return 500;
    }
  }, []);

  /**
   * Calculate percentage-based page sizes
   * Returns an array of page size values based on percentages of total
   */
  const calculatePercentageSizes = useCallback((totalCount) => {
    const percentages = [0.1, 0.25, 0.5]; // 10%, 25%, 50%
    return percentages.map(p => Math.ceil(totalCount * p));
  }, []);

  /**
   * Generate dynamic page size options based on total count
   * 
   * Strategy:
   * - Small (< 1,000): Include percentages and "All"
   * - Medium (1,000 - 10,000): Include percentages and "All"
   * - Large (10,000 - 50,000): Include percentages but no "All"
   * - Very Large (> 50,000): Only fixed sizes, no percentages
   */
  const getPageSizeOptions = useCallback((totalCount) => {
    const options = [];
    
    if (totalCount < 1000) {
      // Small dataset: Show all options including percentages and "All"
      const percentageSizes = calculatePercentageSizes(totalCount);
      percentageSizes.forEach(size => {
        if (size > 0 && size <= totalCount) {
          options.push(size.toString());
        }
      });
      options.push('All');
      options.push('500', '1000');
    } else if (totalCount < 10000) {
      // Medium dataset: Show percentages and "All"
      const percentageSizes = calculatePercentageSizes(totalCount);
      percentageSizes.forEach(size => {
        if (size > 0 && size <= totalCount) {
          options.push(size.toString());
        }
      });
      options.push('All');
      options.push('500', '1000');
    } else if (totalCount < 50000) {
      // Large dataset: Show percentages but no "All" (performance)
      const percentageSizes = calculatePercentageSizes(totalCount);
      percentageSizes.forEach(size => {
        if (size > 0 && size <= totalCount) {
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
  }, [calculatePercentageSizes]);

  /**
   * Fetch data from API endpoint
   * Handles pagination parameters and response transformation
   */
  const fetchData = useCallback(async (currentPage, currentPageSize, currentTotal = null) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      // Use currentTotal if provided, otherwise use state total
      const totalForCalculation = currentTotal !== null ? currentTotal : total;
      const actualPageSize = currentPageSize === 'All' || (currentPageSize === totalForCalculation && totalForCalculation > 0)
        ? totalForCalculation 
        : parseInt(currentPageSize) || getDefaultPageSize(totalForCalculation || 1000);

      const params = {
        page: currentPage,
        pageSize: actualPageSize,
        ...apiConfig.params,
      };

      const response = await axios.get(apiEndpoint, {
        ...apiConfig,
        params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...apiConfig.headers,
        },
      });

      // Transform response if custom transformer provided
      let responseData = response.data;
      let responseTotal = response.data?.total || response.data?.count || 0;

      if (transformResponse) {
        const transformed = transformResponse(response.data);
        responseData = transformed.data;
        responseTotal = transformed.total;
      } else if (Array.isArray(response.data)) {
        // If response is array, assume total is length (client-side pagination)
        responseData = response.data;
        responseTotal = response.data.length;
      } else if (response.data?.data) {
        // Standard format: { data: [], total: number }
        responseData = response.data.data;
        responseTotal = response.data.total || response.data.count || 0;
      }

      setData(responseData || []);
      setTotal(responseTotal);
      
      // Calculate total pages
      const calculatedPageSize = currentPageSize === 'All' || (currentPageSize === responseTotal && responseTotal > 0)
        ? responseTotal 
        : actualPageSize;
      const calculatedTotalPages = calculatedPageSize > 0 
        ? Math.ceil(responseTotal / calculatedPageSize) 
        : 1;
      setTotalPages(calculatedTotalPages);

      // Update page size state if it was "All" or needs adjustment
      if (currentPageSize === 'All' || currentPageSize === responseTotal) {
        setPageSize(responseTotal);
      } else if (!pageSize && responseTotal > 0) {
        // Set default page size if not set and we have total
        const defaultSize = getDefaultPageSize(responseTotal);
        setPageSize(defaultSize);
      }

      // Callbacks
      if (onDataChange) {
        onDataChange(responseData);
      }
      if (onPaginationChange) {
        onPaginationChange({
          page: currentPage,
          pageSize: calculatedPageSize,
          total: responseTotal,
          totalPages: calculatedTotalPages,
        });
      }

    } catch (error) {
      
      message.error(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to fetch data'
      );
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [
    apiEndpoint,
    apiConfig,
    transformResponse,
    onDataChange,
    onPaginationChange,
    getDefaultPageSize,
  ]);

  /**
   * Handle page change
   * Resets to page 1 if page size changes, otherwise navigates to new page
   */
  const handlePageChange = useCallback((newPage, newPageSize) => {
    const actualPageSize = newPageSize === 'All' || newPageSize === total
      ? total
      : parseInt(newPageSize) || pageSize;

    setPage(newPage);
    setPageSize(actualPageSize);
    fetchData(newPage, actualPageSize);
  }, [total, pageSize, fetchData]);

  /**
   * Handle page size change
   * Resets to page 1 when page size changes
   */
  const handlePageSizeChange = useCallback((current, newPageSize) => {
    const actualPageSize = newPageSize === 'All' || newPageSize === total
      ? total
      : parseInt(newPageSize) || pageSize;

    setPage(1);
    setPageSize(actualPageSize);
    fetchData(1, actualPageSize);
  }, [total, pageSize, fetchData]);

  /**
   * Generate page size options for Ant Design Pagination
   * Converts our options array to the format Ant Design expects
   */
  const pageSizeOptions = useMemo(() => {
    return getPageSizeOptions(total);
  }, [total, getPageSizeOptions]);

  /**
   * Format page size for display in selector
   * Handles "All" option and percentage display
   */
  const formatPageSizeOption = useCallback((value) => {
    if (value === 'All') return 'All';
    const numValue = parseInt(value);
    if (total > 0) {
      const percentage = ((numValue / total) * 100).toFixed(0);
      if (percentage === '100') return 'All';
      if (percentage === '10' || percentage === '25' || percentage === '50') {
        return `${percentage}% (${numValue})`;
      }
    }
    return value;
  }, [total]);

  /**
   * Custom showTotal formatter
   * Just shows values without "Page" prefix, handles NaN cases
   */
  const showTotalFormatter = useCallback((total, range) => {
    // Ensure values are valid numbers, handle NaN cases
    const start = isNaN(range[0]) ? 0 : range[0];
    const end = isNaN(range[1]) ? 0 : range[1];
    const totalCount = isNaN(total) ? 0 : total;
    // Just show the values without "Page" prefix
    return `${start}-${end} of ${totalCount} ${itemName}`;
  }, [itemName]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    // Initial fetch with default page size
    const initialSize = initialPageSize || getDefaultPageSize(1000);
    setPageSize(initialSize);
    fetchData(initialPage, initialSize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Refetch when page or pageSize changes (after initial mount)
   */
  useEffect(() => {
    // Skip if this is the initial render (total is still 0)
    if (total > 0 && pageSize) {
      fetchData(page, pageSize);
    }
  }, [page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Render children with pagination state
   */
  if (children && typeof children === 'function') {
    return (
      <div className={`api-pagination-wrapper ${className}`} style={style}>
        <Spin spinning={loading}>
          {children({
            data,
            loading,
            pagination: {
              page,
              pageSize: pageSize === total ? 'All' : pageSize,
              total,
              totalPages,
            },
          })}
        </Spin>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            padding: '16px 0',
            marginTop: '16px',
          }}
        >
          <Pagination
            current={page}
            pageSize={pageSize === total ? total : pageSize}
            total={total}
            showSizeChanger={showSizeChanger}
            showQuickJumper={showQuickJumper}
            showTotal={showTotal ? showTotalFormatter : false}
            pageSizeOptions={pageSizeOptions}
            onChange={handlePageChange}
            onShowSizeChange={handlePageSizeChange}
            disabled={loading}
          />
        </div>
      </div>
    );
  }

  /**
   * Standalone pagination component
   */
  return (
    <div
      className={`api-pagination-container ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '16px 0',
        ...style,
      }}
    >
      <Spin spinning={loading}>
        <Pagination
          current={page}
          pageSize={pageSize === total ? total : pageSize}
          total={total}
          showSizeChanger={showSizeChanger}
          showQuickJumper={showQuickJumper}
          showTotal={showTotal ? showTotalFormatter : false}
          pageSizeOptions={pageSizeOptions}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
          disabled={loading}
        />
      </Spin>
    </div>
  );
};

export default ApiPagination;

