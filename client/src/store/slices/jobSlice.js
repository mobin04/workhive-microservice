import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobs: null,
  savedJobs: null,
};

export const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs: (state, action) => {
      state.jobs = action.payload;
    },
    toSaveJob: (state, action) => {
      state.savedJobs = action.payload;
    },
  },
});

export const { setJobs, toSaveJob } = jobSlice.actions;
export default jobSlice.reducer;
