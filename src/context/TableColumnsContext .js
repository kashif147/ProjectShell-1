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
  const [searchFilters, setsearchFilters] = useState([
    {
      titleColumn: "Rank",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp:"!="
    },
    {
      titleColumn: "Duty",
      isSearch: true,

      isCheck: false,
      lookups: { "All Duties": false },
    },
    {
      titleColumn: "Division",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,

      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,

      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner ",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },

    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,

      lookups: { Male: false, Female: false, Other: false },
    },
  ]);

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

  const updateLookupValue = (titleColumn, gender, value) => {
    setsearchFilters((prevFilters) =>
      prevFilters.map((filter) => {
        // Find the filter by the titleColumn
        if (filter.titleColumn === titleColumn) {
          return {
            ...filter,
            // Update the lookups for the specified gender
            lookups: {
              ...filter.lookups,
              [gender]: value,
            },
          };
        }
        // Return the unchanged filter if the titleColumn doesn't match
        return filter;
      })
    );
  };

  const [gridData, setGridData] = useState(tableData);
  const filterGridDataFtn = (columnName, value, comp) => {
    if(value=="All Ranks" && comp=="="){
      return setGridData(tableData)
    }
    if(value=="All Ranks" && comp=="!=" ){
      return setGridData([])
    }
    if (columnName !== "" && value !== "" && comp) {
      const filteredData = tableData.filter((row) => {
        const cellValue = row[columnName]?.toString().toLowerCase();

        switch (comp) {
          case "=":
            return cellValue === value.toLowerCase();
          case "!=":
            return cellValue !== value.toLowerCase();
          default:
            return false;
        }
      });
      setGridData(filteredData);
    } else {
      setGridData(tableData);
    }
  };
  const handleCompChang = (title,value) => {
    setsearchFilters((prevProfile) => {
      return prevProfile.map((item) => {
        if (item?.titleColumn === title) {
          return { ...item, comp: value }; // Update isSearch based on isChecked
        }
        return item;
      });
    });
    filterGridDataFtn()
  };
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
  useEffect(() => {
    setsearchFilters((prevFilters) =>
      prevFilters.map((item) => {
        const updatedItem = { ...item };
        if (updatedItem.lookups) {
          const hasTrueValue = Object.values(updatedItem.lookups).some(
            (value) => value === true
          );
          updatedItem.isCheck = hasTrueValue;
        }
        return updatedItem;
      })
    );
  }, [searchFilters]);
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
        updateLookupValue,
        filterGridDataFtn,
        handleCompChang
      }}
    >
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};
