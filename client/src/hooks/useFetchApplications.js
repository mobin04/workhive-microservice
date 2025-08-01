import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../server/fetchData";
import { envVariables } from "../config";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setApplications } from "../store/slices/applicationSlice";

const useFetchApplications = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const {
    data: applicationDetails,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: () =>
      fetchData(
        {},
        `${envVariables.GET_APPLICATIONS_URL}/${user?._id}`,
        dispatch
      ),
    enabled: false,
  });

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [refetch, user]);

  useEffect(() => {
    if (applicationDetails) {
      dispatch(setApplications(applicationDetails?.data?.application));
    }
  }, [applicationDetails, dispatch]);

  return {
    applicationDetails,
    isLoading,
  };
};

export default useFetchApplications;
