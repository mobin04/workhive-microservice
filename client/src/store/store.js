import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import loadingReducer from "./slices/loadingSlice";
import jobReducer from "./slices/jobSlice";

const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    loading: loadingReducer,
    jobs: jobReducer,
  },
});

export default store;
