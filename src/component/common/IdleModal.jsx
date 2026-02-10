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
    // Set remaining to promptTimeout duration (10 minutes = 600 seconds)
    setRemaining(10 * 60);
  };

  // User is active again
  const onActive = () => {
    setIsPrompted(false);
  };

  // Use idle timer hook
  const { getRemainingTime, activate } = useIdleTimer({
    timeout: 30 * 60 * 1000, // Total 60 minutes
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

  // Format time in minutes and seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} min ${secs} sec`;
    }
    return `${secs} sec`;
  };

  // Countdown from promptTimeout (10 minutes)
  useEffect(() => {
    let interval;
    if (isPrompted) {
      // Start countdown from promptTimeout (10 minutes = 600 seconds)
      let countdown = 10 * 60;
      setRemaining(countdown);

      interval = setInterval(() => {
        countdown -= 1;
        setRemaining(countdown > 0 ? countdown : 0);

        // If countdown reaches 0, trigger idle
        if (countdown <= 0) {
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPrompted]);

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
      }}
      styles={{
        body: {
          paddingTop: "40px",
          paddingBottom: "40px",
          paddingLeft: "40px",
          paddingRight: "40px",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          // marginTop: "20",
          paddingTop: "20px",
          marginBottom: "18px",
        }}
      >
        <ExclamationCircleOutlined
          style={{ fontSize: "24px", color: "#faad14" }}
        />
        <Title level={3} style={{ margin: 0 }}>
          You have been inactive
        </Title>
      </div>
      <Text type="secondary" style={{ fontSize: "22px" }}>
        Your session will end in{" "}
        <span
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            color: "#ff4d4f",
          }}
        >
          {formatTime(remaining)}
        </span>
        .
      </Text>
      <div
        style={{
          marginTop: "24px",
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
