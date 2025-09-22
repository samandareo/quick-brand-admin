import React, { useState } from "react";
import { useNotifications } from "../../context/useNotifications"; // 👈 import hook
import { BellIcon } from "../icons";
import { Link } from "react-router-dom";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, fetchNotifications } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handelFetchNotification = async () => {
    setIsOpen(!isOpen);
    await fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={handelFetchNotification}
        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-black border-opacity-35 rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">
                Notifications {unreadCount > 0 && `(${unreadCount} new)`}
              </h3>
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.map((notification) => (
                  <Link
                    to={"/purchase-requests"}
                    state={{ id: notification?.relatedEntity }}
                    key={notification._id}
                  >
                    <div
                      className={`px-4 py-3 cursor-pointer ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        markAsRead(notification._id);
                        setIsOpen(false);
                        // Add your navigation logic here
                      }}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
