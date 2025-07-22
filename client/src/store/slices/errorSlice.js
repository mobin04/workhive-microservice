import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  errorShow: {
    type: "404",
    onGoBack: true,
    onGoHome: true,
    onRetry: false,
    visible: false,
    message: null,
    title: null,
  },
};


export const errorSlice = createSlice({
  name: 'errorShow',
  initialState,
  reducers: {
    showError: (state, action) => {
      state.errorShow.type = action.payload.type;
      state.errorShow.visible = action.payload.visible;
      state.errorShow.message = action.payload.message || null;
      state.errorShow.title = action.payload.title || null;
    }
  }
})

export const {showError} = errorSlice.actions;
export default errorSlice.reducer;