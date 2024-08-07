import React from 'react'
import { Button, Drawer, Space } from 'antd';

function MyDrawer({title,open,onClose,}) {
  return (
    <Drawer
    title={title}
    placement="right"
    // size={size}
    onClose={onClose}
    open={open}
    extra={
      <Space>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={onClose}>
          OK
        </Button>
      </Space>
    }
  >
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </Drawer>
  )
}

export default MyDrawer
