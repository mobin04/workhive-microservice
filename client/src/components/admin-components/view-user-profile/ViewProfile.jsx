import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import formatSalaries from "../../../utils/formatSalary";
import formatDateString from "../../../utils/formatDateString";
import useFetchUserById from "../../../hooks/admin-hooks/useFetchUserById";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../loader/Loading";
import useFetchJobByEmpId from "../../../hooks/employer-hooks/useFetchJobByEmpId";
import { envVariables } from "../../../config";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Edit,
  Building,
  DollarSign,
  Clock,
  Users,
  ChevronRight,
  Search,
  MessageCircle,
  UserMinus,
  Filter,
  X,
  UserPlus,
} from "lucide-react";
import AccountSuspention from "../account-suspension/AccountSuspension";

const EmployerProfileView = () => {
  const {
    isDark,
    getStatusClrUsrProfile,
    getJobByClrTypeUsrProfile,
    getJobTypeColor,
  } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSuspendMode, setIsSuspendMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const { id } = useParams();
  const { formatDate } = formatDateString();
  const { formatSalary } = formatSalaries();
  const [employer, setEmployer] = useState({});
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { refetch, isLoading: loadingProfile } = useFetchUserById(
    id,
    setEmployer
  );

  const {
    data: jobData,
    isLoading: jobLoading,
    refetch: jobRefetch,
  } = useFetchJobByEmpId(
    `${envVariables.GET_ALL_JOBS_EMPLOYER_URL}/${id}/employer`,
    false
  );

  useEffect(() => {
    if (jobData && jobData?.data?.jobs?.length > 0) {
      setJobs(jobData?.data?.jobs);
    }
  }, [jobData]);

  useEffect(() => {
    if (!employer) return;
    jobRefetch();
  }, [employer, jobRefetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const clearSearch = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  const onSuspendModeClose = () => {
    setIsSuspendMode(false);
  };
  

  useEffect(() => {
    if (isSuspendMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSuspendMode]);

  if (loadingProfile) return <Loading />;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {isSuspendMode && (
        <AccountSuspention
          isOpen={isSuspendMode}
          onClose={onSuspendModeClose}
          user={employer}
          setUser={setEmployer}
        />
      )}

      {employer && (
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          {/* Header */}
          <div
            className={`rounded-xl shadow-lg mb-6 overflow-hidden ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Decorative Elements */}
            <div className="relative h-32 md:h-48 bg-blue-600 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white transform rotate-45"
                    style={{
                      left: `${(i * 17 + 10) % 100}%`,
                      top: `${(i * 23 + 15) % 80}%`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute top-2 md:top-4 right-2 md:right-4 flex gap-2">
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <Edit className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-2 ${
                    isDark
                      ? "border-gray-700 bg-gray-700"
                      : "border-white bg-gray-200"
                  } flex items-center justify-center -mt-10 md:-mt-12 relative z-10 mx-auto md:mx-0`}
                >
                  <img
                    src={employer?.coverImage}
                    alt={employer?.name}
                    className="rounded-full w-full h-full p-1 border-none"
                  />
                </div>

                <div className="flex-1 text-center md:text-left md:mt-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">
                        {employer?.name}
                      </h1>
                      <p
                        className={`text-md ${getJobTypeColor(
                          "internship"
                        )} w-fit px-2 rounded-2xl mt-5`}
                      >
                        {employer?.role?.toUpperCase()}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-end">
                      <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Message</span>
                      </button>
                      {employer?.isSuspended ? (
                        <button
                          onClick={() => setIsSuspendMode(true)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="text-sm">Remove Suspension</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsSuspendMode(true)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <UserMinus className="w-4 h-4" />
                          <span className="text-sm">Suspend</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Mail className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                      <span className="text-xs md:text-sm break-all">
                        {employer?.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Phone className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                      <span className="text-xs md:text-sm">
                        {employer?.phone}
                      </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3 sm:col-span-2 lg:col-span-1">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                      <span className="text-xs md:text-sm">
                        {employer?.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
            <div
              className={`p-4 md:p-6 rounded-xl shadow-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                  <Briefcase className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <p
                    className={`text-xs md:text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total Jobs
                  </p>
                  {jobLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-b-transparent rounded-full"></div>
                  ) : (
                    <p className="text-lg md:text-2xl font-bold">
                      {jobs.length}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`p-4 md:p-6 rounded-xl shadow-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                </div>
                <div>
                  <p
                    className={`text-xs md:text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Applications
                  </p>
                  {jobLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-b-transparent rounded-full"></div>
                  ) : (
                    <p className="text-lg md:text-2xl font-bold">
                      {jobs.reduce(
                        (acc, job) => acc + job.applications.length,
                        0
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`p-4 md:p-6 rounded-xl shadow-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
                  <Calendar className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div>
                  <p
                    className={`text-xs md:text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Member Since
                  </p>
                  {jobLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-b-transparent rounded-full"></div>
                  ) : (
                    <p className="text-xs md:text-sm font-semibold">
                      {formatDate(employer?.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`p-4 md:p-6 rounded-xl shadow-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-4 h-4 md:w-6 md:h-6 text-orange-600" />
                </div>
                <div>
                  <p
                    className={`text-xs md:text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Last Updated
                  </p>
                  {jobLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-b-transparent rounded-full"></div>
                  ) : (
                    <p className="text-xs md:text-sm font-semibold">
                      {formatDate(employer?.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className={`rounded-xl shadow-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`border-b ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <nav className="flex space-x-4 md:space-x-8 px-4 md:px-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-3 cursor-pointer md:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-600"
                      : `border-transparent ${
                          isDark
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        }`
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("jobs")}
                  disabled={jobLoading}
                  className={`py-3 cursor-pointer md:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "jobs"
                      ? "border-blue-500 text-blue-600"
                      : `border-transparent ${
                          isDark
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        }`
                  }`}
                >
                  {jobLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-b-transparent rounded-full"></div>
                  ) : (
                    <>Jobs ({jobs.length})</>
                  )}
                </button>
              </nav>
            </div>

            <div className="p-4 md:p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          User ID
                        </label>
                        <p
                          className={`text-sm break-all ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {employer?._id}
                        </p>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Account Type
                        </label>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {employer?.role?.charAt(0).toUpperCase() +
                            employer?.role?.slice(1)}
                        </p>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Registration Date
                        </label>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {formatDate(employer?.createdAt)}
                        </p>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Last Activity
                        </label>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {formatDate(employer?.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "jobs" && (
                <div className="space-y-4 md:space-y-6">
                  {/* Search and Filter Section */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Search Input */}
                      <div className="relative flex-1">
                        <Search
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Search jobs by title, company, or location..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                        />
                      </div>

                      {/* Status Filter */}
                      <div className="relative">
                        <Filter
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className={`pl-10 pr-8 py-3 rounded-lg border transition-colors appearance-none min-w-32 ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                        >
                          <option value="all">All Status</option>
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      {/* Clear Button */}
                      {(searchTerm || filterStatus !== "all") && (
                        <button
                          onClick={clearSearch}
                          className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                            isDark
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Clear</span>
                        </button>
                      )}
                    </div>

                    {/* Results Summary */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Posted Jobs</h3>
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {filteredJobs.length} of {jobs.length} job(s)
                      </span>
                    </div>
                  </div>

                  {/* Jobs List */}
                  <div className="space-y-4">
                    {filteredJobs.length === 0 ? (
                      <div
                        className={`text-center py-12 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No jobs found matching your criteria</p>
                      </div>
                    ) : (
                      filteredJobs.map((job) => (
                        <div
                          key={job._id}
                          className={`border rounded-xl p-4 md:p-6 transition-all hover:shadow-lg ${
                            isDark
                              ? "border-gray-700 bg-gray-750 hover:bg-gray-700"
                              : "border-gray-200 bg-gray-50 hover:bg-white"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <img
                              src={job.companyLogo}
                              alt={job.company}
                              className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover mx-auto md:mx-0"
                            />

                            <div className="flex-1 text-center md:text-left">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                                <div className="flex-1">
                                  <h4 className="text-lg md:text-xl font-semibold mb-2">
                                    {job.title}
                                  </h4>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                    <div className="flex items-center justify-center md:justify-start gap-1">
                                      <Building className="w-4 h-4 text-gray-400" />
                                      <span
                                        className={`text-sm ${
                                          isDark
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {job.company}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-1">
                                      <MapPin className="w-4 h-4 text-gray-400" />
                                      <span
                                        className={`text-sm ${
                                          isDark
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {job.location}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-end gap-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClrUsrProfile(
                                      job.status
                                    )}`}
                                  >
                                    {job.status.charAt(0).toUpperCase() +
                                      job.status.slice(1)}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getJobByClrTypeUsrProfile(
                                      job.jobType
                                    )}`}
                                  >
                                    {job.jobType
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              <p
                                className={`text-sm mb-4 line-clamp-2 ${
                                  isDark ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                {job.description.slice(0, 150)}...
                              </p>

                              <div className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:flex md:items-center md:gap-6">
                                  <div className="flex items-center justify-center md:justify-start gap-1">
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium">
                                      {formatSalary(
                                        job.salaryMinPerMonth,
                                        job.salaryMaxPerMonth
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-center md:justify-start gap-1">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm">
                                      {job.applications.length} applications
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-center md:justify-start gap-1">
                                    <Calendar className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm">
                                      Expires {formatDate(job.expiresAt)}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    navigate(`/view-job?id=${job?._id}`)
                                  }
                                  className={`w-full cursor-pointer md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    isDark
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                                  }`}
                                >
                                  View Details
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerProfileView;
