import React, { createContext, useState } from "react";

// Create the context
export const ExcelContext = createContext();

// Create the provider
export const ExcelProvider = ({ children }) => {
  const [excelData, setExcelData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [batchTotals, setBatchTotals] = useState({
    arrears: 0,
    current: 0,
    advance: 0,
    total: 0,
    records: 0,
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isCreatePayment, setIsCreatePayment] = useState(false); // ✅ New state added

  return (
    <ExcelContext.Provider
      value={{
        excelData,
        setExcelData,
        selectedRowData,
        setSelectedRowData,
        selectedRowIndex,
        setSelectedRowIndex,
        batchTotals,
        setBatchTotals,
        uploadedFile,
        setUploadedFile,
        isCreatePayment,
        setIsCreatePayment, // ✅ Expose setter
      }}
    >
      {children}
    </ExcelContext.Provider>
  );
};
