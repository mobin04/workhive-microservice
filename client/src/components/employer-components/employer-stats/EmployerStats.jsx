import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../contexts/ThemeContext";
import useFetchEmpStats from "../../../hooks/employer-hooks/useFetchEmployerStats";
import { Briefcase, Users, MapPin, Award, TrendingUp } from "lucide-react";
import StatsPieChart from "../statistics-tools/pie-chart/PieChart";
import NoDataState from "./NoDataState";
import LineChartStats from "../statistics-tools/line-chart/LineChart";

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

            {/* Time line chart */}
            <LineChartStats employerStats={employerStats} />

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