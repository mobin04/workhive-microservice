import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { envVariables } from "../../config";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Briefcase,
  ArrowRight,
  Send,
  UserLock,
} from "lucide-react";
import { setUser } from "../../store/slices/userSlice";
import authHandler from "../../utils/authHandler";


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark, authThemeClass, authCardClasses, authInputClasses} = useContext(ThemeContext);
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordlessEmail, setPasswordlessEmail] = useState("");
  const [isPasswordlessMode, setIsPasswordlessMode] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const { REQUEST_LOGINOTP_URL, RESEND_OTP, VERIFY_OTP, REQUEST_MAGIC_LINK } =
    envVariables;
  const [seconds, setSeconds] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const useLogin = (url, type) => {
    return useMutation({
      mutationFn: (credentials) => authHandler({ type, url, credentials }),
      onSuccess: (data) => {
        setErr("");
        setSuccessMsg(data.message);
        setTimeout(() => {
          setSuccessMsg("");
        }, 4000);

        if (type === "request_login") {
          setOtpMode(true);
        }
        if (type === "login") {
          dispatch(setUser(data?.data?.user));
          navigate("/");
        }
        if (type === "request_magic_login") {
          setLinkSent(true);
        }
      },
      onError: (error) => {
        setErr(error.response.data.message || "Error occour! Please try again");
        setTimeout(() => {
          setErr("");
        }, 4000);
        if (type === "resend_otp") {
          setIsResendDisabled(false);
        }
      },
    }); 
  };

  const loginMutations = {
    requestLoginOtp: useLogin(REQUEST_LOGINOTP_URL, "request_login"),
    resendOtp: useLogin(RESEND_OTP, "resend_otp"),
    login: useLogin(VERIFY_OTP, "login"),
    requestMagicLogin: useLogin(REQUEST_MAGIC_LINK, "request_magic_login"),
  };

  const { mutate: requestLoginOtpMutate, isPending: isLoginPending } =
    loginMutations.requestLoginOtp;
  const { mutate: resendOtpMutate, isPending: isResendOtpPending } =
    loginMutations.resendOtp;
  const { mutate: loginMutate, isPending: loginPending } = loginMutations.login;
  const { mutate: requestMagicLoginMutate, isPending: reqMagicLoginPending } =
    loginMutations.requestMagicLogin;

  const requestLoginOtp = (formData) => {
    const { email, password } = formData;
    requestLoginOtpMutate({ email, password });
  };

  const handleResendOtp = () => {
    resendOtpMutate({ mode: "login" });
    setSeconds(60);
    setIsResendDisabled(true);
  };

  const handleLogin = (formData) => {
    const { otp } = formData;
    loginMutate({ otp, mode: "login" });
  };

  const handlePasswordlessLogin = (formData) => {
    const email = formData.magicEmail;
    requestMagicLoginMutate({ email });
    setPasswordlessEmail(email);
  };

  const resetPasswordlessState = () => {
    setIsPasswordlessMode(false);
    setLinkSent(false);
    setPasswordlessEmail("");
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

        {/* Right Side - Login Form */}
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
              {!isPasswordlessMode ? (
                /* Regular Login Form */
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Sign in to your WorkHive account
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Email Input */}
                    {!otpMode ? (
                      <form
                        className="space-y-6"
                        onSubmit={handleSubmit(requestLoginOtp)}
                      >
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              {...register("email", {
                                required: "Enter your valid email!",
                              })}
                              type="email"
                              name="email"
                              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${authInputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                              placeholder="Enter your email"
                            />
                          </div>
                          {errors.email ? (
                            <p className="text-sm text-red-600 mt-2">
                              {errors.email.message}
                            </p>
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
                                required: "Enter your valid password!",
                              })}
                              type={showPassword ? "text" : "password"}
                              name="password"
                              className={`w-full pl-10 pr-12 py-3 rounded-lg border ${authInputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                              placeholder="Enter your password"
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
                            <p className="text-sm text-red-600 mt-2">
                              {errors.password.message}
                            </p>
                          ) : null}
                        </div>

                        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer">
                          {isLoginPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Sending OTP...</span>
                            </>
                          ) : (
                            <>
                              <span>Send OTP</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleSubmit(handleLogin)}>
                        <label className="block text-sm font-medium mb-2">
                          Enter OTP
                        </label>
                        <div className="relative">
                          <UserLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            {...register("otp", {
                              required: "Please enter the OTP!",
                              pattern: {
                                value: /^\d{6}$/,
                                message: "OTP must be exactly 6 digits",
                              },
                              minLength: {
                                value: 6,
                                message: "OTP must be 6 digits",
                              },
                              maxLength: {
                                value: 6,
                                message: "OTP must be 6 digits",
                              },
                            })}
                            type="text"
                            name="otp"
                            maxLength={6}
                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${authInputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 text-center text-lg tracking-widest font-mono`}
                            placeholder="000000"
                            onInput={(e) => {
                              // Only allow numbers
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}
                            onKeyDown={(e) => {
                              // Allow backspace, delete, tab, escape, enter, home, end, left, right
                              if (
                                [8, 9, 27, 13, 46, 35, 36, 37, 39].indexOf(
                                  e.keyCode
                                ) !== -1 ||
                                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true)
                              ) {
                                return;
                              }
                              // Ensure that it is a number and stop the keypress
                              if (
                                (e.shiftKey ||
                                  e.keyCode < 48 ||
                                  e.keyCode > 57) &&
                                (e.keyCode < 96 || e.keyCode > 105)
                              ) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </div>
                        {errors.otp ? (
                          <p className="text-sm text-red-600 mt-2">
                            {errors.otp.message}
                          </p>
                        ) : null}

                        {/* Resend OTP  */}
                        <div className="my-5 text-center">
                          <p className="text-sm text-gray-600">
                            {!isResendDisabled
                              ? `Didn't receive the code?`
                              : `Resend otp after ${seconds} seconds`}
                            {!isResendDisabled ? (
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800 font-medium mx-1.5 cursor-pointer"
                                onClick={handleResendOtp}
                              >
                                Resend OTP
                              </button>
                            ) : null}
                          </p>
                        </div>

                        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer">
                          {isResendOtpPending || loginPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>
                                {isResendOtpPending
                                  ? "Please wait..."
                                  : loginPending
                                  ? "Signing In..."
                                  : "Wait a moment..."}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>Sign In</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {err ? <p className="text-red-600">{err}</p> : null}
                    {successMsg ? (
                      <p className="text-green-600 transition-all duration-200">
                        {successMsg}
                      </p>
                    ) : null}

                    {/* Passwordless Login */}
                    <div className="text-center">
                      <button
                        onClick={() => setIsPasswordlessMode(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                      >
                        Login without password
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Passwordless Login Mode */
                <>
                  {!linkSent ? (
                    /* Email Input for Passwordless */
                    <>
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">
                          Login Without Password
                        </h2>
                        <p
                          className={`${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Enter your email to receive a secure login link
                        </p>
                      </div>

                      <form
                        className="space-y-6"
                        onSubmit={handleSubmit(handlePasswordlessLogin)}
                      >
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              {...register("magicEmail", {
                                required: "Please enter your email",
                              })}
                              type="email"
                              name={"magicEmail"}
                              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${authInputClasses} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                        {errors.magicEmail ? (
                          <p className="text-red-600">
                            {errors.magicEmail.message}
                          </p>
                        ) : null}
                        {err ? <p className="text-red-600">{err}</p> : null}
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          {reqMagicLoginPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Please wait...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              <span>Send Login Link</span>
                            </>
                          )}
                        </button>

                        <div className="text-center">
                          <button
                            onClick={resetPasswordlessState}
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                          >
                            Back to password login
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    /* Link Sent Confirmation */
                    <div className="text-center py-8">
                      <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Check Your Email
                      </h3>
                      <p
                        className={`${
                          isDark ? "text-gray-400" : "text-gray-600"
                        } mb-6`}
                      >
                        We've sent a secure login link to{" "}
                        <span className="font-medium">{passwordlessEmail}</span>
                      </p>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        } mb-6`}
                      >
                        Click the link in your email to complete your login. The
                        link will expire in 10 minutes.
                      </p>
                      <button
                        onClick={resetPasswordlessState}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Divider and Sign Up Link - Only show in regular login mode */}
              {!isPasswordlessMode && (
                <>
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

                  <div className="text-center">
                    <p
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Don't have an account?{" "}
                      <span
                        onClick={() => navigate("/signup")}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                      >
                        Sign up for free
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                By signing in, you agree to our{" "}
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

export default Login;
