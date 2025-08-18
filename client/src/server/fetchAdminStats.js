import axios from "axios";
import { envVariables } from "../config";

const fetchAdminStats = async () => {
  const res = await axios.get(envVariables.GET_ADMIN_STATS, { withCredentials: true });
  return res?.data;
};

export default fetchAdminStats;
