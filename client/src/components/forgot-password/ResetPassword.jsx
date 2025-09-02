import React, { useState, useContext, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { ThemeContext } from "../../contexts/ThemeContext";
import checkPasswordStrength from "../../utils/checkPasswordStrength";
import { useLocation, useNavigate } from "react-router-dom";
import { useResetPassword } from "../../hooks/useHandlePassword";
import useSignOut from "../../hooks/useSignout";

const ResetPassword = () => {
  const { isDark } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [count, setCount] = useState(5);
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useSignOut();

  const { getPasswordStrength } = checkPasswordStrength();

  const { mutate, isPending: isLoading } = useResetPassword({ setIsSuccess });

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthColor = () => {
    if (passwordStrength.strength <= 2) return "text-red-500";
    if (passwordStrength.strength <= 3) return "text-yellow-500";
    if (passwordStrength.strength <= 4) return "text-blue-500";
    return "text-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength.strength <= 2) return "Weak";
    if (passwordStrength.strength <= 3) return "Fair";
    if (passwordStrength.strength <= 4) return "Good";
    return "Strong";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "password" && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const getToken = () => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    return token;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = getToken();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    mutate({ credentials: formData, token });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isSuccess) {
        setCount((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            signOut();
            clearInterval(timer);
            return 0;
          }
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [count, navigate, isSuccess, signOut]);

  useEffect(() => {
    if (count === 0) navigate("/login");
  }, [count, navigate]);

  if (isSuccess) {
    return (
      <div
        className={`py-15 flex items-center justify-center px-4 ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`max-w-md w-full space-y-8 p-8 rounded-xl shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="text-center">
            <div
              className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${
                isDark ? "bg-green-900" : "bg-green-100"
              }`}
            >
              <CheckCircle
                className={`h-8 w-8 ${
                  isDark ? "text-green-400" : "text-green-600"
                }`}
              />
            </div>
            <h2
              className={`mt-4 text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Password Reset Successfully
            </h2>
            <p
              className={`mt-2 text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Your password has been updated successfully. You can now log in
              with your new password.
            </p>
          </div>

          <button
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-colors ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {`Redirecting in ${count} seconds`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`py-15 flex items-center justify-center px-4 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-md w-full space-y-8 p-8 rounded-xl shadow-lg ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="text-center">
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Set New Password
          </h2>
          <p
            className={`mt-2 text-sm ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Create a strong password for your account
          </p>
        </div>

        <div className="space-y-6">
          {/* New Password Field */}
          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  className={`h-5 w-5 ${
                    isDark ? "text-gray-400" : "text-gray-400"
                  }`}
                />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${errors.password ? "border-red-500" : ""}`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                  isDark
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password}</p>
            )}

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Password strength:
                  </span>
                  <span className={`text-xs font-medium ${getStrengthColor()}`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      passwordStrength.strength <= 2
                        ? "bg-red-500"
                        : passwordStrength.strength <= 3
                        ? "bg-yellow-500"
                        : passwordStrength.strength <= 4
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`flex items-center ${
                      passwordStrength.checks.length
                        ? "text-green-500"
                        : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-1 h-1 rounded-full mr-2 ${
                        passwordStrength.checks.length
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    8+ characters
                  </div>
                  <div
                    className={`flex items-center ${
                      passwordStrength.checks.uppercase
                        ? "text-green-500"
                        : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-1 h-1 rounded-full mr-2 ${
                        passwordStrength.checks.uppercase
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    Uppercase
                  </div>
                  <div
                    className={`flex items-center ${
                      passwordStrength.checks.lowercase
                        ? "text-green-500"
                        : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-1 h-1 rounded-full mr-2 ${
                        passwordStrength.checks.lowercase
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    Lowercase
                  </div>
                  <div
                    className={`flex items-center ${
                      passwordStrength.checks.number
                        ? "text-green-500"
                        : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-1 h-1 rounded-full mr-2 ${
                        passwordStrength.checks.number
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    Number
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  className={`h-5 w-5 ${
                    isDark ? "text-gray-400" : "text-gray-400"
                  }`}
                />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${errors.confirmPassword ? "border-red-500" : ""}`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                  isDark
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-2 flex items-center text-xs">
                {formData.password === formData.confirmPassword ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passwords match
                  </div>
                ) : (
                  <div
                    className={`flex items-center ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full border-2 border-current mr-1"></div>
                    Passwords don't match
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
                Updating Password...
              </div>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
