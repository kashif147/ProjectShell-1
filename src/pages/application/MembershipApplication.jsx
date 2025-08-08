import React, { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TableComponent from '../../component/common/TableComponent'
import { getAllApplications } from '../../features/ApplicationSlice';
import MultiFilterDropdown from '../../component/common/MultiFilterDropdown';
import { Spin} from 'antd';


function MembershipApplication() {
    const dispatch = useDispatch();
    const { applications, applicationsLoading } = useSelector((state) => state.applications);

    useEffect(() => {
    dispatch(getAllApplications("submitted"));
  }, [dispatch]);
  console.log(applications,"ptdc")
 
  return (
    <div className='' style={{width:'95vw'}}>

    <TableComponent data={applications}  screenName="Applications" isGrideLoading={applicationsLoading} />
 <div style={{ display: "flex", gap: 12 }}>
        
      {/* <MultiFilterDropdown
        label="Division"
        options={["North", "South", "East", "West"]}
        selectedValues={divisionFilter}
        onChange={setDivisionFilter}
      /> */}
    </div>
    </div>
  )
}

export default MembershipApplication