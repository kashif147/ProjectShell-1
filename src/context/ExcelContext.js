import React, { createContext, useState } from 'react';

// Create the context
export const ExcelContext = createContext();

// Create the provider
export const ExcelProvider = ({ children }) => {
  const [excelData, setExcelData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  return (
    <ExcelContext.Provider value={{ excelData, setExcelData ,        
        selectedRowData,
        setSelectedRowData,
        selectedRowIndex,
        setSelectedRowIndex,}}>
      {children}
    </ExcelContext.Provider>
  );
};
