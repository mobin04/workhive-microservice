/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { Briefcase, CheckCircle, XCircle, Home, Sun, Moon } from "lucide-react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { envVariables } from "../../config";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../store/slices/userSlice";

const VerifyMagicLogin = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { isDark } = useContext(ThemeContext);
  const [searchParams] = useSearchParams();
  const { VERIFY_MAGIC_LOGIN } = envVariables;
  const token = searchParams.get("token");
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'

  useEffect(() => {
    if (!token) {
      setStatus("error");
    }
    const login = async () => {
      try {
        const res = await axios.get(`${VERIFY_MAGIC_LOGIN}?token=${token}`, {
          withCredentials: true,
        });

        const user = res.data?.data?.user;

        if (user) {
          setStatus("success");
          dispatch(setUser(user));
          setTimer(3);
        } else {
          throw new Error();
        }
      } catch {
        setStatus("error");
      }
    };
    login();
  }, [token]);

  const handleRedirectHome = () => {
    if (user) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    if (timer === 0) {
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  if (timer === 1) navigate("/");

  const themeClasses = isDark
    ? "bg-gray-900 text-white"
    : "bg-gray-50 text-gray-900";

  return (
    <div
      className={`${themeClasses} transition-colors duration-300 flex items-center justify-center`}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-2xl">
            <Briefcase className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-8">
          WorkHive
        </h1>

        {status === "loading" && (
          <div className="space-y-6">
            {/* Loading Spinner */}
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Verifying your login
              </h2>
              <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Please wait while we verify your account...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">
                Login Successful!
              </h2>
              <p
                className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-6`}
              >
                Welcome back to WorkHive
              </p>
              <p
                className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
              >{`Redirecting you to your dashboard ${timer}`}</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">
                Verification Failed
              </h2>
              <p
                className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-6`}
              >
                The login link has expired or is invalid. Please try logging in
                again.
              </p>
              <button
                onClick={handleRedirectHome}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 inline-flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyMagicLogin;
