import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TableComponent from "../../component/common/TableComponent";
import { getAllApplications } from "../../features/ApplicationSlice";
import MultiFilterDropdown from "../../component/common/MultiFilterDropdown";
import { Spin } from "antd";
import { useFilters } from "../../context/FilterContext";
function MembershipApplication() {
  const dispatch = useDispatch();
   const { filtersState } = useFilters();
  const { applications, applicationsLoading } = useSelector(
    (state) => state.applications
  );
useEffect(()=>{
  dispatch(getAllApplications(filtersState))
},[])
  // useEffect(() => {
  //   const relevantFilters = ['Application Status', 'Membership Category'];
  //   const hasRelevantFilters = relevantFilters.some(
  //     filter => filtersState[filter]?.selectedValues?.length > 0
  //   );

  //   if (hasRelevantFilters) {
  //     const apiParams = [];
      
  //     if (filtersState['Application Status']?.selectedValues?.length > 0) {
  //       const statusParams = filtersState['Application Status'].selectedValues.map(
  //         status => status.toLowerCase().replace('-', '')
  //       );
  //       apiParams.push(...statusParams);
  //     }
      
  //     if (filtersState['Membership Category']?.selectedValues?.length > 0) {
  //       const categoryParams = filtersState['Membership Category'].selectedValues.map(
  //         category => category.toLowerCase()
  //       );
  //       apiParams.push(...categoryParams);
  //     }
      
  //     // dispatch(getAllApplications(apiParams));
  //   } else {
  //     // dispatch(getAllApplications());
  //   }
  // }, [filtersState, dispatch]);
  console.log(applications, "ptdc");

  return (
    <div className="" style={{ width: "100%" }}>
      <TableComponent
        data={applications}
        screenName="Applications"
        isGrideLoading={applicationsLoading}
      />
      <div style={{ display: "flex", gap: 12 }}>
        {/* <MultiFilterDropdown
        label="Division"
        options={["North", "South", "East", "West"]}
        selectedValues={divisionFilter}
        onChange={setDivisionFilter}
      /> */}
      </div>
    </div>
  );
}

export default MembershipApplication;
