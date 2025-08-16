import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../contexts/ThemeContext";
import useFetchEmpStats from '../../../hooks/employer-hooks/useFetchEmployerStats'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Briefcase,
  Users,
  MapPin,
  Award,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  BarChart3,
} from "lucide-react";

const EmployerStatistics = () => {
  const { isDark } = useContext(ThemeContext);
  const [employerStats, setEmployerStats] = useState(null);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user?.role !== "employer") {
      navigate("/");
    }
  }, [user, navigate]);

  const { isLoading, refetch } = useFetchEmpStats(user?._id, setEmployerStats);

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  
  const hasStats = useMemo(() => {
    if (!employerStats) return false;

    const hasSummaryData =
      employerStats.summary && employerStats.summary.totalJobsPosted > 0;

    const hasChartData =
      (employerStats.jobTypeStats && employerStats.jobTypeStats.length > 0) ||
      (employerStats.jobLevelStats && employerStats.jobLevelStats.length > 0) ||
      (employerStats.categoryStats && employerStats.categoryStats.length > 0) ||
      (employerStats.locationStats && employerStats.locationStats.length > 0);

    return hasSummaryData || hasChartData;
  }, [employerStats]);

  const colorSchemes = {
    jobType: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    jobLevel: ["#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"],
    category: ["#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"],
    location: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"],
  };


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

  // Format data for pie charts with null safety
  const formatJobTypeData = useMemo(() => {
    return (
      employerStats?.jobTypeStats?.map((item) => ({
        name: item?.type
          ?.replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: item?.count,
        applications: item?.applications,
      })) || []
    );
  }, [employerStats?.jobTypeStats]);

  const formatJobLevelData = useMemo(() => {
    return (
      employerStats?.jobLevelStats?.map((item) => ({
        name: item?.level
          ?.replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: item?.count,
        applications: item?.applications,
      })) || []
    );
  }, [employerStats?.jobLevelStats]);

  const formatCategoryData = useMemo(() => {
    return (
      employerStats?.categoryStats?.map((item) => ({
        name: item?.category,
        value: item?.count,
        applications: item?.applications,
      })) || []
    );
  }, [employerStats?.categoryStats]);

  const formatLocationData = useMemo(() => {
    return (
      employerStats?.locationStats?.map((item) => ({
        name: item?.location,
        value: item?.count,
        applications: item?.applications,
      })) || []
    );
  }, [employerStats?.locationStats]);

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }) => {
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

  // Custom tooltip for line chart
  const LineTooltip = ({ active, payload, label }) => {
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

  // Pie chart component with no data handling
  // eslint-disable-next-line no-unused-vars
  const StatsPieChart = ({ data, colors, title, icon: Icon }) => (
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

  // No data state component
  const NoDataState = () => (
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
        className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
          isDark
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        onClick={() => console.log("Navigate to create job")}
      >
        <Plus className="w-5 h-5 mr-2" />
        Post Your First Job
      </button>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Loading statistics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with theme toggle */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-600"
              }`}
            >
              Employer Statistics Dashboard
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Complete overview of your job postings and applications
            </p>
          </div>
        </div>

        {/* Show no data state if no statistics are found */}
        {!hasStats ? (
          <NoDataState />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                      Total Jobs Posted
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {employerStats?.summary?.totalJobsPosted || 0}
                    </p>
                  </div>
                  <Briefcase
                    className={`w-8 h-8 ${
                      isDark ? "text-blue-400" : "text-blue-600"
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
                      Active Jobs
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {employerStats?.summary?.activeJobs || 0}
                    </p>
                  </div>
                  <TrendingUp
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
                      Total Applications
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {employerStats?.summary?.totalApplications || 0}
                    </p>
                  </div>
                  <Users
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
                      Avg Applications/Job
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {Number(
                        (
                          employerStats?.summary?.averageApplicationsPerJob || 0
                        ).toFixed(2)
                      )}
                    </p>
                  </div>
                  <Award
                    className={`w-8 h-8 ${
                      isDark ? "text-orange-400" : "text-orange-600"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Job Posting Timeline Line Chart */}
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

            {/* Pie Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StatsPieChart
                data={formatJobTypeData}
                colors={colorSchemes.jobType}
                title="Job Types Distribution"
                icon={Briefcase}
              />

              <StatsPieChart
                data={formatJobLevelData}
                colors={colorSchemes.jobLevel}
                title="Job Levels Distribution"
                icon={Award}
              />

              <StatsPieChart
                data={formatCategoryData}
                colors={colorSchemes.category}
                title="Categories Distribution"
                icon={TrendingUp}
              />

              <StatsPieChart
                data={formatLocationData}
                colors={colorSchemes.location}
                title="Locations Distribution"
                icon={MapPin}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployerStatistics;
