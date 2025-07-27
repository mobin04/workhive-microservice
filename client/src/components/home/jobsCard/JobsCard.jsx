import React, { memo, useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import usePostedDate from "../../../hooks/usePostedDate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { envVariables } from "../../../config";
import { fetchJobs } from "../../../server/fetchJobs";
import { toSaveJob } from "../../../store/slices/jobSlice";
import saveJobToSaveList from "../../../server/saveJob";
import { Bookmark, Building2, Clock, Frown, MapPin } from "lucide-react";
import removeJobFromSaved from "../../../server/removeJobFromSaved";

const JobsCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobs, savedJobs } = useSelector((state) => state.jobs);
  const [pendingJobs, setPendingJobs] = useState({});

  const {
    isDark,
    dynamicFontColor,
    themeClasses,
    getJobTypeColor,
    getJobLevelColor,
  } = useContext(ThemeContext);

  const { data, refetch } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => fetchJobs({}, envVariables.GET_SAVED_JOBS, null),
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

  const posted = usePostedDate();

  const useSaveJob = (url, handleSaveJobs) => {
    return useMutation({
      mutationFn: (id) => handleSaveJobs(url, id),
    });
  };

  const mutations = {
    saveJob: useSaveJob(envVariables.SAVE_JOB, saveJobToSaveList),
    removeJob: useSaveJob(envVariables.REMOVE_SAVED_JOB, removeJobFromSaved),
  };

  const { mutateAsync: mutateAsyncSaveJob } = mutations.saveJob;
  const { mutateAsync: mutateAsyncRemove } = mutations.removeJob;

  const handleSave = async (id, mutateFn) => {
    setPendingJobs((prev) => ({ ...prev, [id]: true }));
    try {
      await mutateFn(id);
      await refetch();
    } catch (err) {
      console.error("failed:", err);
    } finally {
      setPendingJobs((prev) => ({ ...prev, [id]: false }));
    }
  };

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
                        onClick={() => handleSave(job?._id, mutateAsyncRemove)}
                        className={`p-2 rounded-lg cursor-pointer ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        {pendingJobs[job._id] ? (
                          <div className="animate-spin rounded-full w-4 h-4 border-2 border-b-transparent border-blue-500"></div>
                        ) : (
                          <Bookmark className="h-5 w-5 text-red-600 fill-red-600" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSave(job?._id, mutateAsyncSaveJob)}
                        className={`p-2 rounded-lg cursor-pointer ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        {pendingJobs[job._id] ? (
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
