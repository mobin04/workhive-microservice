import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import loadingReducer from "./slices/loadingSlice";
import jobReducer from "./slices/jobSlice";
import popupReducer from "./slices/popupSlice";
import errorReducer from "./slices/errorSlice";

const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    loading: loadingReducer,
    jobs: jobReducer,
    popup: popupReducer,
    errorShow: errorReducer,
  },
});

export default store;
