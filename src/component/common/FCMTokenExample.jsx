import React, { useEffect } from "react";
import { useFCM } from "../../context/FCMContext";
import { Button, Card, Typography, Space } from "antd";

const { Text, Title } = Typography;

const FCMTokenExample = () => {
  const { fcmToken, pushAvailable, requestNotificationPermission, refreshToken } = useFCM();

  useEffect(() => {
    if (fcmToken) {
      console.log("FCM Token from hook:", fcmToken);
    }
  }, [fcmToken]);

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      console.log("FCM Token received:", token);
    }
  };

  const handleRefresh = async () => {
    const newToken = await refreshToken();
    if (newToken) {
      console.log("New FCM Token:", newToken);
    }
  };

  return (
    <Card title="FCM Token">
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Text strong>Push Available: </Text>
          <Text>{pushAvailable ? "✅ Yes" : "❌ No (reload page if service worker just registered)"}</Text>
        </div>
        <div>
          <Text strong>FCM Token: </Text>
          <Text code copyable>
            {fcmToken || "Not available. Click 'Enable Notifications' to get token."}
          </Text>
        </div>
        <Space>
          <Button 
            type="primary" 
            onClick={handleEnableNotifications}
            disabled={!pushAvailable}
          >
            Enable Notifications
          </Button>
          <Button onClick={handleRefresh} disabled={!fcmToken}>
            Refresh Token
          </Button>
        </Space>
        <Text type="secondary">
          Token is saved to localStorage as "fcmToken"
        </Text>
      </Space>
    </Card>
  );
};

export default FCMTokenExample;

