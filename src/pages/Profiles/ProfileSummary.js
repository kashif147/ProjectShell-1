import React from "react";
import {useTableColumns} from "../../context/TableColumnsContext "
import TableComponent from "../../component/common/TableComponent";
function ProfileSummary() {
  const{gridData} = useTableColumns()
 

  return (
    <div className="" style={{width:'95vw'}}>
    <TableComponent data={gridData}  screenName="Profile" redirect="/Details" />
    </div>
  );
}
export default ProfileSummary;