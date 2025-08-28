import React, { useState, useContext, useEffect } from "react";
import { Shield, Key, Send } from "lucide-react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import ProfileCard from "./ProfileCard";
import useScrollToTop from "../../../hooks/useScrollTo";
import { useParams } from "react-router-dom";
import useFetchUserById from "../../../hooks/admin-hooks/useFetchUserById";
import Loading from "../../loader/Loading";

const AdminUserProfile = () => {
  const { isDark, profileThemeClasses } = useContext(ThemeContext);
  const [userData, setUserData] = useState({});

  useScrollToTop();

  const params = useParams();

  const { isLoading, refetch } = useFetchUserById(params?.id, setUserData);

  useEffect(() => {
    if (params?.id) {
      refetch();
    }
  }, [params?.id, refetch]);

  if (isLoading) return <Loading />;

  if (!userData) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className={`text-xl ${isDark ? "text-white" : "text-gray-900"}`}>
          No user data available
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      } py-8 px-4 sm:px-6 lg:px-8`}
    >
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
                <span className="flex items-center gap-2">
                  <Shield className="h-8 w-8 text-blue-600" />
                  Manage User Profile
                </span>
              </h1>
              <p
                className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Admin panel - Edit user information and account settings
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <ProfileCard userData={userData} setUserData={setUserData} />

        {/* Password Management Section */}
        <div>
          <div
            className={`${profileThemeClasses.cardClasses} rounded-xl shadow-lg border overflow-hidden`}
          >
            <div className="px-6 py-6">
              <div className="flex-1 sm:flex items-center justify-between mb-6">
                <div>
                  <h3
                    className={`text-lg font-semibold flex items-center gap-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Key className="h-5 w-5 text-blue-600" />
                    Password Management
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Update user's account password
                  </p>
                </div>
                <button
                  type="button"
                  className="flex mt-5 items-center cursor-pointer space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Send password reset token</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;
