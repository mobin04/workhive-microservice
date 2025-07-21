import { createContext, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleChangeTheme } from "../store/slices/themeSlice";

export const ThemeContext = createContext(null);

export function ThemeContextProvider({ children }) {
  const dispatch = useDispatch();

  const { isDark } = useSelector((state) => state.theme);

  const setDark = useCallback(() => {
    dispatch(handleChangeTheme());
  }, [dispatch]);

  const themeClasses = useMemo(() => {
    return isDark
      ? "bg-gray-900 text-white border-gray-700"
      : "bg-white text-gray-900 border-gray-200";
  }, [isDark]);

  const authThemeClass = useMemo(() => {
    return isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  }, [isDark]);

  const authCardClasses = useMemo(() => {
    return isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  }, [isDark]);

  const authInputClasses = useMemo(() => {
    return isDark
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500";
  }, [isDark]);

  const bodyThemeClasses = isDark ? "bg-gray-800" : "bg-gray-50";

  const searchBgClasses = useMemo(() => {
    return isDark
      ? "bg-gray-800 border-gray-600"
      : "bg-gray-50 border-gray-300";
  }, [isDark]);

  const dynamicFontColor = isDark ? "text-gray-300" : "text-gray-500";

  // Job Viewer
  const getJobTypeColor = useCallback(
    (type) => {
      switch (type) {
        case "full_time":
          return isDark
            ? "bg-blue-900 text-blue-200 border-blue-700"
            : "bg-blue-100 text-blue-800 border-blue-300";
        case "part_time":
          return isDark
            ? "bg-purple-900 text-purple-200 border-purple-700"
            : "bg-purple-100 text-purple-800 border-purple-300";
        case "contract":
          return isDark
            ? "bg-orange-900 text-orange-200 border-orange-700"
            : "bg-orange-100 text-orange-800 border-orange-300";
        case "internship":
          return isDark
            ? "bg-green-900 text-green-200 border-green-700"
            : "bg-green-100 text-green-800 border-green-300";
        default:
          return isDark
            ? "bg-gray-700 text-gray-200 border-gray-600"
            : "bg-gray-100 text-gray-800 border-gray-300";
      }
    },
    [isDark]
  );

  const getJobLevelColor = useCallback(
    (level) => {
      switch (level) {
        case "entry_level":
          return isDark
            ? "bg-emerald-900 text-emerald-200 border-emerald-700"
            : "bg-emerald-100 text-emerald-800 border-emerald-300";
        case "mid_level":
          return isDark
            ? "bg-blue-900 text-blue-200 border-blue-700"
            : "bg-blue-100 text-blue-800 border-blue-300";
        case "senior_level":
          return isDark
            ? "bg-indigo-900 text-indigo-200 border-indigo-700"
            : "bg-indigo-100 text-indigo-800 border-indigo-300";
        default:
          return isDark
            ? "bg-gray-700 text-gray-200 border-gray-600"
            : "bg-gray-100 text-gray-800 border-gray-300";
      }
    },
    [isDark]
  );

  const jobViewerThemeClass = useMemo(
    () => ({
      container: isDark
        ? "bg-gray-900 border-gray-700"
        : "bg-white border-gray-200",
      text: {
        primary: isDark ? "text-white" : "text-gray-900",
        secondary: isDark ? "text-gray-300" : "text-gray-600",
        muted: isDark ? "text-gray-400" : "text-gray-500",
      },
      card: isDark
        ? "bg-gray-800 border-gray-700"
        : "bg-gray-50 border-gray-200",
      button: {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: isDark
          ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
          : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
      },
    }),
    [isDark]
  );

  const getStatusColor = useCallback(
    (status) => {
      switch (status) {
        case "open":
          return isDark ? "text-green-400" : "text-green-600";
        case "closed":
          return isDark ? "text-red-400" : "text-red-600";
        case "paused":
          return isDark ? "text-yellow-400" : "text-yellow-600";
        default:
          return isDark ? "text-gray-400" : "text-gray-600";
      }
    },
    [isDark]
  );

  const applyJobThemeClass = useMemo(
    () => ({
      container: isDark
        ? "bg-gray-900 border-gray-700 shadow-gray-800"
        : "bg-white border-gray-200",
      text: {
        primary: isDark ? "text-white" : "text-gray-900",
        secondary: isDark ? "text-gray-300" : "text-gray-600",
        muted: isDark ? "text-gray-400" : "text-gray-500",
      },
      card: isDark
        ? "bg-gray-800 border-gray-700"
        : "bg-gray-50 border-gray-200",
      input: isDark
        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
      button: {
        primary:
          "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400",
        secondary: isDark
          ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
          : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
        danger: "bg-red-600 hover:bg-red-700 text-white",
      },
      uploadArea: isDark
        ? "border-gray-600 bg-gray-800 hover:bg-gray-750"
        : "border-gray-300 bg-gray-50 hover:bg-gray-100",
      mainContainerBg: isDark ? "bg-gray-900" : "bg-gray-100",
      xBg: isDark ? "hover:bg-red-900 " : " hover:bg-red-100",
      uploadIconBg: isDark
        ? "bg-blue-900 text-blue-600"
        : "bg-blue-100 dark:text-blue-400",
    }),
    [isDark]
  );

  const themeContextValue = useMemo(
    () => ({
      isDark,
      setDark,
      themeClasses,
      bodyThemeClasses,
      searchBgClasses,
      dynamicFontColor,
      authThemeClass,
      authCardClasses,
      authInputClasses,
      getJobTypeColor,
      getJobLevelColor,
      jobViewerThemeClass,
      getStatusColor,
      applyJobThemeClass,
    }),
    [
      isDark,
      setDark,
      themeClasses,
      bodyThemeClasses,
      searchBgClasses,
      dynamicFontColor,
      authThemeClass,
      authCardClasses,
      authInputClasses,
      getJobTypeColor,
      getJobLevelColor,
      jobViewerThemeClass,
      getStatusColor,
      applyJobThemeClass,
    ]
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
}