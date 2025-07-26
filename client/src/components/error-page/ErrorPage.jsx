import React, { useContext, useEffect } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Wifi,
  Lock,
  Server,
  Zap,
} from "lucide-react";

const ErrorComponent = ({
  title,
  message,
  showRetry = true,
  showGoHome = true,
  showGoBack = false,
  onRetry,
  onGoBack,
  type = "general", // "general", "404", "500", "403", "network"
}) => {
  const { errorColorSchemes, errorThemeClass } = useContext(ThemeContext);
  const navigate = useNavigate();
  const getErrorContent = () => {
    switch (type) {
      case "404":
        return {
          title: title || "Page Not Found",
          message:
            message ||
            "The page you're looking for seems to have vanished into the digital void.",
          icon: Zap,
          color: "purple",
          code: "404",
        };
      case "500":
        return {
          title: title || "Server Error",
          message:
            message ||
            "Our servers are having a moment. We're working on getting things back to normal.",
          icon: Server,
          color: "red",
          code: "500",
        };
      case "403":
        return {
          title: title || "Access Forbidden",
          message:
            message ||
            "You don't have permission to access this area. Maybe try knocking first?",
          icon: Lock,
          color: "yellow",
          code: "403",
        };
      case "network":
        return {
          title: title || "Connection Lost",
          message:
            message ||
            "Can't reach the server right now. Check your connection and we'll get you back online.",
          icon: Wifi,
          color: "blue",
          code: "NET",
        };
      default:
        return {
          title: title || "Something Went Wrong",
          message:
            message ||
            "We hit a snag while processing your request. Let's try that again.",
          icon: AlertTriangle,
          color: "orange",
          code: "ERR",
        };
    }
  };

  const errorContent = getErrorContent();
  const IconComponent = errorContent.icon;

  const colors = errorColorSchemes[errorContent.color];

  

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9998] backdrop-blur-xl flex items-center justify-center p-4  overflow-hidden ${errorThemeClass.container}`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-radial ${colors.gradient}`}
      ></div>

      <div className={`max-w-lg w-full text-center relative z-10`}>
        {/* Error code badge */}
        <div className="flex justify-center mb-6">
          <div
            className={`px-4 py-2 rounded-full ${colors.iconBg} ${colors.accent} font-mono text-sm font-bold tracking-wider`}
          >
            {errorContent.code}
          </div>
        </div>

        {/* Main error card */}
        <div
          className={`p-8 rounded-2xl border shadow-2xl ${errorThemeClass.card}`}
        >
          {/* Error Icon */}
          <div className="flex justify-center mb-8">
            <div className={`p-6 rounded-2xl ${colors.iconBg} shadow-lg`}>
              <IconComponent className={`w-12 h-12 ${colors.icon}`} />
            </div>
          </div>

          {/* Error Title */}
          <h1
            className={`text-3xl font-bold mb-4 ${errorThemeClass.text.primary}`}
          >
            {errorContent.title}
          </h1>

          {/* Error Message */}
          <p
            className={`text-lg mb-8 leading-relaxed ${errorThemeClass.text.secondary} max-w-md mx-auto`}
          >
            {errorContent.message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            {showRetry && (
              <button
                onClick={handleRetry}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-400 transform hover:scale-[0.99] cursor-pointer shadow-lg ${colors.button}`}
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            )}

            <div className="flex gap-4">
              {showGoBack && (
                <button
                  onClick={handleGoBack}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border transition-all duration-400 transform hover:scale-[0.99] cursor-pointer shadow-md ${errorThemeClass.button.secondary}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {showGoHome && (
                <button
                  onClick={handleGoHome}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border transition-all duration-400 transform hover:scale-[0.99] cursor-pointer shadow-md ${errorThemeClass.button.secondary}`}
                >
                  <Home className="w-4 h-4" />
                  {showGoBack ? "Home" : "Go Home"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className={`mt-6 text-sm ${errorThemeClass.text.muted}`}>
          Need help? Contact our support team
        </p>
      </div>
    </div>
  );
};

export default ErrorComponent;
