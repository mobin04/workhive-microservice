import React, { useState, useCallback, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";
import { X, Filter } from "lucide-react";
import { ThemeContext } from "../../../contexts/ThemeContext";

const SalaryRangeSlider = ({
  minSalary,
  maxSalary,
  onSalaryChange,
  isDark,
}) => {
  const [activeThumb, setActiveThumb] = useState(null);

  const MIN_SALARY = 0;
  const MAX_SALARY = 300000;

  const formatSalary = useCallback((salary) => {
    if (salary >= 100000) {
      return `₹${(salary / 100000).toFixed(1)}L`;
    }
    if (salary >= 1000) {
      return `₹${(salary / 1000).toFixed(0)}K`;
    }
    return `₹${salary}`;
  }, []);

  const getSliderBackground = useMemo(() => {
    const minPercent =
      ((minSalary - MIN_SALARY) / (MAX_SALARY - MIN_SALARY)) * 100;
    const maxPercent =
      ((maxSalary - MIN_SALARY) / (MAX_SALARY - MIN_SALARY)) * 100;

    const trackColor = isDark ? "#848884" : "#e5e7eb";
    const activeColor = "#3b82f6";
    const inactiveColor = isDark ? "#848884" : "#e5e7eb";

    return `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${minPercent}%, ${activeColor} ${minPercent}%, ${activeColor} ${maxPercent}%, ${inactiveColor} ${maxPercent}%, ${inactiveColor} 100%)`;
  }, [minSalary, maxSalary, isDark, MIN_SALARY, MAX_SALARY]);

  const handleMinChange = useCallback(
    (e) => {
      const value = Math.max(
        MIN_SALARY,
        Math.min(parseInt(e.target.value), maxSalary - 1000)
      );
      if (value !== minSalary) {
        onSalaryChange(value, maxSalary);
      }
    },
    [minSalary, maxSalary, onSalaryChange, MIN_SALARY]
  );

  const handleMaxChange = useCallback(
    (e) => {
      const value = Math.min(
        MAX_SALARY,
        Math.max(parseInt(e.target.value), minSalary + 1000)
      );
      if (value !== maxSalary) {
        onSalaryChange(minSalary, value);
      }
    },
    [minSalary, maxSalary, onSalaryChange, MAX_SALARY]
  );

  const quickSelectionButtons = useMemo(
    () => [
      { label: "0-50K", min: 0, max: 50000 },
      { label: "50K-1L", min: 50000, max: 100000 },
      { label: "1L-3L", min: 100000, max: 200000 },
      { label: "3L+", min: 300000, max: MAX_SALARY },
    ],
    [MAX_SALARY]
  );

  const handleQuickSelect = useCallback(
    (min, max) => {
      onSalaryChange(min, max);
    },
    [onSalaryChange]
  );

  // Calculate z-index based on thumb proximity to avoid overlap issues
  const getZIndex = useCallback(
    (thumbType) => {
      if (activeThumb === thumbType) return 5;

      // If thumbs are close, prioritize the one that's more towards its natural position
      const minPercent =
        ((minSalary - MIN_SALARY) / (MAX_SALARY - MIN_SALARY)) * 100;
      const maxPercent =
        ((maxSalary - MIN_SALARY) / (MAX_SALARY - MIN_SALARY)) * 100;

      if (Math.abs(maxPercent - minPercent) < 5) {
        return thumbType === "min" ? 3 : 4;
      }

      return thumbType === "min" ? 2 : 3;
    },
    [activeThumb, minSalary, maxSalary, MIN_SALARY, MAX_SALARY]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span
          className={`text-sm font-medium ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Salary Range (Monthly)
        </span>
        <div className="flex items-center space-x-2 text-sm">
          <span
            className={`px-2 py-1 rounded-md transition-colors ${
              isDark ? "bg-gray-700 text-blue-400" : "bg-blue-50 text-blue-600"
            }`}
          >
            {formatSalary(minSalary)}
          </span>
          <span className={isDark ? "text-gray-400" : "text-gray-500"}>-</span>
          <span
            className={`px-2 py-1 rounded-md transition-colors ${
              isDark ? "bg-gray-700 text-blue-400" : "bg-blue-50 text-blue-600"
            }`}
          >
            {formatSalary(maxSalary)}
          </span>
        </div>
      </div>

      <div className="relative mb-4 h-6">
        {/* Track */}
        <div
          className="absolute top-2 h-1 w-full rounded-full"
          style={{ background: getSliderBackground }}
          aria-hidden="true"
        />

        {/* Min Range Input */}
        <input
          type="range"
          min={MIN_SALARY}
          max={MAX_SALARY}
          step="1000"
          value={minSalary}
          onChange={handleMinChange}
          onMouseDown={() => setActiveThumb("min")}
          onMouseUp={() => setActiveThumb('max')}
          className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent cursor-pointer slider-thumb"
          style={{
            zIndex: getZIndex("min"),
            pointerEvents: "auto",
          }}
          aria-label={`Minimum salary: ${formatSalary(minSalary)}`}
        />

        {/* Max Range Input */}
        <input
          type="range"
          min={MIN_SALARY}
          max={MAX_SALARY}
          step="1000"
          value={maxSalary}
          onChange={handleMaxChange}
          onMouseDown={() => setActiveThumb("max")}
          onMouseUp={() => setActiveThumb('min')}
          className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent cursor-pointer slider-thumb"
          style={{
            zIndex: getZIndex("max"),
            pointerEvents: "auto",
          }}
          aria-label={`Maximum salary: ${formatSalary(maxSalary)}`}
        />
      </div>

      {/* Quick Selection Buttons */}
      <div className="flex flex-wrap gap-2 mt-3">
        {quickSelectionButtons.map(({ label, min, max }) => {
          const isActive = minSalary === min && maxSalary === max;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleQuickSelect(min, max)}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const JobFilterComponent = ({
  staticData,
  isDark,
  onApplyFilter,
  initialFilters = {
    category: "All",
    jobtype: "All",
    joblevel: "All",
    minSalary: 0,
    maxSalary: 200000,
  },
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: initialFilters,
  });

  const watchedMinSalary = watch("minSalary");
  const watchedMaxSalary = watch("maxSalary");

  const themeClasses = useMemo(
    () =>
      isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
    [isDark]
  );

  const searchBgClasses = useMemo(
    () => (isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"),
    [isDark]
  );

  const handleSalaryChange = useCallback(
    (min, max) => {
      setValue("minSalary", min, { shouldValidate: true });
      setValue("maxSalary", max, { shouldValidate: true });
    },
    [setValue]
  );

  const applyFilter = useCallback(
    (data) => {
      onApplyFilter(data);
      setIsFilterOpen(false);
    },
    [onApplyFilter]
  );

  const resetFilters = useCallback(() => {
    reset(initialFilters);
  }, [reset, initialFilters]);

  const toggleFilter = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  if (!isFilterOpen) {
    return (
      <button
        onClick={toggleFilter}
        className={`flex gap-2 items-center w-fit p-3 px-5 my-2 rounded-full cursor-pointer mb-3 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isDark
            ? "text-white bg-gray-500/30 hover:bg-gray-500/50"
            : "text-white bg-blue-500 hover:bg-blue-600"
        }`}
        aria-label="Open job filters"
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filter Jobs</span>
      </button>
    );
  }

  return (
    <div className={`${themeClasses} p-4 rounded-xl mb-4 shadow-lg border`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="text-blue-600 w-5 h-5" />
          <h3
            className={`font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Filter Jobs
          </h3>
        </div>
        <button
          onClick={toggleFilter}
          className="w-5 h-5 text-red-600 hover:scale-110 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
          aria-label="Close filters"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(applyFilter)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            {...register("category")}
            className={`p-3 rounded-lg border ${searchBgClasses} ${
              isDark ? "text-white" : "text-gray-900"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          >
            <option value="All">All Categories</option>
            {staticData.categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            {...register("jobtype")}
            className={`p-3 rounded-lg border ${searchBgClasses} ${
              isDark ? "text-white" : "text-gray-900"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          >
            <option value="All">All Job Types</option>
            {staticData.jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            {...register("joblevel")}
            className={`p-3 rounded-lg border ${searchBgClasses} ${
              isDark ? "text-white" : "text-gray-900"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          >
            <option value="All">All Levels</option>
            {staticData.jobLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Salary Range Filter */}
        <div className={`p-4 rounded-lg border ${searchBgClasses}`}>
          <SalaryRangeSlider
            minSalary={watchedMinSalary}
            maxSalary={watchedMaxSalary}
            onSalaryChange={handleSalaryChange}
            isDark={isDark}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center space-x-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Filter className="h-4 w-4" />
            <span>Apply Filters</span>
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className={`px-6 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark
                ? "border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500"
                : "border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
            }`}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

// Demo Component
const Filtering = ({ applyFilter }) => {
  const { isDark } = useContext(ThemeContext);

  const staticData = useMemo(
    () => ({
      categories: [
        { name: "Technology" },
        { name: "Marketing" },
        { name: "Sales" },
        { name: "Design" },
        { name: "Finance" },
      ],
      jobTypes: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
      jobLevels: [
        "Entry Level",
        "Mid Level",
        "Senior Level",
        "Director",
        "VP or above",
      ],
    }),
    []
  );

  const handleApplyFilter = useCallback(
    (filterData) => {
      applyFilter(filterData);
    },
    [applyFilter]
  );

  return (
    <JobFilterComponent
      staticData={staticData}
      isDark={isDark}
      onApplyFilter={handleApplyFilter}
    />
  );
};

export default Filtering;