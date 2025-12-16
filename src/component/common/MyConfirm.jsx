import { Modal } from "antd";

const MyConfirm = ({ title, message, onConfirm }) => {
  const modal = Modal.confirm({
    title: title || "Confirm",
    content: message || "Are you sure?",
    okText: "Yes",
    cancelText: "No",
    
    // Add loading state management
    okButtonProps: {
      className: "custom-confirm-ok-button",
      // Remove loading: true here if it exists
    },
    
    onOk: async () => {
      try {
        if (typeof onConfirm === "function") {
          await onConfirm();
        }
        // Modal will close automatically after onOk resolves
        return Promise.resolve();
      } catch (error) {
        // If error is thrown, modal stays open (Ant Design behavior)
        return Promise.reject(error);
      }
    },
    
    onCancel: () => {
      Modal.destroyAll();
    },
    
    // Your existing styles
    style: {
      top: "auto",
      bottom: "40px",
      margin: "0 auto",
    },
    className: "custom-bottom-modal",
  });
  
  return modal;
};
export default MyConfirm;