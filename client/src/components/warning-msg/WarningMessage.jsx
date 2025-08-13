import React, { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { AlertTriangle, X } from "lucide-react";

const WarningMessage = ({
  handleCancel,
  isPending,
  message,
  title,
  handleConfirm,
  pendingBtnText,
  btnText,
}) => {
  const { isDark } = useContext(ThemeContext);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      <div
        className={`
            relative w-full max-w-md mx-auto 
            ${
              isDark
                ? "bg-gray-900 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            } 
            border rounded-2xl shadow-2xl 
            animate-in zoom-in-95 fade-in duration-200
          `}
      >
        <button
          onClick={handleCancel}
          className={`
                absolute top-4 right-4 p-1 rounded-full transition-colors
                ${
                  isDark
                    ? "hover:bg-gray-800 text-gray-400 hover:text-gray-300"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }
              `}
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div
            className={`
                w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center
                ${isDark ? "bg-red-900/20" : "bg-red-50"}
              `}
          >
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>

          {/* Description */}
          <p
            className={`
                text-center mb-6 text-sm leading-relaxed
                ${isDark ? "text-gray-300" : "text-gray-600"}
              `}
          >
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isPending} //isWithdrawPending
              className={`
                    flex-1 disabled:cursor-none cursor-pointer px-4 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${
                      isDark
                        ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                  `}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="
                    flex-1 px-4 disabled:cursor-none cursor-pointer py-2.5 rounded-xl font-medium transition-all duration-200
                    bg-red-600 hover:bg-red-700 text-white
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                    transform hover:scale-[1.02] active:scale-[0.98]
                  "
            >
              <div className="flex items-center justify-center gap-3">
                {isPending && (
                  <div className="animate-spin w-7 h-7 border-3 border-b-transparent rounded-full"></div>
                )}
                {isPending ? pendingBtnText : btnText}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningMessage;
