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
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./store/slices/userSlice";
import { envVariables } from "./config";
import { setLoading } from "./store/slices/loadingSlice";
import Signup from "./components/sign-up/SignUp";
import JobViewer from "./components/job-viewer/JobViewer";
import JobApplicationForm from "./components/submit-application/JobApplicationForm";
import ErrorComponent from "./components/error-page/ErrorPage";
import Popup from "./components/info-popup/Popup";
import { showPopup } from "./store/slices/popupSlice";
import { showError } from "./store/slices/errorSlice";

function App() {
  const { popup } = useSelector((state) => state.popup);
  const { errorShow } = useSelector((state) => state.errorShow);

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
    onError: (err) => {
      if (err.code === "ERR_NETWORK") {
        dispatch(
          showPopup({
            message: "Connection failed! Please check your internet connection",
            type: "error",
            visible: true,
          })
        );
        dispatch(showError({type: '500', visible: true}))
      }
    },
    retry: false,
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
        <Route path="/signup" element={<Signup />} />
        <Route path="/magic-login" element={<VerifyMagicLogin />} />
        <Route path="/job" element={<JobViewer />} />
        <Route path="/apply" element={<JobApplicationForm />} />
        <Route
          path="*"
          element={
            <ErrorComponent
              type="404"
              onGoBack={true}
              onGoHome={true}
              onRetry={false}
            />
          }
        />
      </Routes>
      <Footer />
      {errorShow?.visible ? (
          <ErrorComponent
            title={errorShow?.title}
            message={errorShow?.message}
            onGoBack={errorShow?.onGoBack}
            onGoHome={errorShow?.onGoHome}
            onRetry={errorShow?.onRetry}
            type={errorShow?.type}
          />
        ) : null}

      {popup?.visible ? (
        <Popup
          message={popup.message}
          type={popup.type}
          isVisible={popup.visible}
        />
      ) : null}
    </div>
  );
}

export default App;
