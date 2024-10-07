import React from 'react'
import { useTableColumns } from '../../context/TableColumnsContext '
import TableComponent from '../../component/common/TableComponent'
import { useLocation } from 'react-router-dom'

function Reports({screenName}) {
    const {gridData} = useTableColumns()
    const location = useLocation()
    console.log(location,"location")
     
  return (
    <TableComponent dataSource={gridData} screenName="Profile"   />
//    <h1>testing</h1>
  )
}

export default Reports