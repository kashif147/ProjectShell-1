import React, { createContext, useContext, useState } from "react";

// Create Context
const ViewContext = createContext();

// Provider
export const ViewProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState({Cancallation:"grid",reminder:"grid"}); // "card" | "grid"

const toggleView = (key) => {
  setViewMode((prev) => ({
    ...prev,
    [key]: prev[key] === "card" ? "grid" : "card",
  }));
};
  return (
    <ViewContext.Provider value={{ viewMode, setViewMode, toggleView }}>
      {children}
    </ViewContext.Provider>
  );
};

// Hook for easier usage
export const useView = () => useContext(ViewContext);
