import React, { createContext, useContext, useEffect, useState } from "react";
import { tableData } from "../Data";

const TableColumnsContext = createContext();

export const TableColumnsProvider = ({ children }) => {
  const [ascending, setAscending] = useState(true);
  const handleSaveAfterEdit = (row) => {
    const newData = [...gridData];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      setGridData(newData);
    }
  };
  // State to toggle sort order
  const [columns, setColumns] = useState({
    Profile: [
      { dataIndex: "regNo", title: "Reg No", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true, },
      { dataIndex: "fullName", title: "Full Name", ellipsis: true, isGride: true, isVisible: true, width: 200 },
      { dataIndex: "rank", title: "Rank", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "station", title: "Station", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "distric", title: "District", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "division", title: "Division", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "address", title: "Address", ellipsis: true, isGride: true, isVisible: true, width: 200 },
      { dataIndex: "duty", title: "Duty", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "forename", title: "Forename", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true, },
      { dataIndex: "surname", title: "Surname", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true },
      { dataIndex: "dob", title: "Date Of Birth", ellipsis: true, isGride: false, isVisible: true, width: 150 },
      { dataIndex: "dateRetired", title: "Date Retired", ellipsis: true, isGride: true, isVisible: true, width: 200 },
      { dataIndex: "dateAged65", title: "Date Aged 65", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "dateOfDeath", title: "Date Of Death", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "stationID", title: "Station ID", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "stationPhone", title: "Station Phone", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "pensionNo", title: "Pension No", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "graMember", title: "GRA Member", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "dateJoined", title: "Date Joined", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "dateLeft", title: "Date Left", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "associateMember", title: "Associate Member", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "status", title: "Status", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "updated", title: "Updated", ellipsis: true, isGride: true, isVisible: true, width: 150 },
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
      comp: "!="
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, "Sargent": false, "Garda": false },
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
const updateCompByTitleColumn = (titleColumn, newComp) => {
  // Update the searchFilters state by mapping over the current array
  setsearchFilters((prevFilters) =>
    prevFilters.map((filter) => {
      // If the titleColumn matches, update the 'comp' value
      if (filter.titleColumn === titleColumn) {
        return { ...filter, comp: newComp }; // Spread the filter and update 'comp'
      }
      return filter; // Return the filter unchanged if titleColumn doesn't match
    })
  );
};
  const handleCheckboxFilterChange = (key, isChecked, screenName, width, e) => {
    e.stopPropagation()
    setColumns((prevColumns) => {
      const updatedColumns = prevColumns?.[screenName].map((column) => {
        if (column.title === key) {
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
    if (value == "All Ranks" && comp == "=") {
      return setGridData(tableData)
    }
    if (value == "All Ranks" && comp == "!=") {
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
  const handleCompChang = (title, value) => {
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
  // useEffect(() => {
  //   setsearchFilters((prevFilters) =>
  //     prevFilters.map((item) => {
  //       const updatedItem = { ...item };
  //       if (updatedItem.lookups) {
  //         const hasTrueValue = Object.values(updatedItem.lookups).some(
  //           (value) => value === true
  //         );
  //         updatedItem.isCheck = hasTrueValue;
  //       }
  //       return updatedItem;
  //     })
  //   );
  // }, [searchFilters]);
  const filterGridDataBasedOnLookups = (data, searchFilters) => {
    let filteredData = data; // Start with the full dataset
  
    // Iterate through each filter criteria in searchFilters
    searchFilters?.forEach(({ titleColumn, lookups, comp }) => {
      // Get the keys from lookups where the value is true
      const trueKeys = Object.entries(lookups)
        .filter(([key, value]) => value) // Only keep entries where value is true
        .map(([key]) => key); // Get the keys of those true values
  debugger
      // If there are true keys for this titleColumn, filter the data
      if (trueKeys.length > 0) {
        filteredData = filteredData.filter((row) => {
          const cellValue = row[titleColumn]?.toString().toLowerCase(); // Get the cell value in lowercase
  
          // Based on the comparison operator (comp), filter the data
          if (comp === "=") {
            return trueKeys.includes(cellValue); // Check if the cell value matches any of the trueKeys
          } else if (comp === "!=") {
            return !trueKeys.includes(cellValue); // Exclude rows where the cell value matches trueKeys
          }
  
          return false; // Default fallback if no valid comparison
        });
      }
    });
  
    return filteredData; // Return the filtered dataset
  };

  const getFiltersWithTrueLookups = (filters) => {
    return filters
      .filter((filter) => {
        // Check if any lookup has a true value
        return Object.values(filter.lookups).some((value) => value === true);
      })
      .map((filter) => ({
        titleColumn: filter.titleColumn,
        isSearch: filter.isSearch,
        isCheck: filter.isCheck,
        lookups: filter.lookups,
        comp: filter.comp,
      }));
  };
  const yy = getFiltersWithTrueLookups(searchFilters)
  

  const filterData = () => {
    return tableData?.filter(item => {
        return yy?.every(filter => {
            const { titleColumn, lookups, comp } = filter;
            const itemValue = item[titleColumn.toLowerCase()]; // Adjust case to match your data
            
            // Check the condition based on 'comp'
            if (comp === '=') {
                // Return true if the itemValue is in lookups
                return lookups[itemValue] === true;
            } else if (comp === '!=') {
                // Return true if the itemValue is not in lookups
                return lookups[itemValue] !== true;
            }
            
            // Fallback case if comp is neither '=' nor '!='
            return false;
        });
    });
};


useEffect(() => {
  const result = filterData();
  setGridData(result);
}, [searchFilters]); // Re-run when gridData or filters change

  return (

    <TableColumnsContext.Provider
      value={{
        columns,
        updateColumns,
        state,
        setState,
        updateState,
        gridData,
        handleCheckboxFilterChange,
        searchFilters,
        updateSelectedTitles,
        updateLookupValue,
        filterGridDataFtn,
        handleCompChang,
        setGridData,
        updateCompByTitleColumn

      }}
    >
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};
