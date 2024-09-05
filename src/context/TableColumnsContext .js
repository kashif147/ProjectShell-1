import React, { createContext, useContext, useEffect, useState } from 'react';
import {tableData} from "../Data"

const TableColumnsContext = createContext();

export const TableColumnsProvider = ({ children }) => {
  const [ascending, setAscending] = useState(true); // State to toggle sort order
  const [columns, setColumns] = useState({ Profile: [
    { titleColumn: "RegNo", ellipsis: true, isVisible:true },
    { titleColumn: "Forename", ellipsis: true, isVisible:true },
    { titleColumn: "Surename", ellipsis: true, isVisible:true },
    { titleColumn: "FullName", ellipsis: true, isVisible:true },
    { titleColumn: "Rank", ellipsis: true, isVisible:true },
    { titleColumn: "Duty", ellipsis: true, isVisible:true },
    { titleColumn: "Station", ellipsis: true, isVisible:true },
    { titleColumn: "Distric", ellipsis: true, isVisible:true },
    { titleColumn: "Division", ellipsis: true, isVisible:true },
    { titleColumn: "Address", ellipsis: true, isVisible:true },
    { titleColumn: "Status", ellipsis: true, isVisible:true },
    { titleColumn: "Updated", ellipsis: true, isVisible:true },
    { titleColumn: "alpha", ellipsis: true, isVisible:false },
    { titleColumn: "beta", ellipsis: true, isVisible:false },
    { titleColumn: "giga", ellipsis: true, isVisible:false },
  ],
  Cases: [
    { titleColumn: "RegNo", ellipsis: true, isVisible:true },
    { titleColumn: "Name", ellipsis: true, isVisible:true },
    { titleColumn: "Rank", ellipsis: true, isVisible:true },
    { titleColumn: "Duty", ellipsis: true, isVisible:true },
    { titleColumn: "Station", ellipsis: true, isVisible:true },
    { titleColumn: "Distric", ellipsis: true, isVisible:true },
    { titleColumn: "Division", ellipsis: true, isVisible:true },
    { titleColumn: "Address", ellipsis: true, isVisible:true },
    { titleColumn: "Status", ellipsis: true, isVisible:true },
    { titleColumn: "Updated", ellipsis: true, isVisible:true },
    { titleColumn: "alpha", ellipsis: true, isVisible:false },
    { titleColumn: "beta", ellipsis: true, isVisible:false },
    { titleColumn: "giga", ellipsis: true, isVisible:false },
  ],
  Claims: [
    { titleColumn: "RegNo", ellipsis: true, isVisible:true },
    { titleColumn: "Name", ellipsis: true, isVisible:true },
    { titleColumn: "Rank", ellipsis: true, isVisible:true },
    { titleColumn: "Duty", ellipsis: true, isVisible:true },
    { titleColumn: "Station", ellipsis: true, isVisible:true },
    { titleColumn: "Distric", ellipsis: true, isVisible:true },
    { titleColumn: "Division", ellipsis: true, isVisible:true },
    { titleColumn: "Address", ellipsis: true, isVisible:true },
    { titleColumn: "Status", ellipsis: true, isVisible:true },
    { titleColumn: "Updated", ellipsis: true, isVisible:true },
    { titleColumn: "alpha", ellipsis: true, isVisible:false },
    { titleColumn: "beta", ellipsis: true, isVisible:false },
    { titleColumn: "giga", ellipsis: true, isVisible:false },
  ]

});

  const handleCheckboxFilterChange = (key, isChecked, screenName) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns?.[screenName].map(column => {
        if (column.titleColumn === key) {
          return { ...column, isVisible: isChecked };
        }
        return column;
      });

      return { ...prevColumns, [screenName]: updatedColumns };
    });
  };
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
    // setColumns(newColumns);
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
  const handleSort = () => {
    setAscending(!ascending); // Toggle the sorting order

    // Add your sorting logic here
    const sortedData = [...gridData].sort((a, b) => {
      if (ascending) {
        return a.Name.localeCompare(b.Name); // Ascending order
      } else {
        return b.Name.localeCompare(a.Name); // Descending order
      }
    });

    setGridData(sortedData); // Update the grid data after sorting
  };
console.log(columns,"khan")
  return (
    <TableColumnsContext.Provider value={{ columns, updateColumns, state, setState, updateState, isMale, gridData,handleCheckboxFilterChange }}>
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};
