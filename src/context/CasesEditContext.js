import React, { createContext, useState, useContext, useRef } from "react";

const CasesEditContext = createContext(null);

export const CasesEditProvider = ({ children }) => {
  const [editFieldsDrawerOpen, setEditFieldsDrawerOpen] = useState(false);
  const [selectedCaseRows, setSelectedCaseRows] = useState([]);
  const applyCasesUpdateRef = useRef(() => {});

  const value = {
    editFieldsDrawerOpen,
    setEditFieldsDrawerOpen,
    selectedCaseRows,
    setSelectedCaseRows,
    applyCasesUpdateRef,
  };

  return (
    <CasesEditContext.Provider value={value}>
      {children}
    </CasesEditContext.Provider>
  );
};

export const useCasesEdit = () => {
  const ctx = useContext(CasesEditContext);
  return ctx;
};
