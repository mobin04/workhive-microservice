import React, { memo, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../contexts/ThemeContext";
import usePostedDate from "../../../hooks/usePostedDate";
import { envVariables } from "../../../config";
import saveJobToSaveList from "../../../server/saveJob";
import removeJobFromSaved from "../../../server/removeJobFromSaved";
import useSaveAndRemoveJob from "../../../hooks/useSaveAndRemoveJob";
import useFetchSavedJobs from "../../../hooks/useFetchSavedJobs";
import { useSelector, useDispatch } from "react-redux";
import useFormatSalary from "../../../hooks/useFormatSalary";
import { likeJob, undoLikeJob } from "../../../store/slices/jobSlice";
import { likeJobApi, undoLikeJobApi } from "../../../server/likeJob";
import { useMergeWithdrawnApp } from "../../../hooks/useMergeWithdrawnApp";
import {
  Bookmark,
  Building2,
  CircleAlert,
  CircleCheck,
  Clock,
  Frown,
  MapPin,
  ThumbsUp,
} from "lucide-react";

const JobsCard = ({ isAppLoading, isWithdrawLoading }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobs, savedJobs } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.user);

  const {
    isDark,
    dynamicFontColor,
    themeClasses,
    getJobTypeColor,
    getJobLevelColor,
  } = useContext(ThemeContext);

  const { refetch } = useFetchSavedJobs();

  const fixedApplications = useMergeWithdrawnApp();

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

  const handleAddLike = async (jobId) => {
    dispatch(likeJob({ userId: user?._id, jobId }));
    try {
      await likeJobApi(jobId);
    } catch (err) {
      console.log("ERROR LIKE" + err);
      dispatch(undoLikeJob({ userId: user?._id, jobId }));
    }
  };

  const handleUndoLike = async (jobId) => {
    dispatch(undoLikeJob({ userId: user?._id, jobId }));
    try {
      await undoLikeJobApi(jobId);
    } catch (err) {
      console.log("ERROR UNDO LIKE" + err);
      dispatch(likeJob({ userId: user?._id, jobId }));
    }
  };

  const hasLiked = (job) => {
    return job.likes?.includes(user?._id);
  };

  const formatSalary = useFormatSalary();

  const getApplications = useCallback(
    (id) => {
      if (fixedApplications) {
        const getApp = fixedApplications.filter((app) => app?.job?._id === id);
        return getApp;
      }
    },
    [fixedApplications]
  );

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
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://www.svgrepo.com/download/382706/picture-photo-image.svg";
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">
                        {job.title}
                      </h3>
                      {job?.status === "open" ? (
                        <div
                          className={`inline-flex my-2 gap-1 justify-center items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            isDark
                              ? "bg-green-900 text-green-200 border-green-800"
                              : "bg-green-400/20 text-green-900 border-green-500"
                          }`}
                        >
                          <CircleCheck className="h-3 w-3" />
                          <span>{job?.status}</span>
                        </div>
                      ) : (
                        <div
                          className={`inline-flex my-2 gap-1 justify-center items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            isDark
                              ? "bg-red-900 text-red-200 border-red-800"
                              : "bg-red-400/20 text-red-900 border-red-500"
                          }`}
                        >
                          <CircleAlert className="h-3 w-3" />
                          <span>{job?.status}</span>
                        </div>
                      )}
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
                        {job?.likes?.length > 0 ? (
                          <span className="flex items-center space-x-1 text-blue-400">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="">{job?.likes?.length}</span>
                          </span>
                        ) : null}
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
                            {formatSalary(
                              job?.salaryMinPerMonth,
                              job?.salaryMaxPerMonth
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    {hasLiked(job) ? (
                      <button
                        onClick={() => handleUndoLike(job?._id)}
                        className={`group flex justify-center items-center p-2 min-w-10 rounded-lg cursor-pointer ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        <ThumbsUp className="h-5 w-5 group-hover:-rotate-6 group-hover:scale-110 text-blue-500 transition-all duration-200" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddLike(job?._id)}
                        className={`group flex justify-center items-center p-2 min-w-10 rounded-lg cursor-pointer ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        <ThumbsUp className="h-5 w-5 group-hover:-rotate-6 group-hover:scale-110 transition-all duration-200" />
                      </button>
                    )}

                    {isJobSaved(job._id) ? (
                      <button
                        onClick={() => handleRemove(job?._id)}
                        disabled={removePending[job._id]}
                        className={`flex justify-center items-center p-2 min-w-10 rounded-lg cursor-pointer ${
                          isDark ? "hover:bg-gray-500" : "hover:bg-gray-100"
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
                        disabled={
                          savePending[job._id] || job?.status === "closed"
                        }
                        className={`flex justify-center disabled:text-gray-500 disabled:cursor-not-allowed items-center p-2 min-w-10 rounded-lg cursor-pointer ${
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

                    {isAppLoading || isWithdrawLoading ? (
                      <div className="animate-spin border-4 border-b-transparent rounded-full w-5 h-5"></div>
                    ) : (
                      <>
                        {getApplications(job?._id)?.[0]?.application ? (
                          <div>
                            <button
                              onClick={() => navigate("/applications")}
                              className={` ${
                                isDark
                                  ? "bg-gray-800 border-gray-400 hover:bg-gray-700"
                                  : "bg-gray-100 border-gray-400 hover:bg-gray-200"
                              } border rounded-lg px-6 py-2 transition-colors cursor-pointer`}
                            >
                              View Application
                            </button>
                          </div>
                        ) : job?.status !== "closed" ? (
                          <button
                            onClick={() => navigate(`/job?id=${job._id}`)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            Apply Now
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/job?id=${job._id}`)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            View Job
                          </button>
                        )}
                      </>
                    )}
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
