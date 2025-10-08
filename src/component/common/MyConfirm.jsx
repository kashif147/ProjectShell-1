import { Modal } from "antd";

const MyConfirm = ({ title, message, onConfirm }) => {
  Modal.confirm({
    title: title || "Confirm",
    content: message || "Are you sure?",
    okText: "Yes",
    cancelText: "No",
    onOk: onConfirm,
    onCancel: () => Modal.destroyAll(),
    okButtonProps: {
      className: "custom-confirm-ok-button",
    },
    cancelButtonProps: {
      style: { color: "#000" },
    },
    // 👇 this moves modal to bottom-center
    style: {
      top: "auto",
      bottom: "40px", // distance from bottom
      margin: "0 auto",
    },
    className: "custom-bottom-modal", // optional if you want to add more CSS
  });
};
export default MyConfirm;