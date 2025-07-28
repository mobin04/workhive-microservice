import axios from "axios";

const authHandler = async ({ url, credentials }) => {
  const response = await axios.post(url, credentials, {
    withCredentials: true,
  });
  return response.data;
};

export default authHandler;