import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import useFetchUsers from "../../../hooks/admin-hooks/useFetchUsers";
import formatDateString from "../../../utils/formatDateString";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Pagination from "../../home/pagination/Pagination";

const EmployerDetailsTable = () => {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [employersData, setEmployers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { isPending, mutate } = useFetchUsers(setEmployers);
  const { formatDate } = formatDateString();

  const getJobCountBadgeColor = (totalJobs) => {
    if (totalJobs > 10) {
      return isDark
        ? "bg-green-900 text-green-200"
        : "bg-green-100 text-green-800";
    } else if (totalJobs > 5) {
      return isDark
        ? "bg-yellow-900 text-yellow-200"
        : "bg-yellow-100 text-yellow-800";
    } else {
      return isDark ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800";
    }
  };

  const employer = employersData?.data?.users;

  useEffect(() => {
    mutate({ role: "employer" });
  }, [mutate]);

  useEffect(() => {
    if (searchTerm?.length < 2) {
      mutate({ search: searchTerm, role: "employer" });
    }
  }, [searchTerm, mutate]);

  const handlePagination = (pageNum) => {
    mutate({ role: "employer", page: pageNum?.toString() });
  };

  return (
    <div
      className={`mt-5 sm:mb-8 rounded-xl p-3 sm:p-6 transition-all duration-300 h-1/2 overflow-y-auto ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-100 shadow-lg"
      }`}
    >
      {/* Header - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center mb-3 sm:mb-4">
          <Building2
            className={`w-5 h-5 mr-2 ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <h3
            className={`text-lg sm:text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Employer Overview
          </h3>
        </div>

        {/* Search Bar - Full Width on Mobile */}
        <div className="relative w-full">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="Search employers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border transition-colors text-sm sm:text-base ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
          />
        </div>
      </div>

      {/* Employer List */}
      <div className="space-y-3 sm:space-y-4">
        {employer?.map((employer, index) => (
          <div
            key={employer._id || index}
            className={`rounded-lg border p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
              isDark
                ? "bg-gray-750 border-gray-600 hover:bg-gray-700/20"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            } hover:shadow-md`}
            onClick={() => navigate(`/admin/user-profile/${employer._id}`)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    {employer.coverImage ? (
                      <img
                        src={employer.coverImage}
                        alt={employer.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center ${
                          isDark ? "bg-gray-600" : "bg-gray-200"
                        }`}
                      >
                        <Building2
                          className={`w-6 h-6 sm:w-8 sm:h-8 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Name and Jobs Badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4
                        className={`text-base sm:text-lg font-semibold truncate pr-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {employer.name}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getJobCountBadgeColor(
                          employer.totalJobs
                        )}`}
                      >
                        {employer.totalJobs} Jobs
                      </span>
                    </div>

                    {/* Bio */}
                    {employer.bio && employer.bio !== "undefined" && (
                      <p
                        className={`text-xs sm:text-sm mb-2 line-clamp-2 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {employer.bio}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight
                  className={`w-5 h-5 sm:hidden ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center">
                  <Mail
                    className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`truncate ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {employer.email}
                  </span>
                </div>

                {employer.phone && (
                  <div className="flex items-center">
                    <Phone
                      className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`truncate ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {employer.phone}
                    </span>
                  </div>
                )}

                {employer.location && (
                  <div className="flex items-center">
                    <MapPin
                      className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`truncate ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {employer.location}
                    </span>
                  </div>
                )}

                {employer.website && employer.website !== "undefined" && (
                  <div className="flex items-center">
                    <Globe
                      className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <a
                      href={employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`truncate ${
                        isDark
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-700"
                      } hover:underline`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Date and Status */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center text-xs">
                  <Calendar
                    className={`w-3 h-3 mr-1 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                    Joined {formatDate(employer.createdAt)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Suspension Status */}
                  {employer.isSuspended && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isDark
                          ? "bg-red-900 text-red-200"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      Suspended
                    </span>
                  )}

                  <button
                    className={`hidden cursor-pointer sm:inline-flex px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isDark
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    onClick={() => {
                      navigate(`/admin/user-profile/${employer._id}`);
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Pagination
          currentPage={employersData?.currentPage || "1"}
          isDark={isDark}
          totalPages={employersData?.totalPages || "0"}
          pageFilter={handlePagination}
        />

        {/* Loading */}
        {isPending && (
          <div
            className={`text-center py-8 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-sm">Loading employers...</p>
          </div>
        )}

        {!isPending && employer?.length === 0 && (
          <div
            className={`text-center py-8 sm:py-12 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
            <p className="text-base sm:text-lg font-medium mb-2">
              No employers found
            </p>
            <p className="text-sm px-4">
              {searchTerm
                ? `No employers match "${searchTerm}". Try a different search term.`
                : "There are currently no employers in the system."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDetailsTable;
