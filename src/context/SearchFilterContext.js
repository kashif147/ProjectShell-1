import React, { createContext, useState, useContext } from 'react';

// Create the context
const SearchFilterContext = createContext();

// Create the provider component
export const SearchFilterProvider = ({ children }) => {
  const [trueKeys, setTrueKeys] = useState([]);

  return (
    <>
    <SearchFilterContext.Provider value={{ trueKeys, setTrueKeys }}>
      {children}
    </SearchFilterContext.Provider>
    </>
  );
};

// Custom hook to use the context
export const useSearchFilters = () => useContext(SearchFilterContext);