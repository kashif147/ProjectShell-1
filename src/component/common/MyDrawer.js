import React from 'react'
import { Button, Drawer, Space } from 'antd';

function MyDrawer({title,open,onClose,children,add}) {
  return (
    <Drawer
    width={520}
    title={title}
    placement="right"

    // size={size}
    onClose={onClose}
    open={open}
    extra={
      <Space>
        <Button className="butn btn-border" onClick={onClose}>Close</Button>

        <Button className="gray-btn butn" onClick={add}>
          Add
        </Button>
      </Space>
    }
  >
    {children}
  </Drawer>
  )
}

export default MyDrawer
