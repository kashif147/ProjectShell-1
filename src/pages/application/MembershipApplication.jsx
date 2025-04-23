import React from 'react'
import { useTableColumns } from '../../context/TableColumnsContext '
import TableComponent from '../../component/common/TableComponent'


function MembershipApplication() {
       const{gridData} = useTableColumns()
  return (
    <div className='' style={{width:'95vw'}}>
    <TableComponent data={gridData}  screenName="Applications" />
    </div>
  )
}

export default MembershipApplication