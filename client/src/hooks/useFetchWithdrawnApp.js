import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { fetchData } from "../server/fetchData";
import { envVariables } from "../config";
import { useEffect } from "react";
import { setWithdrawnApp } from "../store/slices/applicationSlice";

const useFetchWithdrawnApp = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const {
    data: applicationDetails,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["withdrawn-apps"],
    queryFn: () =>
      fetchData(
        {},
        `${envVariables.WITHDRAW_APPLICATION_URL}/${user?._id}/withdrawn`,
        dispatch
      ),
    enabled: false,
    retry: 1,
  });

  useEffect(() => {
    if (user && user?.role === "job_seeker") {
      refetch();
    }
  }, [refetch, user]);

  useEffect(() => {
    if (applicationDetails) {
      dispatch(setWithdrawnApp(applicationDetails?.data?.application));
    }
  }, [applicationDetails, dispatch]);

  return {
    applicationDetails,
    isLoading,
  };
};

export default useFetchWithdrawnApp;
