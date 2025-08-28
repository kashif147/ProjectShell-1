import React, { createContext, useContext, useState } from "react";

// Create Context
const ViewContext = createContext();

// Provider
export const ViewProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState("grid"); // "card" | "grid"

  const toggleView = () => {
    setViewMode((prev) => (prev === "card" ? "grid" : "card"));
  };

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode, toggleView }}>
      {children}
    </ViewContext.Provider>
  );
};

// Hook for easier usage
export const useView = () => useContext(ViewContext);
