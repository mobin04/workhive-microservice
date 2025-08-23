import axios from "axios";

const handleSuspendUser = async (url, data = {}) => {
  const res = await axios.patch(url, data, { withCredentials: true });
  return res.data;
};

export default handleSuspendUser;