import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { Upload, X, Check, AlertCircle, FileImage, User } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { envVariables } from "../../config";
import { fetchData } from "../../server/fetchData";
import Loading from "../loader/Loading";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ApplicationSuccessMessage from "./SuccessMessage";
import { useDispatch } from "react-redux";
import { showPopup } from "../../store/slices/popupSlice";

const applyJob = async (formData) => {
  const res = await axios.post(envVariables.APPLY_JOB_URL, formData, {
    withCredentials: true,
  });
  if (res?.data) return res?.data;
};

const JobApplicationForm = () => {
  const { applyJobThemeClass, isDark } = useContext(ThemeContext);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const dispatch = useDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const url = useMemo(() => {
    const jobId = new URLSearchParams(location.search).get("id");
    if (!jobId) return;
    return `${envVariables.GET_JOB_URL}/${jobId}`;
  }, [location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!url) {
      navigate("/");
    }
  }, [url, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["job", url],
    queryFn: ({ queryKey }) => fetchData({}, queryKey[1], dispatch),
    refetchOnWindowFocus: false,
  });

  const jobData = data?.data?.job;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadError("");

    if (!file) return;

    // Validate file type (images only)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload an image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setResumeFile(file);

    // image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setResumePreview(e.target.result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    setResumePreview(null);
    setUploadError("");
  };

  const useApplyJob = () => {
    return useMutation({
      mutationFn: (formData) => applyJob(formData),
      onSuccess: (data) => {
        setResumeFile(null);
        setResumePreview(null);
        setIsSuccess(true);
        console.log(data);
      },
      onError: (error) => {
        dispatch(
          showPopup({
            message: error?.response?.data?.message || "Failed to apply job",
            type: "error",
            visible: true,
            popupId: Date.now(),
          })
        );
        setUploadError(
          error?.response?.data?.message ||
            "Failed to submit application! Please try again after sometime"
        );
      },
    });
  };

  const { mutate, isPending } = useApplyJob();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setUploadError("Please upload your resume");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job", jobData._id);

    mutate(formData);
  };

  if (isLoading) return <Loading />;

  if (isSuccess)
    return (
      <ApplicationSuccessMessage
        jobData={jobData}
        show={isSuccess}
        applicationId={jobData._id}
      />
    );

  return (
    <div className={`${applyJobThemeClass.mainContainerBg} md:py-3`}>
      <div
        className={`max-w-7xl mx-auto p-6 rounded-md border shadow-lg ${applyJobThemeClass.container}`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1
              className={`text-2xl font-bold ${applyJobThemeClass.text.primary}`}
            >
              Apply for Position
            </h1>
            <p className={applyJobThemeClass.text.secondary}>
              Submit your application for {jobData?.title} at {jobData?.company}
            </p>
          </div>
        </div>

        {/* Job Info Card */}
        <div
          className={`p-4 rounded-lg border mb-6 ${applyJobThemeClass.card}`}
        >
          <div className="flex items-center gap-3">
            <img
              src={jobData?.companyLogo}
              alt="logo"
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://www.svgrepo.com/download/382706/picture-photo-image.svg";
              }}
            />
            <div>
              <h3
                className={`font-semibold ${applyJobThemeClass.text.primary}`}
              >
                {jobData?.title}
              </h3>
              <p className={applyJobThemeClass.text.secondary}>
                {jobData?.company} • {jobData?.location}
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="space-y-6">
          {/* Resume Upload Section */}
          <div>
            <label
              className={`block text-sm font-medium mb-3 ${applyJobThemeClass.text.primary}`}
            >
              Resume / CV <span className="text-red-500">*</span>
            </label>
            <p className={`text-sm mb-4 ${applyJobThemeClass.text.muted}`}>
              Upload your resume as an image (JPEG, PNG, or WebP). Max file
              size: 5MB
            </p>

            {!resumeFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${applyJobThemeClass.uploadArea}`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                  disabled={isUploading}
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    ) : (
                      <div
                        className={`p-3 rounded-full ${applyJobThemeClass.uploadIconBg} hover:scale-105 transition-scale duration-500 mb-4`}
                      >
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                    <p
                      className={`text-lg font-medium mb-2 ${applyJobThemeClass.text.primary}`}
                    >
                      {isUploading ? "Processing..." : "Upload your resume"}
                    </p>
                    <p className={applyJobThemeClass.text.muted}>
                      Click to browse or drag and drop your file
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div
                className={`border rounded-lg p-4 ${applyJobThemeClass.card}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-20 rounded border overflow-hidden  ${applyJobThemeClass.mainContainerBg}`}
                    >
                      <img
                        src={resumePreview}
                        alt="Resume preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileImage className="w-4 h-4 text-green-600" />
                      <span
                        className={`font-medium ${applyJobThemeClass.text.primary}`}
                      >
                        {resumeFile?.name}
                      </span>
                    </div>
                    <p className={`text-sm ${applyJobThemeClass.text.muted}`}>
                      {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        Upload successful
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className={`p-1 rounded-full ${applyJobThemeClass.xBg} transition-colors`}
                    title="Remove file"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{uploadError}</span>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className={`p-4 rounded-lg border ${applyJobThemeClass.card}`}>
            <div className="flex items-center gap-2 mb-2">
              <User
                className={`w-4 h-4 ${applyJobThemeClass.text.secondary}`}
              />
              <h3 className={`font-medium ${applyJobThemeClass.text.primary}`}>
                Application Requirements
              </h3>
            </div>
            <ul
              className={`text-sm space-y-1 ${applyJobThemeClass.text.muted}`}
            >
              <li>• Resume must be in image format (JPEG, PNG, or WebP)</li>
              <li>• Ensure all text in your resume is clearly visible</li>
              <li>
                • Include your contact information and relevant experience
              </li>
              <li>• File size should not exceed 5MB</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/job?id=${jobData?._id}`)}
              className={`px-6 py-3 cursor-pointer rounded-lg font-semibold border transition-colors ${applyJobThemeClass.button.secondary}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!resumeFile || isPending}
              className={`flex ${
                isDark
                  ? "disabled:bg-gray-800 disabled:text-gray-600"
                  : "disabled:bg-gray-300 disabled:text-gray-400"
              }  disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center cursor-pointer gap-2 ${
                applyJobThemeClass.button.primary
              }`}
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-sm text-center ${applyJobThemeClass.text.muted}`}>
            Having trouble? Make sure your resume image is clear and all
            information is readable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;
