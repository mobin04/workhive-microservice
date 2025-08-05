import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { setIsNotification } from "../store/slices/notificationSlice";

const socket = io("http://localhost:8004");

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
