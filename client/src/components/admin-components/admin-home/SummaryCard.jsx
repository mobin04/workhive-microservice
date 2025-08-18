import React, { useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import {
  Briefcase,
  TrendingUp,
  Building2,
  FileText,
  UserCheck,
} from "lucide-react";
const SummaryCard = ({ summaryStats }) => {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div
        className={`rounded-xl p-6 transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Total Jobs
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {summaryStats?.totalJobs}
            </p>
          </div>
          <Briefcase
            className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`}
          />
        </div>
      </div>

      <div
        className={`rounded-xl p-6 transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Total Applications
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {summaryStats?.totalApplications}
            </p>
          </div>
          <FileText
            className={`w-8 h-8 ${
              isDark ? "text-green-400" : "text-green-600"
            }`}
          />
        </div>
      </div>

      <div
        className={`rounded-xl p-6 transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Active Employers
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {summaryStats?.totalEmployers}
            </p>
          </div>
          <Building2
            className={`w-8 h-8 ${
              isDark ? "text-purple-400" : "text-purple-600"
            }`}
          />
        </div>
      </div>

      <div
        className={`rounded-xl p-6 transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Job Categories
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {summaryStats?.totalCategories}
            </p>
          </div>
          <TrendingUp
            className={`w-8 h-8 ${
              isDark ? "text-orange-400" : "text-orange-600"
            }`}
          />
        </div>
      </div>

      <div
        className={`rounded-xl p-6 transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Avg Applications/Job
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {Number(summaryStats?.avgApplicationsPerJob.toFixed(1))}
            </p>
          </div>
          <UserCheck
            className={`w-8 h-8 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}
          />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
