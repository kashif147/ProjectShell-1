// MyAlert.js
import { notification } from "antd";

const MyAlert = (type, message, description) => {
  // Ensure `type` is valid: success, error, info, warning
  if (!["success", "error", "info", "warning"].includes(type)) {
    
    return;
  }

  notification[type]({
    message,
    description,
    placement: "topRight",
  });
};

export default MyAlert;
