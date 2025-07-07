import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";

const store = configureStore({
  reducer: {
    themeReducer,
  },
});

export default store;
