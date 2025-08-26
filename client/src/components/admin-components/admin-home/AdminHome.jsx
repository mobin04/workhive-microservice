import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { TrendingUp, UserCheck, BarChart3, UsersRound } from "lucide-react";
import StatsPieChart from "../../employer-components/statistics-tools/pie-chart/PieChart";
import LineChartStats from "../../employer-components/statistics-tools/line-chart/LineChart";
import SummaryCard from "./SummaryCard";
import EmployerDetailsTable from "./EmployerDetailsTable";
import CategoryDetailsTable from "./CategoryDetailsTable";
import useFetchAdminStats from "../../../hooks/admin-hooks/useFetchAdminStats";
import Loading from "../../loader/Loading";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { isDark } = useContext(ThemeContext);
  const [adminStats, setAdminStats] = useState(null);
  const navigate = useNavigate();

  const { refetch, isLoading } = useFetchAdminStats({ setAdminStats });

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!adminStats) return null;

    // Use monthlyStats array to get totals
    const totalJobs = adminStats.job.monthlyStats.reduce(
      (sum, item) => sum + item.totalPosted,
      0
    );
    const totalApplications = adminStats.job.monthlyStats.reduce(
      (sum, item) => sum + item.totalApplications,
      0
    );
    const totalEmployers = adminStats.employer.length;
    const totalCategories = adminStats.category.length;
    const avgApplicationsPerJob =
      totalJobs > 0 ? totalApplications / totalJobs : 0;

    return {
      totalJobs,
      totalApplications,
      totalEmployers,
      totalCategories,
      avgApplicationsPerJob,
    };
  }, [adminStats]);

  // Format data for category pie chart
  const formatCategoryData = useMemo(() => {
    if (!adminStats?.category) return [];

    return adminStats.category.map((item) => ({
      name: item.category,
      value: item.totalJobs,
      applications: item.totalApplications,
    }));
  }, [adminStats?.category]);

  // Format data for applications vs jobs pie chart
  const formatApplicationJobsData = useMemo(() => {
    if (!summaryStats) return [];

    return [
      {
        name: "Applied Jobs",
        value: summaryStats.totalApplications,
        applications: summaryStats.totalApplications,
      },
      {
        name: "Unapplied Jobs",
        value: summaryStats.totalJobs - summaryStats.totalApplications,
        applications: 0,
      },
    ];
  }, [summaryStats]);

  // Format timeline data for line chart using actual timeRangeStats
  const formatTimelineStats = useMemo(() => {
    if (!adminStats?.job?.timeRangeStats) return null;

    return {
      timeRangeStats: adminStats.job.timeRangeStats,
    };
  }, [adminStats?.job?.timeRangeStats]);

  const colorSchemes = {
    category: [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
      "#84CC16",
    ],
    employer: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"],
    applicationStatus: ["#10B981", "#EF4444"],
  };

  if (isLoading) return <Loading />;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Admin Dashboard
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              WorkHive platform overview and analytics
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/all-users")}
            className={`flex items-center gap-2 ${
              isDark
                ? "bg-blue-800/60 text-blue-300 hover:bg-blue-800/70 border-2 border-blue-500"
                : "bg-blue-200 text-blue-700 hover:bg-blue-100 border-2 border-blue-400"
            } justify-center cursor-pointer  px-3 py-3 rounded-xl transition-all ease-in-out duration-200`}
          >
            <UsersRound />
            <span>Manage Users</span>
          </button>
        </div>

        {!summaryStats ? (
          <div
            className={`rounded-xl p-8 text-center ${
              isDark
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-100 shadow-lg"
            }`}
          >
            <BarChart3
              className={`w-16 h-16 mx-auto mb-4 ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              No Statistics Available
            </h3>
            <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
              No platform data found to display statistics.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <SummaryCard summaryStats={summaryStats} />

            {/* Timeline Chart */}
            {formatTimelineStats && (
              <LineChartStats employerStats={formatTimelineStats} />
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <StatsPieChart
                data={formatCategoryData}
                colors={colorSchemes.category}
                title="Jobs by Category"
                icon={TrendingUp}
              />

              <StatsPieChart
                data={formatApplicationJobsData}
                colors={colorSchemes.applicationStatus}
                title="Application Coverage"
                icon={UserCheck}
              />
            </div>

            {/* Employers Table */}
            <EmployerDetailsTable adminStats={adminStats} />

            {/* Detailed Category Table */}
            <CategoryDetailsTable adminStats={adminStats} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
