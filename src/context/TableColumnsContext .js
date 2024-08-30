import React, { createContext, useContext, useEffect, useState } from 'react';
import {tableData} from "../Data"

const TableColumnsContext = createContext();

export const TableColumnsProvider = ({ children }) => {
  const [columns, setColumns] = useState([]);
  const [gridData, setGridData] = useState(tableData);
  
  const [state, setState] = useState({
    selectedOption: "!=",
    checkboxes: {},
  });

  const updateState = (key, newState) => {
    setState((prevState) => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        ...newState,
      },
    }));
  };

  const updateColumns = (newColumns) => {
    setColumns(newColumns);
  };

  const checkGenderCondition = (state) => {
    const genderState = state.Gender;
    if (genderState?.selectedOption === "=" && genderState.checkboxes["Male"]) {
      return true; // Condition met
    }
    return false; // Condition not met
  };

  const isMale = checkGenderCondition(state);

  const filterByGender = (data, gender) => {
    return data.filter(item => item.Gender.toLowerCase() === gender.toLowerCase());
  };

  useEffect(() => {
    if (isMale) {
      const filteredData = filterByGender(tableData, "Male");
      setGridData(filteredData); // Update gridData with the filtered data
    } else {
      setGridData(tableData); // Reset gridData if the condition isn't met
    }
  }, [isMale]);

  return (
    <TableColumnsContext.Provider value={{ columns, updateColumns, state, setState, updateState, isMale, gridData }}>
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};
