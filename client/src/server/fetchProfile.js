import axios from "axios";
import { envVariables } from "../config";

export const fetchProfile = async () => {
  const response = await axios.get(envVariables.GET_PROFILE_URL, {
    withCredentials: true,
  });

  return response.data;
};
