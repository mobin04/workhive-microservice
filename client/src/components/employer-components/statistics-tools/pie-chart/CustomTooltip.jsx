import React, { useContext } from "react";
import { ThemeContext } from "../../../../contexts/ThemeContext";

const CustomTooltip = ({ active, payload }) => {
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
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">
          <span className="font-medium">Jobs: </span>
          <span style={{ color: payload[0].color }}>{payload[0].value}</span>
        </p>
        {payload[0].payload.applications !== undefined && (
          <p className="text-sm">
            <span className="font-medium">Applications: </span>
            {payload[0].payload.applications}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
