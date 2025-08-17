import React, { useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { AlertCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NoDataState = () => {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div className="text-center py-16">
      <div
        className={`rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center ${
          isDark ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        <AlertCircle
          className={`w-12 h-12 ${isDark ? "text-gray-400" : "text-gray-500"}`}
        />
      </div>
      <h3
        className={`text-xl font-semibold mb-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        No Statistics Available
      </h3>
      <p
        className={`text-base mb-8 max-w-md mx-auto ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        You haven't posted any jobs yet. Start by creating your first job
        posting to see your statistics here.
      </p>
      <button
        className={`inline-flex cursor-pointer items-center px-6 py-3 rounded-lg font-medium transition-colors ${
          isDark
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        onClick={() => navigate("/")}
      >
        <Plus className="w-5 h-5 mr-2" />
        Return to Home
      </button>
    </div>
  );
};

export default NoDataState;