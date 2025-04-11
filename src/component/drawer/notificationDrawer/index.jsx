import React from "react";
import { Drawer, Button, Space, Spin } from "antd";
import {
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineWarning,
  AiOutlineSync,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { useNotification } from "../../../context/NotificationContext";

const NotificationDrawer = ({ open, onClose }) => {
  const {
    notifications,
    dismissNotification,
    dismissAllNotifications,
  } = useNotification();

  const getIcon = (notification) => {
    if (notification.status === "loading") {
      return (
        <Spin
          indicator={
            <AiOutlineSync className="text-primary fs-6 animate-spin" />
          }
          size="small"
        />
      );
    }

    switch (notification.type) {
      case "success":
        return <AiOutlineCheckCircle className="text-success fs-6" />;
      case "error":
        return <AiOutlineWarning className="text-danger fs-6" />;
      default:
        return <AiOutlineInfoCircle className="text-info fs-6" />;
    }
  };

  return (
    <Drawer
      title="Notifications"
      placement="right"
      width={320}
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button 
            size="small" 
            onClick={dismissAllNotifications}
            className="btn-sm btn-outline-secondary"
          >
            Clear All
          </Button>
        </Space>
      }
    >
      <div className="d-grid gap-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-2 small rounded border shadow-sm ${
              notification.status === "loading"
                ? "border-info-subtle bg-info-subtle"
                : notification.type === "success"
                ? "border-success-subtle bg-success-subtle"
                : notification.type === "error"
                ? "border-danger-subtle bg-danger-subtle"
                : "border-info-subtle bg-info-subtle"
            }`}
          >
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div className="d-flex align-items-start gap-2 flex-grow-1">
                <span className="mt-1">{getIcon(notification)}</span>
                <div className="flex-grow-1">
                  <h6 className="mb-1 fw-semibold text-dark">{notification.title}</h6>
                  <p className="text-muted mb-1 lh-sm">{notification.message}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {new Date(notification.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                    {notification.status === "loading" && (
                      <small className="text-muted">
                        Processing...
                      </small>
                    )}
                  </div>
                </div>
              </div>
              <Button
                type="text"
                size="small"
                icon={<AiOutlineClose className="fs-6" />}
                onClick={() => dismissNotification(notification.id)}
                className="btn-close opacity-50 hover-opacity-100 align-self-start"
              />
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center text-muted py-4 small">
            No new notifications
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default NotificationDrawer;