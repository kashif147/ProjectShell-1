import { Table } from 'antd';

function SubTableComp({ columns, dataSource }) {
  return (
    <Table style={{marginLeft:'34px',marginRight:'34px'}} rowKey="key" bordered scroll={{ x: 'max-content' }} dataSource={dataSource} columns={columns} pagination={false} className='claims-table' />
  )
}

export default SubTableComp