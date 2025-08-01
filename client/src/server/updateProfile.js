import axios from "axios";
import { envVariables } from "../config";

const updateProfile = async (credential) => {
  const res = await axios.patch(envVariables.UPDATA_PROFILE_URL, credential, {
    withCredentials: true,
  });
  return res?.data;
};

export default updateProfile;
