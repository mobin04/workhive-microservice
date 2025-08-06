import React, { useState, useEffect, useContext } from "react";
import { Check, X, Clock, AlertCircle, Briefcase } from "lucide-react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useDispatch } from "react-redux";
import { setIsNotification } from "../../store/slices/notificationSlice";
import { useNavigate } from "react-router-dom";

const NotificationPopup = ({
  notification,
  isVisible,
  position = "top-right", // top-right, top-left, bottom-right, bottom-left
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentNotification = notification;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShouldRender(false);
      dispatch(setIsNotification({ isVisible: false, notification: {} }));
    }, 300);
  };

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);

      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // const handleViewDetails = () => {
  //   if (onViewDetails) onViewDetails(currentNotification);
  //   handleClose();
  // };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (message) => {
    const lowerMessage = message.toLowerCase();
    if (
      lowerMessage.includes("accepted") ||
      lowerMessage.includes("shortlisted")
    ) {
      return <Check className="h-5 w-5 text-green-500" />;
    } else if (lowerMessage.includes("rejected")) {
      return <X className="h-5 w-5 text-red-500" />;
    } else if (lowerMessage.includes("application")) {
      return <Briefcase className="h-5 w-5 text-blue-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-orange-500" />;
  };

  const getPositionClasses = () => {
    const base = "fixed z-[9999]";
    switch (position) {
      case "top-left":
        return `${base} top-4 left-4`;
      case "top-right":
        return `${base} top-4 right-4`;
      case "bottom-left":
        return `${base} bottom-4 left-4`;
      case "bottom-right":
        return `${base} bottom-4 right-4`;
      default:
        return `${base} top-4 right-4`;
    }
  };

  const getAnimationClasses = () => {
    const isTop = position.includes("top");
    const isRight = position.includes("right");

    if (!isAnimating) {
      if (isTop) {
        return isRight
          ? "translate-x-full -translate-y-2"
          : "-translate-x-full -translate-y-2";
      } else {
        return isRight
          ? "translate-x-full translate-y-2"
          : "-translate-x-full translate-y-2";
      }
    }
    return "translate-x-0 translate-y-0";
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`${getPositionClasses()} w-80 sm:w-96 max-w-[calc(100vw-2rem)]`}
    >
      <div
        className={`
          ${
            isDark
              ? "bg-gray-900/95 border-gray-700 text-white"
              : "bg-white/95 border-gray-200 text-gray-900"
          }
          backdrop-blur-md border rounded-xl shadow-2xl
          transform transition-all duration-300 ease-out
          ${getAnimationClasses()}
          ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center space-x-2">
            <div
              className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${isDark ? "bg-gray-800" : "bg-blue-50"}
            `}
            >
              {getNotificationIcon(currentNotification.message)}
            </div>
            <div>
              <h4 className="font-semibold text-sm">WorkHive</h4>
              <p
                className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {formatTimeAgo(currentNotification.timeStamp)}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className={`
              p-1 rounded-full transition-colors
              ${
                isDark
                  ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              }
            `}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* message content */}
        <div className="px-4 pb-4">
          <p
            className={`text-sm leading-relaxed ${
              isDark ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {currentNotification.message}
          </p>

          {/* Close Buttons */}
          <div className="flex items-center justify-end space-x-2 mt-3">
            <button
              onClick={handleClose}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              Dismiss
            </button>
            <button
              onClick={() => navigate("/applications")}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        </div>

        <div
          className={`h-1 ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          } rounded-b-xl overflow-hidden`}
        >
          <div
            className="h-full bg-blue-500 rounded-b-xl animate-[shrink_5s_linear_forwards]"
            style={{
              animation: isAnimating ? "shrink 5s linear forwards" : "none",
            }}
          />
        </div>
      </div>

      <style>
        {`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}
      </style>
    </div>
  );
};

export default NotificationPopup;
