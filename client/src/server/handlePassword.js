import axios from "axios";
import { envVariables } from "../config";

export const forgotPassword = async ({ credentials }) => {
  const res = await axios.post(envVariables.FORGOT_PASSWORD_URL, credentials, {
    withCredentials: true,
  });

  return res.data;
};

export const resetPassword = async ({ credentials, token }) => {
  console.log(credentials)
  const res = await axios.patch(`${envVariables.RESET_PASSWORD_URL}/${token}`, credentials, {
    withCredentials: true,
  });
  return res.data;
};
