import React, { createContext, useContext, useState } from 'react';

const TableColumnsContext = createContext();

export const TableColumnsProvider = ({ children }) => {
  const [columns, setColumns] = useState([]); // Initialize as an empty array

  const updateColumns = (newColumns) => {
    setColumns(newColumns);
  };

  return (
    <TableColumnsContext.Provider value={{ columns, updateColumns }}>
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};
