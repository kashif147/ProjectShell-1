import React, { createContext, useState, useContext } from 'react';

// Create the context
const SelectedIdsContext = createContext();

// Create the provider component
export const SelectedIdsProvider = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  return (
    <SelectedIdsContext.Provider value={{ selectedIds, setSelectedIds }}>
      {children}
    </SelectedIdsContext.Provider>
  );
};

// Custom hook to use the context
export const useSelectedIds = () => {
  const context = useContext(SelectedIdsContext);
  if (!context) {
    throw new Error('useSelectedIds must be used within a SelectedIdsProvider');
  }
  return context;
};