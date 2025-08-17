import React, { useContext, useMemo } from "react";
import { ThemeContext } from "../../../../contexts/ThemeContext";
import { Clock } from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import LineTooltip from "./CustomTooltipLineChart";


const LineChartStats = ({ employerStats = [] }) => {
  const { isDark } = useContext(ThemeContext);

  const formatTimelineData = useMemo(() => {
    if (!employerStats?.timeRangeStats?.length) {
      return [
        { period: "Last 7 Days", jobs: 0 },
        { period: "Last 30 Days", jobs: 0 },
        { period: "Last 90 Days", jobs: 0 },
      ];
    }

    return [
      {
        period: "Last 7 Days",
        jobs: employerStats.timeRangeStats[0]?.last7Days || 0,
      },
      {
        period: "Last 30 Days",
        jobs: employerStats.timeRangeStats[0]?.last30Days || 0,
      },
      {
        period: "Last 90 Days",
        jobs: employerStats.timeRangeStats[0]?.last90Days || 0,
      },
    ];
  }, [employerStats?.timeRangeStats]);

  return (
    <div
      className={`rounded-xl p-6 mb-8 transition-all duration-300 ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-100 shadow-lg"
      }`}
    >
      <div className="flex items-center mb-4">
        <Clock
          className={`w-5 h-5 mr-2 ${
            isDark ? "text-blue-400" : "text-blue-600"
          }`}
        />
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Job Posting Timeline
        </h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formatTimelineData}
            margin={{ top: 10, right: 10, left: 5, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#374151" : "#E5E7EB"}
            />
            <XAxis
              dataKey="period"
              tick={{
                fill: isDark ? "#9CA3AF" : "#6B7280",
                fontSize: 12,
              }}
              axisLine={{ stroke: isDark ? "#4B5563" : "#D1D5DB" }}
            />
            <YAxis
              tick={{
                fill: isDark ? "#9CA3AF" : "#6B7280",
                fontSize: 12,
              }}
              width={25}
              axisLine={{ stroke: isDark ? "#4B5563" : "#D1D5DB" }}
            />
            <Tooltip content={<LineTooltip />} />
            <Line
              type="monotone"
              dataKey="jobs"
              stroke={isDark ? "#60A5FA" : "#3B82F6"}
              strokeWidth={3}
              dot={{
                fill: isDark ? "#60A5FA" : "#3B82F6",
                strokeWidth: 2,
                r: 6,
              }}
              activeDot={{
                r: 8,
                fill: isDark ? "#60A5FA" : "#3B82F6",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartStats;
