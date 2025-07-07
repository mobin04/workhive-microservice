import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDark: JSON.parse(localStorage.getItem("theme")) || false,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,

  reducers: {
    handleChangeTheme: (state) => {
      localStorage.setItem("theme", JSON.stringify(!state.isDark));
      state.isDark = !state.isDark
    },
  },
});

export const { handleChangeTheme } = themeSlice.actions;

export default themeSlice.reducer;
