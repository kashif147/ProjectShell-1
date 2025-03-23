import React, { useState, useEffect, useRef } from "react";

import { useIdleTimer } from "react-idle-timer";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const IdleModal = () => {
    const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds countdown
  const idleTimerRef = useRef(null);
  const countdownRef = useRef(null);

  // Function to start countdown
  const startCountdown = () => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          handleLogout(); // Auto logout when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Function called when user is idle (after 9 minutes)
  const onIdle = () => {
    setIsModalOpen(true);
    startCountdown();
  };

  // Function to reset the timer when user is active
  const onActive = () => {
    console.log("User is active again");
  };

  // Function to continue session
  const handleContinue = () => {
    setIsModalOpen(false);
    clearInterval(countdownRef.current); // Stop countdown
    idleTimerRef.current.reset(); // Reset idle timer
  };

  // Function to logout user
  const handleLogout = () => {
    setIsModalOpen(false);
    clearInterval(countdownRef.current);
    localStorage.removeItem('token')
    navigate('/')
  };

  // Initialize Idle Timer (triggers after 9 minutes)
  idleTimerRef.current = useIdleTimer({
    // timeout: 540000, // 9 minutes (9 * 60 * 1000 ms)
    timeout: 120000,
    onIdle,
    onActive,
    debounce: 500,
  });

  return (
    <>
      <Modal
        open={isModalOpen}
        footer={null}
        closable={false}
        centered
        width={500} // Increased width
        style={{
          textAlign: "center",
          borderRadius: "8px",
          padding: "40px",
          minHeight: "250px", // Increased height
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
          <span style={{ fontSize: "22px", fontWeight: "bold", color: "#ff4d4f" }}>
            {countdown} seconds
          </span>.
        </Text>
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <Button className="butn primary-btn" onClick={handleContinue}  style={{ width: "150px" }}>
            Continue
          </Button>
          <Button className="butn secoundry-btn" onClick={handleLogout}  style={{ width: "150px" }}>
            Logout
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default IdleModal;
