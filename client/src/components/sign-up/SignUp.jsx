import React, { useCallback, useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useForm } from "react-hook-form";
import authHandler from "../../utils/authHandler";
import { useMutation } from "@tanstack/react-query";
import { envVariables } from "../../config";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Briefcase,
  Building2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";

const { REQUEST_SIGNUP_URL, VERIFY_OTP, RESEND_OTP } = envVariables;

const Signup = () => {
  const { isDark, authThemeClass, authCardClasses, authInputClasses } =
    useContext(ThemeContext);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState(null);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [userEmail, setUserEmail] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "job_seeker",
    },
  });

  const useSignup = (url, type) => {
    return useMutation({
      mutationFn: (credentials) => authHandler({ type, url, credentials }),
      onSuccess: (data) => {
        if (type === "request_signup") {
          setIsOtpMode(true);
          setUserEmail(data?.data?.user?.email);
        }

        if (type === "signup") {
          dispatch(setUser(data?.data?.user));
          navigate("/");
        }

        if (type === "resend_otp") {
          setSeconds(60);
          setIsResendDisabled(true);
        }
      },
      onError: (error) => {
        console.log(error);
        setErr(error.response.data.message || "Error occour! Please try again");
        setTimeout(() => {
          setErr("");
        }, 4000);
      },
    });
  };

  const signupMutation = {
    requestSignupOtp: useSignup(REQUEST_SIGNUP_URL, "request_signup"),
    verifyOtp: useSignup(VERIFY_OTP, "signup"),
    resendOtp: useSignup(RESEND_OTP, "resend_otp"),
  };

  const { mutate: signupOtpMutation, isPending: signupOtpPending } =
    signupMutation.requestSignupOtp;

  const { mutate: verifySignupMutation, isPending: signupPending } =
    signupMutation.verifyOtp;

  const { mutate: resendOtpMutate, isPending: isResendOtpPending } =
    signupMutation.resendOtp;

  const handleSignup = (formData) => {
    console.log(formData);
    signupOtpMutation({
      name: formData?.name,
      email: formData?.email,
      role: formData?.role,
      password: formData?.password,
    });
  };

  useEffect(() => {
    if (seconds === 0) {
      return setIsResendDisabled(false);
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const handleVerifyOtp = () => {
    verifySignupMutation({
      mode: "signup",
      otp: otpCode.join("").toString(),
    });
  };

  const handleOtpChange = useCallback(
    (index, value) => {
      if (value.length <= 1) {
        const newOtp = [...otpCode];
        newOtp[index] = value;
        setOtpCode(newOtp);

        // Auto focus next input
        if (value && index < 5) {
          const nextInput = document.querySelector(
            `input[name="otp-${index + 1}"]`
          );
          if (nextInput) nextInput.focus();
        }
      }
    },
    [otpCode]
  );

  const handleOtpKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !otpCode[index] && index > 0) {
        const prevInput = document.querySelector(
          `input[name="otp-${index - 1}"]`
        );
        if (prevInput) prevInput.focus();
      }
    },
    [otpCode]
  );

  const handleResendOtp = () => {
    setOtpCode(["", "", "", "", "", ""]);
    resendOtpMutate({ mode: "signup" });
  };

  const roleButtonClasses = (isSelected) => {
    const baseClasses =
      "flex-1 p-4 rounded-lg border-2 transition-all duration-200 text-center cursor-pointer";
    if (isSelected) {
      return `${baseClasses} ${
        isDark ? "bg-blue-900/30" : "border-blue-500 bg-blue-50"
      }   `;
    }
    return `${baseClasses} ${
      isDark
        ? "border-gray-600 hover:border-gray-500"
        : "border-gray-300  hover:border-gray-400"
    }  `;
  };

  return (
    <div
      className={`min-h-screen ${authThemeClass} transition-colors duration-300`}
    >
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden m-15 rounded-3xl">
          <div className="relative z-10 flex flex-col mx-auto justify-center items-center text-white p-12">
            <div className=" bg-opacity-20 backdrop-blur-sm p-4 rounded-2xl mb-8">
              <Briefcase className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6 text-center">WorkHive</h1>
            <p className="text-xl text-center text-blue-100 max-w-md leading-relaxed">
              Your gateway to endless career opportunities. Connect with top
              employers and find your dream job today.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-blue-200">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl font-bold">25K+</div>
                <div className="text-blue-200">Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold">100K+</div>
                <div className="text-blue-200">Job Seekers</div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white opacity-5 rounded-full"></div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  WorkHive
                </h1>
              </div>
            </div>

            <div
              className={`${authCardClasses} rounded-2xl shadow-xl border p-8 transition-all duration-300`}
            >
              {!isOtpMode ? (
                /* Signup Form */
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                      Create Your Account
                    </h2>
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Join WorkHive and unlock your career potential
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleSignup)}
                    className="space-y-6"
                  >
                    {/* Name Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("name", {
                            required: "Name is required",
                          })}
                          type="text"
                          name="name"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${authInputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name ? (
                        <p className="text-red-600">{errors.name.message}</p>
                      ) : null}
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("email", {
                            required: "Email is required",
                          })}
                          type="email"
                          name="email"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${authInputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                          placeholder="Enter your email"
                        />
                      </div>
                      {errors.email ? (
                        <p className="text-red-600">{errors.email.message}</p>
                      ) : null}
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("password", {
                            required: "Password is required",
                          })}
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className={`w-full pl-10 pr-12 py-3 rounded-lg border ${authInputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.password ? (
                        <p className="text-red-600">
                          {errors.password.message}
                        </p>
                      ) : null}
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        I am a
                      </label>

                      <div className="flex space-x-4">
                        {/* Job Seeker */}
                        <label
                          // htmlFor="jobseeker"
                          className={roleButtonClasses(
                            watch("role") === "job_seeker"
                          )}
                        >
                          <input
                            {...register("role", { required: true })}
                            type="radio"
                            id="jobseeker"
                            value="job_seeker"
                            className="hidden"
                          />
                          <User className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                          <div className="font-medium">Job Seeker</div>
                        </label>

                        {/* Employer */}
                        <label
                          htmlFor="employer"
                          className={roleButtonClasses(
                            watch("role") === "employer"
                          )}
                        >
                          <input
                            {...register("role", { required: true })}
                            type="radio"
                            id="employer"
                            value="employer"
                            className="hidden"
                          />
                          <Building2 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                          <div className="font-medium">Employer</div>
                        </label>
                      </div>
                    </div>

                    {/* Signup Button */}
                    <button
                      type="submit"
                      // onClick={handleSignup}
                      disabled={signupOtpPending}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      {signupOtpPending ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    {err ? <p className="text-red-600">{err}</p> : null}
                  </form>
                </>
              ) : (
                /* OTP Verification Form */
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                      Verify Your Email
                    </h2>
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      We've sent a 6-digit verification code to
                    </p>
                    <p className="text-blue-600 font-medium">{userEmail}</p>
                  </div>

                  <div className="space-y-6">
                    {/* OTP Input */}
                    <div>
                      <label className="block text-sm font-medium mb-3 text-center">
                        Enter Verification Code
                      </label>
                      <div className="flex justify-center space-x-2">
                        {otpCode.map((digit, index) => (
                          <input
                            key={index}
                            type="number"
                            name={`otp-${index}`}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className={`w-9 h-9  md:w-12 md:h-12 text-center text-lg font-bold rounded-lg border ${authInputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            maxLength="1"
                            inputMode="numeric"
                          />
                        ))}
                      </div>
                    </div>

                    {err ? <p className="text-red-600">{err}</p> : null}

                    {/* Verify Button */}
                    <button
                      onClick={handleVerifyOtp}
                      disabled={
                        signupPending || otpCode.some((digit) => !digit)
                      }
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      {signupPending ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <>
                          <span>Verify & Continue</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    {/* Resend OTP */}
                    <div className="text-center">
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        } mb-2`}
                      >
                        {!isResendDisabled
                          ? `Didn't receive the code?`
                          : `Resend otp after ${seconds} seconds`}
                        {!isResendDisabled ? (
                          isResendOtpPending ? (
                            <button
                              className={`mx-2 animate-spin w-4 h-4 border-3 ${
                                isDark ? "border-gray-200" : "border-blue-600"
                              } border-t-transparent rounded-full`}
                            ></button>
                          ) : (
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800 font-medium mx-1.5 cursor-pointer"
                              onClick={handleResendOtp}
                            >
                              Resend OTP
                            </button>
                          )
                        ) : null}
                      </p>
                    </div>

                    {/* Back to Signup */}
                    <div className="text-center">
                      <button
                        onClick={() => setIsOtpMode(false)}
                        className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Signup</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div
                  className={`flex-1 h-px ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <span
                  className={`px-4 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  or
                </span>
                <div
                  className={`flex-1 h-px ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Already have an account?{" "}
                  <a
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                By creating an account, you agree to our{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
