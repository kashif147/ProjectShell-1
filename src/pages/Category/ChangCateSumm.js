
import React from 'react'
import TableComponent from '../../component/common/TableComponent'
import { useTableColumns } from '../../context/TableColumnsContext '
function ChangCateSumm() {
          const{gridData} = useTableColumns()
  return (
    <div className='' style={{width:'95vw'}}>
    <TableComponent data={gridData}  screenName="ChangCateSumm" />
    </div>
  )
}

export default ChangCateSumm