import React, { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Building2,
  Shredder,
} from "lucide-react";
import formatSalaries from "../../utils/formatSalary";
import formatDateString from "../../utils/formatDateString";

const ApplicationCard = ({ app, setIsWithdrawPopup, setWithDrawnId }) => {
  const navigate = useNavigate();
  const { isDark, applicationThemeClasses, getApplicationStatusClr } =
    useContext(ThemeContext);

  const { formatDate } = formatDateString();

  const { formatSalary } = formatSalaries();

  return (
    <div
      key={app.application._id}
      className={`${applicationThemeClasses.cardClasses} border rounded-lg p-6 transition-all duration-200`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left Section - Job Info */}
        <div className="flex items-start space-x-4 flex-1">
          <img
            src={app.job.companyLogo}
            alt={`${app.job.company} logo`}
            className="w-12 h-12 rounded-lg overflow-hidden object-cover border border-gray-200"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://www.svgrepo.com/download/382706/picture-photo-image.svg";
            }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div
                className={`flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } mt-1`}
              >
                <div className="flex items-center space-x-1">
                  <Building2 className="h-4 w-4" />
                  <span>{app.job.company}</span>
                </div>

                <span className="hidden sm:inline">•</span>

                <div className="flex items-center space-x-1 my-2 sm:my-0">
                  <MapPin className="h-4 w-4" />
                  <span>{app.job.location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getApplicationStatusClr(
                  app.application.status
                )}`}
              >
                {app.application.status.charAt(0).toUpperCase() +
                  app.application.status.slice(1)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDark
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {app.job.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDark
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {app?.job?.jobType?.split("_").join(" ")}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDark
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {app?.job?.jobLevel?.split("_").join(" ")}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <span>
                  {formatSalary(
                    app.job.salaryMinPerMonth,
                    app.job.salaryMaxPerMonth
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Applied {formatDate(app.application.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Updated {formatDate(app.application.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex-col-1 sm:flex items-center space-x-3 lg:ml-4">
          <a
            href={app.application.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-fit justify-center items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
          >
            <div className="flex justify-center gap-2 items-center">
              <FileText className="h-4 w-4" />
              <span>View Resume</span>
            </div>
          </a>
          <div className="flex gap-2 justify-between">
            <button
              onClick={() => navigate(`/job?id=${app?.job?._id}`)}
              className={`flex-1 my-3 sm:my-0 items-center space-x-2  px-4 py-2 border ${
                isDark
                  ? "hover:bg-gray-700 border-gray-600"
                  : "hover:bg-gray-50 border-gray-300"
              } cursor-pointer rounded-lg transition-colors text-sm font-medium`}
            >
              <div className="flex justify-center gap-2 items-center">
                <ExternalLink className="h-4 w-4" />
                <span>View Job</span>
              </div>
            </button>
            {app?.application?.status === "pending" ? (
              <button
                onClick={() => {
                  setIsWithdrawPopup(true);
                  setWithDrawnId(app?.application?._id);
                }}
                className={`flex-1 my-3 sm:my-0 items-center space-x-2 px-4 py-2 group border ${
                  isDark
                    ? "hover:bg-red-800 bg-red-900 text-red-100 border-red-700"
                    : "hover:bg-red-200 bg-red-100 text-red-700 border-red-200"
                } cursor-pointer rounded-lg transition-colors text-sm font-medium`}
              >
                <div className="flex justify-center gap-2 items-center">
                  <Shredder
                    className={`h-4 w-4 group-hover:scale-110 transition-all duration-300 ${
                      isDark ? "text-red-50" : ""
                    }`}
                  />
                  <span>Withdraw</span>
                </div>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
