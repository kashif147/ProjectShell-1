import React from 'react';

const ExportCSV = ({ data, filename, metadata }) => {
  const convertToCSV = (data) => {
    let csvString = "";

    // Prepend metadata if provided
    if (metadata && Array.isArray(metadata)) {
      metadata.forEach(line => {
        // Simple escaping for metadata line if it contains commas, 
        // though usually metadata lines are single strings.
        csvString += line.includes(',') ? `"${line.replace(/"/g, '""')}"` : line;
        csvString += "\n";
      });
      csvString += "\n"; // Empty line between metadata and table
    }

    if (data && data.length > 0) {
      const header = Object.keys(data[0]).join(",") + "\n"; // Create CSV header
      const rows = data.map(row =>
        Object.values(row).map(val => {
          const str = val === null || val === undefined ? "" : String(val);
          // Standard CSV escaping: surround with quotes and double existing quotes
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(",")
      ).join("\n"); // Create CSV rows
      csvString += header + rows;
    }

    return csvString;
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <button className='transparent-bg' onClick={downloadCSV}>
      Export as excel
    </button>
  );
};

export default ExportCSV;
