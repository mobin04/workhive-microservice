/* eslint-disable no-unused-vars */
import axios from "axios";

export const fetchJobs = async (filter = {}, url) => {
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
    console.error("Failed to fetch jobs:", err);
    throw err;
  }
};