import React, { useState, useEffect, useContext, useCallback } from "react";
import { useForm } from "react-hook-form";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { forwardGeocode, reverseGeocode } from "../../../utils/mapbox";
import MiniEditor from "./MiniDescEditor";
import { allCategories } from "./categories";
import {
  X,
  Upload,
  MapPin,
  Building2,
  Briefcase,
  FileText,
  Clock,
  Tag,
  Users,
  Save,
  IndianRupee,
} from "lucide-react";

const JobFormModal = ({
  isOpen,
  onClose,
  jobData = null,
  onSubmit,
  isLoading = false,
}) => {
  const [logoPreview, setLogoPreview] = useState(jobData?.companyLogo || "");
  const [logoFile, setLogoFile] = useState(null);
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const [geoLocName, setGeoLocName] = useState("");
  const { isDark, jobFormThemeClasses } = useContext(ThemeContext);
  const isEditMode = Boolean(jobData);

  useEffect(() => {
    if (jobData && jobData?.geoLocation?.coordinates?.length === 2) {
      reverseGeocode(jobData?.geoLocation?.coordinates).then((name) =>
        setGeoLocName(name.place_name)
      );
    }
  }, [jobData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      company: "",
      location: "",
      description: "",
      category: "",
      jobType: "full_time",
      jobLevel: "entry_level",
      salaryMinPerMonth: "",
      salaryMaxPerMonth: "",
      geoLocationName: "",
      coordinates: [0, 0],
      expiresAt: "",
    },
  });

  // Reset form when jobData changes
  useEffect(() => {
    if (jobData) {
      reset({
        title: jobData.title || "",
        company: jobData.company || "",
        location: jobData.location || "",
        description: jobData.description || "",
        category: jobData.category || "",
        jobType: jobData.jobType || "full_time",
        jobLevel: jobData.jobLevel || "entry_level",
        salaryMinPerMonth: jobData.salaryMinPerMonth || "",
        salaryMaxPerMonth: jobData.salaryMaxPerMonth || "",
        coordinates: jobData.geoLocation?.coordinates || [0, 0],
        geoLocationName: geoLocName || "",
        expiresAt: jobData.expiresAt
          ? new Date(jobData.expiresAt).toISOString().split("T")[0]
          : "",
      });
      setLogoPreview(jobData.companyLogo || "");
      setLogoFile(null);
    } else {
      reset({
        title: "",
        company: "",
        location: "",
        description: "",
        category: "",
        jobType: "full_time",
        jobLevel: "entry_level",
        salaryMinPerMonth: "",
        salaryMaxPerMonth: "",
        coordinates: [0, 0],
        geoLocationName: "",
        expiresAt: "",
      });
      setLogoPreview("");
      setLogoFile(null);
    }
  }, [jobData, reset, geoLocName]);

  // Handle logo upload
  const handleLogoUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      // file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 2MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setLogoFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const findLocation = useCallback(async (value) => {
    if (value?.length >= 2) {
      setIsLocationSearchOpen(true);
      try {
        const result = await forwardGeocode(value);
        setLocationSuggestion(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Location search error:", error);
        setLocationSuggestion([]);
      }
    } else {
      setLocationSuggestion([]);
      setIsLocationSearchOpen(false);
    }
  }, []);

  const selectLocation = useCallback(
    (item) => {
      setValue("geoLocationName", item?.place_name);
      setValue("coordinates", [item?.coordinates[0], item?.coordinates[1]]);
      setIsLocationSearchOpen(false);
    },
    [setValue]
  );

  const handleClose = useCallback(() => {
    setLogoPreview("");
    setLogoFile(null);
    setLocationSuggestion([]);
    setIsLocationSearchOpen(false);
    onClose();
  }, [onClose]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    (data) => {
      const formData = {
        ...data,
        companyLogo: logoFile,
        geoLocation: {
          type: "Point",
          coordinates: [
            parseFloat(data?.coordinates[0]) || 0,
            parseFloat(data?.coordinates[1]) || 0,
          ],
        },
      };

      // Remove unwanted fields
      // eslint-disable-next-line no-unused-vars
      const { geoLocationName, coordinates, ...updatedFormData } = formData;

      onSubmit(updatedFormData);
    },
    [logoFile, onSubmit]
  );

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${jobFormThemeClasses?.overlayClass} flex items-center justify-center p-4 z-50`}
    >
      <div
        className={`${jobFormThemeClasses?.bgClass} ${jobFormThemeClasses?.textClass} rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${jobFormThemeClasses?.borderClass}`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Edit Job" : "Create New Job"}
              </h2>
              <p
                className={`${jobFormThemeClasses?.textSecondaryClass} text-sm`}
              >
                {isEditMode
                  ? "Update your job posting"
                  : "Post a new job opportunity"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 ${
              isDark ? "hover:bg-gray-800" : ""
            }`}
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Company Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Company Logo</span>
              </label>
              <div className="flex items-center space-x-4">
                <div
                  className={`w-20 h-20 rounded-xl border-2 border-dashed ${jobFormThemeClasses?.borderClass} flex items-center justify-center overflow-hidden`}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company Logo Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Logo</span>
                  </label>
                  <p
                    className={`${jobFormThemeClasses?.textSecondaryClass} text-xs mt-1`}
                  >
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <span>Job Title *</span>
                </label>
                <input
                  {...register("title", {
                    required: "Job title is required",
                    minLength: {
                      value: 3,
                      message: "Job title must be at least 3 characters",
                    },
                    maxLength: {
                      value: 100,
                      message: "Job title must be less than 100 characters",
                    },
                  })}
                  className={`w-full p-3 ${jobFormThemeClasses?.inputBgClass} border ${jobFormThemeClasses?.inputBorderClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                  placeholder="e.g. Software Engineer"
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs">{errors.title.message}</p>
                )}
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Company Name *</span>
                </label>
                <input
                  {...register("company", {
                    required: "Company name is required",
                    minLength: {
                      value: 2,
                      message: "Company name must be at least 2 characters",
                    },
                  })}
                  className={`w-full p-3 ${jobFormThemeClasses?.inputBgClass} border ${jobFormThemeClasses?.inputBorderClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                  placeholder="e.g. TechNova"
                  disabled={isLoading}
                />
                {errors.company && (
                  <p className="text-red-500 text-xs">
                    {errors.company.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>Location *</span>
                </label>
                <input
                  {...register("location", {
                    required: "Location is required",
                  })}
                  className={`w-full p-3 ${jobFormThemeClasses?.inputBgClass} border ${jobFormThemeClasses?.inputBorderClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                  placeholder="e.g. Chennai"
                  disabled={isLoading}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span>Category *</span>
                </label>
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className={`w-full p-3 ${jobFormThemeClasses?.inputBgClass} border ${jobFormThemeClasses?.inputBorderClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                  disabled={isLoading}
                >
                  <option value="">Select a category</option>
                  {allCategories?.map((val, i) => (
                    <option key={i} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Job Type *</span>
                </label>
                <select
                  {...register("jobType", { required: "Job type is required" })}
                  className={`w-full p-3 ${jobFormThemeClasses?.inputBgClass} border ${jobFormThemeClasses?.inputBorderClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                  disabled={isLoading}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="remote">Remote</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
                {errors.jobType && (
                  <p className="text-red-500 text-xs">
                    {errors.jobType.message}
                  </p>
                )}
              </div>

              {/* Job Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Job Level *</span>
                </label>
                <select
                  {...register("jobLevel", {
                    required: "Job level is required",
                  })}
                  className={`w-full p-3 ${jobFormThemeClasses?.inputBgClass} border ${jobFormThemeClasses?.inputBorderClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                  disabled={isLoading}
                >
                  <option value="entry_level">Entry Level</option>
                  <option value="mid_level">Mid Level</option>
                  <option value="senior_level">Senior Level</option>
                  <option value="director">Director</option>
                  <option value="vp_or_above">Vp or Above</option>
                </select>
                {errors.jobLevel && (
                  <p className="text-red-500 text-xs">
                    {errors.jobLevel.message}
                  </p>
                )}
              </div>
            </div>

            {/* Geo Location */}
            <div className="space-y-2 relative">
              <label className="text-sm font-medium flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Geo Location *</span>
              </label>
              <div className="w-full md:w-1/2">
                <input
                  {...register("geoLocationName", {
                    required: "Geo location is required",
                  })}
                  type="text"
                  onChange={(e) => findLocation(e.target.value)}
                  className={`w-full p-3 ${jobFormThemeClasses?.inputBgClass} border ${jobFormThemeClasses?.inputBorderClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                  placeholder="Search location"
                  disabled={isLoading}
                />
                {errors?.geoLocationName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors?.geoLocationName?.message}
                  </p>
                )}

                {isLocationSearchOpen && locationSuggestion?.length > 0 && (
                  <div
                    className={`absolute top-full left-0 right-0 md:right-auto md:w-1/2 z-50 mt-1 ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } border rounded-lg shadow-lg max-h-60 overflow-y-auto`}
                  >
                    <div className="p-2">
                      <div className="text-sm font-medium text-blue-600 mb-2">
                        Suggestions
                      </div>
                      <div className="space-y-1">
                        {locationSuggestion?.map((item, i) => (
                          <div
                            key={i}
                            onClick={() => selectLocation(item)}
                            className={`p-2 rounded cursor-pointer transition-colors flex items-center space-x-2 ${
                              isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                            }`}
                          >
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate text-sm">
                              {item.place_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Salary Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                  <span>Salary Range (per month) *</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("salaryMinPerMonth", {
                      required: "Minimum salary is required",
                      min: {
                        value: 1,
                        message: "Salary must be greater than 0",
                      },
                    })}
                    type="number"
                    min="1"
                    onKeyDown={(e) => {
                      if (
                        [
                          "Backspace",
                          "Delete",
                          "ArrowLeft",
                          "ArrowRight",
                          "Tab",
                        ].includes(e.key)
                      ) {
                        return;
                      }
                      if (!/^\d$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className={`w-full p-3 ${jobFormThemeClasses?.inputBgClass} border ${jobFormThemeClasses?.inputBorderClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="Minimum salary"
                    disabled={isLoading}
                  />
                  {errors?.salaryMinPerMonth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors?.salaryMinPerMonth?.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("salaryMaxPerMonth", {
                      required: "Maximum salary is required",
                      min: {
                        value: 1,
                        message: "Salary must be greater than 0",
                      },
                      validate: (value) => {
                        const minSalary = watch("salaryMinPerMonth");
                        return (
                          !minSalary ||
                          Number(value) >= Number(minSalary) ||
                          "Maximum salary must be greater than or equal to minimum salary"
                        );
                      },
                    })}
                    type="number"
                    min="1"
                    onKeyDown={(e) => {
                      if (
                        [
                          "Backspace",
                          "Delete",
                          "ArrowLeft",
                          "ArrowRight",
                          "Tab",
                        ].includes(e.key)
                      ) {
                        return;
                      }
                      if (!/^\d$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className={`w-full p-3 ${jobFormThemeClasses?.inputBgClass} border ${jobFormThemeClasses?.inputBorderClass} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="Maximum salary"
                    disabled={isLoading}
                  />
                  {errors?.salaryMaxPerMonth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors?.salaryMaxPerMonth?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Job Description *</span>
              </label>

              <MiniEditor
                value={watch("description")}
                onChange={(val) => setValue("description", val)}
                disabled={isLoading}
              />

              <input
                {...register("description", {
                  required: "Job description is required",
                  minLength: {
                    value: 50,
                    message: "Description must be at least 50 characters",
                  },
                })}
                type="hidden"
              />

              {errors.description && (
                <p className="text-red-500 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-opacity-50">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className={`w-full sm:w-auto px-6 py-3 border ${
                  jobFormThemeClasses?.borderClass
                } rounded-lg font-medium transition-colors hover:bg-gray-50 ${
                  isDark ? "hover:bg-gray-800" : ""
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-b-transparent rounded-full"></div>
                    <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{isEditMode ? "Update Job" : "Create Job"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFormModal;
