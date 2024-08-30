import React, { createContext, useState, useContext } from 'react';

const SearchFilterContext = createContext();

export const SearchFilterProvider = ({ children }) => {
  const [trueKeys, setTrueKeys] = useState([]);
  const [checkboxes, setCheckboxes] = useState({})
  const checkGenderCondition = (state) => {
    const genderState = state.Gender;
    if (genderState?.selectedOption === "=" && genderState.checkboxes["Male"]) {
      return true; // Indication that the condition is met
    }
    return false; // Condition not met
  };
  const isMale =checkGenderCondition(state)
  const filterByGender = (data, gender) => {
    return data.filter(item => item.Gender.toLowerCase() === gender.toLowerCase());
  };
  

  return (
    <>
    <SearchFilterContext.Provider value={{ trueKeys, setTrueKeys,checkboxes, setCheckboxes }}>
      {children}
    </SearchFilterContext.Provider>
    </>
  );
};


export const useSearchFilters = () => useContext(SearchFilterContext);
