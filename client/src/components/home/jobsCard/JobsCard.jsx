import React, { memo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { Bookmark, Building2, Clock, Frown, MapPin } from "lucide-react";
import usePostedDate from "../../../hooks/usePostedDate";
import { envVariables } from "../../../config";
import saveJobToSaveList from "../../../server/saveJob";
import removeJobFromSaved from "../../../server/removeJobFromSaved";
import useSaveAndRemoveJob from "../../../hooks/useSaveAndRemoveJob";
import useFetchSavedJobs from "../../../hooks/useFetchSavedJobs";
import { useSelector } from "react-redux";

const JobsCard = () => {
  const navigate = useNavigate();
  const { jobs, savedJobs } = useSelector((state) => state.jobs);

  const {
    isDark,
    dynamicFontColor,
    themeClasses,
    getJobTypeColor,
    getJobLevelColor,
  } = useContext(ThemeContext);

  const {refetch} = useFetchSavedJobs();

  const posted = usePostedDate();

  // Handle save job
  const { handleSave, pendingJobs: savePending } = useSaveAndRemoveJob(
    (id) => saveJobToSaveList(envVariables.SAVE_JOB, id),
    refetch
  );

  // Hanlde remove job from saved list
  const { handleSave: handleRemove, pendingJobs: removePending } =
    useSaveAndRemoveJob(
      (id) => removeJobFromSaved(envVariables.REMOVE_SAVED_JOB, id),
      refetch
    );

  const isJobSaved = (id) => {
    const is = savedJobs?.some((saveJob) => saveJob._id === id);
    if (is) return true;
    return false;
  };

  return (
    <div>
      {jobs && jobs?.data?.jobs.length !== 0 ? (
        <div className="space-y-4 mb-8">
          {jobs &&
            jobs?.data?.jobs.map((job) => (
              <div
                key={job._id}
                className={`${themeClasses} p-6 rounded-xl hover:shadow-lg transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={job.companyLogo}
                        alt={`${job.company} logo`}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">
                        {job.title}
                      </h3>
                      <div
                        className={`flex flex-wrap items-center gap-4 text-sm ${dynamicFontColor} mb-2`}
                      >
                        <span className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4" />
                          <span>{job.company}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{posted(job.createdAt)}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeColor(
                            job.jobType
                          )}`}
                        >
                          {job.jobType.replace("_", " ")}
                        </div>

                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getJobLevelColor(
                            job.jobLevel
                          )}`}
                        >
                          {job.jobLevel.replace("_", " ")}
                        </div>
                        {job.salaryMinPerMonth && (
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border  ${
                              isDark
                                ? "bg-gray-700 text-gray-200 border-gray-500"
                                : "bg-gray-200 text-gray-800 border-gray-400"
                            } rounded text-sm`}
                          >
                            {`${
                              job.salaryMinPerMonth > 1000
                                ? Math.floor(job.salaryMinPerMonth / 1000) + "k"
                                : job.salaryMinPerMonth
                            } - ${
                              job.salaryMaxPerMonth > 1000
                                ? Math.floor(job.salaryMaxPerMonth / 1000) + "k"
                                : job.salaryMaxPerMonth
                            } / M`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    {isJobSaved(job._id) ? (
                      <button
                        onClick={() => handleRemove(job?._id)}
                        disabled={removePending[job._id]}
                        className={`flex justify-center items-center p-2 min-w-10 rounded-lg cursor-pointer ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        {removePending[job._id] ? (
                          <div className="animate-spin rounded-full w-4 h-4 border-2 border-b-transparent border-blue-500"></div>
                        ) : (
                          <Bookmark className="h-5 w-5 text-red-600 fill-red-600" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSave(job?._id)}
                        disabled={savePending[job._id]}
                        className={`flex justify-center items-center p-2 min-w-10 rounded-lg cursor-pointer ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        {savePending[job._id] ? (
                          <div className="animate-spin rounded-full w-4 h-4 border-2 border-b-transparent border-red-500"></div>
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/job?id=${job._id}`)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="flex gap-3 justify-center items-center my-15">
          <div className="text-gray-400 text-3xl font-bold">No Jobs Found!</div>
          <Frown className="text-gray-400 scale-150" />
        </div>
      )}
    </div>
  );
};

export default memo(JobsCard);
