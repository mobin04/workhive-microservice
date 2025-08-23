import React, { useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

const EmployerDetailsTable = ({ adminStats }) => {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div
      className={`mb-8 rounded-xl p-6 transition-all duration-300 h-1/2 overflow-y-auto ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-100 shadow-lg"
      }`}
    >
      <div className="flex items-center mb-4">
        <Building2
          className={`w-5 h-5 mr-2 ${
            isDark ? "text-blue-400" : "text-blue-600"
          }`}
        />
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Employer Overview
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
                Employer ID
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Total Jobs Posted
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {adminStats.employer.map((employer, index) => (
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
                  <div className="font-mono text-sm">
                    {employer.employerId.substring(0, 8)}...
                  </div>
                </td>
                <td
                  className={`py-3 px-4 text-center ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      employer.totalJobs > 10
                        ? isDark
                          ? "bg-green-900 text-green-200"
                          : "bg-green-100 text-green-800"
                        : employer.totalJobs > 5
                        ? isDark
                          ? "bg-yellow-900 text-yellow-200"
                          : "bg-yellow-100 text-yellow-800"
                        : isDark
                        ? "bg-red-900 text-red-200"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {employer.totalJobs}
                  </span>
                </td>
                <td className={`py-3 px-4 text-center`}>
                  <button
                    onClick={() => {
                      navigate(`/admin/user-profile/${employer.employerId}`);
                    }}
                    className={`px-3 py-1.5 cursor-pointer text-sm font-medium rounded-lg transition-colors ${
                      isDark
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    View Employer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployerDetailsTable;
