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
    likeJob: (state, action) => {
      const { jobId, userId } = action.payload;
      
      const job = state.jobs?.data?.jobs.find((j) => j._id === jobId);
      
      if (job && !job?.likes?.includes(userId)) {
        job?.likes?.push(userId);
      }
    },
    undoLikeJob: (state, action) => {
      const { jobId, userId } = action.payload;
      
      const job = state.jobs?.data?.jobs.find((j) => j._id === jobId);
      
      if (job) {
        job.likes = job?.likes?.filter((id) => id !== userId);
      }
    },
  },
});

export const { setJobs, toSaveJob, likeJob, undoLikeJob } = jobSlice.actions;
export default jobSlice.reducer;
