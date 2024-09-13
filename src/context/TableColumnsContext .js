import React, { createContext, useContext, useEffect, useState } from "react";
import { tableData } from "../Data";

const TableColumnsContext = createContext();

export const TableColumnsProvider = ({ children }) => {
  const [ascending, setAscending] = useState(true); // State to toggle sort order
  const [columns, setColumns] = useState({
    Profile: [
      { titleColumn: "Reg No", ellipsis: true, isGride: true, width: "100px" },
      {
        titleColumn: "Forename",
        ellipsis: true,
        isGride: true,
        width: "120px",
      },
      { titleColumn: "Surname", ellipsis: true, isGride: true, width: "420px" },
      {
        titleColumn: "Full Name",
        ellipsis: true,
        isGride: true,
        width: "420px",
      },
      {
        titleColumn: "Date Of Birth",
        ellipsis: true,
        isGride: true,
        width: "420px",
      },
      {
        titleColumn: "Date Retired",
        ellipsis: true,
        isGride: true,
        width: "420px",
      },
      {
        titleColumn: "Date Aged 65",
        ellipsis: true,
        isGride: true,
        width: "420px",
      },
      {
        titleColumn: "Date Of Death",
        ellipsis: true,
        isGride: true,
        width: "420px",
      },
      { titleColumn: "Rank", ellipsis: true, isGride: true, width: "100px" },
      { titleColumn: "Duty", ellipsis: true, isGride: true, width: "100px" },
      { titleColumn: "Station", ellipsis: true, isGride: true, width: "100px" },
      {
        titleColumn: "Station ID",
        ellipsis: true,
        isGride: true,
        width: "100px",
      },
      {
        titleColumn: "Station Phone",
        ellipsis: true,
        isGride: true,
        width: "100px",
      },
      {
        titleColumn: "Pension No",
        ellipsis: true,
        isGride: true,
        width: "100px",
      },
      {
        titleColumn: "GRA Member",
        ellipsis: true,
        isGride: true,
        width: "100px",
      },
      {
        titleColumn: "Date Joined",
        ellipsis: true,
        isGride: true,
        width: "100px",
      },
      {
        titleColumn: "Date Left",
        ellipsis: true,
        isGride: true,
        width: "100px",
      },
      {
        titleColumn: "Associate Member",
        ellipsis: true,
        isGride: true,
        width: "100px",
      },
      {
        titleColumn: "District",
        ellipsis: true,
        isGride: true,
        width: "100px",
      },
      {
        titleColumn: "Division",
        ellipsis: true,
        isGride: true,
        width: "100px",
      },
      { titleColumn: "Address", ellipsis: true, isGride: true, width: "250px" },
      { titleColumn: "Status", ellipsis: true, isGride: true, width: "100px" },
      { titleColumn: "Updated", ellipsis: true, isGride: true, width: "100px" },
    ],
    Cases: [
      { titleColumn: "Reg No", ellipsis: true, isGride: true, width: "100px" },
      {
        titleColumn: "Full Name",
        ellipsis: true,
        isGride: true,
        width: "420px",
      },
      { titleColumn: "Name", ellipsis: true, isGride: true, width: "100px" },
      { titleColumn: "Rank", ellipsis: true, isGride: true, width: "120px" },
      { titleColumn: "Duty", ellipsis: true, isGride: true, width: "120px" },
      { titleColumn: "Station", ellipsis: true, isGride: true, width: "120px" },
      { titleColumn: "Distric", ellipsis: true, isGride: true, width: "120px" },
      {
        titleColumn: "Division",
        ellipsis: true,
        isGride: true,
        width: "120px",
      },
      { titleColumn: "Address", ellipsis: true, isGride: true, width: "120px" },
      { titleColumn: "Status", ellipsis: true, isGride: true, width: "120px" },
      { titleColumn: "Updated", ellipsis: true, isGride: true, width: "120px" },
      { titleColumn: "alpha", ellipsis: true, isGride: false, width: "100px" },
      { titleColumn: "beta", ellipsis: true, isGride: false, width: "100px" },
      { titleColumn: "giga", ellipsis: true, isGride: false, width: "100px" },
    ],
    Claims: [
      { titleColumn: "Reg No", ellipsis: true, isGride: true, width: 120 },
      {
        titleColumn: "Full Name",
        ellipsis: true,
        isGride: true,
        width: "420px",
      },
      { titleColumn: "Name", ellipsis: true, isGride: true, width: 120 },
      { titleColumn: "Rank", ellipsis: true, isGride: true, width: 120 },
      { titleColumn: "Duty", ellipsis: true, isGride: true, width: 120 },
      { titleColumn: "Station", ellipsis: true, isGride: true, width: 120 },
      { titleColumn: "Distric", ellipsis: true, isGride: true, width: 120 },
      { titleColumn: "Division", ellipsis: true, isGride: true, width: 120 },
      { titleColumn: "Address", ellipsis: true, isGride: true, width: 120 },
      { titleColumn: "Status", ellipsis: true, isGride: true, width: 120 },
      { titleColumn: "Updated", ellipsis: true, isGride: true, width: 120 },
      { titleColumn: "alpha", ellipsis: true, isGride: false, width: 100 },
      { titleColumn: "beta", ellipsis: true, isGride: false, width: 100 },
      { titleColumn: "giga", ellipsis: true, isGride: false, width: 100 },
    ],
  });
  const [searchFilters, setsearchFilters] = useState([{ titleColumn: "Reg No", isSearch: false },
    { titleColumn: "Forename", isSearch: false,
     lookups:{ Male: false,
      Female: false,
      Other: false,}
     },
    { titleColumn: "Surname", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,}, },
    { titleColumn: "Full Name", isSearch: false ,lookups:{ Male: false,
      Female: false,
      Other: false,}}, // Important (4)
    { titleColumn: "Date Of Birth", isSearch: false ,lookups:{ Male: false,
      Female: false,
      Other: false,}}, // Important (5)
    { titleColumn: "Date Retired", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Date Aged 65", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Date Of Death", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Rank", isSearch: true,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Duty", isSearch: true,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Station", isSearch: true,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Station ID", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Station Phone", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Pension No", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "GRA Member", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Date Joined", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Date Left", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Associate Member", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "District", isSearch: true,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Division", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Address", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Status", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },
    { titleColumn: "Updated", isSearch: false,lookups:{ Male: false,
      Female: false,
      Other: false,} },]);

  const handleCheckboxFilterChange = (key, isChecked, screenName, width) => {
    setColumns((prevColumns) => {
      const updatedColumns = prevColumns?.[screenName].map((column) => {
        if (column.titleColumn === key) {
          return { ...column, isGride: isChecked, width: width };
        }
        return column;
      });

      return { ...prevColumns, [screenName]: updatedColumns };
    });
  };
  const updateSelectedTitles = (title, isChecked) => {
    setsearchFilters((prevProfile) => {
      return prevProfile.map((item) => {
        if (item.titleColumn === title) {
          return { ...item, isSearch: isChecked }; // Update isSearch based on isChecked
        }
        return item;
      });
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
    return data.filter(
      (item) => item.Gender.toLowerCase() === gender.toLowerCase()
    );
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
    <TableColumnsContext.Provider
      value={{
        columns,
        updateColumns,
        state,
        setState,
        updateState,
        isMale,
        gridData,
        handleCheckboxFilterChange,
        searchFilters,
        updateSelectedTitles,
      }}
    >
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};
