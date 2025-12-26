# API Pagination Component Guide

## Overview

The `ApiPagination` component provides a complete pagination solution for datasets ranging from hundreds to tens of thousands of records. It integrates with your API endpoints, handles loading states, and provides flexible page size options including percentages and fixed sizes.

## Features

- ✅ **API Integration**: Automatically fetches data from `/api/items` (or custom endpoint)
- ✅ **Dynamic Page Sizes**: Supports fixed sizes (500, 1000) and percentages (10%, 25%, 50%, All)
- ✅ **Smart Defaults**: Automatically selects appropriate page size based on total count
- ✅ **Performance Optimized**: Limits "All" option for large datasets to prevent performance issues
- ✅ **State Management**: Tracks data, loading, page, pageSize, total, and totalPages
- ✅ **Ant Design Integration**: Uses Ant Design Pagination component with full feature support

## Pagination Logic

### Page Size Calculation Strategy

The component uses a multi-tiered strategy for determining available page sizes:

#### 1. Small Datasets (< 1,000 records)

- **Options**: 10%, 25%, 50%, All, 500, 1000
- **Default**: 500
- **Rationale**: Small datasets can safely show all records without performance concerns

#### 2. Medium Datasets (1,000 - 10,000 records)

- **Options**: 10%, 25%, 50%, All, 500, 1000
- **Default**: 500
- **Rationale**: Still manageable to show "All" option, percentages provide useful views

#### 3. Large Datasets (10,000 - 50,000 records)

- **Options**: 10%, 25%, 50%, 500, 1000, 5000
- **Default**: 500
- **Rationale**: "All" option removed to prevent loading too much data at once

#### 4. Very Large Datasets (> 50,000 records)

- **Options**: 500, 1000, 5000, 10000
- **Default**: 5000
- **Rationale**: Percentage options removed, only fixed sizes for predictable performance

### How Total Count Influences Page Sizes

The total record count directly determines which page size options are available:

1. **Percentage Calculations**:

   - 10% = `Math.ceil(total * 0.1)`
   - 25% = `Math.ceil(total * 0.25)`
   - 50% = `Math.ceil(total * 0.5)`

2. **"All" Option**:

   - Only shown when `total < 10,000`
   - Prevents performance issues with very large datasets
   - When selected, `pageSize = total`

3. **Default Page Size**:
   - Automatically calculated based on total
   - Small datasets (< 1,000): 500
   - Very large datasets (≥ 50,000): 5000
   - Otherwise: 500

### Handling Large Totals Gracefully

The component implements several strategies to handle large datasets:

1. **Progressive Option Reduction**: As total increases, percentage options are removed
2. **"All" Option Limitation**: Disabled for totals > 10,000
3. **Default Size Scaling**: Larger defaults for very large datasets (5000 instead of 500)
4. **API Optimization**: Only fetches the requested page size, not entire dataset

## Usage Examples

### Basic Usage with Render Function

```jsx
import ApiPagination from "./component/common/ApiPagination";
import { Table } from "antd";

function MyComponent() {
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
  ];

  return (
    <ApiPagination apiEndpoint="/api/items" itemName="items">
      {({ data, loading, pagination }) => (
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />
      )}
    </ApiPagination>
  );
}
```

### Standalone Usage

```jsx
import ApiPagination from "./component/common/ApiPagination";

function MyComponent() {
  return (
    <ApiPagination
      apiEndpoint="/api/users"
      itemName="users"
      showSizeChanger={true}
      showQuickJumper={true}
      onDataChange={(data) => console.log("New data:", data)}
      onPaginationChange={({ page, pageSize, total, totalPages }) => {
        console.log("Pagination:", { page, pageSize, total, totalPages });
      }}
    />
  );
}
```

### Custom API Response Transformation

```jsx
<ApiPagination
  apiEndpoint="/api/custom-endpoint"
  transformResponse={(response) => {
    // Transform API response to expected format
    return {
      data: response.items || [],
      total: response.totalCount || 0,
    };
  }}
>
  {({ data, loading }) => (
    // Your component here
  )}
</ApiPagination>
```

### Custom API Configuration

```jsx
<ApiPagination
  apiEndpoint="/api/items"
  apiConfig={{
    params: {
      filter: 'active',
      sort: 'name',
    },
    headers: {
      'X-Custom-Header': 'value',
    },
  }}
>
  {({ data }) => (
    // Your component here
  )}
</ApiPagination>
```

## API Endpoint Requirements

Your API endpoint should accept the following query parameters:

- `page`: Current page number (1-indexed)
- `pageSize`: Number of items per page

Expected response format:

```json
{
  "data": [...],  // Array of items
  "total": 1000    // Total count of all items
}
```

Alternative formats supported:

- `{ items: [], total: 1000 }`
- `{ data: [], count: 1000 }`
- Direct array: `[...]` (uses array length as total)

## Component Props

| Prop                 | Type     | Default        | Description                                                                         |
| -------------------- | -------- | -------------- | ----------------------------------------------------------------------------------- |
| `apiEndpoint`        | string   | `'/api/items'` | API endpoint URL                                                                    |
| `onDataChange`       | function | -              | Callback when data changes: `(data) => void`                                        |
| `onPaginationChange` | function | -              | Callback when pagination changes: `({ page, pageSize, total, totalPages }) => void` |
| `initialPage`        | number   | `1`            | Initial page number                                                                 |
| `initialPageSize`    | number   | -              | Initial page size (auto-calculated if not provided)                                 |
| `showSizeChanger`    | boolean  | `true`         | Show page size selector                                                             |
| `showQuickJumper`    | boolean  | `false`        | Show quick page jumper                                                              |
| `showTotal`          | boolean  | `true`         | Show total count display                                                            |
| `itemName`           | string   | `'items'`      | Item name for display (e.g., "users", "items")                                      |
| `apiConfig`          | object   | `{}`           | Additional axios config (headers, params, etc.)                                     |
| `transformResponse`  | function | -              | Transform API response: `(response) => ({ data, total })`                           |
| `className`          | string   | `''`           | Additional CSS classes                                                              |
| `style`              | object   | `{}`           | Additional inline styles                                                            |
| `children`           | function | -              | Render function: `({ data, loading, pagination }) => ReactNode`                     |

## State Management

The component manages the following state internally:

- `data`: Array of current page items
- `loading`: Boolean indicating fetch status
- `page`: Current page number (1-indexed)
- `pageSize`: Current page size (number or 'All')
- `total`: Total number of records
- `totalPages`: Total number of pages

## Performance Considerations

1. **Large Datasets**: For datasets > 50,000 records, percentage options are removed to prevent loading excessive data
2. **"All" Option**: Only available for totals < 10,000 to maintain performance
3. **Default Sizes**: Larger defaults (5000) for very large datasets reduce initial load time
4. **API Calls**: Only fetches the requested page size, not the entire dataset

## Error Handling

The component handles errors gracefully:

- Displays error message via Ant Design `message.error()`
- Resets data to empty array on error
- Maintains loading state properly
- Logs errors to console for debugging

## Integration with Ant Design Table

When using with Ant Design Table, disable the Table's built-in pagination:

```jsx
<Table
  columns={columns}
  dataSource={data}
  loading={loading}
  pagination={false} // Important: disable Table's pagination
/>
```

The `ApiPagination` component provides its own pagination controls below the table.

## Best Practices

1. **Use appropriate endpoints**: Ensure your API endpoint supports pagination parameters
2. **Handle loading states**: The component provides `loading` state for UI feedback
3. **Customize item names**: Use descriptive `itemName` props (e.g., "users", "orders", "products")
4. **Transform responses**: Use `transformResponse` if your API returns non-standard formats
5. **Monitor performance**: For very large datasets, consider server-side filtering/sorting

## Troubleshooting

### Data not loading

- Check API endpoint URL
- Verify API response format matches expected structure
- Check browser console for errors
- Ensure authentication token is available in localStorage

### Page size options not showing

- Verify total count is being returned from API
- Check that `showSizeChanger={true}` is set
- Ensure total is greater than 0

### "All" option not available

- "All" option is only shown for totals < 10,000
- This is intentional to prevent performance issues
- Use a large fixed size (e.g., 5000) instead
