export const envVariables = {
  // 🔹 Login
  REQUEST_LOGINOTP_URL: `${import.meta.env.VITE_API_URL}/auth/login`,
  RESEND_OTP: `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
  VERIFY_OTP: `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
  // VERIFY_OTP: `http://localhost:8001/api/v2/auth/verify-otp`,
  
  REQUEST_MAGIC_LINK: `${import.meta.env.VITE_API_URL}/auth/login-link`,
  VERIFY_MAGIC_LOGIN: `${import.meta.env.VITE_API_URL}/auth/magic-login`,

  // 🔹Signup
  REQUEST_SIGNUP_URL: `${import.meta.env.VITE_API_URL}/auth/signup`,
  // REQUEST_SIGNUP_URL: `http://localhost:8001/api/v2/auth/signup`,
  
  // 🔹Logout
  LOGOUT_URL: `${import.meta.env.VITE_API_URL}/auth/logout`,

  // 🔹Get Profile
  GET_PROFILE_URL: `${import.meta.env.VITE_API_URL}/auth/profile`,

  // 🔹Jobs
  GET_JOB_URL: `${import.meta.env.VITE_API_URL}/jobs`,
};
