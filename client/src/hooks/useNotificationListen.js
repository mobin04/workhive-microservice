import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { setIsNotification } from "../store/slices/notificationSlice";

const socket = io("https://workhive-notification-service.onrender.com");

const useNotificationListen = (userId, refetch) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!userId) return;

    socket.on(`notification:${userId}`, (data) => {
      dispatch(setIsNotification({ isVisible: true, notification: data }));
      refetch();
    });

    return () => {
      socket.off(`notification:${userId}`);
    };
  }, [userId, dispatch, refetch]);
};

export default useNotificationListen;
