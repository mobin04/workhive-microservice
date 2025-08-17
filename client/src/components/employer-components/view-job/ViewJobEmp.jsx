import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import useFetchJobByJobId from "../../../hooks/useFetchJobByJobId";
import { useLocation, useNavigate } from "react-router-dom";
import { envVariables } from "../../../config";
import Loading from "../../loader/Loading";
import { useDispatch, useSelector } from "react-redux";
import useEditJob from "../../../hooks/employer-hooks/useEditJob";
import WarningMessage from "../../warning-msg/WarningMessage";
import CreateOrEditJob from "../create-or-edit-job/CreateOrEditJob";
import JobDescriptionRender from "../../job-description-render/JobDescriptionRender";
import { reverseGeocode } from "../../../utils/mapbox";
import { deleteJob } from "../../../server/deleteJob";
import useTriggerPopup from "../../../hooks/useTriggerPopup";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Building2,
  Eye,
  Heart,
  Edit3,
  XCircle,
  RotateCcw,
  Briefcase,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  CircleAlert,
  MapPinned,
  Trash,
} from "lucide-react";
import formatDateString from "../../../utils/formatDateString";
import formatSalaries from "../../../utils/formatSalary";

const ViewJobEmp = () => {
  const { isDark, jobViewerEmpThemeClasses, jobViewerThemeClass } =
    useContext(ThemeContext);
  const { user } = useSelector((state) => state.user);
  const [isEditPopup, setIsEditPopup] = useState({ type: "", isTrue: false });
  const [isJobEditingMode, setIsJobEditingMode] = useState(false);
  const [geoLocName, setGeoLocName] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [job, setJob] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isPending, mutate } = useEditJob(setJob);
  const { triggerPopup } = useTriggerPopup();

  const handleCloseJob = (jobId) => {
    if (!jobId) return;
    mutate({
      url: `${envVariables.CLOSE_JOB_URL}/${jobId}/close`,
      credential: {},
    });
  };

  const handleRenewJob = (jobId) => {
    mutate({
      url: `${envVariables.CLOSE_JOB_URL}/${jobId}/renew`,
      credential: {},
    });
  };

  const jobId = useMemo(() => {
    const jobId = new URLSearchParams(location.search).get("id");
    return jobId;
  }, [location.search]);

  const { data, isLoading, refetch } = useFetchJobByJobId(
    `${envVariables.GET_JOB_URL}/${jobId}`,
    false
  );

  useEffect(() => {
    if (user && user?.role !== "employer") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    refetch();
  }, [jobId, refetch]);

  useEffect(() => {
    if (data) {
      setJob(data?.data?.job);
    }
  }, [data]);

  const {formatSalary} = formatSalaries();
  const {formatDate} = formatDateString();

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-green-600 bg-green-100";
      case "closed":
        return "text-red-600 bg-red-100";
      case "paused":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Format job type
  const formatJobType = (type) => {
    if (!type) return;
    return type
      .replace("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleCancel = () => {
    setIsEditPopup({ type: "", isTrue: false });
    setIsDeleteMode(false);
  };

  const handleSubmit = () => {
    if (isEditPopup?.type === "Close") {
      handleCloseJob(job?._id);
    } else if (isEditPopup?.type === "Renew") {
      handleRenewJob(job?._id);
    }
    if (!isPending) handleCancel();
  };

  //Edit Job onClose
  const onClose = () => {
    setIsJobEditingMode(false);
    setIsDeleteMode(false);
  };

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

    mutate({
      url: `${envVariables.UPDATE_JOB_URL}/${job?._id}`,
      credential: formData,
    });
    onClose();
  };

  useEffect(() => {
    if (job && job?.geoLocation?.coordinates?.length === 2) {
      reverseGeocode(job?.geoLocation?.coordinates).then((name) =>
        setGeoLocName(name.place_name)
      );
    }
  }, [job]);

  // Handle Deleting job
  const handleDelete = async () => {
    if (!isDeleteMode) return;

    setIsDeleteLoading(true);
    const { message } = await deleteJob({
      jobId: job?._id,
      setIsDeleteLoading,
      onClose,
      dispatch,
    });
    if (message) {
      triggerPopup({
        message: message || "Job deleted successfully",
        type: "success",
      });

      navigate("/");
    }
  };

  if (isLoading || isPending) return <Loading />;

  return (
    <div
      className={`${jobViewerEmpThemeClasses?.bgClass} ${jobViewerEmpThemeClasses?.textClass}  min-h-screen p-6`}
    >
      {isJobEditingMode && (
        <CreateOrEditJob
          isOpen={isJobEditingMode}
          onClose={onClose}
          jobData={job}
          onSubmit={onSubmit}
          isLoading={isPending}
        />
      )}
      {(isEditPopup.isTrue || isDeleteMode) && (
        <WarningMessage
          handleCancel={handleCancel}
          handleConfirm={isEditPopup?.isTrue ? handleSubmit : handleDelete}
          isPending={isEditPopup?.isTrue ? isPending : isDeleteLoading}
          message={`${
            isEditPopup.type === "Close"
              ? "Are you sure you want to close this job!"
              : isEditPopup.type === "Renew"
              ? "Are you sure you want to renew this job!, Job can only renew once"
              : isDeleteMode
              ? "Are you sure? Once deleted, this job and all its associated information will be permanently removed. This action cannot be undone"
              : ""
          }`}
          title={`${
            isEditPopup?.type === "Close"
              ? "Close this job"
              : isEditPopup?.type === "Close"
              ? "Renew this job"
              : isDeleteMode
              ? "permanently delete this job"
              : ""
          }`}
          pendingBtnText={
            isEditPopup.isTrue
              ? `${isEditPopup?.type}...`
              : isDeleteMode
              ? "Deleting..."
              : ""
          }
          btnText={
            isEditPopup.isTrue
              ? isEditPopup?.type
              : isDeleteMode
              ? "Delete"
              : ""
          }
        />
      )}

      {job && (
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div
            className={`${jobViewerEmpThemeClasses?.cardBgClass} rounded-xl border ${jobViewerEmpThemeClasses?.borderClass} p-6 mb-6 shadow-lg`}
          >
            <div className="flex-1 md:flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4 mb-5 md:mb-0">
                <img
                  src={job?.companyLogo}
                  alt={job?.company}
                  className="w-16 h-16 overflow-hidden rounded-xl object-cover border-2 border-blue-200"
                />
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold mb-2">
                    {job?.title}
                  </h1>
                  <div className="flex-1 sm:flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="sm:h-5 sm:w-5 w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-md sm:text-lg">
                        {job?.company}
                      </span>
                    </div>

                    <div className="flex my-2 items-center space-x-2">
                      <MapPin className="w-4 h-4 sm:h-5 sm:w-5 text-gray-500" />
                      <span
                        className={`${jobViewerEmpThemeClasses?.textSecondaryClass} overflow-ellipsis`}
                      >
                        {job?.location}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 max-w-md">
                    <div className="flex my-2 items-center space-x-2">
                      <div>
                        <MapPinned
                          className={`w-4 h-4 ${jobViewerThemeClass.text.muted}`}
                        />
                      </div>
                      <span className={jobViewerThemeClass.text.muted}>
                        {geoLocName ? geoLocName : "Not Avaliable"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 sm:flex gap-1 justify-start items-start">
                    <div className="flex gap-1">
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {formatJobType(job?.jobType)}
                      </div>
                      <div className="px-3 py-1  bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {formatJobType(job?.jobLevel)}
                      </div>
                    </div>
                    {job?.status && (
                      <div
                        className={`px-3 flex items-center justify-center w-fit mt-2 sm:mt-0 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          job?.status
                        )}`}
                      >
                        {job?.status?.charAt(0)?.toUpperCase() +
                          job?.status?.slice(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className=" sm:flex items-center space-x-3">
                <div className="flex gap-2 justify-between items-center">
                  {job?.status !== "closed" && (
                    <button
                      onClick={() =>
                        setIsEditPopup({ type: "Close", isTrue: true })
                      }
                      className="flex w-1/2 sm:w-fit cursor-pointer items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Close</span>
                    </button>
                  )}

                  {job?.status === "closed" &&
                    job?.applications?.length === 0 && (
                      <button
                        onClick={() => setIsDeleteMode(true)}
                        className="flex w-1/2 sm:w-fit cursor-pointer items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    )}

                  {!job?.isRenewed && (
                    <button
                      onClick={() =>
                        setIsEditPopup({ type: "Renew", isTrue: true })
                      }
                      className="flex items-center w-1/2 cursor-pointer sm:w-fit space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Renew</span>
                    </button>
                  )}
                </div>
                {(job?.status === "open" || !job?.isRenewed) && (
                  <button
                    onClick={() => setIsJobEditingMode(true)}
                    className={`flex mt-3 sm:mt-0 w-fit cursor-pointer items-center space-x-2 px-4 py-2 rounded-lg font-medium  transition-colors ${
                      isDark
                        ? " bg-gray-600/20 text-white hover:bg-gray-600/30"
                        : "bg-gray-400/10 hover:bg-gray-400/20"
                    }`}
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
            {job?.status === "closed" && !job?.isRenewed && (
              <div
                className={`text-red-500 w-fit text-sm flex justify-center items-center p-2 rounded-md gap-2 ${
                  isDark ? "bg-red-500/10" : "bg-red-200/50"
                }`}
              >
                <CircleAlert className="w-6 h-6" />
                <p>
                  To reopen this job, please renew it first. Jobs can only be
                  renewed once, and renewal will extend the job expiration by 30
                  days
                </p>
              </div>
            )}
            {job?.isRenewed && job?.status !== "closed" && (
              <div
                className={`text-red-600 w-fit text-sm flex justify-center items-center p-2 rounded-md gap-2 ${
                  isDark ? "bg-red-500/10" : "bg-red-200/50"
                }`}
              >
                <CircleAlert className="w-6 h-6" />
                <p>Closing this job will permanently prevent renewal</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <div
                className={`${jobViewerEmpThemeClasses?.cardBgClass} rounded-xl overflow-hidden border ${jobViewerEmpThemeClasses?.borderClass} p-6 shadow-lg`}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <span>Job Description</span>
                </h2>
                <JobDescriptionRender description={job?.description} />
              </div>

              {/* Job Details */}
              <div
                className={`${jobViewerEmpThemeClasses?.cardBgClass} rounded-xl border ${jobViewerEmpThemeClasses?.borderClass} p-6 shadow-lg`}
              >
                <h2 className="text-xl font-bold mb-4">Job Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isDark ? "bg-gray-700/30" : "bg-gray-400/10"
                    } shadow-md`}
                  >
                    <IndianRupee className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Salary Range</div>
                      <div
                        className={`${jobViewerEmpThemeClasses?.textSecondaryClass} text-sm`}
                      >
                        {formatSalary(
                          job?.salaryMinPerMonth,
                          job?.salaryMaxPerMonth
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isDark ? "bg-gray-700/30" : "bg-gray-400/10"
                    } shadow-md`}
                  >
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Category</div>
                      <div
                        className={`${jobViewerEmpThemeClasses?.textSecondaryClass} text-sm`}
                      >
                        {job?.category}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isDark ? "bg-gray-700/30" : "bg-gray-400/10"
                    } shadow-md`}
                  >
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Posted Date</div>
                      <div
                        className={`${jobViewerEmpThemeClasses?.textSecondaryClass} text-sm`}
                      >
                        {formatDate(job?.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isDark ? "bg-gray-700/30" : "bg-gray-400/10"
                    } shadow-md`}
                  >
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Expires On</div>
                      <div
                        className={`${jobViewerEmpThemeClasses?.textSecondaryClass} text-sm`}
                      >
                        {formatDate(job?.expiresAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Statistics */}
              <div
                className={`${jobViewerEmpThemeClasses?.cardBgClass} rounded-xl border ${jobViewerEmpThemeClasses?.borderClass} p-6 shadow-lg`}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Job Statistics</span>
                </h3>

                <div className="space-y-4">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark
                        ? "bg-blue-300"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-900 font-medium">
                        Applications
                      </span>
                    </div>
                    <span className="text-blue-800 font-bold">
                      {job?.applications?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span className="text-red-900 font-medium">Likes</span>
                    </div>
                    <span className="text-red-800 font-bold">
                      {job?.likes?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="text-green-900 font-medium">Views</span>
                    </div>
                    <span className="text-green-800 font-bold">
                      NOT_YET_IMPLEMENTED
                    </span>
                  </div>
                </div>
              </div>

              {/* Job Status */}
              <div
                className={`${jobViewerEmpThemeClasses?.cardBgClass} rounded-xl border ${jobViewerEmpThemeClasses?.borderClass} p-6 shadow-lg`}
              >
                <h3 className="text-lg font-bold mb-4">Job Status</h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {job?.status === "open" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {job?.status === "open"
                        ? "Active & Accepting Applications"
                        : "Job Closed"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <RotateCcw
                      className={`h-5 w-5 ${
                        job?.isRenewed ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        job?.isRenewed
                          ? "text-green-600"
                          : jobViewerEmpThemeClasses?.textSecondaryClass
                      }
                    >
                      {job?.isRenewed ? "Recently Renewed" : "Not Renewed"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-opacity-50">
                  <div
                    className={`${jobViewerEmpThemeClasses?.textSecondaryClass} text-sm`}
                  >
                    <div>
                      Job ID: {job?._id?.slice(-8) || job?.id?.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewJobEmp;
