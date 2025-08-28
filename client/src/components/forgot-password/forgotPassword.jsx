import React, { useState, useContext } from "react";
import { Mail, ArrowLeft, X } from "lucide-react";
import { ThemeContext } from "../../contexts/ThemeContext";
import usePreventScroll from "../../hooks/usePreventScroll";
import { useForgotPassword } from "../../hooks/useHandlePassword";
import { useSelector } from "react-redux";

const ForgotPassword = ({ closeForgotMode, userEmail = null }) => {
  const { isDark } = useContext(ThemeContext);
  const [email, setEmail] = useState(userEmail || "");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [error, setError] = useState("");

  usePreventScroll();

  const { mutate, isPending: isLoading } = useForgotPassword(setIsSubmitted);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    mutate({ credentials: { email } });
  };

  const handleClose = () => {
    closeForgotMode();
  };

  const handleResendEmail = () => {
    setIsSubmitted(false);
  };

  const handleBackClickClose = (e) => {
    if (e.target === e.currentTarget) {
      closeForgotMode();
    }
  };

  if (isSubmitted) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-800/80 bg-opacity-50 backdrop-blur-md"
        onClick={handleBackClickClose}
      >
        <div
          className={`relative max-w-md w-full space-y-8 p-8 rounded-xl shadow-2xl transform transition-all duration-200 scale-100 ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={closeForgotMode}
            className={`absolute top-4 cursor-pointer right-4 p-2 rounded-lg transition-colors ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div
              className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${
                isDark ? "bg-blue-900" : "bg-blue-100"
              }`}
            >
              <Mail
                className={`h-8 w-8 ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <h2
              className={`mt-4 text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Check your email
            </h2>
            <p
              className={`mt-2 text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              We've sent a password reset link to
            </p>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {email}
            </p>
          </div>

          <div className="space-y-4">
            {user?.role !== "admin" && (
              <button
                onClick={handleClose}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-colors ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </button>
            )}

            <div className="text-center">
              <span
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Didn't receive the email?{" "}
                <button
                  onClick={handleResendEmail}
                  className={`font-medium hover:underline ${
                    isDark
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  Click to resend
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4  bg-gray-800/80 bg-opacity-50 backdrop-blur-md"
      onClick={handleBackClickClose}
    >
      <div
        className={`relative max-w-md w-full space-y-8 p-8 rounded-xl shadow-2xl transform transition-all duration-200 scale-100 ${
          isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeForgotMode}
          title="Close"
          className={`absolute cursor-pointer top-4 right-4 p-2 rounded-lg transition-colors ${
            isDark
              ? "text-gray-400 hover:text-white hover:bg-gray-700"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center pt-4">
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {`Reset ${user?.role === "admin" ? `User` : "Your"} Password`}
          </h2>
          <p
            className={`mt-2 text-sm ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {user?.role === "admin"
              ? `Enter the user's email address and we'll send them a link to reset their password.`
              : `Enter your email address and we'll send you a link to reset your
            password.`}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail
                  className={`h-5 w-5 ${
                    isDark ? "text-gray-400" : "text-gray-400"
                  }`}
                />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${error ? "border-red-500" : ""}`}
                placeholder="Enter your email"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full flex cursor-pointer justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading
                  ? isDark
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : isDark
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Sending...
                </div>
              ) : (
                "Send reset link"
              )}
            </button>
          </div>

          <div className="text-center">
            {user?.role !== "admin" && (
              <button
                type="button"
                onClick={handleClose}
                className={`text-sm font-medium hover:underline ${
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                }`}
              >
                ← Back to login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
