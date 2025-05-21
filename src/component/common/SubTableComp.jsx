import { Table } from 'antd';

function SubTableComp({ columns, dataSource }) {
  return (
    <Table bordered scroll={{ x: 'max-content' }} dataSource={dataSource} columns={columns} pagination={false} className='claims-table' />
  )
}

export default SubTableComp