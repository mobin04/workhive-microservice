import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  popup: {
    message: "",
    type: "info",
    visible: false,
    _nonce: null,
  },
};

const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    showPopup: (state, action) => {
      state.popup.message = action.payload.message;
      state.popup.type = action.payload.type || "info";
      state.popup.visible = true;
      state.popup._nonce = Date.now();
    },
    hidePopup: (state) => {
      state.visible = false;
    },
  },
});

export const { showPopup, hidePopup } = popupSlice.actions;
export default popupSlice.reducer;
