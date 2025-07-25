import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { envVariables } from "../../config";
import { fetchJobs } from "../../utils/fetchJobs";

import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Building,
  Tag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../loader/Loading";

const JobViewer = () => {
  const {
    getJobTypeColor,
    getJobLevelColor,
    jobViewerThemeClass,
    getStatusColor,
  } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const url = useMemo(() => {
    const jobId = new URLSearchParams(location.search).get("id");
    return `${envVariables.GET_JOB_URL}/${jobId}`;
  }, [location.search]);

  const { data, isLoading } = useQuery({
    queryKey: ["job", url],
    queryFn: ({ queryKey }) => fetchJobs({}, queryKey[1]),
    refetchOnWindowFocus: false,
  });

  const jobData = data?.data?.job;

  const formatSalary = useCallback((min, max) => {
    const formatNumber = (num) => {
      if (num >= 100000) {
        return `₹${(num / 100000).toFixed(1)}L`;
      } else if (num >= 1000) {
        return `₹${(num / 1000).toFixed(1)}K`;
      } else {
        return `₹${num}`;
      }
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className={`w-full  ${jobViewerThemeClass.container}`}>
      <div
        className={`max-w-7xl w-full mx-auto p-6 rounded-lg  shadow-lg ${jobViewerThemeClass.container}`}
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            <img
              src={jobData.companyLogo}
              alt={`${jobData.company} logo`}
              className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1
                  className={`text-3xl font-bold mb-2 ${jobViewerThemeClass.text.primary}`}
                >
                  {jobData.title}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <Building
                    className={`w-5 h-5 ${jobViewerThemeClass.text.secondary}`}
                  />
                  <span
                    className={`text-lg font-semibold ${jobViewerThemeClass.text.secondary}`}
                  >
                    {jobData.company}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin
                    className={`w-4 h-4 ${jobViewerThemeClass.text.muted}`}
                  />
                  <span className={jobViewerThemeClass.text.muted}>
                    {jobData.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {jobData.status === "open" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span
                  className={`font-semibold capitalize ${getStatusColor(
                    jobData.status
                  )}`}
                >
                  {jobData.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg border ${jobViewerThemeClass.card}`}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign
                className={`w-4 h-4 ${jobViewerThemeClass.text.secondary}`}
              />
              <span
                className={`text-sm font-medium ${jobViewerThemeClass.text.secondary}`}
              >
                Salary
              </span>
            </div>
            <div
              className={`text-lg font-bold ${jobViewerThemeClass.text.primary}`}
            >
              {formatSalary(
                jobData.salaryMinPerMonth,
                jobData.salaryMaxPerMonth
              )}
            </div>
            <div className={`text-xs ${jobViewerThemeClass.text.muted}`}>
              per month
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${jobViewerThemeClass.card}`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock
                className={`w-4 h-4 ${jobViewerThemeClass.text.secondary}`}
              />
              <span
                className={`text-sm font-medium ${jobViewerThemeClass.text.secondary}`}
              >
                Job Type
              </span>
            </div>
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJobTypeColor(
                jobData.jobType
              )}`}
            >
              {jobData.jobType.replace("_", " ")}
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${jobViewerThemeClass.card}`}>
            <div className="flex items-center gap-2 mb-1">
              <Users
                className={`w-4 h-4 ${jobViewerThemeClass.text.secondary}`}
              />
              <span
                className={`text-sm font-medium ${jobViewerThemeClass.text.secondary}`}
              >
                Level
              </span>
            </div>
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJobLevelColor(
                jobData.jobLevel
              )}`}
            >
              {jobData.jobLevel.replace("_", " ")}
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${jobViewerThemeClass.card}`}>
            <div className="flex items-center gap-2 mb-1">
              <Tag
                className={`w-4 h-4 ${jobViewerThemeClass.text.secondary}`}
              />
              <span
                className={`text-sm font-medium ${jobViewerThemeClass.text.secondary}`}
              >
                Category
              </span>
            </div>
            <div
              className={`text-lg font-bold ${jobViewerThemeClass.text.primary}`}
            >
              {jobData.category}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="mb-8">
          <h2
            className={`text-xl font-semibold mb-4 ${jobViewerThemeClass.text.primary}`}
          >
            Job Description
          </h2>
          <div
            className={`prose max-w-none ${jobViewerThemeClass.text.secondary}`}
          >
            <p className="leading-relaxed whitespace-pre-line text-base">
              {jobData.description}
            </p>
          </div>
        </div>

        {/* Timeline Information */}
        <div
          className={`p-4 rounded-lg border mb-8 ${jobViewerThemeClass.card}`}
        >
          <h3
            className={`text-lg font-semibold mb-3 ${jobViewerThemeClass.text.primary}`}
          >
            Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar
                className={`w-4 h-4 ${jobViewerThemeClass.text.secondary}`}
              />
              <div>
                <div className={`text-sm ${jobViewerThemeClass.text.muted}`}>
                  Posted
                </div>
                <div
                  className={`font-medium ${jobViewerThemeClass.text.primary}`}
                >
                  {formatDate(jobData.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar
                className={`w-4 h-4 ${jobViewerThemeClass.text.secondary}`}
              />
              <div>
                <div className={`text-sm ${jobViewerThemeClass.text.muted}`}>
                  Updated
                </div>
                <div
                  className={`font-medium ${jobViewerThemeClass.text.primary}`}
                >
                  {formatDate(jobData.updatedAt || jobData.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar
                className={`w-4 h-4 ${jobViewerThemeClass.text.secondary}`}
              />
              <div>
                <div className={`text-sm ${jobViewerThemeClass.text.muted}`}>
                  Expires
                </div>
                <div
                  className={`font-medium ${jobViewerThemeClass.text.primary}`}
                >
                  {formatDate(jobData.expiresAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/apply?id=${jobData._id}`)}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${jobViewerThemeClass.button.primary}`}
          >
            Apply Now
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold border transition-colors cursor-pointer ${jobViewerThemeClass.button.secondary}`}
          >
            Save Job
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold border transition-colors cursor-pointer ${jobViewerThemeClass.button.secondary}`}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobViewer;
