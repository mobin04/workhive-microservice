import React, { useContext } from "react";
import { ThemeContext } from "../../../../contexts/ThemeContext";

const LineTooltip = ({ active, payload, label }) => {
  const { isDark } = useContext(ThemeContext);

  if (active && payload && payload.length) {
    return (
      <div
        className={`p-3 rounded-lg shadow-lg border ${
          isDark
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <p className="font-medium">{label}</p>
        <p className="text-sm">
          <span className="font-medium">Jobs Posted: </span>
          <span style={{ color: payload[0].color }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default LineTooltip;
