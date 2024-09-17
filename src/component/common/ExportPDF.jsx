import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import autoTable plugin

const ExportPDF = ({ data, filename }) => {
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape', // Landscape for wider tables
    });

    // Define table headers (based on keys of the first data object)
    const headers = [Object.keys(data[0])];

    // Define the data rows (each row is an array of the object values)
    const rows = data.map(item => Object.values(item));

    // Add the autoTable with headers and rows
    doc.autoTable({
      startY: 20, // Starting position of the table
      head: headers,
      body: rows,
      margin: { top: 20 },
      theme: 'grid', // Optional: use 'grid' to create a more defined table style
      styles: { fontSize: 8 }, // Smaller font size to fit more content
      tableWidth: 'wrap', // Ensure table width wraps automatically
      columnStyles: {
        0: { cellWidth: 30 }, // Adjust this based on your data
        1: { cellWidth: 20 },
        // Add more column-specific adjustments here if needed
      },
      headStyles: {
        fillColor: [41, 128, 185], // Header background color
        textColor: [255, 255, 255], // Header text color
        halign: 'center', // Center align header text
      },
      bodyStyles: {
        cellPadding: 2, // Padding for each cell
        valign: 'middle', // Vertically align content in the middle of the cell
        halign: 'center', // Horizontally align text in cells to center
      },
      didDrawPage: (data) => {
        doc.setFontSize(16);
        doc.text('Exported Data', 14, 16); // Add title to the page
      },
      pageBreak: 'auto', // Automatically create new pages for long tables
      horizontalPageBreak: true, // Enable horizontal page breaks for wide tables
    });

    // Save the PDF with a given filename
    doc.save(filename || 'data.pdf');
  };

  return (
    <button onClick={downloadPDF}>
      Export as PDF
    </button>
  );
};

export default ExportPDF;
