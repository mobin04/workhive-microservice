import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  Building2,
  MapPin,
  Moon,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { envVariables } from "../../config";
import { setUser } from "../../store/slices/userSlice";

function Header() {
  const navigate = useNavigate();
  const { isDark, setDark, themeClasses, searchBgClasses } =
    useContext(ThemeContext);
  const [isJobSearchOpen, setIsJobSearchOpen] = useState(false);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { LOGOUT_URL } = envVariables;
  const dispatch = useDispatch();

  const staticData = {
    popularSearches: [
      "Software Engineer",
      "Data Analyst",
      "Product Manager",
      "UX Designer",
    ],
    popularCitys: [
      "Mumbai, IN",
      "Bangalore, IN",
      "Hyderabad, IN",
      "Chennai, IN",
    ],
  };

  const toggleTheme = () => {
    setDark(!isDark);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    setIsJobSearchOpen(false);
    setIsLocationSearchOpen(false);
  };

  const signOut = async () => {
    try {
      const res = await axios.post(LOGOUT_URL, "", { withCredentials: true });
      if (res.data.message) dispatch(setUser(null));
      setProfileDropdownOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <header
        className={`${themeClasses} border-b shadow-lg flex items-center justify-center relative`}
      >
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
            {/* Logo Section */}
            <div
              className="flex items-center space-x-2 flex-shrink-0 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                WorkHive
              </h1>
            </div>

            {/* Desktop Search Section */}
            {user ? (
              <div className="hidden lg:flex flex-1 max-w-2xl mx-8 space-x-4">
                {/* Job Search */}
                <div className="relative flex-1">
                  <div
                    className={`${searchBgClasses} border rounded-lg px-4 py-2 flex items-center space-x-2 cursor-pointer hover:border-blue-400 transition-colors`}
                    onClick={() => {
                      setIsJobSearchOpen(!isJobSearchOpen);
                      setIsLocationSearchOpen(false);
                    }}
                  >
                    <Search className="h-4 w-4 text-blue-600" />
                    <input
                      type="text"
                      placeholder="Search jobs, category, companies..."
                      className={`flex-1 bg-transparent outline-none ${
                        isDark ? "placeholder-gray-400" : "placeholder-gray-500"
                      }`}
                    />
                  </div>

                  {isJobSearchOpen && (
                    <div
                      className={`absolute top-full left-0 right-0 mt-2 ${themeClasses} border rounded-lg shadow-xl z-50 p-4`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm font-medium text-blue-600">
                          <Briefcase className="h-4 w-4" />
                          <span>Popular Searches</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {staticData.popularSearches.map((item, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded ${
                                isDark
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-blue-50"
                              } cursor-pointer transition-colors`}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Search */}
                <div className="relative w-64">
                  <div
                    className={`${searchBgClasses} border rounded-lg px-4 py-2 flex items-center space-x-2 cursor-pointer hover:border-blue-400 transition-colors`}
                    onClick={() => {
                      setIsLocationSearchOpen(!isLocationSearchOpen);
                      setIsJobSearchOpen(false);
                    }}
                  >
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <input
                      type="text"
                      placeholder="Location"
                      className={`flex-1 bg-transparent outline-none ${
                        isDark ? "placeholder-gray-400" : "placeholder-gray-500"
                      }`}
                    />
                  </div>

                  {isLocationSearchOpen && (
                    <div
                      className={`absolute top-full left-0 right-0 mt-2 ${themeClasses} border rounded-lg shadow-xl z-50 p-4`}
                    >
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-blue-600 mb-2">
                          Popular Locations
                        </div>
                        <div className="space-y-1">
                          {staticData.popularCitys.map((item, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded cursor-pointer transition-colors flex items-center space-x-2 ${
                                isDark
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-blue-50"
                              }`}
                            >
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Right Section */}
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Mobile Search Button */}
                <button
                  onClick={toggleMobileSearch}
                  className={`lg:hidden p-2 rounded-lg ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                  } transition-colors`}
                >
                  {isMobileSearchOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Search className="h-5 w-5 text-blue-600" />
                  )}
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                  } transition-colors cursor-pointer`}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {/* Notifications */}
                <button
                  className={`relative p-2 rounded-lg ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                  } transition-colors hidden sm:block`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                    }`}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <img
                      src={user.coverImage}
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                    ></img>
                    <span className="hidden md:block font-medium">
                      {user?.name}
                    </span>
                  </button>

                  {profileDropdownOpen && (
                    <div
                      className={`absolute top-full right-0 mt-2 w-fit ${themeClasses} border rounded-lg shadow-xl z-50 py-2`}
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                      <a
                        href="#"
                        className={`block px-4 py-2 ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                        } transition-colors`}
                      >
                        My Profile
                      </a>
                      <a
                        href="#"
                        className={`block px-4 py-2 ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                        } transition-colors`}
                      >
                        My Applications
                      </a>
                      <a
                        href="#"
                        className={`block px-4 py-2 ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                        } transition-colors`}
                      >
                        Saved Jobs
                      </a>
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <a
                          className="cursor-pointer block px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          onClick={signOut}
                        >
                          Sign Out
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <button
                    className="text-white px-3 py-2 text-sm md:text-lg bg-blue-600 md:px-5 md:py-3 rounded-md mx-4 cursor-pointer hover:bg-blue-700 transition-all duration-200 hover:translate-y-[0.99px]"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </button>
                  <button
                    className="text-white px-3 py-2 text-sm md:text-lg bg-blue-600 md:px-5 md:py-3 rounded-md cursor-pointer hover:bg-blue-700 transition-all duration-200 hover:translate-y-[0.99px]"
                    onClick={() => navigate("/login")}
                  >
                    Signup
                  </button>
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                    } transition-colors hidden sm:inline-block sm:relative left-2 md:left-5 lg:left-8 cursor-pointer`}
                  >
                    {isDark ? (
                      <Sun className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Moon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {user ? (
        <>
          {isMobileSearchOpen && (
            <div
              className={`lg:hidden ${themeClasses} border-b shadow-lg px-4 py-4 space-y-4`}
            >
              {/* Job Search */}
              <div className="relative">
                <div
                  className={`${searchBgClasses} border rounded-lg px-4 py-3 flex items-center space-x-2 cursor-pointer hover:border-blue-400 transition-colors`}
                  onClick={() => {
                    setIsJobSearchOpen(!isJobSearchOpen);
                    setIsLocationSearchOpen(false);
                  }}
                >
                  <Search className="h-4 w-4 text-blue-600" />
                  <input
                    type="text"
                    placeholder="Search jobs, category, companies..."
                    className={`flex-1 bg-transparent outline-none ${
                      isDark ? "placeholder-gray-400" : "placeholder-gray-500"
                    }`}
                  />
                </div>

                {isJobSearchOpen && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-2 ${themeClasses} border rounded-lg shadow-xl z-50 p-4`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm font-medium text-blue-600">
                        <Briefcase className="h-4 w-4" />
                        <span>Popular Searches</span>
                      </div>
                      <div className="space-y-2">
                        {staticData.popularSearches.map((item, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded ${
                              isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                            } cursor-pointer transition-colors`}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Search */}
              <div className="relative">
                <div
                  className={`${searchBgClasses} border rounded-lg px-4 py-3 flex items-center space-x-2 cursor-pointer hover:border-blue-400 transition-colors`}
                  onClick={() => {
                    setIsLocationSearchOpen(!isLocationSearchOpen);
                    setIsJobSearchOpen(false);
                  }}
                >
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <input
                    type="text"
                    placeholder="Location"
                    className={`flex-1 bg-transparent outline-none ${
                      isDark ? "placeholder-gray-400" : "placeholder-gray-500"
                    }`}
                  />
                </div>

                {isLocationSearchOpen && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-2 ${themeClasses} border rounded-lg shadow-xl z-50 p-4`}
                  >
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-blue-600 mb-2">
                        Popular Locations
                      </div>
                      <div className="space-y-1">
                        {staticData.popularCitys.map((item, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded cursor-pointer transition-colors flex items-center space-x-2 ${
                              isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                            }`}
                          >
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </>
  );
}

export default Header;
