import React, { useContext, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import {
  CheckCircle,
  Calendar,
  Mail,
  Building,
  MapPin,
  ArrowRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicationSuccessMessage = ({ jobData, applicationId = null }) => {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    navigate("/");
  };

  const handleViewJob = () => {
    setIsVisible(false)
    navigate(`/job?id=${jobData?._id}`);
  };

  const handleViewApplications = () => {
    setIsVisible(false)
    navigate("/applications");
  };

  const themeClasses = {
    overlay: isDark ? "bg-gray-900" : "bg-gray-100",
    container: isDark
      ? "bg-gray-900 border-gray-700"
      : "bg-white border-gray-200",
    text: {
      primary: isDark ? "text-white" : "text-gray-900",
      secondary: isDark ? "text-gray-300" : "text-gray-600",
      muted: isDark ? "text-gray-400" : "text-gray-500",
    },
    card: isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200",
    button: {
      primary: isDark
        ? "bg-blue-600 hover:bg-blue-700 text-white"
        : "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: isDark
        ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300",
    },
    closeButton: isDark
      ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
  };

  return (
    <div className="">
      <div
        className={`inset-0 z-50 flex items-center justify-center p-4 ${
          themeClasses.overlay
        } ${
          isVisible ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
        onClick={handleClose}
      >
        <div
          className={`relative max-w-2xl w-full rounded-2xl border shadow-2xl ${
            themeClasses.container
          } ${
            isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          } transition-all duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${themeClasses.closeButton}`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Success Icon and Animation */}
          <div className="text-center pt-8 pb-6">
            <div className="relative inline-block">
              <div
                className={`w-20 h-20 mx-auto ${
                  isDark ? "bg-green-900/30" : "bg-green-100"
                } rounded-full flex items-center justify-center mb-4`}
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              {/* Animated rings */}
              <div
                className={`absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 ${
                  isDark ? "border-green-600/30" : "border-green-300"
                } animate-ping opacity-75`}
              ></div>
              <div
                className={`absolute inset-0 w-20 h-20 mx-auto rounded-full border ${
                  isDark ? "border-green-700/50" : "border-green-200 "
                } animate-pulse`}
              ></div>
            </div>

            <h2
              className={`text-2xl font-bold mb-2 ${themeClasses.text.primary}`}
            >
              Application Submitted!
            </h2>
            <p className={themeClasses.text.secondary}>
              Your job application has been successfully submitted
            </p>
          </div>

          {/* Job Details Card */}
          <div
            className={`mx-6 mb-6 p-4 rounded-xl border ${themeClasses.card}`}
          >
            <div className="flex items-start gap-3">
              <img
                src={jobData?.companyLogo}
                alt={`${jobData?.company} logo`}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-lg leading-tight ${themeClasses.text.primary}`}
                >
                  {jobData?.title}
                </h3>
                <div className="flex items-center gap-1 mt-1 mb-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className={`text-sm ${themeClasses.text.secondary}`}>
                    {jobData?.company}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${themeClasses.text.muted}`}>
                    {jobData?.location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="px-6 pb-6">
            <div className={`p-4 rounded-xl ${themeClasses.card}`}>
              <h4 className={`font-semibold mb-3 ${themeClasses.text.primary}`}>
                What happens next?
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6  ${
                      isDark ? "bg-blue-900/30" : "bg-blue-100"
                    }  rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <Mail className="w-3 h-3 text-blue-600" />
                  </div>
                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                    You'll receive a confirmation email shortly
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 ${
                      isDark ? "bg-green-900/30" : "bg-green-100"
                    } rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <Calendar className="w-3 h-3 text-green-600" />
                  </div>
                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                    The hiring team will review your application
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            <button
              onClick={handleViewApplications}
              className={`w-full cursor-pointer px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${themeClasses.button.primary}`}
            >
              View My Applications
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleViewJob}
              className={`w-full cursor-pointer px-4 py-3 rounded-xl font-semibold border transition-colors ${themeClasses.button.secondary}`}
            >
              Back to Job Details
            </button>
          </div>

          {/* Application ID (if provided) */}
          {applicationId && (
            <div className="px-6 pb-6">
              <div className="text-center">
                <p className={`text-xs ${themeClasses.text.muted}`}>
                  Application ID:{" "}
                  <span className="font-mono">{applicationId}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccessMessage;
