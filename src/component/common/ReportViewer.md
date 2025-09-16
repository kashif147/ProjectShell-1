# Report Viewer Component

A comprehensive React component for displaying and managing reports with built-in export, print, and interactive features.

## Features

- **Export Functionality**: PDF and Excel export with customizable formatting
- **Print Support**: Print-friendly layouts with optimized styling
- **Fullscreen Mode**: Toggle between normal and fullscreen viewing
- **Data Refresh**: Real-time data refresh capability
- **Custom Actions**: Add custom action buttons for specific functionality
- **Settings Drawer**: Quick access to report settings and options
- **Responsive Design**: Works seamlessly on all screen sizes
- **Loading States**: Built-in loading indicators and error handling
- **Interactive Charts**: Support for various chart types (Bar, Pie, Line, Area)
- **Data Filtering**: Built-in search and filter capabilities

## Installation

The ReportViewer component is already integrated into the project. No additional installation required.

## Usage

### Basic Usage

```jsx
import ReportViewer from "../component/common/ReportViewer";

function MyReport() {
  const data = [
    { id: 1, name: "John Doe", status: "Active" },
    { id: 2, name: "Jane Smith", status: "Inactive" },
  ];

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <ReportViewer
      title="My Report"
      subtitle="Report description"
      data={data}
      columns={columns}
    >
      {/* Your report content goes here */}
    </ReportViewer>
  );
}
```

### Advanced Usage with Custom Actions

```jsx
import ReportViewer from "../component/common/ReportViewer";
import { Button } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

function AdvancedReport() {
  const customActions = [
    {
      label: "Custom Action",
      icon: <BarChartOutlined />,
      onClick: () => console.log("Custom action triggered"),
      type: "primary",
    },
  ];

  const handleExportPDF = async () => {
    // Custom PDF export logic
    console.log("Custom PDF export");
  };

  const handleRefresh = async () => {
    // Custom refresh logic
    console.log("Refreshing data...");
  };

  return (
    <ReportViewer
      title="Advanced Report"
      subtitle="With custom functionality"
      data={data}
      columns={columns}
      onExportPDF={handleExportPDF}
      onRefresh={handleRefresh}
      customActions={customActions}
      showFullscreen={true}
      showExport={true}
      showPrint={true}
      showRefresh={true}
    >
      {/* Report content */}
    </ReportViewer>
  );
}
```

## Props

| Prop             | Type      | Default                      | Description                   |
| ---------------- | --------- | ---------------------------- | ----------------------------- |
| `title`          | string    | "Report Viewer"              | Main report title             |
| `subtitle`       | string    | "Interactive Report Display" | Report subtitle/description   |
| `data`           | array     | []                           | Data array for the report     |
| `columns`        | array     | []                           | Table columns configuration   |
| `loading`        | boolean   | false                        | Loading state                 |
| `onRefresh`      | function  | -                            | Refresh callback function     |
| `onExportPDF`    | function  | -                            | Custom PDF export function    |
| `onExportExcel`  | function  | -                            | Custom Excel export function  |
| `onPrint`        | function  | -                            | Custom print function         |
| `showFullscreen` | boolean   | true                         | Show fullscreen toggle button |
| `showExport`     | boolean   | true                         | Show export buttons           |
| `showPrint`      | boolean   | true                         | Show print button             |
| `showRefresh`    | boolean   | true                         | Show refresh button           |
| `customActions`  | array     | []                           | Custom action buttons         |
| `reportType`     | string    | "table"                      | Report type identifier        |
| `className`      | string    | ""                           | Additional CSS classes        |
| `style`          | object    | {}                           | Inline styles                 |
| `children`       | ReactNode | -                            | Report content                |

## Custom Actions

Custom actions allow you to add additional functionality to the report viewer:

```jsx
const customActions = [
  {
    label: "Action 1",
    icon: <SomeIcon />,
    onClick: () => handleAction1(),
    type: "primary",
  },
  {
    label: "Action 2",
    icon: <AnotherIcon />,
    onClick: () => handleAction2(),
    type: "default",
  },
];
```

## Export Functions

### Default Export Functions

The component provides default export functions if none are specified:

- **PDF Export**: Uses jsPDF with autoTable plugin
- **Excel Export**: Uses XLSX library
- **Print**: Opens print dialog with optimized layout

### Custom Export Functions

You can override the default export functions:

```jsx
const handleCustomPDFExport = async () => {
  // Your custom PDF export logic
  const doc = new jsPDF();
  // ... custom PDF generation
  doc.save("custom-report.pdf");
};

const handleCustomExcelExport = async () => {
  // Your custom Excel export logic
  const workbook = XLSX.utils.book_new();
  // ... custom Excel generation
  XLSX.writeFile(workbook, "custom-report.xlsx");
};
```

## Styling

The component uses CSS classes that can be customized:

- `.report-viewer`: Main container
- `.report-header-card`: Header section
- `.report-content-card`: Content section
- `.kpi-card`: KPI/metrics cards
- `.chart-card`: Chart containers
- `.filters-card`: Filter section
- `.report-table`: Data table

## Examples

### Cancelled Members Report

The Cancelled Members Report demonstrates a complete implementation:

```jsx
// Located at: src/pages/reports/CancelledMembersReport.js
import ReportViewer from "../../component/common/ReportViewer";

function CancelledMembersReport() {
  return (
    <ReportViewer
      title="Cancelled Members Report"
      subtitle="Comprehensive analysis of cancelled membership data"
      data={filteredData}
      columns={columns}
      loading={loading}
      onRefresh={handleRefresh}
      onExportPDF={handleExportPDF}
      onExportExcel={handleExportExcel}
      onPrint={handlePrint}
      reportType="cancelled-members"
    >
      {/* Filters and dashboard content */}
    </ReportViewer>
  );
}
```

### Demo Page

A demo page is available at `/ReportViewerDemo` showcasing various features.

## Navigation

The report viewer is accessible through the sidebar navigation:

- **Reports** → **Cancelled Members Report**
- **Demo** → **Report Viewer Demo** (for testing)

## Dependencies

The component requires the following dependencies (already included):

- `antd`: UI component library
- `jsPDF`: PDF generation
- `jspdf-autotable`: PDF table formatting
- `xlsx`: Excel file generation
- `moment`: Date manipulation
- `recharts`: Chart components

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations

- Large datasets are handled with pagination
- Charts are rendered using ResponsiveContainer for optimal performance
- Export functions include error handling and loading states
- Print styles are optimized for ink-friendly output

## Troubleshooting

### Common Issues

1. **Export not working**: Ensure all required dependencies are installed
2. **Charts not rendering**: Check that data is properly formatted
3. **Print layout issues**: Verify print CSS is loaded correctly
4. **Performance issues**: Consider implementing data pagination for large datasets

### Debug Mode

Enable debug mode by adding `console.log` statements in custom functions to troubleshoot issues.

## Contributing

When extending the ReportViewer component:

1. Maintain backward compatibility
2. Add proper TypeScript types if converting to TypeScript
3. Include comprehensive tests
4. Update documentation
5. Follow the existing code style

## License

This component is part of the Membership Management System project.
