import React, { createContext, useState, useContext } from 'react';
<<<<<<< HEAD
// Create the context
const SearchFilterContext = createContext();
=======

// Create the context
const SearchFilterContext = createContext();

>>>>>>> 5467c459a103614900edad65a508c0e705f8b4b2
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