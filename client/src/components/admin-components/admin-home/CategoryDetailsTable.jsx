import React, { useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { Calendar } from "lucide-react";

const CategoryDetailsTable = ({ adminStats }) => {
  const { isDark } = useContext(ThemeContext);
  return (
    <div
      className={`mt-8 rounded-xl p-6 transition-all duration-300 ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-100 shadow-lg"
      }`}
    >
      <div className="flex items-center mb-4">
        <Calendar
          className={`w-5 h-5 mr-2 ${
            isDark ? "text-blue-400" : "text-blue-600"
          }`}
        />
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Category Performance Details
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`border-b ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <th
                className={`text-left py-3 px-4 font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Category
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Total Jobs
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Applications
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Avg Apps/Job
              </th>
            </tr>
          </thead>
          <tbody>
            {adminStats?.category?.map((category, index) => (
              <tr
                key={index}
                className={`border-b ${
                  isDark ? "border-gray-700" : "border-gray-100"
                } ${
                  isDark ? "hover:bg-gray-750" : "hover:bg-gray-50"
                } transition-colors`}
              >
                <td
                  className={`py-3 px-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {category.category}
                </td>
                <td
                  className={`py-3 px-4 text-center ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {category.totalJobs}
                </td>
                <td
                  className={`py-3 px-4 text-center ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {category.totalApplications}
                </td>
                <td
                  className={`py-3 px-4 text-center ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {category.totalJobs > 0
                    ? (category.totalApplications / category.totalJobs).toFixed(
                        1
                      )
                    : "0.0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryDetailsTable;
