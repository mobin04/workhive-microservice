/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login/Login";
import Footer from "./components/footer/Footer";
import VerifyMagicLogin from "./components/login/VerifyMagicLogin";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./store/slices/userSlice";
import { envVariables } from "./config";
import Loading from "./components/loader/Loading";
import { setLoading } from "./store/slices/loadingSlice";

function App () {
  const dispatch = useDispatch();
  const { GET_PROFILE_URL } = envVariables;

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axios.get(GET_PROFILE_URL, {
        withCredentials: true,
      });
      return response.data;
    },
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
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/magic-login" element={<VerifyMagicLogin />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
