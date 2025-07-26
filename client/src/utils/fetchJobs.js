/* eslint-disable no-unused-vars */
import axios from "axios";
import { showPopup } from "../store/slices/popupSlice";

export const fetchJobs = async (filter = {}, url, dispatch = null) => {
  const cleanedFilter = Object.fromEntries(
    Object.entries(filter).filter(
      ([_, value]) => value?.toString().trim().toLowerCase() !== "all"
    )
  );

  const queryString = new URLSearchParams(cleanedFilter).toString();

  try {
    const res = await axios.get(`${url}?${queryString}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (dispatch !== null) {
      dispatch(
        showPopup({
          message: err.response?.data?.message || 'Something went wrong',
          type: "error",
          visible: true,
        })
      );
    }
    console.log(err.response);
    console.log(err.data.response)
    console.error("Failed to fetch jobs:", err);
    throw new Error();
  }
};
