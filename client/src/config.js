export const envVariables = {
  // 🔹 Login 
  REQUEST_LOGINOTP_URL: `${import.meta.env.VITE_API_URL}/auth/login`,
  RESEND_OTP: `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
  VERIFY_OTP: `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
  REQUEST_MAGIC_LINK: `${import.meta.env.VITE_API_URL}/auth/login-link`,
  VERIFY_MAGIC_LOGIN: `${import.meta.env.VITE_API_URL}/auth/magic-login` ,
  
  // 🔹Get Profile
  GET_PROFILE_URL: `${import.meta.env.VITE_API_URL}/auth/profile`
};
