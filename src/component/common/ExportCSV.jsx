import React from 'react';

const ExportCSV = ({ data, filename }) => {
  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(",") + "\n"; // Create CSV header
    const rows = data.map(row => Object.values(row).join(",")).join("\n"); // Create CSV rows
    return header + rows;
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
      Export as CSV
    </button>
  );
};

export default ExportCSV;
