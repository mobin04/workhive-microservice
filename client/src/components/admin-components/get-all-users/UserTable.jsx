import React, { useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import formatDateString from "../../../utils/formatDateString";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  Edit,
  SquareArrowOutUpRightIcon,
} from "lucide-react";

const UserTable = ({ userData }) => {
  const { allUserThemeClasses, isDark } = useContext(ThemeContext);
  const { formatDate } = formatDateString();
  const navigate = useNavigate();

  const getRoleColor = (role) => {
    const colors = {
      admin: isDark
        ? "bg-red-900/20 text-red-400 border-red-800"
        : "bg-red-50 text-red-600 border-red-200",
      employer: isDark
        ? "bg-green-900/20 text-green-400 border-green-800"
        : "bg-green-50 text-green-600 border-green-200",
      job_seeker: isDark
        ? "bg-blue-900/20 text-blue-400 border-blue-800"
        : "bg-blue-50 text-blue-600 border-blue-200",
    };
    return colors[role] || colors.job_seeker;
  };

  const statusColor = (status) => {
    const color = {
      suspended: isDark
        ? "bg-red-900/20 text-red-400 border-red-800"
        : "bg-red-50 text-red-600 border-red-200",
      active: isDark
        ? "bg-green-900/20 text-green-400 border-green-800"
        : "bg-green-50 text-green-600 border-green-200",
    };
    return color[status];
  };

  return (
    <>
      {/* Users Table - Desktop */}
      <div className="hidden lg:block">
        <div
          className={`${allUserThemeClasses.cardBackground} rounded-xl shadow-sm border ${allUserThemeClasses.border} overflow-hidden`}
        >
          <table className="w-full">
            <thead
              className={`${isDark ? "bg-gray-700" : "bg-gray-50"} border-b ${
                allUserThemeClasses.border
              }`}
            >
              <tr>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium ${allUserThemeClasses.textSecondary} uppercase tracking-wider`}
                >
                  User
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium ${allUserThemeClasses.textSecondary} uppercase tracking-wider`}
                >
                  Role
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium ${allUserThemeClasses.textSecondary} uppercase tracking-wider`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium ${allUserThemeClasses.textSecondary} uppercase tracking-wider`}
                >
                  Contact
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium ${allUserThemeClasses.textSecondary} uppercase tracking-wider`}
                >
                  Joined
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-medium ${allUserThemeClasses.textSecondary} uppercase tracking-wider`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-gray-600" : "divide-gray-300"
              }`}
            >
              {userData?.data?.users?.map((user) => (
                <tr
                  key={user._id}
                  className={`${allUserThemeClasses.hover} transition-colors ease-in-out duration-300`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.coverImage}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                      />
                      <div>
                        <h3
                          className={`font-semibold ${allUserThemeClasses.text}`}
                        >
                          {user.name}
                        </h3>
                        <p
                          className={`text-sm ${allUserThemeClasses.textSecondary}`}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor(
                        user.isSuspended ? "suspended" : "active"
                      )}`}
                    >
                      {user.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {user.phone && user.phone !== "Not specified" ? (
                        <div className="flex items-center gap-2">
                          <Phone
                            className={`h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                          />
                          <span
                            className={`text-sm ${allUserThemeClasses.text}`}
                          >
                            {user.phone}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Phone
                            className={`h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                          />
                          <span
                            className={`text-sm ${allUserThemeClasses.text}`}
                          >
                            not set
                          </span>
                        </div>
                      )}
                      {user.location && user.location !== "Not specified" ? (
                        <div className="flex items-center gap-2">
                          <MapPin
                            className={`h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                          />
                          <span
                            className={`text-sm ${allUserThemeClasses.text}`}
                          >
                            {user.location}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin
                            className={`h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                          />
                          <span
                            className={`text-sm ${allUserThemeClasses.text}`}
                          >
                            not set
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar
                        className={`h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                      />
                      <span className={`text-sm ${allUserThemeClasses.text}`}>
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user?.role === "employer" && (
                        <button
                          onClick={() =>
                            navigate(`/admin/user-profile/${user?._id}`)
                          }
                          className={`p-2 rounded-lg ${allUserThemeClasses.hover} ${allUserThemeClasses.iconHover} transition-colors cursor-pointer`}
                          title="Manage Employer"
                        >
                          <SquareArrowOutUpRightIcon
                            className={`h-5 w-5 ${allUserThemeClasses.textSecondary}`}
                          />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          navigate(`/admin/manage-user/${user?._id}`)
                        }
                        className={`p-2 rounded-lg ${allUserThemeClasses.hover} ${allUserThemeClasses.iconHover}  transition-colors cursor-pointer`}
                        title="Edit User"
                      >
                        <Edit
                          className={`h-5 w-5 ${allUserThemeClasses.textSecondary}`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {userData?.data?.users?.map((user) => (
          <div
            key={user._id}
            className={`${allUserThemeClasses.cardBackground} rounded-xl p-6 border ${allUserThemeClasses.border} shadow-sm`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={user.coverImage}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                />
                <div>
                  <h3 className={`font-semibold ${allUserThemeClasses.text}`}>
                    {user.name}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {user.role.replace("_", " ")}
                  </span>
                </div>
              </div>
              <button className={`p-2 ${allUserThemeClasses.hover} rounded-lg`}>
                <MoreVertical
                  className={`h-5 w-5 ${allUserThemeClasses.textSecondary}`}
                />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Mail
                  className={`h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                />
                <span className={`text-sm ${allUserThemeClasses.text}`}>
                  {user.email}
                </span>
              </div>
              {user.phone && user.phone !== "Not specified" && (
                <div className="flex items-center gap-2">
                  <Phone
                    className={`h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                  />
                  <span className={`text-sm ${allUserThemeClasses.text}`}>
                    {user.phone}
                  </span>
                </div>
              )}
              {user.location && user.location !== "Not specified" && (
                <div className="flex items-center gap-2">
                  <MapPin
                    className={`h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                  />
                  <span className={`text-sm ${allUserThemeClasses.text}`}>
                    {user.location}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar
                  className={`h-4 w-4 ${allUserThemeClasses.textSecondary}`}
                />
                <span
                  className={`text-sm ${allUserThemeClasses.textSecondary}`}
                >
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                View Details
              </button>
              <button
                className={`px-4 py-2 border ${allUserThemeClasses.border} rounded-lg ${allUserThemeClasses.hover} transition-colors text-sm font-medium ${allUserThemeClasses.text}`}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UserTable;
