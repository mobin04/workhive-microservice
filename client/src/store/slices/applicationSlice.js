import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  applications: null,
  withDrawnedApp: null,
};

export const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state.applications = action.payload;
    },
    setWithdrawnApp: (state, action) => {
      state.withDrawnedApp = action.payload;
    },
    updateApplicationStatus: (state, action) => {
      const { id, status } = action.payload;
      const app = state.applications.find((app) => app.application._id === id);
      if (app) {
        app.application.status = status;
      }
    },
  },
});

export const { setApplications, setWithdrawnApp, updateApplicationStatus } =
  applicationSlice.actions;
export default applicationSlice.reducer;
