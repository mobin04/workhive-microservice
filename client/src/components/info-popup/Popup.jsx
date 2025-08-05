import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { showPopup } from "../../store/slices/popupSlice";

const Popup = ({
  message = "Notification message",
  type = "info", // "success", "error", "warning", "info"
  isVisible = false,
  onClose,
  autoClose = true,
  duration = 4000,
  popupId,
}) => {
  const [show, setShow] = useState(isVisible);
  const dispatch = useDispatch();

  const handleClose = () => {
    setShow(false);
    if (onClose) {
      setTimeout(() => {
        onClose();
        dispatch(
          showPopup({
            message: "",
            type: "",
            visible: false,
            popupId: Date.now(),
          })
        );
      }, 300);
    }
  };

  useEffect(() => {
    setShow(isVisible);

    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, dispatch, popupId]);

  const getNotificationConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          colors: "bg-green-500 border-green-600",
          iconColor: "text-white",
          textColor: "text-white",
        };
      case "error":
        return {
          icon: XCircle,
          colors: "bg-red-500 border-red-600",
          iconColor: "text-white",
          textColor: "text-white",
        };
      case "warning":
        return {
          icon: AlertCircle,
          colors: "bg-yellow-500 border-yellow-600",
          iconColor: "text-white",
          textColor: "text-white",
        };
      default: // info
        return {
          icon: Info,
          colors: "bg-blue-500 border-blue-600",
          iconColor: "text-white",
          textColor: "text-white",
        };
    }
  };

  const config = getNotificationConfig();
  const IconComponent = config.icon;

  if (!show) return null;

  return (
    <div
      className={`
        fixed top-4 z-[9999] 
        left-1/2 transform -translate-x-1/2
        transition-all duration-300 ease-out
        ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
    >
      <div
        className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        ${config.colors}
        backdrop-blur-sm
        min-w-80 max-w-96
      `}
      >
        <IconComponent
          className={`w-5 h-5 ${config.iconColor} flex-shrink-0`}
        />

        <span className={`${config.textColor} font-medium text-sm flex-1`}>
          {message}
        </span>

        <button
          onClick={handleClose}
          className={`${config.iconColor} hover:bg-white/20 rounded-full p-1 transition-colors duration-200 flex-shrink-0`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Popup;
