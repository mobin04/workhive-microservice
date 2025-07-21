import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

const ErrorComponent = ({ 
  isDark = false, 
  title = "Something went wrong", 
  message = "We encountered an error while processing your request. Please try again.",
  showRetry = true,
  showGoHome = true,
  showGoBack = false,
  onRetry,
  onGoHome,
  onGoBack,
  type = "general" // "general", "404", "network", "auth"
}) => {

  const getErrorContent = () => {
    switch (type) {
      case "404":
        return {
          title: "Page Not Found",
          message: "The page you're looking for doesn't exist or has been moved."
        };
      case "network":
        return {
          title: "Connection Error",
          message: "Unable to connect to the server. Please check your internet connection."
        };
      case "auth":
        return {
          title: "Access Denied",
          message: "You don't have permission to access this resource."
        };
      default:
        return { title, message };
    }
  };

  const errorContent = getErrorContent();

  const themeClasses = {
    container: isDark 
      ? 'bg-gray-900 text-white' 
      : 'bg-white text-gray-900',
    card: isDark 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-gray-50 border-gray-200',
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-gray-300' : 'text-gray-600',
      muted: isDark ? 'text-gray-400' : 'text-gray-500'
    },
    button: {
      primary: isDark 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: isDark 
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
    },
    icon: isDark ? 'text-orange-400' : 'text-orange-500'
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`flex items-center justify-center p-4 ${themeClasses.container}`}>
      <div className={`max-w-md w-full text-center p-8 rounded-lg border ${themeClasses.card}`}>
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-3 rounded-full ${isDark ? 'bg-orange-900/20' : 'bg-orange-100'}`}>
            <AlertTriangle className={`w-8 h-8 ${themeClasses.icon}`} />
          </div>
        </div>

        {/* Error Title */}
        <h1 className={`text-2xl font-bold mb-3 ${themeClasses.text.primary}`}>
          {errorContent.title}
        </h1>

        {/* Error Message */}
        <p className={`text-base mb-8 leading-relaxed ${themeClasses.text.secondary}`}>
          {errorContent.message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {showRetry && (
            <button 
              onClick={handleRetry}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${themeClasses.button.primary}`}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          
          <div className="flex gap-3">
            {showGoBack && (
              <button 
                onClick={handleGoBack}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold border transition-colors ${themeClasses.button.secondary}`}
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            )}
            
            {showGoHome && (
              <button 
                onClick={handleGoHome}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold border transition-colors ${themeClasses.button.secondary}`}
              >
                <Home className="w-4 h-4" />
                {showGoBack ? 'Home' : 'Go Home'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;