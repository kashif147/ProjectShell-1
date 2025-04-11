import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addNotification = useCallback((notification) => {
    const id = uuidv4();
    setIsLoading(true);
    
    setNotifications(prev => [
      ...prev,
      {
        ...notification,
        id,
        timestamp: new Date(),
        type: notification.type || 'info'
      }
    ]);
    
    setDrawerVisible(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        drawerVisible,
        isLoading,
        addNotification,
        dismissNotification,
        dismissAllNotifications,
        closeDrawer
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};