import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import loadingReducer from "./slices/loadingSlice";

const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    loading: loadingReducer,
  },
});

export default store;
