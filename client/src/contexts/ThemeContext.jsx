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
          : "bg-gray-100 hover:bg-gray-50 text-gray-700 border-gray-300",
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

  const errorColorSchemes = useMemo(
    () => ({
      purple: {
        gradient: isDark
          ? "from-purple-500/20 via-purple-600/10 to-transparent"
          : "from-purple-50 via-purple-100/50 to-transparent",
        iconBg: isDark ? "bg-purple-500/20" : "bg-purple-100",
        icon: "text-purple-400",
        accent: "text-purple-400",
        button: isDark
          ? "bg-purple-600 hover:bg-purple-700 text-white"
          : "bg-purple-600 hover:bg-purple-700 text-white",
      },
      red: {
        gradient: isDark
          ? "from-red-500/20 via-red-600/10 to-transparent"
          : "from-red-50 via-red-100/50 to-transparent",
        iconBg: isDark ? "bg-red-500/20" : "bg-red-100",
        icon: "text-red-400",
        accent: "text-red-400",
        button: isDark
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-red-600 hover:bg-red-700 text-white",
      },
      yellow: {
        gradient: isDark
          ? "from-yellow-500/20 via-yellow-600/10 to-transparent"
          : "from-yellow-50 via-yellow-100/50 to-transparent",
        iconBg: isDark ? "bg-yellow-500/20" : "bg-yellow-100",
        icon: "text-yellow-400",
        accent: "text-yellow-400",
        button: isDark
          ? "bg-yellow-600 hover:bg-yellow-700 text-white"
          : "bg-yellow-600 hover:bg-yellow-700 text-white",
      },
      blue: {
        gradient: isDark
          ? "from-blue-700/30 via-blue-600/10 to-transparent"
          : "from-blue-50 via-blue-100/50 to-transparent",
        iconBg: isDark ? "bg-blue-500/20" : "bg-blue-100",
        icon: "text-blue-400",
        accent: "text-blue-400",
        button: isDark
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white",
      },
      orange: {
        gradient: isDark
          ? "from-orange-500/20 via-orange-600/10 to-transparent"
          : "from-orange-50 via-orange-100/50 to-transparent",
        iconBg: isDark ? "bg-orange-500/20" : "bg-orange-100",
        icon: "text-orange-400",
        accent: "text-orange-400",
        button: isDark
          ? "bg-orange-600 hover:bg-orange-700 text-white"
          : "bg-orange-600 hover:bg-orange-700 text-white",
      },
    }),
    [isDark]
  );

  const errorThemeClass = useMemo(
    () => ({
      container: isDark
        ? "bg-gray-900/20 text-white"
        : "bg-gray-500/10 text-gray-900",
      card: isDark
        ? "bg-gray-800/70 border-gray-700/50 backdrop-blur-lg"
        : "bg-white/80 border-gray-200 backdrop-blur-sm",
      text: {
        primary: isDark ? "text-white" : "text-gray-900",
        secondary: isDark ? "text-gray-300" : "text-gray-600",
        muted: isDark ? "text-gray-400" : "text-gray-500",
      },
      button: {
        secondary: isDark
          ? "bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 border-gray-600/50"
          : "bg-white/80 hover:bg-gray-50/80 text-gray-700 border-gray-300",
      },
    }),
    [isDark]
  );

  const saveJobThemes = useMemo(
    () => ({
      themeClasses: isDark
        ? "bg-gray-900 text-white"
        : "bg-gray-50 text-gray-900",

      cardClasses: isDark
        ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
        : "bg-white border-gray-200 hover:bg-gray-50",

      inputClasses: isDark
        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
      activeStatusClasses: isDark
        ? "bg-green-900 text-green-200 border-green-700"
        : "bg-green-100 text-green-800 border-green-300",
      closeStatusClasses: isDark
        ? "bg-red-900 text-red-200 border-red-700"
        : "bg-red-100 text-red-800 border-red-300",
    }),
    [isDark]
  );

  const applicationThemeClasses = useMemo(
    () => ({
      themeClasses: isDark
        ? "bg-gray-900 text-white"
        : "bg-gray-50 text-gray-900",
      cardClasses: isDark
        ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
        : "bg-white border-gray-200 hover:shadow-lg",
      inputClasses: isDark
        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
    }),
    [isDark]
  );

  const getApplicationStatusClr = useCallback(
    (status) => {
      const colors = {
        pending: isDark
          ? "bg-yellow-900 text-yellow-300 border-yellow-700"
          : "bg-yellow-100 text-yellow-700 border-yellow-300",
        withdrawn: isDark
          ? "bg-red-900 text-red-300 border-red-700"
          : "bg-red-100 text-red-700 border-red-300",
        accepted: isDark
          ? "bg-green-900 text-green-300 border-green-700"
          : "bg-green-100 text-green-700 border-green-200",
        rejected: isDark
          ? "bg-red-900 text-red-300 border-red-700"
          : "bg-red-100 text-red-700 border-red-200",
      };
      return colors[status] || colors.pending;
    },
    [isDark]
  );

  const profileThemeClasses = useMemo(
    () => ({
      cardClasses: isDark
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200",
      inputClasses: isDark
        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500",
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
      errorColorSchemes,
      errorThemeClass,
      saveJobThemes,
      applicationThemeClasses,
      getApplicationStatusClr,
      profileThemeClasses,
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
      errorColorSchemes,
      errorThemeClass,
      saveJobThemes,
      applicationThemeClasses,
      getApplicationStatusClr,
      profileThemeClasses,
    ]
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
