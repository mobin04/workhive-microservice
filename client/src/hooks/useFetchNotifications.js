import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../server/fetchData";
import { envVariables } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setAllNotifications } from "../store/slices/notificationSlice";

const useFetchNotifications = () => {
  const {user} = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { data, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchData({}, envVariables.GET_ALL_NOTIFICATIONS_URL, null),
    enabled: false,
    retry: 3,
    retryDelay: 3000,
  });

  useEffect(() => {
    if (!user?._id || user?.isSuspended) return;
    refetch();
  }, [refetch, user]);

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
