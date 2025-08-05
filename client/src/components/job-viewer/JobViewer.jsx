import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { envVariables } from "../../config";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../loader/Loading";
import useFormatSalary from "../../hooks/useFormatSalary";
import useFormatDate from "../../hooks/useFormatDate";
import useSaveAndRemoveJob from "../../hooks/useSaveAndRemoveJob";
import saveJobToSaveList from "../../server/saveJob";
import removeJobFromSaved from "../../server/removeJobFromSaved";
import { useDispatch, useSelector } from "react-redux";
import useFetchSavedJobs from "../../hooks/useFetchSavedJobs";
import useFetchJobByJobId from "../../hooks/useFetchJobByJobId";
import { useMergeWithdrawnApp } from "../../hooks/useMergeWithdrawnApp";
import useFetchApplications from "../../hooks/useFetchApplications";
import useFetchWithdrawnApp from "../../hooks/useFetchWithdrawnApp";
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
  Bookmark,
  ClipboardCheck,
  Clipboard,
  ClipboardList,
  ServerCrash,
} from "lucide-react";
import { showPopup } from "../../store/slices/popupSlice";

const JobViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { savedJobs } = useSelector((state) => state.jobs);
  const dispatch = useDispatch();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const {
    getJobTypeColor,
    getJobLevelColor,
    jobViewerThemeClass,
    getStatusColor,
  } = useContext(ThemeContext);

  // Fetch application
  const { isLoading: isAppLoading } = useFetchApplications();
  const { isLoading: isWithdrawLoading } = useFetchWithdrawnApp();

  // Fix and merge withdrawn and active applications
  const fixedApplications = useMergeWithdrawnApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const url = useMemo(() => {
    const jobId = new URLSearchParams(location.search).get("id");
    return `${envVariables.GET_JOB_URL}/${jobId}`;
  }, [location.search]);

  const { data, isLoading } = useFetchJobByJobId(url);

  const jobData = data?.data?.job;

  const formatSalary = useFormatSalary();
  const formatDate = useFormatDate();

  const { refetch } = useFetchSavedJobs();

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

  const getApplications = useCallback(
    (id) => {
      if (fixedApplications) {
        const getApp = fixedApplications.filter((app) => app?.job?._id === id);
        return getApp;
      }
    },
    [fixedApplications]
  );

  const timeoutRef = useRef();

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsLinkCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsLinkCopied(false);
      timeoutRef.current = null;
    }, 2000);

    dispatch(
      showPopup({
        message: "Link copied to clipboard!",
        type: "success",
        visible: true,
        popupId: Date.now(),
      })
    );
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className={`w-full  ${jobViewerThemeClass.container}`}>
      {jobData ? (
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
            <div
              className={`p-4 rounded-lg border ${jobViewerThemeClass.card}`}
            >
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

            <div
              className={`p-4 rounded-lg border ${jobViewerThemeClass.card}`}
            >
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

            <div
              className={`p-4 rounded-lg border ${jobViewerThemeClass.card}`}
            >
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

            <div
              className={`p-4 rounded-lg border ${jobViewerThemeClass.card}`}
            >
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
            {isAppLoading || isWithdrawLoading ? (
              <button
                className={`flex-1 flex gap-2 items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${jobViewerThemeClass.button.secondary}`}
              >
                <div className="w-5 h-5 animate-spin border-4 border-b-transparent rounded-full"></div>
                <span>Loading...</span>
              </button>
            ) : (
              <>
                {getApplications(jobData?._id)?.[0]?.application ? (
                  <button
                    onClick={() => navigate("/applications")}
                    className={`flex-1 px-6 py-3 border rounded-lg font-semibold transition-colors cursor-pointer ${jobViewerThemeClass.button.secondary}`}
                  >
                    View Application
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/apply?id=${jobData?._id}`)}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${jobViewerThemeClass.button.primary}`}
                  >
                    Apply Now
                  </button>
                )}
              </>
            )}

            {isJobSaved(jobData?._id) ? (
              <button
                onClick={() => handleRemove(jobData?._id)}
                disabled={removePending[jobData?._id]}
                className={`min-h-14 min-w-30 flex justify-center items-center px-6 py-3 rounded-lg font-semibold border transition-colors cursor-pointer ${jobViewerThemeClass.button.secondary}`}
              >
                {removePending[jobData?._id] ? (
                  <div className="animate-spin rounded-full w-5 h-5 border-3 border-b-transparent border-blue-500"></div>
                ) : (
                  <div className="flex justify-center items-center gap-1 ">
                    <Bookmark className="text-red-600 fill-red-600" />
                    saved
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => handleSave(jobData?._id)}
                disabled={savePending[jobData._id]}
                className={`min-h-14 min-w-30 flex justify-center items-center px-6 py-3 rounded-lg font-semibold border transition-colors cursor-pointer ${jobViewerThemeClass.button.secondary}`}
              >
                {savePending[jobData._id] ? (
                  <div className="animate-spin rounded-full w-5 h-5 border-3 border-b-transparent border-red-500"></div>
                ) : (
                  <div className="flex justify-center items-center gap-1 ">
                    <Bookmark className="h-5 w-5" />
                    save
                  </div>
                )}
              </button>
            )}

            <button
              onClick={copyLink}
              className={` px-6 py-3 rounded-lg font-semibold border transition-colors cursor-pointer ${jobViewerThemeClass.button.secondary}`}
            >
              {isLinkCopied ? (
                <div className="flex transition-all duration-200 gap-2 justify-center items-center text-green-600">
                  <ClipboardCheck />
                  <span>Link copied</span>
                </div>
              ) : (
                <div className="flex gap-2 transition-all duration-200 justify-center items-center">
                  <ClipboardList />
                  <span>Copy Link</span>
                </div>
              )}
            </button>
            <button
              onClick={() => navigate("/")}
              className={`px-6 py-3 rounded-lg font-semibold border transition-colors cursor-pointer ${jobViewerThemeClass.button.secondary}`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 justify-center items-center min-h-screen">
          <div className="flex gap-4 justify-center items-center p-5">
            <ServerCrash className="scale-150 text-gray-500" />
            <div className="text-gray-500 overflow-clip text-2xl md:text-4xl">
              Failed to fetch job please try again later :(
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobViewer;
