import axios from "axios";
import { envVariables } from "../config";

export const editJob = async (url, credential = {}) => {
  const res = await axios.patch(url, credential, { withCredentials: true });
  return res?.data;
};

export const createJob = async (credential) => {
  const res = await axios.post(envVariables.CREATE_NEW_JOB_URL, credential, {
    withCredentials: true,
  });
  return res?.data
};
