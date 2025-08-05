import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../server/fetchData";
import { envVariables } from "../config";
import { useDispatch } from "react-redux";
import { setAllNotifications } from "../store/slices/notificationSlice";

const useFetchNotifications = () => {
  const dispatch = useDispatch();
  const { data, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchData({}, envVariables.GET_ALL_NOTIFICATIONS_URL, null),
    enabled: false,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (data) {
      dispatch(setAllNotifications(data?.data?.notification));
    }
  }, [data, dispatch]);

  return {
    data,
    refetch,
  };
};

export default useFetchNotifications;
