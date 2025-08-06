import React, { useState, useMemo, useContext, useEffect } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import useFormatSalary from "../../hooks/useFormatSalary";
import useFormatDate from "../../hooks/useFormatDate";
import usePostedDate from "../../hooks/usePostedDate";
import { useQuery } from "@tanstack/react-query";
import { envVariables } from "../../config";
import Loading from "../loader/Loading";
import { fetchData } from "../../server/fetchData";
import { useDispatch, useSelector } from "react-redux";
import { toSaveJob } from "../../store/slices/jobSlice";
import useSaveAndRemoveJob from "../../hooks/useSaveAndRemoveJob";
import removeJobFromSaved from "../../server/removeJobFromSaved";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  SearchX,
} from "lucide-react";

const SavedJobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { savedJobs } = useSelector((state) => state.jobs);
  const dispatch = useDispatch();
  const { isDark, getJobTypeColor, getJobLevelColor, saveJobThemes } =
    useContext(ThemeContext);

  useEffect(() => {
    if (user && user?.role !== "job_seeker") {
      navigate("/");
    }
  }, [user, navigate]);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => fetchData({}, envVariables.GET_SAVED_JOBS, dispatch),
    enabled: false,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (data) {
      dispatch(toSaveJob(data?.data?.jobs));
    }
  }, [data, dispatch]);

  // Search jobs
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return savedJobs;

    const query = searchQuery.toLowerCase();
    return savedJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query)
    );
  }, [searchQuery, savedJobs]);

  const formatSalary = useFormatSalary();
  const formatDate = useFormatDate();
  const posted = usePostedDate();

  // Hanlde remove job from saved list
  const { handleSave: handleRemove, pendingJobs: removePending } =
    useSaveAndRemoveJob(
      (id) => removeJobFromSaved(envVariables.REMOVE_SAVED_JOB, id),
      refetch
    );

  if (isLoading) return <Loading />;
  return (
    <div
      className={`min-h-screen ${saveJobThemes.themeClasses} transition-colors duration-300`}
    >
      {savedJobs && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xl md:text-2xl font-bold border-b pb-3 md:pb-5 text-blue-500 border-gray-500">
                  {filteredJobs.length} Job
                  {filteredJobs.length !== 1 ? "s" : ""} Saved
                </p>
              </div>
            </div>

            {/* Search Bar */}
            {savedJobs?.length > 0 && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search saved jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${saveJobThemes.inputClasses} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                />
              </div>
            )}
          </div>

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <SearchX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {searchQuery ? "No jobs found" : "No saved jobs yet"}
              </h3>
              <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start saving jobs to see them here"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className={`${saveJobThemes.cardClasses} border rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    {/* Main Content */}
                    <div className="flex space-x-4 flex-1">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <img
                          src={job.companyLogo}
                          alt={`${job.company} logo`}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM3NDNkYiIvPgo8cGF0aCBkPSJNMjAgMjBoMjR2NGgtMjR2LTR6bTAgOGgyNHY0aC0yNHYtNHptMCA4aDI0djRoLTI0di00eiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+";
                          }}
                        />
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">
                              {job.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span
                                className={`font-medium ${
                                  isDark ? "text-gray-200" : "text-gray-700"
                                }`}
                              >
                                {job.company}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Job Info */}
                        <div className="flex items-center space-x-4 mb-3 text-sm">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span
                              className={
                                isDark ? "text-gray-300" : "text-gray-600"
                              }
                            >
                              {job.location}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {/* <DollarSign className="h-4 w-4 text-gray-400" /> */}
                            <span
                              className={`font-medium ${
                                isDark ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {formatSalary(
                                job.salaryMinPerMonth,
                                job.salaryMaxPerMonth
                              )}
                            </span>
                          </div>
                          <div className="hidden md:flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-400">
                              {posted(job.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="md:flex items-center space-x-2 mb-4">
                          <div className="flex gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJobTypeColor(
                                job.jobType
                              )}`}
                            >
                              {job.jobType.replace("_", " ")}
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getJobLevelColor(
                                job.jobLevel
                              )}`}
                            >
                              {job.jobLevel.replace("_", " ")}
                            </span>
                          </div>
                          <span
                            className={`mt-3 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                              job?.status === "open"
                                ? saveJobThemes.activeStatusClasses
                                : saveJobThemes.closeStatusClasses
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>

                        {/* Description */}
                        <p
                          className={`text-sm leading-relaxed ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          } line-clamp-2`}
                        >
                          {job.description.replace(/\n/g, " ")}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span className="mx-2">•</span>
                            <span>Expires {formatDate(job.expiresAt)}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigate(`/job?id=${job?._id}`)}
                              className={`p-2 rounded-lg ${
                                isDark
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-blue-200"
                              } text-blue-600 transition-colors cursor-pointer`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemove(job._id)}
                              className={`p-2 cursor-pointer rounded-lg ${
                                isDark
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-red-200"
                              } text-red-500 transition-colors`}
                            >
                              {removePending[job._id] ? (
                                <div className="animate-spin rounded-full w-4 h-4 border-2 border-b-transparent border-blue-500"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
