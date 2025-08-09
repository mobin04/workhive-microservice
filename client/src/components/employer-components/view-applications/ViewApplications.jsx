import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Eye,
  Download,
  Mail,
  Briefcase,
  Star,
  Check,
  X,
  Clock,
  Users,
} from "lucide-react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import ResumePreview from "./Preview";
import useFetchAppsByJobId from "../../../hooks/employer-hooks/useFetchAppsByJob";
import { useLocation } from "react-router-dom";
import Loading from "../../loader/Loading";

const JobApplicationsViewer = () => {
  const { isDark, getStatusColorViewAppEmp } = useContext(ThemeContext);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [jobData, setJobData] = useState({});
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const jobId = useMemo(() => {
    const jobId = new URLSearchParams(location.search).get("id");
    return jobId;
  }, [location.search]);

  const { refetch, isLoading } = useFetchAppsByJobId(jobId, setJobData);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateApplicationStatus = (applicationId, newStatus) => {
    // This would be your API call to update status
    console.log(`Updating application ${applicationId} to ${newStatus}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "shortlisted":
        return <Star className="h-3 w-3" />;
      case "accepted":
        return <Check className="h-3 w-3" />;
      case "rejected":
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const filteredApplications =
    selectedStatus === "all"
      ? jobData?.application
      : jobData?.application?.filter((app) => app.status === selectedStatus);

  const statusCounts = useMemo(() => {
    return {
      all: jobData?.application?.length,
      pending: jobData?.application?.filter((app) => app.status === "pending")
        .length,
      shortlisted: jobData?.application?.filter(
        (app) => app.status === "shortlisted"
      ).length,
      accepted: jobData?.application?.filter((app) => app.status === "accepted")
        .length,
      rejected: jobData?.application?.filter((app) => app.status === "rejected")
        .length,
    };
  }, [jobData?.application]);

  if (isLoading) return <Loading />;

  return (
    <div
      className={`min-h-screen  transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className={`${isDark ? "bg-gray-800/20" : "bg-white"} `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={jobData?.companyLogo}
                alt={jobData?.company}
                className="w-12 h-12 rounded-lg object-cover overflow-hidden shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold">{jobData?.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{jobData?.company}</span>
                  <span>•</span>
                  <MapPin className="h-4 w-4" />
                  <span>{jobData?.location}</span>
                </div>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg ${
                isDark
                  ? "bg-blue-900 text-blue-300"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">
                  {jobData?.totalApplication} Applications
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div
        className={`${
          isDark ? "bg-gray-800/10 border-gray-700" : "bg-white border-gray-200"
        } border-b sticky top-0 z-10`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  selectedStatus === status
                    ? "border-blue-500 text-blue-600"
                    : `border-transparent ${
                        isDark
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-600 hover:text-gray-800"
                      }`
                }`}
              >
                <span className="capitalize font-medium">
                  {status === "all" ? "All" : status}
                </span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {filteredApplications?.map((application) => (
            <div
              key={application._id}
              className={`${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } border rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Applicant Info */}
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={application.applicant.coverImage}
                    alt={application.applicant.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {application.applicant.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">
                        {application.applicant.email}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{application.applicant.location}</span>
                      <span>•</span>
                      <Briefcase className="h-3 w-3" />
                      <span>{application.applicant.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColorViewAppEmp(
                      application.status
                    )}`}
                  >
                    {getStatusIcon(application.status)}
                    <span className="capitalize">{application.status}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {application.applicant.skills
                    .slice(0, 6)
                    .map((skill, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded text-xs ${
                          isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  {application.applicant.skills.length > 6 && (
                    <span className="px-2 py-1 rounded text-xs text-gray-500">
                      +{application.applicant.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              {application.applicant.bio && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    {application.applicant.bio}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowResumePreview(true);
                  }}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Resume</span>
                </button>

                <a
                  href={application.resumeUrl}
                  download
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>

                {/* Status Update Buttons */}
                {application.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        updateApplicationStatus(application._id, "shortlisted")
                      }
                      className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Star className="h-4 w-4" />
                      <span>Shortlist</span>
                    </button>
                    <button
                      onClick={() =>
                        updateApplicationStatus(application._id, "rejected")
                      }
                      className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() =>
                        updateApplicationStatus(application._id, "rejected")
                      }
                      className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {application.status === "shortlisted" && (
                  <>
                    <button
                      onClick={() =>
                        updateApplicationStatus(application._id, "accepted")
                      }
                      className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() =>
                        updateApplicationStatus(application._id, "rejected")
                      }
                      className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredApplications?.length === 0 && (
          <div className="text-center py-12">
            <Users
              className={`mx-auto h-12 w-12 ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <h3 className="mt-2 text-sm font-medium">No applications found</h3>
            <p
              className={`mt-1 text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No applications match the selected filter.
            </p>
          </div>
        )}
      </div>

      {/* Resume Preview Modal */}
      {showResumePreview && selectedApplication && (
        <ResumePreview
          selectedApplication={selectedApplication}
          setShowResumePreview={setShowResumePreview}
          showResumePreview={showResumePreview}
        />
      )}
    </div>
  );
};

export default JobApplicationsViewer;
