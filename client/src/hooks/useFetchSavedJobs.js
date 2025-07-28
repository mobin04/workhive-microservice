import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../server/fetchJobs";
import { envVariables } from "../config";
import { useDispatch } from "react-redux";
import { toSaveJob } from "../store/slices/jobSlice";

const useFetchSavedJobs = () => {
  const dispatch = useDispatch();
  const { data, refetch } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => fetchJobs({}, envVariables.GET_SAVED_JOBS, null),
    enabled: false,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Get saved jobs on page load
  useEffect(() => {
    if (data) {
      dispatch(toSaveJob(data?.data?.jobs));
    }
  }, [data, dispatch]);

  return {
    data,
    refetch,
  };
};

export default useFetchSavedJobs;
