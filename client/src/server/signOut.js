import axios from "axios";
import { envVariables } from "../config";

const signoutApi = async () => {
  const res = await axios.post(envVariables.LOGOUT_URL, "", {
    withCredentials: true,
  });
  return res;
};

export default signoutApi;
