import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isVisible: false,
  notification: {},
  allNotifications: [],
};

export const notifSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setIsNotification: (state, action) => {
      state.isVisible = action.payload?.isVisible;
      state.notification = action.payload?.notification;
    },
    setAllNotifications: (state, action) => {
      state.allNotifications = action.payload;
    },
    markAllAsRead: (state) => {
      if (state.allNotifications) {
        const notifications = [...state.allNotifications];
        const readNotif = notifications.map((notif) => {
          if (notif.status === "unread") {
            return { ...notif, status: "read" };
          }
          return notif;
        });
        const readedNotif = [...readNotif];
        state.allNotifications = readedNotif;
      }
    },
    deleteNotification: (state, action) => {
      const filterOut = state?.allNotifications?.filter(
        (notif) => notif?._id !== action.payload
      );
      state.allNotifications = filterOut;
    },
  },
});

export const {
  setIsNotification,
  setAllNotifications,
  markAllAsRead,
  deleteNotification,
} = notifSlice.actions;
export default notifSlice.reducer;
