import axios from "axios";
import { envVariables } from "../config";

const updateApplication = async (appId, status) => {
  const res = await axios.patch(
    `${envVariables.UPDATE_APPLICATION_URL}/${appId}`,
    { status },
    {
      withCredentials: true,
    }
  );
  return res?.data;
};

export default updateApplication;