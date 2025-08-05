export const envVariables = {
  // 🔹 Login
  REQUEST_LOGINOTP_URL: `${import.meta.env.VITE_API_URL}/auth/login`,
  REQUEST_MAGIC_LINK: `${import.meta.env.VITE_API_URL}/auth/login-link`,
  VERIFY_MAGIC_LOGIN: `${import.meta.env.VITE_API_URL}/auth/magic-login`,

  // 🔹OTP Handling
  RESEND_OTP: `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
  VERIFY_OTP: `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
  // VERIFY_OTP: `http://localhost:8001/api/v2/auth/verify-otp`,

  // 🔹Signup
  REQUEST_SIGNUP_URL: `${import.meta.env.VITE_API_URL}/auth/signup`,
  // REQUEST_SIGNUP_URL: `http://localhost:8001/api/v2/auth/signup`,

  // 🔹Logout
  LOGOUT_URL: `${import.meta.env.VITE_API_URL}/auth/logout`,

  // 🔹Get Profile
  GET_PROFILE_URL: `${import.meta.env.VITE_API_URL}/auth/profile`,
  UPDATA_PROFILE_URL: `${import.meta.env.VITE_API_URL}/auth/profile`,

  // 🔹Jobs
  GET_JOB_URL: `${import.meta.env.VITE_API_URL}/jobs`,
  GET_SAVED_JOBS: `${import.meta.env.VITE_API_URL}/auth/saved-jobs`,
  SAVE_JOB: `${import.meta.env.VITE_API_URL}/auth/save-job`,
  REMOVE_SAVED_JOB: `${import.meta.env.VITE_API_URL}/auth/saved-job`,
  ADD_LIKE_URL: `${import.meta.env.VITE_API_URL}/jobs/like`,
  UNDO_LIKE_URL: `${import.meta.env.VITE_API_URL}/jobs`,

  // 🔹Mapbox Token
  MAPBOX_ACCESS_KEY: import.meta.env.VITE_MAPBOX_API_KEY,

  // 🔹Application
  APPLY_JOB_URL: `${import.meta.env.VITE_API_URL}/applications`,
  GET_APPLICATIONS_URL: `${import.meta.env.VITE_API_URL}/applications`,
  WITHDRAW_APPLICATION_URL: `${import.meta.env.VITE_API_URL}/applications`,

  // 🔹Notification
  GET_ALL_NOTIFICATIONS_URL: `${import.meta.env.VITE_API_URL}/notifications`,
  READ_ALL_NOTIFICATION_URL: `${import.meta.env.VITE_API_URL}/notifications/read-all`,
  DELETE_NOTIFICATION_URL: `${import.meta.env.VITE_API_URL}/notifications`,
};