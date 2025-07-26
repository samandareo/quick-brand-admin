import React, { useEffect, useState } from "react";
import {
  requestPermissionAndToken,
  onForegroundMessage,
} from "../utils/firebase";
import {
  saveFcmToken,
  removeFcmToken,
  getNotifications,
  markNotificationAsRead,
} from "../apis";
import { useAuth } from "../context/AuthContext";
import { NotificationContext } from "./useNotifications";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user: admin, loading } = useAuth();

  const originalTitle = "Admin Panel | Quick Brand Pluse";

  useEffect(() => {
    if (loading || !admin?._id) return;

    let unsubscribeCleanup;

    const setupFCM = async () => {
      try {
        const token = await requestPermissionAndToken();

        if (token) {
          await saveFcmToken(admin._id, token);

          // Listen for foreground notifications
          const unsubscribe = onForegroundMessage((payload) => {
            const { notification, data } = payload;
            setNotifications((prev) => [
              {
                _id: data.notificationId,
                title: notification?.title,
                message: notification?.body,
                metadata: data,
                isRead: false,
                createdAt: new Date(),
              },
              ...prev,
            ]);
            setUnreadCount((prev) => prev + 1);
          });

          unsubscribeCleanup = () => {
            unsubscribe();
            removeFcmToken(admin._id, token);
          };
        }
      } catch (error) {
        console.error("FCM setup failed:", error);
      }
    };

    setupFCM();

    return () => {
      if (unsubscribeCleanup) {
        unsubscribeCleanup();
      }
    };
  }, [admin, loading]);

  useEffect(() => {
    if (unreadCount > 0) {
      const audio = new Audio("/notification.wav");
      audio.play().catch((e) => console.log("Audio play failed:", e));
      document.title = `(${unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount]);

  const fetchNotifications = async () => {
    try {
      // Replace with your actual API call to fetch notifications
      const { data } = await getNotifications();
      console.log(data);

      setNotifications(data.data || []);
      setUnreadCount((data.data || []).filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Replace with your actual API call to mark notification as read
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  useEffect(() => {
    if (!loading && admin?._id) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, loading]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        setUnreadCount,
        fetchNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
