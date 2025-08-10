import axios from "axios";

const editJob = async (url, credential = {}) => {
  const res = await axios.patch(url, credential, { withCredentials: true });
  return res?.data;
};

export default editJob;