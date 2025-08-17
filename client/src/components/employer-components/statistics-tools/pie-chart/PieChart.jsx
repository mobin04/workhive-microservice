import { useContext } from "react";
import { ThemeContext } from "../../../../contexts/ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import CustomTooltip from "./CustomTooltip";

// eslint-disable-next-line no-unused-vars
const StatsPieChart = ({ data, colors, title, icon: Icon }) => {
  const { isDark } = useContext(ThemeContext);

  return (
    <div
      className={`rounded-xl p-6 transition-all duration-300 ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-100 shadow-lg"
      }`}
    >
      <div className="flex items-center mb-4">
        <Icon
          className={`w-5 h-5 mr-2 ${
            isDark ? "text-blue-400" : "text-blue-600"
          }`}
        />
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
      </div>
      <div className="h-[25rem] flex items-center justify-center">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 40, bottom: 50 }}>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={1.5}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  fontSize: "13px",
                  fontWeight: 500,
                  paddingTop: "10px",
                  color: isDark ? "#F3F4F6" : "#1F2937",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center">
            <BarChart3
              className={`w-12 h-12 mx-auto mb-3 ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPieChart;
