// MyConfirm.js
import { Popconfirm, Button } from "antd";

const MyConfirm = ({ title, message, onConfirm, children }) => {
  return (
    <Popconfirm
      title={title || "Confirm"}
      description={message || "Are you sure?"}
      onConfirm={onConfirm}
      okText="Yes"
      cancelText="No"
    >
      {children || <Button danger>Delete123</Button>}
    </Popconfirm>
  );
};

export default MyConfirm;
