// server/likeJob.js
import axios from "axios";
import { envVariables } from "../config";

export async function likeJobApi(jobId) {
  const res = await axios.post(`${envVariables.ADD_LIKE_URL}/${jobId}`, "", {
    withCredentials: true,
  });
  return res.data;
}

export async function undoLikeJobApi(jobId) {
  const res = await axios.patch(
    `${envVariables.UNDO_LIKE_URL}/${jobId}/like`,
    "",
    { withCredentials: true }
  );
  return res.data;
}