import React, { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

const Loading = () => {
  // For demo purposes, you can toggle between light and dark themes
 
  const {isDark} = useContext(ThemeContext)
  
  // Background with blur and overlay
  const backgroundClasses = isDark
    ? "bg-gray-900/80 backdrop-blur-md"
    : "bg-white/80 backdrop-blur-md";
  
  // Text colors with better contrast
  const textClasses = isDark
    ? "text-white"
    : "text-gray-900";
  
  // Spinner colors
  const spinnerClasses = isDark
    ? "border-gray-700 border-t-blue-400"
    : "border-gray-200 border-t-blue-600";
  
  // Subtle text for secondary information
  const subtleTextClasses = isDark
    ? "text-gray-300"
    : "text-gray-600";

  return (
    <div
      className={`fixed inset-0 ${backgroundClasses} flex items-center justify-center z-50 transition-all duration-300`}
    >
      {/* Content container with subtle backdrop */}
      <div className="text-center relative">
        <div className={`absolute inset-0 ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'} rounded-2xl blur-xl scale-150`}></div>
        
        {/* Main content */}
        <div className="relative z-10 px-8 py-6">
          {/* Enhanced spinner with pulsing effect */}
          <div className="relative">
            <div
              className={`w-16 h-16 border-4 ${spinnerClasses} rounded-full animate-spin mx-auto`}
            ></div>
            {/* Pulsing ring behind spinner */}
            <div
              className={`absolute inset-0 w-16 h-16 ${isDark ? 'border-blue-400/20' : 'border-blue-600/20'} border-4 rounded-full animate-pulse mx-auto`}
            ></div>
          </div>
          
          {/* Primary loading text */}
          <h2 className={`mt-6 text-xl font-semibold ${textClasses} tracking-wide`}>
            Loading
          </h2>
          
          {/* Secondary text with animation */}
          <p className={`mt-2 text-sm ${subtleTextClasses} animate-pulse`}>
            Please wait while we prepare your content
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center mt-4 space-x-1">
            <div className={`w-2 h-2 ${isDark ? 'bg-blue-400' : 'bg-blue-600'} rounded-full animate-bounce`}></div>
            <div className={`w-2 h-2 ${isDark ? 'bg-blue-400' : 'bg-blue-600'} rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
            <div className={`w-2 h-2 ${isDark ? 'bg-blue-400' : 'bg-blue-600'} rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;