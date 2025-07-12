import React, { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

const Loading = () => {
  const { isDark } = useContext(ThemeContext);
  const containerClasses = isDark
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-900";

  const spinnerClasses = isDark
    ? "border-gray-700 border-t-blue-400"
    : "border-gray-200 border-t-blue-600";

  return (
    <div
      className={`fixed inset-0 ${containerClasses} flex items-center justify-center z-50 transition-colors duration-300`}
    >
      <div className="text-center">

        <div
          className={`w-16 h-16 border-4 ${spinnerClasses} rounded-full animate-spin mx-auto`}
        ></div>
        
        <p className="mt-6 text-lg font-medium">Loading please wait</p>
      </div>
    </div>
  );
};

export default Loading;
