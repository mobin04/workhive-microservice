import React, { useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useSelector } from "react-redux";
import { useMergeWithdrawnApp } from "../../hooks/useMergeWithdrawnApp";
import { useNavigate } from "react-router-dom";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  MapPin,
  Phone,
  Globe,
  Award,
  BookOpen,
  Bookmark,
  List,
} from "lucide-react";

const ViewProfile = () => {
  const { isDark, profileThemeClasses } = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const fileInputRef = useRef(null);
  const { user: userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const applications = useMergeWithdrawnApp();
  const { mutate, isPending, fetchProfilePending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      name: userData?.name,
      phone: userData?.phone,
      location: userData?.location,
      website: userData?.website,
      bio: userData?.bio,
      experience: userData?.experience,
      education: userData?.education,
      skills: userData?.skills?.join(", "),
      coverImage: userData?.coverImage,
    },
  });

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: userData.name,
      phone: userData.phone,
      location: userData.location,
      website: userData.website,
      bio: userData.bio,
      experience: userData.experience,
      education: userData.education,
      skills: userData.skills.join(", "),
      coverImage: userData.coverImage,
    });
    setPreviewImg(null);
  };

  const onSubmit = (data) => {
    const processedData = {
      ...data,
      skills: data.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0),
    };

    // eslint-disable-next-line no-unused-vars
    const { updatedAt, ...userDataWithoutUpdatedAt } = userData;
    const updatedUserData = {
      ...userDataWithoutUpdatedAt,
      ...processedData,
      coverImage: data.coverImage,
    };
    const formData = new FormData();
    for (const key in updatedUserData) {
      const value = updatedUserData[key];
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        const isObject = typeof value === "object" && value !== null;
        formData.append(key, isObject ? JSON.stringify(value) : value);
      }
    }
    
    // API call
    mutate(formData);
    
    
    setIsEditing(false);
    setPreviewImg(null);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setPreviewImg(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImg(imageUrl);
      setValue("coverImage", file, { shouldDirty: true });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleDisplay = (role) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      } py-8 px-4 sm:px-6 lg:px-8`}
    >
      {userData && (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {userData?.name?.toUpperCase()}
                </h1>
                <p
                  className={`mt-2 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Manage your profile information and preferences
                </p>
              </div>
            </div>
          </div>

          {/*Profile Card */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className={`${profileThemeClasses.cardClasses} rounded-xl shadow-lg border overflow-hidden`}
            >
              {/* Cover Image */}
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="absolute inset-0 bg-black/20 overflow-hidden">
                  {[...Array(20)].map((_, i) => {
                    return (
                      <div
                        key={i}
                        className="absolute transition-all duration-1000 ease-initial"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                        }}
                      >
                        🔹
                      </div>
                    );
                  })}
                </div>

                {/* Edit Button */}
                <div className="absolute top-4 right-4">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex items-center cursor-pointer space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={!isDirty}
                        className={`flex ${
                          isDark
                            ? "disabled:bg-gray-500"
                            : "disabled:bg-gray-400"
                        } disabled:cursor-not-allowed cursor-pointer items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors`}
                      >
                        <Save className="h-4 w-4" />
                        {isPending ? (
                          <div className="animate-spin border-4 border-b-transparent rounded-full w-4-h-4"></div>
                        ) : (
                          <span>Save</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center space-x-2 cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Content */}
              <div className="relative px-6 pb-6">
                {/* Avatar Section */}
                <div className="flex items-end -mt-16 mb-6">
                  <div className="relative">
                    {isPending || fetchProfilePending ? (
                      <div className="flex justify-center items-center h-32 w-32 rounded-full border-2 border-white shadow-lg bg-white">
                        <div className="animate-spin w-25 h-25 border-8 border-blue-600 border-b-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <img
                        src={previewImg || userData.coverImage}
                        alt={userData.name}
                        className="h-32 w-32 object-cover rounded-full border-2 border-white shadow-lg bg-white"
                      />
                    )}
                    {isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={handleButtonClick}
                          className="absolute bottom-2 cursor-pointer right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </>
                    )}
                  </div>

                  <div className="ml-6 pb-4">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          userData.role === "job_seeker"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {getRoleDisplay(userData.role)}
                      </span>
                      <span
                        onClick={() => navigate("/saved-jobs")}
                        className={`flex cursor-pointer justify-center items-center px-3 py-1 rounded-full text-sm ${
                          isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Bookmark className="h-4 w-4 fill-red-600 text-red-600 inline mr-1" />
                        {userData.savedJobs.length} Saved Jobs
                      </span>
                      {applications && applications?.length > 0 && (
                        <span
                          onClick={() => navigate("/applications")}
                          className={`flex cursor-pointer justify-center items-center px-3 py-1 rounded-full text-sm ${
                            isDark
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <List className="h-4 w-4 fill-blue-600 text-blue-600 inline mr-1" />
                          {`${applications?.length} Application${
                            applications?.length > 1 ? "s" : ""
                          }`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Basic Information
                      </h3>
                      <div className="space-y-4">
                        {/* Name */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              {...register("name")}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileThemeClasses.inputClasses}`}
                            />
                          ) : (
                            <div
                              className={`flex items-center space-x-2 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              <User className="h-4 w-4 text-blue-600" />
                              <span>{userData.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Email Address
                          </label>
                          <div
                            className={`flex items-center space-x-2 ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            <Mail className="h-4 w-4 text-blue-600" />
                            <span>{userData.email}</span>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                              Verified
                            </span>
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              {...register("phone")}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileThemeClasses.inputClasses}`}
                            />
                          ) : (
                            <div
                              className={`flex items-center space-x-2 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              <Phone className="h-4 w-4 text-blue-600" />
                              <span>
                                {userData?.phone || (
                                  <span className="text-gray-500">
                                    Not added
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Location */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Location
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              {...register("location")}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileThemeClasses.inputClasses}`}
                            />
                          ) : (
                            <div
                              className={`flex items-center space-x-2 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span>
                                {userData.location || (
                                  <span className="text-gray-500">
                                    Not added
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Website */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Website
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              {...register("website")}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileThemeClasses.inputClasses}`}
                            />
                          ) : (
                            <div
                              className={`flex items-center space-x-2 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              <Globe className="h-4 w-4 text-blue-600" />
                              <a
                                href={`https://${userData.website}`}
                                className="text-blue-600 hover:underline"
                              >
                                {userData?.website || (
                                  <span className="text-gray-500">
                                    Not added
                                  </span>
                                )}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div>
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Account Information
                      </h3>
                      <div className="space-y-3">
                        <div
                          className={`flex items-center justify-between ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <span>Member since:</span>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>{formatDate(userData?.createdAt)}</span>
                          </div>
                        </div>
                        <div
                          className={`flex items-center justify-between ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <span>Last updated:</span>
                          <span>{formatDate(userData?.updatedAt)}</span>
                        </div>
                        <div
                          className={`flex items-center justify-between ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <span>User ID:</span>
                          <span className="font-mono text-xs">
                            {userData?._id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Bio */}
                    <div>
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        About Me
                      </h3>
                      {isEditing ? (
                        <textarea
                          {...register("bio")}
                          rows={4}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${profileThemeClasses.inputClasses}`}
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-700"
                          } leading-relaxed`}
                        >
                          {userData?.bio || (
                            <span className="text-gray-500">Not added</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Professional Details */}
                    <div>
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Professional Details
                      </h3>
                      <div className="space-y-4">
                        {/* Experience */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Experience Level
                          </label>
                          {isEditing ? (
                            <select
                              {...register("experience")}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileThemeClasses.inputClasses}`}
                            >
                              <option value="Entry Level">Entry Level</option>
                              <option value="1-2 years">1-2 years</option>
                              <option value="3-5 years">3-5 years</option>
                              <option value="5+ years">5+ years</option>
                              <option value="10+ years">10+ years</option>
                            </select>
                          ) : (
                            <div
                              className={`flex items-center space-x-2 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              <Award className="h-4 w-4 text-blue-600" />
                              <span>
                                {userData?.experience ? (
                                  userData.experience
                                ) : (
                                  <span className="text-gray-500">
                                    Not added
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Education */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Education
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              {...register("education")}
                              className={`w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileThemeClasses.inputClasses}`}
                            />
                          ) : (
                            <div
                              className={`flex items-center space-x-2 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              <span>
                                {userData?.education ? (
                                  userData.education
                                ) : (
                                  <span className="text-gray-500">
                                    Not added
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Skills
                      </h3>
                      {isEditing ? (
                        <input
                          type="text"
                          {...register("skills")}
                          placeholder="Enter skills separated by commas"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profileThemeClasses.inputClasses}`}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {userData?.skills?.length > 0 ? (
                            userData?.skills?.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">Not added</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ViewProfile;
