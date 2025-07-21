import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const Popup = ({ 
  message = "Notification message",
  type = "info", // "success", "error", "warning", "info"
  isVisible = false,
  onClose,
  autoClose = true,
  duration = 4000,
  position = "top-center" // "top-left", "top-center", "top-right"
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
    
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration]);

  const handleClose = () => {
    setShow(false);
    if (onClose) {
      setTimeout(() => onClose(), 300); // Wait for animation to complete
    }
  };

  const getNotificationConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          colors: "bg-green-500 border-green-600",
          iconColor: "text-white",
          textColor: "text-white"
        };
      case "error":
        return {
          icon: XCircle,
          colors: "bg-red-500 border-red-600",
          iconColor: "text-white",
          textColor: "text-white"
        };
      case "warning":
        return {
          icon: AlertCircle,
          colors: "bg-yellow-500 border-yellow-600",
          iconColor: "text-white",
          textColor: "text-white"
        };
      default: // info
        return {
          icon: Info,
          colors: "bg-blue-500 border-blue-600",
          iconColor: "text-white",
          textColor: "text-white"
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "left-4 transform-none";
      case "top-right":
        return "right-4 transform-none";
      default: // top-center
        return "left-1/2 transform -translate-x-1/2";
    }
  };

  const config = getNotificationConfig();
  const IconComponent = config.icon;

  if (!show) return null;

  return (
    <div 
      className={`
        fixed top-4 z-50 
        ${getPositionClasses()}
        transition-all duration-300 ease-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        ${config.colors}
        backdrop-blur-sm
        min-w-80 max-w-96
      `}>
        {/* Icon */}
        <IconComponent className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
        
        {/* Message */}
        <span className={`${config.textColor} font-medium text-sm flex-1`}>
          {message}
        </span>
        
        {/* Close button */}
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

export default Popup

// // Demo component to showcase the popup
// const PopupDemo = () => {
//   const [notifications, setNotifications] = useState([]);
  
//   const showNotification = (type, message) => {
//     const id = Date.now();
//     const newNotification = {
//       id,
//       type,
//       message,
//       isVisible: true
//     };
    
//     setNotifications(prev => [...prev, newNotification]);
//   };

//   const hideNotification = (id) => {
//     setNotifications(prev => prev.filter(notification => notification.id !== id));
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
//           Modern Popup Notifications
//         </h1>
        
//         <div className="bg-white rounded-xl p-6 shadow-lg">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Try Different Types:</h2>
          
//           <div className="grid grid-cols-2 gap-4">
//             <button
//               onClick={() => showNotification("success", "Operation completed successfully!")}
//               className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//             >
//               Success Message
//             </button>
            
//             <button
//               onClick={() => showNotification("error", "Something went wrong. Please try again.")}
//               className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//             >
//               Error Message
//             </button>
            
//             <button
//               onClick={() => showNotification("warning", "Please review your settings before continuing.")}
//               className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
//             >
//               Warning Message
//             </button>
            
//             <button
//               onClick={() => showNotification("info", "New features are now available in your dashboard.")}
//               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               Info Message
//             </button>
//           </div>
          
//           <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-2">Features:</h3>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• Auto-close after 4 seconds (customizable)</li>
//               <li>• Manual close button</li>
//               <li>• Smooth slide-in animation</li>
//               <li>• Multiple position options</li>
//               <li>• Different types: success, error, warning, info</li>
//               <li>• Backdrop blur effect</li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Render all active notifications */}
//       {notifications.map((notification, index) => (
//         <PopupNotification
//           key={notification.id}
//           message={notification.message}
//           type={notification.type}
//           isVisible={notification.isVisible}
//           onClose={() => hideNotification(notification.id)}
//           position="top-center"
//         />
//       ))}
//     </div>
//   );
// };

// export default PopupDemo;