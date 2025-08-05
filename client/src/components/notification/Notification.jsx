import React, { useCallback, useEffect, useMemo } from "react";
import { Check, Clock, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteNotification,
  markAllAsRead,
} from "../../store/slices/notificationSlice";
import readAllNotification from "../../server/readAllNotifications";
import deleteNoficationApi from "../../server/deleteNotification";

const NotificationDropdown = ({ isOpen, onClose, isDark }) => {
  const { allNotifications } = useSelector((state) => state.notification);
  const dispatch = useDispatch();

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (message) => {
    if (message.toLowerCase().includes("accepted")) {
      return <Check className="h-4 w-4 text-green-500" />;
    } else if (message.toLowerCase().includes("rejected")) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  const handleMarkAllNotif = useCallback(() => {
    dispatch(markAllAsRead());
    readAllNotification(dispatch);
  }, [dispatch]);

  const handleDeleteNotification = useCallback(
    (id) => {
      dispatch(deleteNotification(id));
      deleteNoficationApi(id, "");
    },
    [dispatch]
  );

  // Auto close when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const unreadCount = useMemo(
    () =>
      allNotifications?.filter((notifs) => notifs?.status === "unread")
        ?.length || 0,
    [allNotifications]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="lg:hidden dropdown-container fixed inset-0"
        onClick={onClose}
      />

      {/* Notification Dropdown */}
      <div
        className={`
        absolute top-full -right-15 dropdown-container sm:right-0 t-0 mt-6 sm:mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)]
        ${isDark ? "bg-gray-900/50" : "bg-white/90"} 
        backdrop-blur-lg border rounded-lg shadow-xl z-50
        ${isDark ? "border-gray-700" : "border-gray-200"}
        
        /* Mobile positioning */
        lg:w-96 lg:max-w-none
        max-h-[80vh] lg:max-h-96 overflow-hidden
      `}
      >
        {/* Header */}
        <div
          className={`
          px-4 py-3 border-b flex items-center justify-between
          ${isDark ? "border-gray-700" : "border-gray-200"}
        `}
        >
          <h3 className="font-semibold text-lg">
            Notifications ({allNotifications?.length || 0})
          </h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllNotif}
                className={`
                text-sm cursor-pointer px-2 py-1 rounded transition-colors
                ${
                  isDark
                    ? "text-blue-400 hover:bg-gray-700"
                    : "text-blue-600 hover:bg-blue-50"
                }
              `}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className={`
                p-1 cursor-pointer rounded transition-colors 
                ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}
              `}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-64 lg:max-h-80 overflow-y-auto">
          {allNotifications?.length > 0 ? (
            allNotifications?.map((notification) => (
              <div
                key={notification._id}
                className={`
                  px-4 py-3 border-b transition-colors
                  ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-700/40"
                      : "border-gray-100 hover:bg-gray-50"
                  }
                  ${
                    notification.status === "unread"
                      ? isDark
                        ? "bg-gray-800/50"
                        : "bg-blue-50/50"
                      : ""
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  {/* Notification Icon */}
                  <div
                    className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${
                      notification.status === "unread"
                        ? isDark
                          ? "bg-gray-700"
                          : "bg-blue-100"
                        : isDark
                        ? "bg-gray-800"
                        : "bg-gray-100"
                    }
                  `}
                  >
                    {getNotificationIcon(notification.message)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`
                      text-sm leading-relaxed
                      ${
                        notification.status === "unread"
                          ? "font-medium"
                          : isDark
                          ? "text-gray-300"
                          : "text-gray-600"
                      }
                    `}
                    >
                      {notification.message}
                    </p>
                    <p
                      className={`
                      text-xs mt-1
                      ${isDark ? "text-gray-400" : "text-gray-500"}
                    `}
                    >
                      {formatTime(notification?.createdAt)}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {notification.status === "unread" && (
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  )}

                  <button
                    onClick={() => handleDeleteNotification(notification?._id)}
                    className={`${
                      isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                    } rounded-sm cursor-pointer  p-1`}
                  >
                    <Trash2 className="text-red-600 scale-90" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <Clock
                className={`h-12 w-12 mx-auto mb-2 ${
                  isDark ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No notifications yet
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
