import React, { useContext, useState } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import {
  Download,
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  GraduationCap,
  Briefcase,
  Badge,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const ResumePreview = ({
  showResumePreview,
  selectedApplication,
  setShowResumePreview,
}) => {
  const [scale, setScale] = useState(1);

  const { isDark } = useContext(ThemeContext);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  if (!showResumePreview || !selectedApplication) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-2xl w-full max-h-[95vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 lg:p-6 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex-shrink-0`}
        >
          <div className="flex items-center gap-3">
            <img
              src={selectedApplication.applicant.coverImage}
              alt={selectedApplication.applicant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-lg">
                {selectedApplication.applicant.name}
              </h3>
              <p className="text-sm text-gray-500">Resume Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={selectedApplication.resumeUrl}
              download
              className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={() => setShowResumePreview(false)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="h-full flex flex-col lg:flex-row">
            {/* Resume Section - Left Side */}
            <div className="flex-1 lg:w-1/2 overflow-y-auto max-h-[calc(95vh-100px)] scrollbar-hide">
              <div
                className={`p-4 border-b ${
                  isDark ? "border-gray-700" : "border-gray-200"
                } flex-shrink-0`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">Resume Document</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={zoomOut}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        isDark ? "bg-gray-400/20" : "bg-gray-100"
                      }  min-w-[60px] text-center`}
                    >
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={zoomIn}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <div
                  className={`border rounded-lg overflow-auto ${
                    isDark
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  style={{ minHeight: "400px" }}
                >
                  <div className="flex justify-center items-center p-4">
                    <img
                      src={selectedApplication?.resumeUrl}
                      alt="Failed to load resume!"
                      className="max-w-full h-auto shadow-lg rounded"
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: "center",
                        transition: "transform 0.2s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Details Section - Right Side */}
            <div className="flex-1 lg:w-1/2 overflow-y-auto max-h-[calc(95vh-100px)] scrollbar-hide ">
              <div className="p-4 lg:p-6">
                <div
                  className={`${
                    isDark ? "bg-gray-900" : "bg-gray-50"
                  } rounded-xl p-6`}
                >
                  {/* Applicant Header */}
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                      <img
                        src={selectedApplication.applicant.coverImage}
                        alt={selectedApplication.applicant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">
                      {selectedApplication.applicant.name}
                    </h2>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {selectedApplication.applicant.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{selectedApplication.applicant.phone}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{selectedApplication.applicant.location}</span>
                      </div>
                      {selectedApplication.applicant.website && (
                        <div className="flex items-center justify-center gap-2">
                          <Globe className="h-4 w-4 flex-shrink-0" />
                          <a
                            href={selectedApplication.applicant.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            Portfolio
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Sections */}
                  <div className="space-y-6">
                    {/* About Section */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-600">
                        <User className="h-5 w-5" />
                        About
                      </h3>
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        <p
                          className={`leading-relaxed ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {selectedApplication.applicant.bio}
                        </p>
                      </div>
                    </div>

                    {/* Education Section */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-600">
                        <GraduationCap className="h-5 w-5" />
                        Education
                      </h3>
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        <p
                          className={`leading-relaxed ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {selectedApplication.applicant.education}
                        </p>
                      </div>
                    </div>

                    {/* Experience Section */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-600">
                        <Briefcase className="h-5 w-5" />
                        Experience
                      </h3>
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        <p
                          className={`leading-relaxed ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {selectedApplication.applicant.experience}
                        </p>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-600">
                        <Badge className="h-5 w-5" />
                        Skills
                      </h3>
                      <div
                        className={`p-4 rounded-lg ${
                          isDark ? "bg-gray-800" : "bg-white"
                        }`}
                      >
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.applicant.skills.map(
                            (skill, index) => (
                              <span
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                  isDark
                                    ? "bg-blue-900 text-blue-300 border border-blue-700"
                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                }`}
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
