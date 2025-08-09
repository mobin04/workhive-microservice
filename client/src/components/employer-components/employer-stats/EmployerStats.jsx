import React, { useContext, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import useFetchEmpStats from "../../../hooks/employer-hooks/useFetchEmployerStats";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loading from "../../loader/Loading";

const EmployerStatistics = () => {
  const { isDark } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.user);
  const [employerStats, setEmployerStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user?.role !== "employer") navigate("/");
  }, [user, navigate]);

  const { isLoading, refetch } = useFetchEmpStats(user?._id, setEmployerStats);

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  // Color schemes for different themes
  const colorSchemes = {
    jobType: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    jobLevel: ["#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"],
    category: ["#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"],
    location: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"],
  };

  // Format timeline data for line chart
  const formatTimelineData = useMemo(() => {
    return [
      {
        period: "Last 7 Days",
        jobs: employerStats?.timeRangeStats[0]?.last7Days,
      },
      {
        period: "Last 30 Days",
        jobs: employerStats?.timeRangeStats[0]?.last30Days,
      },
      {
        period: "Last 90 Days",
        jobs: employerStats?.timeRangeStats[0]?.last90Days,
      },
    ];
  }, [employerStats?.timeRangeStats]);

  // Format data for pie charts
  const formatJobTypeData = useMemo(() => {
    return employerStats?.jobTypeStats?.map((item) => ({
      name: item?.type
        ?.replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      value: item?.count,
      applications: item?.applications,
    }));
  }, [employerStats?.jobTypeStats]);

  const formatJobLevelData = useMemo(() => {
    return employerStats?.jobLevelStats?.map((item) => ({
      name: item?.level
        ?.replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      value: item?.count,
      applications: item?.applications,
    }));
  }, [employerStats?.jobLevelStats]);

  const formatCategoryData = useMemo(() => {
    return employerStats?.categoryStats?.map((item) => ({
      name: item?.category,
      value: item?.count,
      applications: item?.applications,
    }));
  }, [employerStats?.categoryStats]);

  const formatLocationData = useMemo(() => {
    return employerStats?.locationStats?.map((item) => ({
      name: item?.location,
      value: item?.count,
      applications: item?.applications,
    }));
  }, [employerStats?.locationStats]);
  

  // RESENTLY UPDATED JOBS FOR  BADGING TOMMOROW 🍾

  // Custom tooltip component for pie charts
  // eslint-disable-next-line no-unused-vars
  const CustomTooltip = ({ active, payload, label }) => {
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

  // Pie chart component
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
      <div className="h-75">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={85}
              paddingAngle={1.5}
              dataKey="value"
              label={({ percent, applications }) => `apps(${applications}) ${(percent * 100).toFixed(0)}%`}
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
                marginTop: "10px",
                color: isDark ? "#F3F4F6" : "#1F2937",
                paddingBottom: "10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (isLoading) return <Loading />;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-600"
            }`}
          >
            Employer Statistics Dashboard
          </h1>
          <p
            className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Complete overview of your job postings and applications
          </p>
        </div>

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
                  {employerStats?.summary?.totalJobsPosted}
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
                  {employerStats?.summary?.activeJobs}
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
                  {employerStats?.summary?.totalApplications}
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
                    employerStats?.summary?.averageApplicationsPerJob?.toFixed(
                      2
                    )
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
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
      </div>
    </div>
  );
};

export default EmployerStatistics;
