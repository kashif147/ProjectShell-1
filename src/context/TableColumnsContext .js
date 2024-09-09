import React, { createContext, useContext, useEffect, useState } from 'react';
import {tableData} from "../Data"

const TableColumnsContext = createContext();

export const TableColumnsProvider = ({ children }) => {
  const [ascending, setAscending] = useState(true); // State to toggle sort order
  const [columns, setColumns] = useState({ Profile: [
    { titleColumn: "Reg No", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Forename", ellipsis: true, isVisible:true,width:"120px" },
    { titleColumn: "Surename", ellipsis: true, isVisible:true,width:"420px" },
    { titleColumn: "Full Name", ellipsis: true, isVisible:true,width:"420px" },
    { titleColumn: "Date Of Birth", ellipsis: true, isVisible:true,width:"420px" },
    { titleColumn: "Date Retired", ellipsis: true, isVisible:true,width:"420px" },
    { titleColumn: "Date Aged 65", ellipsis: true, isVisible:true,width:"420px" },
    { titleColumn: "Date Of Death", ellipsis: true, isVisible:true,width:"420px" },
    { titleColumn: "Rank", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Duty", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Station", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Station ID", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Station Phone", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Pension No", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "GRA Member", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Date Joined", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Date Left", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Associate Member", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "District", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Division", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Address", ellipsis: true, isVisible:true,width:"250px" },
    { titleColumn: "Status", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Updated", ellipsis: true, isVisible:true,width:"100px" },
  ],
  Cases: [
    { titleColumn: "Reg No", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Full Name", ellipsis: true, isVisible:true,width:"420px" },
    { titleColumn: "Name", ellipsis: true, isVisible:true,width:"100px" },
    { titleColumn: "Rank", ellipsis: true, isVisible:true,width:"120px" },
    { titleColumn: "Duty", ellipsis: true, isVisible:true,width:"120px" },
    { titleColumn: "Station", ellipsis: true, isVisible:true,width:"120px" },
    { titleColumn: "Distric", ellipsis: true, isVisible:true,width:"120px" },
    { titleColumn: "Division", ellipsis: true, isVisible:true,width:"120px" },
    { titleColumn: "Address", ellipsis: true, isVisible:true,width:"120px" },
    { titleColumn: "Status", ellipsis: true, isVisible:true,width:"120px" },
    { titleColumn: "Updated", ellipsis: true, isVisible:true,width:"120px" },
    { titleColumn: "alpha", ellipsis: true, isVisible:false,width:"100px" },
    { titleColumn: "beta", ellipsis: true, isVisible:false,width:"100px" },
    { titleColumn: "giga", ellipsis: true, isVisible:false,width:"100px" },
  ],
  Claims: [
    { titleColumn: "Reg No", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "Full Name", ellipsis: true, isVisible:true,width:"420px" },
    { titleColumn: "Name", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "Rank", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "Duty", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "Station", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "Distric", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "Division", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "Address", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "Status", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "Updated", ellipsis: true, isVisible:true,width:120 },
    { titleColumn: "alpha", ellipsis: true, isVisible:false,width:100 },
    { titleColumn: "beta", ellipsis: true, isVisible:false,width:100 },
    { titleColumn: "giga", ellipsis: true, isVisible:false,width:100 },
  ]

});

  const handleCheckboxFilterChange = (key, isChecked, screenName,width) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns?.[screenName].map(column => {
        if (column.titleColumn === key) {
          return { ...column, isVisible: isChecked, width:width };
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

  return (
    <TableColumnsContext.Provider value={{ columns, updateColumns, state, setState, updateState, isMale, gridData,handleCheckboxFilterChange }}>
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};
