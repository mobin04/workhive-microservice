import React, { useContext } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Wifi, Lock, Server, Zap } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

const ErrorComponent = ({ 
  title,
  message,
  showRetry = true,
  showGoHome = true,
  showGoBack = false,
  onRetry,
  onGoHome,
  onGoBack,
  type = "general" // "general", "404", "500", "403", "network"
}) => {
  
  const { isDark } = useContext(ThemeContext);

  const getErrorContent = () => {
    switch (type) {
      case "404":
        return {
          title: title || "Page Not Found",
          message: message || "The page you're looking for seems to have vanished into the digital void.",
          icon: Zap,
          color: "purple",
          code: "404"
        };
      case "500":
        return {
          title: title || "Server Error",
          message: message || "Our servers are having a moment. We're working on getting things back to normal.",
          icon: Server,
          color: "red",
          code: "500"
        };
      case "403":
        return {
          title: title || "Access Forbidden",
          message: message || "You don't have permission to access this area. Maybe try knocking first?",
          icon: Lock,
          color: "yellow",
          code: "403"
        };
      case "network":
        return {
          title: title || "Connection Lost",
          message: message || "Can't reach the server right now. Check your connection and we'll get you back online.",
          icon: Wifi,
          color: "blue",
          code: "NET"
        };
      default:
        return { 
          title: title || "Something Went Wrong",
          message: message || "We hit a snag while processing your request. Let's try that again.",
          icon: AlertTriangle,
          color: "orange",
          code: "ERR"
        };
    }
  };

  const errorContent = getErrorContent();
  const IconComponent = errorContent.icon;

  const colorSchemes = {
    purple: {
      gradient: isDark 
        ? 'from-purple-500/20 via-purple-600/10 to-transparent' 
        : 'from-purple-50 via-purple-100/50 to-transparent',
      iconBg: isDark ? 'bg-purple-500/20' : 'bg-purple-100',
      icon: 'text-purple-400',
      accent: 'text-purple-400',
      button: isDark 
        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
        : 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    red: {
      gradient: isDark 
        ? 'from-red-500/20 via-red-600/10 to-transparent' 
        : 'from-red-50 via-red-100/50 to-transparent',
      iconBg: isDark ? 'bg-red-500/20' : 'bg-red-100',
      icon: 'text-red-400',
      accent: 'text-red-400',
      button: isDark 
        ? 'bg-red-600 hover:bg-red-700 text-white' 
        : 'bg-red-600 hover:bg-red-700 text-white'
    },
    yellow: {
      gradient: isDark 
        ? 'from-yellow-500/20 via-yellow-600/10 to-transparent' 
        : 'from-yellow-50 via-yellow-100/50 to-transparent',
      iconBg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100',
      icon: 'text-yellow-400',
      accent: 'text-yellow-400',
      button: isDark 
        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    blue: {
      gradient: isDark 
        ? 'from-blue-500/20 via-blue-600/10 to-transparent' 
        : 'from-blue-50 via-blue-100/50 to-transparent',
      iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
      icon: 'text-blue-400',
      accent: 'text-blue-400',
      button: isDark 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    orange: {
      gradient: isDark 
        ? 'from-orange-500/20 via-orange-600/10 to-transparent' 
        : 'from-orange-50 via-orange-100/50 to-transparent',
      iconBg: isDark ? 'bg-orange-500/20' : 'bg-orange-100',
      icon: 'text-orange-400',
      accent: 'text-orange-400',
      button: isDark 
        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
        : 'bg-orange-600 hover:bg-orange-700 text-white'
    }
  };

  const colors = colorSchemes[errorContent.color];

  const themeClasses = {
    container: isDark 
      ? 'bg-gray-900 text-white' 
      : 'bg-gray-50 text-gray-900',
    card: isDark 
      ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
      : 'bg-white/80 border-gray-200 backdrop-blur-sm',
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-gray-300' : 'text-gray-600',
      muted: isDark ? 'text-gray-400' : 'text-gray-500'
    },
    button: {
      secondary: isDark 
        ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 border-gray-600/50' 
        : 'bg-white/80 hover:bg-gray-50/80 text-gray-700 border-gray-300'
    }
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
    <div className={`flex items-center justify-center p-4 relative overflow-hidden ${themeClasses.container}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-radial ${colors.gradient}`}></div>
      
      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-2 h-2 ${colors.iconBg} rounded-full opacity-60`}></div>
        <div className={`absolute top-40 right-32 w-1 h-1 ${colors.iconBg} rounded-full opacity-40`}></div>
        <div className={`absolute bottom-32 left-40 w-1.5 h-1.5 ${colors.iconBg} rounded-full opacity-50`}></div>
        <div className={`absolute bottom-20 right-20 w-1 h-1 ${colors.iconBg} rounded-full opacity-30`}></div>
      </div>

      <div className={`max-w-lg w-full text-center relative z-10`}>
        {/* Error code badge */}
        <div className="flex justify-center mb-6">
          <div className={`px-4 py-2 rounded-full ${colors.iconBg} ${colors.accent} font-mono text-sm font-bold tracking-wider`}>
            {errorContent.code}
          </div>
        </div>

        {/* Main error card */}
        <div className={`p-8 rounded-2xl border shadow-2xl ${themeClasses.card}`}>
          {/* Error Icon */}
          <div className="flex justify-center mb-8">
            <div className={`p-6 rounded-2xl ${colors.iconBg} shadow-lg`}>
              <IconComponent className={`w-12 h-12 ${colors.icon}`} />
            </div>
          </div>

          {/* Error Title */}
          <h1 className={`text-3xl font-bold mb-4 ${themeClasses.text.primary}`}>
            {errorContent.title}
          </h1>

          {/* Error Message */}
          <p className={`text-lg mb-8 leading-relaxed ${themeClasses.text.secondary} max-w-md mx-auto`}>
            {errorContent.message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            {showRetry && (
              <button 
                onClick={handleRetry}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${colors.button}`}
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            )}
            
            <div className="flex gap-4">
              {showGoBack && (
                <button 
                  onClick={handleGoBack}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border transition-all duration-200 hover:scale-105 shadow-md ${themeClasses.button.secondary}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              
              {showGoHome && (
                <button 
                  onClick={handleGoHome}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border transition-all duration-200 hover:scale-105 shadow-md ${themeClasses.button.secondary}`}
                >
                  <Home className="w-4 h-4" />
                  {showGoBack ? 'Home' : 'Go Home'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className={`mt-6 text-sm ${themeClasses.text.muted}`}>
          Need help? Contact our support team
        </p>
      </div>
    </div>
  );
};

export default ErrorComponent;