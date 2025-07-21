/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect } from "react";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login/Login";
import Footer from "./components/footer/Footer";
import VerifyMagicLogin from "./components/login/VerifyMagicLogin";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "./store/slices/userSlice";
import { envVariables } from "./config";
import { setLoading } from "./store/slices/loadingSlice";
import Signup from "./components/sign-up/SignUp";
import JobViewer from "./components/job-viewer/JobViewer";
import JobApplicationForm from "./components/submit-application/JobApplicationForm";


function App() {
  // Fetch Profile at initial load
  const dispatch = useDispatch();
  const { GET_PROFILE_URL } = envVariables;

  const fetchProfile = useCallback(async () => {
    const response = await axios.get(GET_PROFILE_URL, {
      withCredentials: true,
    });
    return response.data;
  }, [GET_PROFILE_URL]);

  const mutation = useMutation({
    mutationFn: fetchProfile,
    onSuccess: (data) => {
      dispatch(setUser(data.data.user));
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  useEffect(() => {
    dispatch(setLoading(mutation.isPending));
  }, [mutation.isPending]);

  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={ <Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/magic-login" element={<VerifyMagicLogin />} />
        <Route path="/job" element={<JobViewer/>} />
        <Route path="/apply" element={<JobApplicationForm/>}/>
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
