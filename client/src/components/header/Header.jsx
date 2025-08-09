import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { envVariables } from "../../config";
import { setUser } from "../../store/slices/userSlice";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../../server/fetchData";
import { setJobs } from "../../store/slices/jobSlice";
import { useDebounce } from "../../hooks/useDebounce";
import { Bell, Briefcase, Moon, Search, Sun, X } from "lucide-react";
import { forwardGeocode } from "../../utils/mapbox";
import { showPopup } from "../../store/slices/popupSlice";
import SearchBars from "./search-bar/SearchBars";
import MobileSearchBar from "./mobile-search-bar/MobileSearchBar";
import NotificationDropdown from "../notification/Notification";

const initialState = {
  search: "",
  location: "",
  locationCoords: null,
};

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, setDark, themeClasses } = useContext(ThemeContext);
  const { allNotifications } = useSelector((state) => state.notification);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isJobSearchOpen, setIsJobSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const isHome = location.pathname === "/";
    setIsHomePage(isHome);
  }, [location]);

  const { user } = useSelector((state) => state.user);
  const { LOGOUT_URL, GET_JOB_URL } = envVariables;
  const reduxDispatch = useDispatch();

  function reducer(state, action) {
    return { ...state, [action.name]: action.value };
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const debouncedSearch = useDebounce(state.search, 400);
  // const debouncedLocation = useDebounce(state.location, 400);

  const staticData = useMemo(
    () => ({
      popularSearches: [
        "Software Engineer",
        "Data Analyst",
        "Product Manager",
        "UX Designer",
      ],
    }),
    []
  );

  // search query based on current state
  const createSearchQuery = useCallback(() => {
    const query = {};

    if (debouncedSearch?.trim()) {
      query.search = debouncedSearch.trim();
    }

    if (
      state.locationCoords &&
      Array.isArray(state.locationCoords) &&
      state.locationCoords.length >= 2
    ) {
      query.longitude = state.locationCoords[0];
      query.latitude = state.locationCoords[1];
      query.distance = 50;
      query.unit = "km";
    }

    return query;
  }, [debouncedSearch, state.locationCoords]);

  const searchQuery = createSearchQuery();

  // fetching jobs
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["jobs", searchQuery],
    queryFn: ({ queryKey }) => fetchData(queryKey[1], GET_JOB_URL),
    enabled: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (data && user?.role === "job_seeker") {
      reduxDispatch(setJobs(data));
    }
  }, [data, reduxDispatch]);

  useEffect(() => {
    const shouldSearch =
      (debouncedSearch && debouncedSearch.trim().length >= 2) ||
      (state.locationCoords && Array.isArray(state.locationCoords));

    if (shouldSearch && user?.role === "job_seeker") {
      refetch();
    } else if (
      debouncedSearch === "" &&
      !state.locationCoords &&
      user?.role === "job_seeker"
    ) {
      // fetch all jobs when search is cleared
      fetchData({}, GET_JOB_URL)
        .then((res) => {
          reduxDispatch(setJobs(res));
        })
        .catch((error) => {
          console.error("Error fetching all jobs:", error);
        });
    }
  }, [
    debouncedSearch,
    state.locationCoords,
    refetch,
    GET_JOB_URL,
    reduxDispatch,
    user,
  ]);

  // Handle location search
  const handleLocationSearch = useCallback(async (value) => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    if (value.length >= 2) {
      setIsSearching(true);
      try {
        const results = await forwardGeocode(value);
        setSuggestions(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }
  }, []);

  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    dispatch({ name: "location", value });

    // Clear location coordinates when user types new location
    if (state.locationCoords) {
      dispatch({ name: "locationCoords", value: null });
    }

    handleLocationSearch(value);
  };

  const selectLocation = (item) => {
    if (item && item.place_name && item.coordinates) {
      dispatch({ name: "location", value: item.place_name });
      dispatch({ name: "locationCoords", value: item.coordinates });
      setSuggestions([]);
      setIsLocationSearchOpen(false);
    }
  };

  const selectPopularSearch = (searchTerm) => {
    dispatch({ name: "search", value: searchTerm });
    setIsJobSearchOpen(false);
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
      if (res.data.message) {
        reduxDispatch(setUser(null));
        reduxDispatch(
          showPopup({
            message: "Sign out successfully!",
            type: "success",
            visible: true,
            popupId: Date.now,
          })
        );
        navigate("/");
      }
      setProfileDropdownOpen(false);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsJobSearchOpen(false);
        setIsLocationSearchOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInputChange = (e) => {
    dispatch({ name: e.target.name, value: e.target.value });
  };

  const clearSearch = useCallback(() => {
    dispatch({ name: "search", value: "" });
    dispatch({ name: "location", value: "" });
    dispatch({ name: "locationCoords", value: null });
    setSuggestions([]);
  }, []);

  return (
    <>
      <header
        className={`${themeClasses} z-50 fixed top-0 left-0 w-full border-b shadow-sm flex items-center justify-center `}
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
            {isHomePage && user?.role === "job_seeker" && (
              <SearchBars
                clearSearch={clearSearch}
                handleLocationInputChange={handleLocationInputChange}
                handleSearchInputChange={handleSearchInputChange}
                isJobSearchOpen={isJobSearchOpen}
                isLoading={isLoading}
                isLocationSearchOpen={isLocationSearchOpen}
                isSearching={isSearching}
                selectLocation={selectLocation}
                selectPopularSearch={selectPopularSearch}
                setIsJobSearchOpen={setIsJobSearchOpen}
                setIsLocationSearchOpen={setIsLocationSearchOpen}
                state={state}
                suggestions={suggestions}
                isMobileSearchOpen={isMobileSearchOpen}
              />
            )}

            {/* Right Section */}
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Mobile Search Button */}
                {isHomePage && (
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
                )}

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

                {/* Notifications */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className={`relative p-2 rounded-lg cursor-pointer ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                    } transition-colors hidden sm:block`}
                  >
                    {allNotifications?.filter(
                      (notifs) => notifs?.status === "unread"
                    )?.length > 0 ? (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {
                          allNotifications?.filter(
                            (notifs) => notifs?.status === "unread"
                          )?.length
                        }
                      </span>
                    ) : null}
                    <Bell className="h-5 w-5" />
                  </button>

                  <NotificationDropdown
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                    isDark={isDark}
                  />
                </div>

                {/* <button
                  className={`relative p-2 rounded-lg cursor-pointer ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                  } transition-colors hidden sm:block`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button> */}

                {/* Profile Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    className={`flex items-center cursor-pointer space-x-2 p-2 rounded-lg transition-colors ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                    }`}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <img
                      src={user.coverImage}
                      alt="Profile"
                      className="h-9 w-9 border-2 border-white rounded-full object-cover"
                    />
                    <span className="hidden md:block font-medium">
                      {user?.name?.split(" ")[0]?.toUpperCase()}
                    </span>
                  </button>

                  {profileDropdownOpen && (
                    <div
                      className={`absolute top-full right-0 mt-2 w-50 md:w-64 ${
                        isDark ? "bg-gray-900/95" : "bg-white/95"
                      } backdrop-blur-md border rounded-lg shadow-xl z-50 py-2`}
                    >
                      <div
                        className={`px-4 py-3 border-b ${
                          isDark ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                      <a
                        onClick={() => {
                          navigate("/profile");
                          setProfileDropdownOpen(false);
                        }}
                        className={`block px-4 py-2 cursor-pointer ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        My Profile
                      </a>
                      <a
                        onClick={() => {
                          setIsNotificationOpen(!isNotificationOpen);
                          setProfileDropdownOpen(false);
                        }}
                        className={`block sm:hidden px-4 py-2 cursor-pointer ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        Notifications
                      </a>
                      
                      {user?.role === "employer" && (
                        <a
                          onClick={() => {
                            navigate("/employer-stats");
                            setProfileDropdownOpen(false);
                          }}
                          className={`block cursor-pointer px-4 py-2 ${
                            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          } transition-colors`}
                        >
                          Job Statistics
                        </a>
                      )}

                      {user?.role === "job_seeker" && (
                        <a
                          onClick={() => {
                            navigate("/applications");
                            setProfileDropdownOpen(false);
                          }}
                          className={`block cursor-pointer px-4 py-2 ${
                            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          } transition-colors`}
                        >
                          My Applications
                        </a>
                      )}

                      {user?.role === "job_seeker" && (
                        <a
                          onClick={() => {
                            navigate("/saved-jobs");
                            setProfileDropdownOpen(false);
                          }}
                          className={`block px-4 py-2 ${
                            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          } transition-colors cursor-pointer`}
                        >
                          Saved Jobs
                        </a>
                      )}
                      <div
                        className={`border-t ${
                          isDark ? "border-gray-700" : "border-gray-200"
                        } mt-1 pt-1`}
                      >
                        <button
                          className={`w-full cursor-pointer text-left px-4 py-2 text-red-600 ${
                            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          } transition-colors`}
                          onClick={() => {
                            signOut();
                            setProfileDropdownOpen(false);
                          }}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  className="text-white px-3 py-2 text-sm md:text-lg bg-blue-600 md:px-5 md:py-3 rounded-md cursor-pointer hover:bg-blue-700 transition-all duration-200 hover:translate-y-[0.99px]"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="text-white px-3 py-2 text-sm md:text-lg bg-blue-600 md:px-5 md:py-3 rounded-md cursor-pointer hover:bg-blue-700 transition-all duration-200 hover:translate-y-[0.99px]"
                  onClick={() => navigate("/signup")}
                >
                  Signup
                </button>
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                  } transition-colors hidden sm:inline-block cursor-pointer ml-2`}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isHomePage && user?.role === "job_seeker" && (
        <MobileSearchBar
          clearSearch={clearSearch}
          handleLocationInputChange={handleLocationInputChange}
          handleSearchInputChange={handleSearchInputChange}
          isJobSearchOpen={isJobSearchOpen}
          isLocationSearchOpen={isLocationSearchOpen}
          isMobileSearchOpen={isMobileSearchOpen}
          isSearching={isSearching}
          selectLocation={selectLocation}
          selectPopularSearch={selectPopularSearch}
          setIsJobSearchOpen={setIsJobSearchOpen}
          setIsLocationSearchOpen={setIsLocationSearchOpen}
          state={state}
          staticData={staticData}
          suggestions={suggestions}
        />
      )}
      <div className="h-[60px] sm:h-[72px]" />
    </>
  );
}

export default Header;
