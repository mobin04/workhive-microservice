import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { setIsNotification } from "../store/slices/notificationSlice";

const socket = io(import.meta.env.VITE_SOCKET_URL);

const useNotificationListen = (userId, refetch) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!userId || !user || user?.isSuspended) return;
    socket.on(`notification:${userId}`, (data) => {
      dispatch(setIsNotification({ isVisible: true, notification: data }));
      refetch();
    });

    return () => {
      socket.off(`notification:${userId}`);
    };
  }, [userId, dispatch, refetch, user]);
};

export default useNotificationListen;
