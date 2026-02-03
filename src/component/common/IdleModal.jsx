import React, { useState, useEffect, useRef } from "react";
import { useIdleTimer } from "react-idle-timer";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const IdleModal = () => {
  const navigate = useNavigate();
  const [isPrompted, setIsPrompted] = useState(false);
  const [remaining, setRemaining] = useState(60);

  // Final Idle Logout
  const onIdle = () => {
    setIsPrompted(false);
    localStorage.removeItem("token");
    navigate("/");
  };

  // User is idle for 9 minutes
  const onPrompt = () => {
    setIsPrompted(true);
    setRemaining(60);
  };

  // User is active again
  const onActive = () => {
    setIsPrompted(false);
  };

  // Use idle timer hook
  const { getRemainingTime, activate } = useIdleTimer({
    timeout: 60 * 60 * 1000, // Total 60 minutes
    promptTimeout: 10 * 60 * 1000, // 10 minute warning
    onIdle,
    onPrompt,
    onActive,
    crossTab: true,
    debounce: 500,
  });

  // Handle session continuation
  const handleContinue = () => {
    activate(); // Reset the timer and mark as active
    setIsPrompted(false);
  };

  // Synchronize countdown with actual remaining time
  useEffect(() => {
    let interval;
    if (isPrompted) {
      interval = setInterval(() => {
        const totalRemaining = Math.ceil(getRemainingTime() / 1000);
        // The prompt remaining time is the total remaining time
        setRemaining(totalRemaining > 0 ? totalRemaining : 0);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPrompted, getRemainingTime]);

  // Logout manually
  const handleLogout = () => {
    onIdle();
  };

  return (
    <Modal
      open={isPrompted}
      footer={null}
      closable={false}
      centered
      width={500}
      style={{
        textAlign: "center",
        borderRadius: "8px",
        padding: "40px",
        minHeight: "250px",
      }}
    >
      <ExclamationCircleOutlined
        style={{ fontSize: "60px", color: "#faad14", marginBottom: "18px" }}
      />
      <Title level={3} style={{ marginBottom: "18px" }}>
        You have been inactive
      </Title>
      <Text type="secondary" style={{ fontSize: "22px" }}>
        Your session will end in{" "}
        <span
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            color: "#ff4d4f",
          }}
        >
          {remaining} seconds
        </span>
        .
      </Text>
      <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        <Button
          className="butn primary-btn"
          onClick={handleContinue}
          style={{ width: "150px" }}
        >
          Continue
        </Button>
        <Button
          className="butn secoundry-btn"
          onClick={handleLogout}
          style={{ width: "150px" }}
        >
          Logout
        </Button>
      </div>
    </Modal>
  );
};

export default IdleModal;
