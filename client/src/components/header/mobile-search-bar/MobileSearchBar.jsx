import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { Briefcase, MapPin, Search, X } from "lucide-react";

const MobileSearchBar = ({
  isMobileSearchOpen,
  setIsJobSearchOpen,
  isJobSearchOpen,
  setIsLocationSearchOpen,
  state,
  handleSearchInputChange,
  clearSearch,
  staticData,
  selectPopularSearch,
  isLocationSearchOpen,
  handleLocationInputChange,
  isSearching,
  suggestions,
  selectLocation,
}) => {
  const { user } = useSelector((state) => state.user);
  const { isDark, themeClasses, searchBgClasses } = useContext(ThemeContext);

  // console.log('called mobilesearch')
  
  return (
    <>
      {user && isMobileSearchOpen && (
        <div
          className={`lg:hidden ${themeClasses} border-b shadow-lg px-4 py-4 space-y-4 fixed mt-15 w-full`}
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
                          isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
                        }`}
                      >
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{item.place_name}</span>
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
};

export default React.memo(MobileSearchBar);