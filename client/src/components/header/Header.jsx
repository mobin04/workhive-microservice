import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { envVariables } from "../../config";
import { setUser } from "../../store/slices/userSlice";
import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../../utils/fetchJobs";
import { setJobs } from "../../store/slices/jobSlice";
import { useDebounce } from "../../hooks/useDebounce";
import { Bell, Briefcase, MapPin, Moon, Search, Sun, X } from "lucide-react";
import { forwardGeocode } from "../../utils/mapbox";

const initialState = {
  search: "",
  location: "",
  locationCoords: null,
};

function Header() {
  const navigate = useNavigate();
  const { isDark, setDark, themeClasses, searchBgClasses } =
    useContext(ThemeContext);
  const [isJobSearchOpen, setIsJobSearchOpen] = useState(false);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Create search query based on current state
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

  // React Query for fetching jobs
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["jobs", searchQuery],
    queryFn: ({ queryKey }) => fetchJobs(queryKey[1], GET_JOB_URL),
    enabled: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });


  useEffect(() => {
    if (data) {
      reduxDispatch(setJobs(data));
    }
  }, [data, reduxDispatch]);

  // Trigger search when search parameters change
  useEffect(() => {
    const shouldSearch =
      (debouncedSearch && debouncedSearch.trim().length >= 2) ||
      (state.locationCoords && Array.isArray(state.locationCoords));

    if (shouldSearch) {
      refetch();
    } else if (debouncedSearch === "" && !state.locationCoords) {
      // fetch all jobs when search is cleared
      fetchJobs({}, GET_JOB_URL)
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

  const clearSearch = () => {
    dispatch({ name: "search", value: "" });
    dispatch({ name: "location", value: "" });
    dispatch({ name: "locationCoords", value: null });
    setSuggestions([]);
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
                <div className="relative flex-1 dropdown-container">
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
                      value={state.search}
                      name="search"
                      onChange={handleSearchInputChange}
                      placeholder="Search jobs, category, companies..."
                      className={`flex-1 bg-transparent outline-none ${
                        isDark ? "placeholder-gray-400" : "placeholder-gray-500"
                      }`}
                    />
                    {state.search && (
                      <button onClick={clearSearch} className="p-1">
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                    {isLoading && (
                      <div
                        className={`animate-spin rounded-full h-5 w-5 border-4 ${
                          isDark
                            ? "border-r-blue-300 border-b-blue-400 border-l-blue-500"
                            : "border-r-blue-300 border-b-blue-400 border-l-blue-500"
                        } border-t-transparent`}
                      />
                    )}
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
                              onClick={() => selectPopularSearch(item)}
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
                <div className="relative w-64 dropdown-container">
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
                      value={state.location}
                      onChange={handleLocationInputChange}
                      className={`flex-1 bg-transparent outline-none ${
                        isDark ? "placeholder-gray-400" : "placeholder-gray-500"
                      }`}
                    />
                    {isSearching && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
                    )}
                  </div>

                  {isLocationSearchOpen && suggestions.length > 0 && (
                    <div
                      className={`absolute top-full left-0 right-0 mt-2 ${themeClasses} border rounded-lg shadow-xl z-50 p-4 max-h-64 overflow-y-auto`}
                    >
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-blue-600 mb-2">
                          Suggestions
                        </div>
                        <div className="space-y-1">
                          {suggestions.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => selectLocation(item)}
                              className={`p-2 rounded cursor-pointer transition-colors flex items-center space-x-2 ${
                                isDark
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-blue-50"
                              }`}
                            >
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="truncate">
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
                <div className="relative dropdown-container">
                  <button
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                    }`}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <img
                      src={user.coverImage}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="hidden md:block font-medium">
                      {user?.name?.split(" ")[0]?.toUpperCase()}
                    </span>
                  </button>

                  {profileDropdownOpen && (
                    <div
                      className={`absolute top-full right-0 mt-2 w-64 ${
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
                        href="#"
                        className={`block px-4 py-2 ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        My Profile
                      </a>
                      <a
                        href="#"
                        className={`block px-4 py-2 ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        My Applications
                      </a>
                      <a
                        href="#"
                        className={`block px-4 py-2 ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors`}
                      >
                        Saved Jobs
                      </a>
                      <div
                        className={`border-t ${
                          isDark ? "border-gray-700" : "border-gray-200"
                        } mt-1 pt-1`}
                      >
                        <button
                          className={`w-full text-left px-4 py-2 text-red-600 ${
                            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          } transition-colors`}
                          onClick={signOut}
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
      {user && isMobileSearchOpen && (
        <div
          className={`lg:hidden ${themeClasses} border-b shadow-lg px-4 py-4 space-y-4`}
        >
          {/* Job Search */}
          <div className="relative dropdown-container">
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
                name="search"
                value={state.search}
                onChange={handleSearchInputChange}
                placeholder="Search jobs, category, companies..."
                className={`flex-1 bg-transparent outline-none ${
                  isDark ? "placeholder-gray-400" : "placeholder-gray-500"
                }`}
              />
              {state.search && (
                <button onClick={clearSearch} className="p-1">
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
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
                        onClick={() => selectPopularSearch(item)}
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
          <div className="relative dropdown-container">
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
                value={state.location}
                onChange={handleLocationInputChange}
                className={`flex-1 bg-transparent outline-none ${
                  isDark ? "placeholder-gray-400" : "placeholder-gray-500"
                }`}
              />
              {isSearching && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
              )}
            </div>

            {isLocationSearchOpen && suggestions.length > 0 && (
              <div
                className={`absolute top-full left-0 right-0 mt-2 ${themeClasses} border rounded-lg shadow-xl z-50 p-4 max-h-64 overflow-y-auto`}
              >
                <div className="space-y-2">
                  <div className="text-sm font-medium text-blue-600 mb-2">
                    Suggestions
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectLocation(item)}
                        className={`p-3 rounded cursor-pointer transition-colors flex items-center space-x-2 ${
                          isDark
                            ? "hover:bg-gray-700"
                            : "hover:bg-blue-50"
                        }`}
                      >
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate">
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
      )}
    </>
  );
}

export default Header;