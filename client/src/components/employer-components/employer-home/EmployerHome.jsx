import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { envVariables } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { setJobs } from "../../../store/slices/jobSlice";
import Loading from "../../loader/Loading";
import useFetchJobByEmpId from "../../../hooks/employer-hooks/useFetchJobByEmpId";
import { useNavigate } from "react-router-dom";
import CreateOrEditJob from "../create-or-edit-job/CreateOrEditJob";
import useEditJob from "../../../hooks/employer-hooks/useEditJob";
import useCreateJob from "../../../hooks/employer-hooks/useCreateJob";
import { deleteJob } from "../../../server/deleteJob";
import WarningMessage from "../../warning-msg/WarningMessage";
import {
  MapPin,
  Users,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  ThumbsUp,
  ChartNoAxesCombined,
  ExternalLink,
} from "lucide-react";
import useTriggerPopup from "../../../hooks/useTriggerPopup";
import formatDateString from "../../../utils/formatDateString";
import formatSalaries from "../../../utils/formatSalary";

const EmployerHome = () => {
  const { isDark, getJobTypeColor, getJobLevelColor } =
    useContext(ThemeContext);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [isJobCreateMode, setIsJobCreateMode] = useState(false);
  const [jobs, setJobDetails] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState({
    isTrue: false,
    jobId: "",
  });

  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isJobEditingMode, setIsJobEditingMode] = useState({
    isTrue: false,
    jobData: null,
  });
  const { jobs: jobDetails } = useSelector((state) => state.jobs);
  const { triggerPopup } = useTriggerPopup();

  useEffect(() => {
    if (jobDetails && jobDetails?.data?.jobs?.length > 0)
      setJobDetails(jobDetails?.data?.jobs || []);
  }, [jobDetails]);

  const {formatDate} = formatDateString();

  // Quick update in UI When job updated
  const handleSaveUpdatedJob = (jobData) => {
    if (!jobs) return;
    const updatedJob = jobs?.map((job) => {
      if (job._id === jobData?._id) {
        return jobData;
      } else {
        return job;
      }
    });

    setJobDetails(updatedJob);
  };

  const onClose = () => {
    setIsJobCreateMode(false);
    setIsJobEditingMode({ isTrue: false, jobData: null });
    setIsDeleteMode({ isTrue: false, jobId: "" });
  };

  const { isPending, mutate } = useEditJob(handleSaveUpdatedJob, onClose);
  const { mutate: jobCreateMutation, isPending: isJobCreatePending } =
    useCreateJob(setJobDetails, onClose);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { data, isLoading, refetch } = useFetchJobByEmpId(
    `${envVariables.GET_ALL_JOBS_EMPLOYER_URL}/${user?._id}/employer`,
    false
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (data && user?.role === "employer") {
      dispatch(setJobs(data));
    }
  }, [data, dispatch, user]);

  // const jobs = jobDetails?.data?.jobs || [];

  const {formatSalary} = formatSalaries();

  // Get the search jobs
  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch =
      job?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job?.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job?.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || job?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get Most Popular jobs
  const isTrending = (job) => {
    const now = new Date();
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(now.getDate() - 5);

    if (
      job?.applications?.length > 0 &&
      job?.updatedAt &&
      new Date(job?.updatedAt) >= fiveDaysAgo
    ) {
      return true;
    }

    return false;
  };

  // Handle creating job
  const onSubmit = (jobData) => {
    const formData = new FormData();
    for (const key in jobData) {
      const value = jobData[key];

      if (value instanceof File) {
        formData.append(key, value);
      } else {
        const isObject = typeof value === "object" && value !== null;
        formData.append(key, isObject ? JSON.stringify(value) : value);
      }
    }

    jobCreateMutation({
      credential: formData,
    });
  };

  // Handle updating job
  const onSubmitUpdatedJob = (jobData) => {
    const formData = new FormData();
    for (const key in jobData) {
      const value = jobData[key];

      if (value instanceof File) {
        formData.append(key, value);
      } else {
        const isObject = typeof value === "object" && value !== null;
        formData.append(key, isObject ? JSON.stringify(value) : value);
      }
    }

    mutate({
      url: `${envVariables.UPDATE_JOB_URL}/${isJobEditingMode?.jobData?._id}`,
      credential: formData,
    });
  };

  // Handle Deleting job
  const handleDelete = async () => {
    if (!isDeleteMode.isTrue) return;

    setIsDeleteLoading(true);
    const { message, jobId } = await deleteJob({
      jobId: isDeleteMode?.jobId,
      setIsDeleteLoading,
      onClose,
      dispatch,
    });
    if (message) {
      const filteredJob = jobs?.filter((job) => job?._id !== jobId);
      setJobDetails(filteredJob);
      triggerPopup({
        message: message || "Job deleted successfully",
        type: "success",
      });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div
      className={`min-h-screen flex justify-center  transition-colors duration-200  ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {(isJobCreateMode || isJobEditingMode?.isTrue) && (
        <CreateOrEditJob
          isOpen={isJobCreateMode || isJobEditingMode?.isTrue}
          onClose={onClose}
          jobData={isJobEditingMode?.isTrue ? isJobEditingMode?.jobData : null}
          onSubmit={isJobCreateMode ? onSubmit : onSubmitUpdatedJob}
          isLoading={isPending || isJobCreatePending}
        />
      )}

      {isDeleteMode.isTrue && isDeleteMode.jobId && (
        <WarningMessage
          handleCancel={onClose}
          handleConfirm={handleDelete}
          isPending={isDeleteLoading}
          message={
            "Are you sure? Once deleted, this job and all its associated information will be permanently removed. This action cannot be undone"
          }
          title={"permanently Delete Job"}
          pendingBtnText={"Deleting..."}
          btnText={"Delete"}
        />
      )}

      <div className="container w-7xl px-4 py-8">
        {/* Job Management Section */}
        <div
          className={`rounded-xl ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          } shadow-sm`}
        >
          {/* Header */}
          <div
            className={`p-6 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Your Job Postings</h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Manage and track your job listings
                </p>
              </div>
              <div className="flex gap-2 items-center justify-center">
                <button
                  onClick={() => setIsJobCreateMode(true)}
                  className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300 shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Post New Job
                </button>
                <button
                  onClick={() => navigate("/employer-stats")}
                  className={`${
                    isDark
                      ? "bg-gray-500/50 text-white hover:bg-gray-500/40"
                      : "bg-gray-400/20 text-gray-700 hover:bg-gray-400/30"
                  } cursor-pointer px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300 shadow-md`}
                >
                  <ChartNoAxesCombined className="h-4 w-4" />
                  View Statistics
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div
            className={`p-6 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md  ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer bg-blue-200/10 py-2 px-2 rounded-md shadow-md`}
              >
                <Filter
                  className={`h-4 w-4 ${
                    isDark ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-0.5 border rounded-md focus:outline-none border-none focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "bg-blue-200/10 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div
            className={`divide-y${
              isDark ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            {filteredJobs?.map((job) => (
              <div
                key={job._id}
                className={`p-6 ${
                  isDark ? "hover:bg-gray-600/10" : "hover:bg-gray-50"
                }   transition-all duration-400 ease-in-out hover:scale-[0.99] transition-scale`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={job?.companyLogo}
                          alt={`${job?.company} logo`}
                          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex gap-2 justify-center items-center w-fit">
                          <h3 className="text-lg font-semibold mb-1">
                            {job?.title}
                          </h3>

                          {isTrending(job) && (
                            <div
                              className={`flex gap-1 px-2 rounded-full ${
                                isDark ? "bg-gray-200/10" : "bg-gray-200/20"
                              } `}
                            >
                              <TrendingUp className="text-red-400 scale-75" />
                              <p className="text-sm">Trending</p>
                            </div>
                          )}
                        </div>

                        <div
                          className={`flex flex-wrap items-center gap-4 text-sm ${
                            isDark ? "text-gray-400 mb-3" : "text-gray-500"
                          } `}
                        >
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job?.location}
                          </div>

                          <div>
                            {formatSalary(
                              job?.salaryMinPerMonth,
                              job?.salaryMaxPerMonth
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Posted {formatDate(job?.createdAt)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(
                              job?.jobType
                            )}`}
                          >
                            {job?.jobType.replace("_", " ").toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getJobLevelColor(
                              job?.jobLevel
                            )}`}
                          >
                            {job?.jobLevel.replace("_", " ").toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isDark
                                ? "bg-gray-700 text-gray-200"
                                : "bg-gray-100 text-gray-800"
                            }  `}
                          >
                            {job?.category}
                          </span>
                          <span
                            className={`px-2 py-1 flex items-center font-bold justify-center gap-1 rounded-full text-xs ${
                              isDark
                                ? "bg-blue-200/10 text-blue-300"
                                : "bg-blue-50 text-blue-800"
                            }  `}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {job?.likes?.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Application Count & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">
                          {job?.applications?.length}
                        </span>
                      </div>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Applications
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {job?.applications?.length > 0 && (
                        <button
                          onClick={() =>
                            navigate(`/view-applications?id=${job?._id}`)
                          }
                          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4" />
                          View Applications
                        </button>
                      )}
                      {job?.applications?.length === 0 && (
                        <button
                          onClick={() =>
                            setIsJobEditingMode({
                              isTrue: true,
                              jobData: job,
                            })
                          }
                          className={`p-2 rounded-lg transition-colors cursor-pointer duration-200 ${
                            isDark
                              ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/view-job?id=${job?._id}`)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer duration-200 ${
                          isDark
                            ? "text-gray-400 hover:text-blue-400 hover:bg-gray-700"
                            : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      {job?.status === "closed" &&
                        job?.applications?.length === 0 && (
                          <button
                            onClick={() =>
                              setIsDeleteMode({ isTrue: true, jobId: job?._id })
                            }
                            className={`p-2 rounded-lg transition-colors cursor-pointer duration-200 ${
                              isDark
                                ? "text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                    </div>
                  </div>
                </div>

                {/* Expiry Warning */}
                {new Date(job?.expiresAt) <=
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                  <div
                    className={`mt-4 p-3 ${
                      isDark
                        ? "bg-yellow-700/70 border border-yellow-600"
                        : "bg-yellow-100 border-yellow-300"
                    } rounded-lg`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`h-4 w-4 ${
                          isDark ? "text-yellow-400" : "text-yellow-600"
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          isDark ? "text-yellow-200" : "text-yellow-800"
                        }`}
                      >
                        This job expires on {formatDate(job?.expiresAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredJobs?.length === 0 && (
            <div className="p-12 text-center">
              <div
                className={`w-16 h-16 ${
                  isDark ? "bg-gray-700" : "bg-gray-100"
                }   rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No jobs found</h3>
              <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Try adjusting your search criteria or post a new job.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerHome;
