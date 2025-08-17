import React, { useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import { ThemeContext } from "../../../contexts/ThemeContext";

const ApplicationUpdatePopup = ({
  isOpen,
  onClose,
  onSubmit,
  status,
  isLoading,
}) => {
  const { isDark } = useContext(ThemeContext);
  const [popupContent, setPopupContent] = useState({});

  useEffect(() => {
    switch (status) {
      case "shortlisted":
        setPopupContent({
          title: "Shortlist Candidate",
          message:
            "Are you sure you want to shortlist this candidate? This will move them to the next stage of the hiring process.",
          buttonText: "Shortlist",
          buttonVariant: "primary",
          loadinBtnText: "Shortlisting...",
        });
        break;
      case "accepted":
        setPopupContent({
          title: "Accept Application",
          message:
            "Are you sure you want to accept this application? This action will send them an acceptance notification.",
          buttonText: "Accept",
          buttonVariant: "success",
          loadinBtnText: "Accepting...",
        });
        break;
      case "rejected":
        setPopupContent({
          title: "Reject Application",
          message:
            "Are you sure you want to reject this application? This action cannot be undone.",
          buttonText: "Reject",
          buttonVariant: "danger",
          loadinBtnText: "Rejecting...",
        });
        break;
      default:
        return;
    }
  }, [status]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getButtonClasses = () => {
    const baseClasses =
      "px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50";

    if (popupContent?.buttonVariant === "danger") {
      return `${baseClasses} ${
        isDark
          ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
          : "bg-red-500 hover:bg-red-600 text-white focus:ring-red-400"
      }`;
    } else if (popupContent?.buttonVariant === "success") {
      return `${baseClasses} ${
        isDark
          ? "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
          : "bg-green-500 hover:bg-green-600 text-white focus:ring-green-400"
      }`;
    } else {
      return `${baseClasses} ${
        isDark
          ? "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
          : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400"
      }`;
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-200"
      style={{ zIndex: 50 }}
    >
      <div
        className={`absolute inset-0 backdrop-blur-md transition-colors duration-200 ${
          isDark ? "bg-gray-800/40" : "bg-gray-800/40"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md mx-auto rounded-2xl shadow-2xl transform transition-all duration-200 ${
          isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {popupContent?.title}
          </h2>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
              isDark
                ? "hover:bg-gray-700 text-gray-400 hover:text-white focus:ring-gray-600 focus:ring-offset-gray-800"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700 focus:ring-gray-500 focus:ring-offset-white"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <div className="px-6 pb-6">
          <p
            className={`text-base leading-relaxed ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {popupContent?.message}
          </p>
        </div>

        {/* Actions */}
        <div
          className={`flex flex-col sm:flex-row gap-3 p-6 pt-5 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 cursor-pointer ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300 focus:ring-gray-500"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className={`flex-1 ${getButtonClasses()} cursor-pointer`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin border-2 border-b-transparent rounded-full w-4 h-4"></div>
                <span>{popupContent?.loadinBtnText}</span>
              </div>
            ) : (
              popupContent?.buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationUpdatePopup;
