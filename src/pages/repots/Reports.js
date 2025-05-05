import React from 'react'
import { useTableColumns } from '../../context/TableColumnsContext '
import TableComponent from '../../component/common/TableComponent'


function Reports({screenName}) {
    const {gridData} = useTableColumns()
     
  return (
    <TableComponent data={gridData} screenName="Profile"   />
//    <h1>testing</h1>
  )
}

export default Reports