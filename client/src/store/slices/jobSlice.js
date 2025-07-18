import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobs: null,
}

export const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action) => {
      state.jobs = action.payload
    }
  }
})

export const {setJobs} = jobSlice.actions;
export default jobSlice.reducer;