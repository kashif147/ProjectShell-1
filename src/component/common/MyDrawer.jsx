import React from "react";
import { Button, Drawer, Space, Pagination } from "antd";

function MyDrawer({ title, open, onClose, children, add, width = 820, isHeader = false, isPagination = false,total }) {
  const onChange = (pageNumber) => {
    console.log('Page: ', pageNumber);
  };
  return (
    <Drawer
      width={width}
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button className="butn secoundry-btn" onClick={onClose}>
            Close
          </Button>
          <Button className="butn primary-btn" onClick={add}>
            Add
          </Button>
        </Space>
      }
    >
      <div className="">
        {children}
        {
          isPagination &&
          (
            <div className="d-flex justify-content-center align-items-baseline">
              Total Items: <Pagination showQuickJumper defaultCurrent={1} total={total} onChange={onChange} />
            </div>
          )
        }
      </div>

    </Drawer>
  );
}

export default MyDrawer;
